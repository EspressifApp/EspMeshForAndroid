package iot.espressif.esp32.model.device.ota;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.SystemClock;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import iot.espressif.esp32.action.device.IEspActionDevice;
import iot.espressif.esp32.action.device.IEspActionDeviceReboot;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;

class EspOTAClientImpl2 extends EspOTAClient {
    private static final String HEADER_BIN_NAME = "Firmware-Name";
    private static final String HEADER_BIN_URL = "Firmware-Url";

    private static final int PROGRESS_POST_BIN_START = 0;
    private static final int PROGRESS_POST_BIN_COMPLETE = 50;
    private static final int PROGRESS_CHECK_PROGRESS_START = 51;
    private static final int PROGRESS_CHECK_PROGRESS_COMPLETE = 99;

    private final EspLog mLog = new EspLog(getClass());

    private File mBin;
    private String mBinUrl;

    private String mProtocol;
    private String mHost;
    private int mPort;
    private List<String> mMacList;

    private volatile boolean mOtaRunning = false;
    private Thread mOtaThread;

    private HttpURLConnection mConnection;

    private final Map<String, Integer> mProgressValues = new HashMap<>();
    private final Set<String> mProgressMacs = new HashSet<>();
    private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if (action == null) {
                return;
            }

            if (action.equals(DeviceConstants.ACTION_OTA_STATUS_CHANGED)) {
                mLog.d("Receive ota change local broadcast");
                String[] macs = intent.getStringArrayExtra(DeviceConstants.KEY_DEVICE_MACS);
                if (macs == null) {
                    return;
                }
                synchronized (mProgressMacs) {
                    mProgressMacs.addAll(Arrays.asList(macs));
                }
                synchronized (mReceiver) {
                    mLog.d("Notify mReceiver wait to get ota progress");
                    mReceiver.notify();
                }
            }
        }
    };

    EspOTAClientImpl2(File bin, String protocol, String host, Collection<String> macs, OTACallback callback) {
        mBin = bin;
        mBinUrl = null;
        init(protocol, host, macs, callback);
    }

    EspOTAClientImpl2(String binUrl, String protocol, String host, Collection<String> macs, OTACallback callback) {
        mBinUrl = binUrl;
        mBin = null;
        init(protocol, host, macs, callback);
    }

    private void init(String protocol, String host, Collection<String> macs, OTACallback callback) {
        mProtocol = protocol;
        if (protocol.toLowerCase().equals("http")) {
            mPort = 80;
        } else {
            mPort = 443;
        }
        mHost = host;
        mMacList = new LinkedList<>();
        mMacList.addAll(macs);
        for (String mac : mMacList) {
            mProgressValues.put(mac, 0);
        }

        setOTACallback(callback);
    }

    private String getOTADataUrl() {
        return String.format("%s://%s/ota/firmware", mProtocol, mHost);
    }

    private String getOTAUrlUrl() {
        return String.format("%s://%s/ota/url", mProtocol, mHost);
    }

    private String getStopUrl() {
        return String.format("%s://%s/ota/stop", mProtocol, mHost);
    }

    @Override
    public String getAddress() {
        return mHost;
    }

    @Override
    public synchronized void start() {
        if (mOtaRunning) {
            throw new IllegalStateException("OTA task is running");
        }

        runOta();
    }

    @Override
    public synchronized void stop() {
        close();

        try {
            mLog.d("Request OTA stop");
            URL url = new URL(getStopUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setFixedLengthStreamingMode(0);
            connection.setDoOutput(true);
            connection.setRequestMethod(EspHttpUtils.METHOD_POST);

            connection.connect();

            int status = connection.getResponseCode();
            mLog.d("Stop OTA response http code = " + status);
            if (status == HttpURLConnection.HTTP_OK) {
                mLog.d("Stop OTA success");
            } else {
                mLog.d("Stop OTA failed");
            }

            connection.disconnect();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public synchronized void close() {
        mLog.d("close()");
        mOtaRunning = false;

        if (mOtaThread != null) {
            mOtaThread.interrupt();
            mOtaThread = null;
        }
        if (mConnection != null) {
            mConnection.disconnect();
            mConnection = null;
        }
    }

    private void runOta() {
        mOtaRunning = true;

        mOtaThread = new Thread(() -> {
            if (getOTACallback() != null) {
                runOtaCallback(() -> getOTACallback().onOTAPrepare(EspOTAClientImpl2.this));
            }

            registerReceiver();

            for (int t = 0; t < 1; t++) {
                if (mBin != null) {
                    if (!postBinData()) {
                        mLog.w("PostBinData failed");
                        continue;
                    }
                } else if (mBinUrl != null) {
                    if (!postBinUrl()) {
                        mLog.w("PostBinUrl failed");
                        continue;
                    }
                } else {
                    mLog.e("Bin and bin url are both null");
                    break;
                }


                if (!checkProgress()) {
                    mLog.w("checkProgress failed");
                    continue;
                }

                if (willRebootAfterOTA()) {
                    otaReboot();
                }
                mLog.d("Check over");
            }

            unregisterReceiver();
            close();

            if (getOTACallback() != null) {
                runOtaCallback(() -> {
                    List<String> sucMacList = new LinkedList<>();
                    for (Map.Entry<String, Integer> entry : mProgressValues.entrySet()) {
                        if (entry.getValue() == 100) {
                            sucMacList.add(entry.getKey());
                        }
                    }
                    getOTACallback().onOTAResult(EspOTAClientImpl2.this, sucMacList);
                });
            }

            mOtaRunning = false;
            mLog.d("OTA thread over");
        });
        mOtaThread.start();
    }

    private String getMacHeaderValue() {
        StringBuilder macsValue = new StringBuilder(13 * mMacList.size());
        for (int i = 0; i < mMacList.size(); i++) {
            macsValue.append(mMacList.get(i));
            if (i < mMacList.size() - 1) {
                macsValue.append(",");
            }
        }

        return macsValue.toString();
    }

    private boolean postBinData() {
        FileInputStream fis = null;
        try {
            String name = mBin.getName();
            name = name.substring(0, name.length() - SUFFIX_BIN_FILE.length());
            fis = new FileInputStream(mBin);
            int binLen = (int) mBin.length();

            URL url = new URL(getOTADataUrl());
            mConnection = (HttpURLConnection) url.openConnection();
            mConnection.setFixedLengthStreamingMode((int)mBin.length());
            mConnection.setDoOutput(true);
            mConnection.setRequestMethod(EspHttpUtils.METHOD_POST);
            mConnection.setReadTimeout(30000);

            mConnection.addRequestProperty(IEspActionDevice.HEADER_NODE_MAC, getMacHeaderValue());
            mConnection.addRequestProperty(IEspActionDevice.HEADER_NODE_COUNT, String.valueOf(mMacList.size()));
            mConnection.addRequestProperty(EspHttpUtils.CONTENT_TYPE, DeviceUtil.CONTENT_TYPE_BIN);
            mConnection.addRequestProperty(HEADER_BIN_NAME, name);
            mConnection.connect();

            OutputStream os = mConnection.getOutputStream();
            int i = 0;
            for (int read = fis.read(); read != -1; read = fis.read()) {
                if (!mOtaRunning) {
                    return false;
                }

                if (i % 100000 == 0) {
                    mLog.d("Write " + i + " bytes");
                    int range = PROGRESS_POST_BIN_COMPLETE - PROGRESS_POST_BIN_START;
                    int progress = i * 100 / binLen * range / 100;
                    if (getOTACallback() != null) {
                        runOtaCallback(() -> {
                            List<OTAProgress> progressList = new ArrayList<>(mMacList.size());
                            for (String mac : mMacList) {
                                OTAProgressImpl otaProgress = new OTAProgressImpl();
                                otaProgress.mac = mac;
                                otaProgress.message = "Posting bin";
                                otaProgress.progress = progress;

                                progressList.add(otaProgress);
                            }
                            getOTACallback().onOTAProgressUpdate(EspOTAClientImpl2.this, progressList);
                        });
                    }
                }
                i++;
                os.write(read);
            }
            mLog.d("OTA post bin complete");
            if (getOTACallback() != null) {
                runOtaCallback(() -> {
                    List<OTAProgress> progressList = new ArrayList<>(mMacList.size());
                    for (String mac : mMacList) {
                        OTAProgressImpl otaProgress = new OTAProgressImpl();
                        otaProgress.mac = mac;
                        otaProgress.message = "Post bin over";
                        otaProgress.progress = PROGRESS_POST_BIN_COMPLETE;

                        progressList.add(otaProgress);
                    }
                    getOTACallback().onOTAProgressUpdate(EspOTAClientImpl2.this, progressList);
                });
            }

            int statusCode = mConnection.getResponseCode();
            mLog.d("OTA response code = " + statusCode);
            return statusCode == HttpURLConnection.HTTP_OK;
        } catch (Exception e) {
            mLog.w("Catch exception when post bin data");
            e.printStackTrace();
            return false;
        } finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (mConnection != null) {
                mConnection.disconnect();
            }
        }
    }

    private boolean postBinUrl() {
        try {
            URL url = new URL(getOTAUrlUrl());
            mConnection = (HttpURLConnection) url.openConnection();
            mConnection.setDoOutput(true);
            mConnection.setRequestMethod(EspHttpUtils.METHOD_POST);
            mConnection.addRequestProperty(IEspActionDevice.HEADER_NODE_MAC, getMacHeaderValue());
            mConnection.addRequestProperty(IEspActionDevice.HEADER_NODE_COUNT, String.valueOf(mMacList.size()));
            mConnection.addRequestProperty(EspHttpUtils.CONTENT_TYPE, EspHttpUtils.APPLICATION_JSON);
            mConnection.addRequestProperty(HEADER_BIN_URL, mBinUrl);

            byte[] postData = "{}".getBytes();
            mConnection.setFixedLengthStreamingMode(postData.length);
            mConnection.setReadTimeout(180000);
            mConnection.connect();

            mConnection.getOutputStream().write(postData);

            int statusCode = mConnection.getResponseCode();
            mLog.d("OTA url response code = " + statusCode);

            InputStream is;
            if (statusCode >= 400) {
                is = mConnection.getErrorStream();
            } else {
                is = mConnection.getInputStream();
            }
            LinkedList<Byte> contentList = new LinkedList<>();
            for (int read = is.read(); read != -1; read = is.read()) {
                contentList.add((byte) read);
            }
            byte[] content = new byte[contentList.size()];
            for (int i = 0; i < content.length; i++) {
                content[i] = contentList.get(i);
            }
            String contentStr = new String(content);
            mLog.d("OTA url response content = " + contentStr);

            return statusCode == HttpURLConnection.HTTP_OK;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            if (mConnection != null) {
                mConnection.disconnect();
            }
        }
    }

    private boolean checkProgress() {
        if (getOTACallback() != null) {
            runOtaCallback(() -> {
                List<OTAProgress> progressList = new ArrayList<>(mMacList.size());
                for (String mac : mMacList) {
                    OTAProgressImpl otaProgress = new OTAProgressImpl();
                    otaProgress.mac = mac;
                    otaProgress.message = "Checking device progress";
                    otaProgress.progress = PROGRESS_CHECK_PROGRESS_START;

                    progressList.add(otaProgress);
                }
                getOTACallback().onOTAProgressUpdate(EspOTAClientImpl2.this, progressList);
            });
        }

        if (mMacList.size() == 1) {
            mProgressValues.put(mMacList.get(0), 100);
            return true;
        }

        final long timeout = 600000; // 10 minutes
        final long startTime = SystemClock.elapsedRealtime();
        final long checkInterval = 30000;
        while (SystemClock.elapsedRealtime() - startTime < timeout) {
            if (!mOtaRunning) {
                return false;
            }

            synchronized (mReceiver) {
                try {
                    mReceiver.wait(checkInterval);
                } catch (InterruptedException e) {
                    mLog.w("CheckProgress wait interrupted");
                    return false;
                }
            }

            mLog.d("Start check progress");
            List<String> progressMacList;
            synchronized (mProgressMacs) {
                if (mProgressMacs.isEmpty()) {
                    progressMacList = new ArrayList<>(mMacList.size());
                    for (Map.Entry<String, Integer> entry : mProgressValues.entrySet()) {
                        if (entry.getValue() != 100) {
                            progressMacList.add(entry.getKey());
                        }
                    }
                } else {
                    progressMacList = new ArrayList<>(mProgressMacs);
                    mProgressMacs.clear();
                }
            }

            JSONObject postJSON = new JSONObject();
            try {
                postJSON.put(KEY_REQUEST, REQUEST_OTA_PROGRESS);
            } catch (JSONException e) {
                e.printStackTrace();
                return false;
            }

            EspHttpParams params = new EspHttpParams();
            params.setSOTimeout(30000);
            List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(mProtocol, mHost, mPort,
                    progressMacList, postJSON.toString().getBytes(), params, null);
            if (responseList == null) {
                continue;
            }
            Map<String, EspHttpResponse> map = DeviceUtil.getMapWithDeviceResponses(responseList);
            if (map == null) {
                continue;
            }
            for (Map.Entry<String, EspHttpResponse> entry : map.entrySet()) {
                String mac = entry.getKey();
                EspHttpResponse response = entry.getValue();
                try {
                    JSONObject respJSON = response.getContentJSON();
                    long totalSize = respJSON.getLong(KEY_TOTAL_SIZE);
                    long writtenSize = respJSON.getLong(KEY_WRITTEN_SIZE);
                    int progress = (int) (writtenSize * 100 / totalSize);
                    mProgressValues.put(mac, progress);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            boolean complete = true;
            for (int progress : mProgressValues.values()) {
                if (progress != 100) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                return true;
            }

            if (getOTACallback() != null) {
                List<OTAProgress> otaProgressList = new LinkedList<>();
                for (Map.Entry<String, Integer> entry : mProgressValues.entrySet()) {
                    OTAProgressImpl otaProgress = new OTAProgressImpl();
                    otaProgress.mac = entry.getKey();
                    otaProgress.progress = entry.getValue()
                            * (PROGRESS_CHECK_PROGRESS_COMPLETE - PROGRESS_CHECK_PROGRESS_START) / 100
                            + PROGRESS_CHECK_PROGRESS_START;
                    otaProgress.message = "Checking device progress";

                    otaProgressList.add(otaProgress);
                }
                runOtaCallback(() -> getOTACallback().onOTAProgressUpdate(EspOTAClientImpl2.this, otaProgressList));
            }
        }

        return false;
    }


    private void registerReceiver() {
        synchronized (mReceiver) {
            Observable.create(emitter -> {
                IntentFilter filter = new IntentFilter(DeviceConstants.ACTION_OTA_STATUS_CHANGED);
                EspApplication.getEspApplication().registerLocalReceiver(mReceiver, filter);
                synchronized (mReceiver) {
                    mReceiver.notify();
                }
                emitter.onComplete();
            }).subscribeOn(AndroidSchedulers.mainThread())
                    .subscribe();
            try {
                mReceiver.wait();
            } catch (InterruptedException e) {
                mLog.w("OTA registerReceiver interrupted");
            }
        }
    }

    private void unregisterReceiver() {
        synchronized (mReceiver) {
            Observable.create(emitter -> {
                EspApplication.getEspApplication().unregisterLocalReceiver(mReceiver);
                synchronized (mReceiver) {
                    mReceiver.notify();
                }
                emitter.onComplete();
            }).subscribeOn(AndroidSchedulers.mainThread())
                    .subscribe();
            try {
                mReceiver.wait();
            } catch (InterruptedException e) {
                mLog.w("OTA unregisterReceiver interrupted");
                Thread.currentThread().interrupt();
            }
        }
    }

    private void otaReboot() {
        mLog.d("OTA reboot");
        try {
            List<String> sucMacList = new LinkedList<>();
            for (Map.Entry<String, Integer> entry : mProgressValues.entrySet()) {
                if (entry.getValue() == 100) {
                    sucMacList.add(entry.getKey());
                }
            }
            if (sucMacList.isEmpty()) {
                mLog.w("No suc mac to reboot");
                return;
            }

            JSONObject json = new JSONObject()
                    .put(IEspActionDevice.KEY_REQUEST, IEspActionDeviceReboot.REQUEST_REBOOT)
                    .put(IEspActionDevice.KEY_DELAY, 5000);
            DeviceUtil.httpLocalMulticastRequest(mProtocol, mHost, mPort, sucMacList,
                    json.toString().getBytes(), null, null);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private class OTAProgressImpl implements OTAProgress {
        String mac;
        String message;
        int progress;

        @Override
        public String getDeviceMac() {
            return mac;
        }

        @Override
        public String getMessage() {
            return message;
        }

        @Override
        public int getProgress() {
            return progress;
        }
    }
}
