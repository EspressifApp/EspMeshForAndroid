package iot.espressif.esp32.model.device.ota;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import io.reactivex.Observable;
import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;
import libs.espressif.security.EspMD5;

class EspOTAClientImpl extends EspOTAClient {
    private static final int PACKAGE_LENGTH_DEFAULT = 1440;

    private static final int RETRY_COUNT = 30;

    private final EspLog mLog = new EspLog(getClass());

    private volatile boolean mClosed = false;

    private File mBin;
    private String mVersion;

    private Collection<IEspDevice> mDevices = new HashSet<>();

    private InetAddress mAddress;
    private int mPort;

    private ExecutorService mExecutorService;
    private OTAThread mThread;

    EspOTAClientImpl(File bin, IEspDevice device, OTACallback callback) {
        mDevices.add(device);
        init(bin, callback);
    }

    EspOTAClientImpl(File bin, Collection<IEspDevice> devices, OTACallback callback) {
        mDevices.addAll(devices);
        init(bin, callback);
    }

    private void init(File bin, OTACallback callback) {
        IEspDevice firstDevice = mDevices.iterator().next();
        mAddress = firstDevice.getLanAddress();
        mPort = firstDevice.getProtocolPort();

        mBin = bin;
        String binName = mBin.getName();
        mVersion = binName.substring(0, binName.length() - SUFFIX_BIN_FILE.length());

        setOTACallback(callback);

        mThread = new OTAThread();
        mExecutorService = Executors.newCachedThreadPool();
    }

    @Override
    public String getAddress() {
        return mAddress == null ? null : mAddress.getHostAddress();
    }

    @Override
    public synchronized void start() {
        if (mClosed) {
            throw new IllegalStateException("The client is closed");
        }

        mThread.start();
    }

    @Override
    public void stop() {
        close();
    }

    @Override
    public synchronized void close() {
        mLog.d("Close Client");
        mClosed = true;

        mThread.interrupt();
        mThread.closeSocket();

        mExecutorService.shutdownNow();
    }

    private Socket createSocket(InetAddress address, int port) {
        mLog.d("ota createLongSocket");
        Socket socket = null;
        for (int i = 0; i < 3; i++) {
            if (mClosed) {
                return null;
            }

            try {
                socket = new Socket(address, port);
                break;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return socket;
    }

    private class OTAThread extends Thread {
        private static final int PROGRESS_READ_BIN = 1;
        private static final int PROGRESS_CHECK_STATUS = 5;
        private static final int PROGRESS_CONNECTING = 10;
        private static final int PROGRESS_REQUEST_OTA = 15;
        private static final int PROGRESS_POSTING = 20;
        private static final int PROGRESS_POSTING_MAX = 90;
        private static final int PROGRESS_OTA_REBOOT = 99;

        private Socket mSocket;
        private List<IEspDevice> mSucDevices = new LinkedList<>();
        private Map<IEspDevice, OTAProgressImpl> mProgressMap = new HashMap<>();

        private byte[] mBinData;

        private synchronized void closeSocket() {
            if (mSocket != null) {
                try {
                    mSocket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }

                mSocket = null;
            }
        }

        private void callback(Runnable runnable) {
            if (mClosed) {
                return;
            }
            if (getOTACallback() != null) {
                if (getOTACallback().getHandler() != null) {
                    getOTACallback().getHandler().post(runnable);
                } else {
                    mExecutorService.execute(runnable);
                }
            }
        }

        private void updateAllProgress(int progressValue, String message) {
            if (getOTACallback() != null) {
                List<OTAProgress> progressList = new LinkedList<>();
                for (OTAProgressImpl progress : mProgressMap.values()) {
                    boolean changed = false;
                    if (progress.getProgress() != PROGRESS_OTA_REBOOT) {
                        progress.message = message;
                        changed = true;
                    }
                    if (progress.getProgress() < progressValue) {
                        progress.progress = progressValue;
                        changed = true;
                    }
                    if (changed) {
                        progressList.add(progress);
                    }
                }

                if (!progressList.isEmpty()) {
                    callback(() -> getOTACallback().onOTAProgressUpdate(EspOTAClientImpl.this, progressList));
                }
            }
        }

        private void updateDeviceProgress(IEspDevice device, int progressValue, String message) {
            if (getOTACallback() != null) {
                boolean changed = false;
                List<OTAProgress> progressList = new ArrayList<>(1);
                OTAProgressImpl progress = mProgressMap.get(device);
                if (progress.getProgress() != PROGRESS_OTA_REBOOT) {
                    progress.message = message;
                    changed = true;
                }
                if (progress.getProgress() < progressValue) {
                    progress.progress = progressValue;
                    changed = true;
                }
                if (changed) {
                    progressList.add(progress);
                }

                if (!progressList.isEmpty()) {
                    callback(() -> getOTACallback().onOTAProgressUpdate(EspOTAClientImpl.this, progressList));
                }
            }

        }

        private class OTAProgressImpl implements OTAProgress {
            IEspDevice device;
            String message;
            int progress;

            @Override
            public String getDeviceMac() {
                return device.getMac();
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

        private void runOta() {
            AtomicInteger appPkgLen = new AtomicInteger(PACKAGE_LENGTH_DEFAULT);
            LinkedList<IEspDevice> postDevices = new LinkedList<>(mDevices);
            Map<IEspDevice, Set<Integer>> postMap = new HashMap<>();

            for (IEspDevice device : mDevices) {
                OTAProgressImpl progress = new OTAProgressImpl();
                progress.device = device;

                mProgressMap.put(device, progress);
            }

            mBinData = readBinData();
            if (mBinData == null) {
                updateAllProgress(PROGRESS_READ_BIN, "Read bin data failed");
                mLog.e("OTA RETURN 0");
                return;
            }
            String binMD5 = EspMD5.getMD5String(mBinData);

            boolean checkStatus = true;
            for (int tryCount = 0; tryCount < RETRY_COUNT; tryCount++) {
                mLog.d("OTA try count " + tryCount);
                if (mClosed) {
                    closeSocket();
                    mLog.e("OTA RETURN 1");
                    return;
                }

                // Check status
                if (checkStatus) {
                    mLog.d("OTA checkStatus");
                    if (getOTACallback() != null) {
                        updateAllProgress(PROGRESS_CHECK_STATUS, "Checking status");
                    }
                    Map<IEspDevice, HashSet<Integer>> statusMap = checkStatus(postDevices, mVersion,
                            mBin.length(), binMD5, appPkgLen);
                    if (statusMap == Collections.<IEspDevice, HashSet<Integer>>emptyMap()) {
                        mLog.w("OTA checkStatus failed");
                        continue;
                    }
                    if (statusMap.isEmpty()) {
                        mLog.e("OTA BREAK 1");
                        break;
                    }

                    postMap.clear();
                    postDevices.clear();
                    boolean hasSeqData = false;
                    for (Map.Entry<IEspDevice, HashSet<Integer>> entry : statusMap.entrySet()) {
                        if (!entry.getValue().isEmpty()) {
                            hasSeqData = true;
                        }

                        postMap.put(entry.getKey(), entry.getValue());
                        postDevices.add(entry.getKey());
                    }
                    if (!hasSeqData) {
                        mLog.w("OTA all status seq set is empty");
                        continue;
                    }

                    checkStatus = false;
                }

                // Create long connection
                if (getOTACallback() != null) {
                    updateAllProgress(PROGRESS_CONNECTING, "Creating long connection");
                }
                if (mSocket == null) {
                    mSocket = createSocket(mAddress, mPort);
                }
                if (mSocket == null) {
                    mLog.w("OTA createLongSocket failed");
                    continue;
                }
                if (mClosed) {
                    closeSocket();
                    mLog.e("OTA RETURN 2");
                    return;
                }

                // Request OTA
                mLog.d("OTA requestOTA");
                if (getOTACallback() != null) {
                    updateAllProgress(PROGRESS_REQUEST_OTA, "Request ota");
                }
                EspHttpResponse requResp = requestOTA(postDevices, mAddress, mSocket.getLocalPort(),
                        mSocket.getLocalAddress().getAddress(), appPkgLen.get());
                if (requResp == null) {
                    mLog.i("OTA requestOTA failed");
                    continue;
                } else if (requResp.getCode() == HttpURLConnection.HTTP_NOT_FOUND) {
                    mLog.w("OTA requestOTA 404");
                    closeSocket();
                    continue;
                } else if (requResp.getCode() == HttpURLConnection.HTTP_FORBIDDEN) {
                    mLog.w("OTA requestOTA 403");
                    closeSocket();
                    mLog.e("OTA BREAK 2");
                    break;
                }
                checkStatus = true;

                if (mClosed) {
                    closeSocket();
                    mLog.e("OTA RETURN 3");
                    return;
                }
                try {
                    writeBinData(appPkgLen.get(), postDevices, postMap);

                    if (mClosed) {
                        closeSocket();
                        mLog.e("OTA RETURN 4");
                        return;
                    }

                    int respTimeout = Integer.MAX_VALUE;
                    mSocket.setSoTimeout(respTimeout);
                    InputStream is = mSocket.getInputStream();
                    int recvResp;
                    try {
                        mLog.d("OTA wait write resp");
                        recvResp = is.read();
                    } catch (IOException ioE) {
                        mLog.w("OTA wait resp timeout");
                        throw ioE;
                    }

                    mLog.i("OTA response code = " + recvResp);
                    if (recvResp != 200) {
                        closeSocket();
                        continue;
                    }

                    mSocket.setSoTimeout(5000);
                    int delay = is.read();
                    delay = (is.read() << 8) | delay;
                    mLog.i("OTA response delay = " + delay);
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                        Thread.currentThread().interrupt();
                        mLog.e("OTA BREAK 3");
                        break;
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    // Socket disconnected
                    closeSocket();
                }
            }

            if (mClosed) {
                closeSocket();
                mLog.e("OTA RETURN 5");
                return;
            }

            closeSocket();
            if (willRebootAfterOTA()) {
                otaReboot();
            }
            mLog.e("OTA RETURN 6");
        } // end runOta()

        @Override
        public void run() {
            if (getOTACallback() != null) {
                callback(() -> getOTACallback().onOTAPrepare(EspOTAClientImpl.this));
            }

            try {
                runOta();
            } catch (Exception e) {
                e.printStackTrace();
                closeSocket();
            }

            if (getOTACallback() != null) {
                callback(() -> {
                    List<String> macs = new ArrayList<>(mSucDevices.size());
                    for (IEspDevice device : mSucDevices) {
                        macs.add(device.getMac());
                    }
                    getOTACallback().onOTAResult(EspOTAClientImpl.this, macs);
                });
            }
            mLog.d("EspOTAClient run over");
        }

        private byte[] readBinData() {
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(mBin);
                int binLen = (int) mBin.length();
                byte[] result = new byte[binLen];
                int read = fis.read(result);
                if (read == binLen) {
                    return result;
                } else {
                    mLog.w("Read length wrong");
                    return null;
                }

            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (fis != null) {
                    try {
                        fis.close();
                    } catch (IOException ignore){
                    }
                }
            }

            return null;
        }

        private JSONObject checkResponseJSON(EspHttpResponse response) {
            if (response == null) {
                return null;
            }

            if (response.getCode() != HttpURLConnection.HTTP_OK) {
                return null;
            }

            try {
                return response.getContentJSON();
            } catch (JSONException e) {
                e.printStackTrace();
                return null;
            }
        }

        private Map<IEspDevice, HashSet<Integer>> checkStatus(
                List<IEspDevice> devices, String binVersion, long binLength, String binMD5, AtomicInteger appPkgLen) {
            HashMap<IEspDevice, HashSet<Integer>> result = new HashMap<>();

            JSONObject postJSON = new JSONObject();
            try {
                postJSON.put(KEY_REQUEST, REQUEST_OTA_STATUS);
                postJSON.put(KEY_BIN_VERSION, binVersion);
                postJSON.put(KEY_BIN_LENGTH, binLength);
                postJSON.put(KEY_BIN_MD5, binMD5);
                postJSON.put(KEY_PACKAGE_LENGTH, appPkgLen.get());
            } catch (JSONException e) {
                e.printStackTrace();
                return Collections.emptyMap();
            }

            int timeout = 30000;
            int tryCount = 3;
            EspHttpParams params = new EspHttpParams();
            params.setSOTimeout(timeout);
            EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
            Map<String, String> httpHeaders = new HashMap<>();
            if (tokenH != null) {
                httpHeaders.put(tokenH.getName(), tokenH.getValue());
            }
            Map<String, IEspDevice> deviceMap = new HashMap<>();
            for (IEspDevice device : devices) {
                deviceMap.put(device.getMac(), device);
            }

            Map<String, EspHttpResponse> respMap = new HashMap<>();
            for (int i = 0; i < tryCount && !deviceMap.isEmpty(); i++) {
                if (mClosed) {
                    return Collections.emptyMap();
                }

                List<EspHttpResponse> respList = DeviceUtil.httpLocalMulticastRequest(deviceMap.values(),
                        postJSON.toString().getBytes(), params, httpHeaders);
                if (respList == null) {
                    return Collections.emptyMap();
                }
                Map<String, EspHttpResponse> map = DeviceUtil.getMapWithDeviceResponses(respList);
                if (map == null) {
                    return Collections.emptyMap();
                }

                for (String mac : map.keySet()) {
                    deviceMap.remove(mac);
                }

                respMap.putAll(map);
            }

            for (IEspDevice device : devices) {
                if (respMap.isEmpty()) {
                    break;
                }

                EspHttpResponse response = respMap.get(device.getMac());
                JSONObject respJSON = checkResponseJSON(response);
                if (respJSON == null) {
                    result.put(device, new HashSet<>());
                    continue;
                }

                try {
                    int status = respJSON.getInt(KEY_STATUS_CODE);
                    switch (status) {
                        case STATUS_CODE_SUC:
                            mSucDevices.add(device);
                            updateDeviceProgress(device, PROGRESS_OTA_REBOOT, "Wait for rebooting");
                            break;
                        case STATUS_CONTINUE:
                            JSONArray array = respJSON.getJSONArray(KEY_PACKAGE_SEQUENCE);
                            HashSet<Integer> set = new HashSet<>();
                            for (int i = 0; i < array.length(); i++) {
                                set.add(array.getInt(i));
                            }
                            result.put(device, set);

                            int pkgLen = respJSON.getInt(KEY_PACKAGE_LENGTH);
                            appPkgLen.set(pkgLen);
                            break;
                        default:
                            mLog.w("CheckStatus unknow status code");
                            result.put(device, new HashSet<>());
                            break;
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            return result;
        }
        private String getOtaRequestUrl(String protocol, String host, int port) {
            return String.format(Locale.ENGLISH, "%s://%s:%d/mesh_ota", protocol, host, port);
        }

        private EspHttpResponse requestOTA(List<IEspDevice> devices, InetAddress address,
                                           int appPort, byte[] appIP, int appPkgLength) {
            mLog.d("OTA requestOTA");
            List<IEspDevice> requestDevices = new LinkedList<>(devices);
            Collections.sort(requestDevices, (o1, o2) -> {
                Integer layer1 = o1.getMeshLayerLevel();
                Integer layer2 = o2.getMeshLayerLevel();
                return layer2.compareTo(layer1);
            });

            IEspDevice firstDev = requestDevices.get(0);
            String url = getOtaRequestUrl(firstDev.getProtocol(), address.getHostAddress(), firstDev.getProtocolPort());
            StringBuilder otaAddr = new StringBuilder();
            String portStr = String.format("%02x%02x", (appPort & 0xff), ((appPort >> 8) & 0xff));
            otaAddr.append(portStr);
            for (byte b : appIP) {
                otaAddr.append(String.format("%02x", b));
            }
            mLog.d("OTA requestOTA addr" + otaAddr.toString());

            StringBuilder bssids = new StringBuilder();
            for (int i = 0; i < requestDevices.size(); i++) {
                bssids.append(requestDevices.get(i).getMac());
                if (i < requestDevices.size() - 1) {
                    bssids.append(",");
                }
            }

            Map<String, String> headers = new HashMap<>();
            headers.put(HEADER_OTA_ADDRESS, otaAddr.toString());
            headers.put(HEADER_OTA_LENGTH, String.valueOf(appPkgLength));
            headers.put(HEADER_NODE_COUNT, String.valueOf(requestDevices.size()));
            headers.put(HEADER_NODE_MAC, bssids.toString());
            headers.put(EspHttpUtils.CONTENT_TYPE, "application/ota_bin");

            EspHttpParams params = new EspHttpParams();
            params.setTryCount(3);
            params.setSOTimeout(5000);
            return EspHttpUtils.Post(url, null, params, headers);
        }

        private void writeBinData(int pkgLen, List<IEspDevice> devices, Map<IEspDevice, Set<Integer>> deviceSeqMap)
                throws IOException {
            // Read bin data
            if (getOTACallback() != null) {
                updateAllProgress(PROGRESS_POSTING, "Prepare to post bin");
            }
            List<byte[]> binDataList = new ArrayList<>();
            final int headLen = 8;
            final int binLen = pkgLen - headLen;
            ByteArrayInputStream is = new ByteArrayInputStream(mBinData);
            for (int i = 0; ; i++) {
                byte[] data = new byte[pkgLen];
                data[0] = data[1] = data[2] = data[3] = (byte) 0xa5;
                data[4] = (byte) (i & 0xff);
                data[5] = (byte) ((i >> 8) & 0xff);

                int read = is.read(data, headLen, binLen);
                if (read == -1) {
                    break;
                }
                data[6] = (byte) (read & 0xff);
                data[7] = (byte) ((read >> 8) & 0xff);

                binDataList.add(data);
            }
            is.close();

            // Process device seq set
            Observable.fromIterable(deviceSeqMap.values())
                    .filter(set -> set.contains(-1))
                    .doOnNext(set -> {
                        set.remove(-1);
                        for (int index = set.iterator().next(); index < binDataList.size(); index++) {
                            set.add(index);
                        }
                    })
                    .subscribe();

            Collections.sort(devices, (d1, d2) -> {
                Set<Integer> set1 = deviceSeqMap.get(d1);
                Set<Integer> set2 = deviceSeqMap.get(d2);
                Integer size1 = set1.size();
                Integer size2 = set2.size();
                return size1.compareTo(size2);
            });

            for (int i = 0; i < devices.size(); i++) {
                Set<Integer> set1 = deviceSeqMap.get(devices.get(i));
                for (int j = i + 1; j < devices.size(); j++) {
                    Set<Integer> set2 = deviceSeqMap.get(devices.get(j));
                    Observable.fromIterable(set1)
                            .filter(set2::contains)
                            .doOnNext(set2::remove)
                            .subscribe();
                }
            }

            if (mClosed) {
                closeSocket();
                return;
            }

            // Post bin data
            mSocket.setSoTimeout(30000);
            mSocket.setSendBufferSize(pkgLen);
            AtomicInteger postedPercent = new AtomicInteger(0);
            AtomicInteger postedPkgSize = new AtomicInteger(0);
            AtomicReference<IOException> writeException = new AtomicReference<>();
            Observable.fromIterable(devices)
                    .concatMap(device -> {
                        Set<Integer> set = deviceSeqMap.get(device);
                        mLog.d("OTA writeBinData ready to post pkg size " + set.size());
                        ArrayList<Integer> list = new ArrayList<>(set.size());
                        list.addAll(set);
                        Collections.sort(list, Integer::compareTo);
                        return Observable.fromIterable(list);
                    })
                    .doOnNext(index -> {
                        if (mClosed) {
                            closeSocket();
                            return;
                        }

                        // write bin data
                        byte[] postData = binDataList.get(index);
                        mSocket.getOutputStream().write(postData);
                        mSocket.getOutputStream().flush();

                        // update progress
                        int currentPosted = postedPkgSize.get() + 1;
                        postedPkgSize.set(currentPosted);
                        int currentPercent = currentPosted * 100 / binDataList.size() / 10; // Notify change every 10%
                        if (currentPercent > postedPercent.get()) {
                            postedPercent.set(currentPercent);
                            if (getOTACallback() != null) {
                                int progress = (PROGRESS_POSTING_MAX - PROGRESS_POSTING) * currentPercent / 10 + PROGRESS_POSTING;
                                updateAllProgress(progress, "Posting bin data");
                            }
                        }
                    })
                    .subscribe(new Observer<Integer>() {
                        @Override
                        public void onSubscribe(Disposable d) {
                            if (getOTACallback() != null) {
                                updateAllProgress(PROGRESS_POSTING, "Posting bin data");
                            }
                        }

                        @Override
                        public void onNext(Integer integer) {
                        }

                        @Override
                        public void onError(Throwable e) {
                            if (e instanceof IOException) {
                                writeException.set((IOException) e);
                            } else {
                                e.printStackTrace();
                            }

                        }

                        @Override
                        public void onComplete() {
                        }
                    });

            mLog.d("OTA writeBinData post bin end");
            if (writeException.get() != null) {
                mLog.w("OTA writeBinData catch IOE " + writeException.get().getMessage());
                throw writeException.get();
            }

            // Post end package
            try {
                byte[] endData = new byte[pkgLen];
                endData[0] = -1;
                endData[1] = -1;
                mSocket.getOutputStream().write(endData);
                mSocket.getOutputStream().flush();
                mLog.d("OTA writeBinData post end package");
            } catch (NullPointerException e) {
                mLog.w("mSocket is null");
            }
        }

        private void otaReboot() {
            if (mSucDevices.isEmpty()) {
                return;
            }

            EspHttpParams params = new EspHttpParams();
            params.setTryCount(3);
            DeviceUtil.delayRequestRetry(mSucDevices, REQUEST_OTA_REBOOT, params);
        }
    } // end OTARunnable
}
