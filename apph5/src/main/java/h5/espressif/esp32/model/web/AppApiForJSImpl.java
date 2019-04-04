package h5.espressif.esp32.model.web;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Handler;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import blufi.espressif.params.BlufiConfigureParams;
import blufi.espressif.params.BlufiParameter;
import h5.espressif.esp32.action.EspActionDeviceConfigure2;
import h5.espressif.esp32.action.EspActionJSON;
import h5.espressif.esp32.action.IEspActionDeviceConfigure2;
import h5.espressif.esp32.main.EspWebActivity;
import h5.espressif.esp32.main.MainDeviceNotifyHelper;
import h5.espressif.esp32.model.customer.Customer;
import h5.espressif.esp32.model.other.HttpLongSocket;
import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.common.EspActionDownloadFromIotEsp;
import iot.espressif.esp32.action.device.EspActionDeviceInfo;
import iot.espressif.esp32.action.device.EspActionDeviceOTA;
import iot.espressif.esp32.action.device.IEspActionDevice;
import iot.espressif.esp32.action.device.IEspActionDeviceOTA;
import iot.espressif.esp32.action.device.IEspActionDeviceReboot;
import iot.espressif.esp32.action.group.EspActionGroup;
import iot.espressif.esp32.action.user.EspActionUserLoadLastLogged;
import iot.espressif.esp32.action.user.EspActionUserRegister;
import iot.espressif.esp32.action.user.EspActionUserResetPassword;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.db.model.ApDB;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.db.model.DeviceHWDB;
import iot.espressif.esp32.db.model.OperationDB;
import iot.espressif.esp32.db.model.SceneDB;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.model.device.ota.EspOTAClient;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.group.IEspGroup;
import iot.espressif.esp32.model.other.EspDownloadResult;
import iot.espressif.esp32.model.other.EspRomQueryResult;
import iot.espressif.esp32.model.other.EspRxObserver;
import iot.espressif.esp32.model.user.EspLoginResult;
import iot.espressif.esp32.model.user.EspRegisterResult;
import iot.espressif.esp32.model.user.EspResetPasswordResult;
import iot.espressif.esp32.model.user.EspUser;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.app.AppUtil;
import libs.espressif.app.SdkUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;
import libs.espressif.utils.TextUtils;

class AppApiForJSImpl implements AppApiForJSConstants {
    private final EspLog mLog = new EspLog(getClass());

    private final String mNoArgMark = new String(new byte[]{
            'N', 'o', 'A', 'r', 'g', 'M', 'a', 'r', 'k'
    });
    private final LinkedBlockingQueue<Task> mTaskQueue;
    private final Thread mTaskThread;

    private volatile EspWebActivity mActivity;
    private EspApplication mApp;

    private AppApiForJS mOrigin;

    private EspUser mUser = EspUser.INSTANCE;

    private Disposable mSnifferTask;

    private final Object mBlufiLock = new Object();
    private MeshBlufiClient mBlufi;

    private final Object mOtaLock = new Object();
    private Map<String, EspOTAClient> mOtaClientMap = new HashMap<>();

    private final Lock mLongHttpLock = new ReentrantLock();
    private HttpLongSocket mHttpLongSocket;
    private Thread mHttpLongSocketReadThread;

    private static class Task {
        Method method;
        String argument;
    }

    AppApiForJSImpl(EspWebActivity activity, AppApiForJS api) {
        mActivity = activity;
        mApp = EspApplication.getInstance();
        mOrigin = api;
        mTaskQueue = new LinkedBlockingQueue<>();
        mTaskThread = new Thread(() -> {
            while (true) {
                if (Thread.currentThread().isInterrupted()) {
                    break;
                }

                try {
                    Task task = mTaskQueue.take();
                    try {
                        if (task.argument != null) {
                            task.method.invoke(mOrigin, task.argument);
                        } else {
                            task.method.invoke(mOrigin);
                        }
                    } catch (IllegalAccessException | InvocationTargetException e) {
                        e.printStackTrace();
                    }
                } catch (InterruptedException e) {
                    mLog.w("JS task queue interrupted");
                    break;
                }
            }

            mLog.d("Task thread end");
        });
        mTaskThread.start();
    }

    private void evaluateJavascript(String script) {
        if (mActivity != null) {
            mActivity.evaluateJavascript(script);
        }
    }

    void log(String msg) {
        mLog.i(msg);
    }

    void release() {
        mOrigin = null;
        mTaskQueue.clear();
        mTaskThread.interrupt();
        mApp = null;
        mActivity = null;
    }

    void addQueueTask(String request) {
        String methodName;
        String argument;
        try {
            JSONObject json = new JSONObject(request);
            methodName = json.getString(KEY_METHOD);
            argument = json.optString(KEY_ARGUMENT, mNoArgMark);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        boolean suc;
        try {
            Method method;
            //noinspection StringEquality
            if (argument == mNoArgMark) {
                method = mOrigin.getClass().getMethod(methodName);
            } else {
                method = mOrigin.getClass().getMethod(methodName, String.class);
            }

            Task task = new Task();
            task.method = method;
            task.argument = argument;
            mTaskQueue.clear();
            mTaskQueue.add(task);

            suc = true;
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
            suc = false;
        }

        try {
            JSONObject resultJSON = new JSONObject()
                    .put(KEY_RESULT, suc);

            evaluateJavascript(JSApi.onAddQueueTask(resultJSON.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void scanTopo() {
        Observable.create(emitter -> {
            mUser.scanStations();
            List<IEspDevice> devices = mUser.getAllDeviceList();
            JSONArray array = new JSONArray();
            for (IEspDevice device : devices) {
                array.put(device.getMac());
            }
            emitter.onNext(array.toString());
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new EspRxObserver<Object>() {
                    @Override
                    public void onNext(Object topo) {
                        evaluateJavascript(JSApi.onTopoScanned(topo.toString()));
                    }
                });
    }

    void scanDevicesAsync() {
        Observable.create(emitter -> {
            String result = scanDevices();
            emitter.onNext(result);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new EspRxObserver<Object>() {
                    @Override
                    public void onNext(Object result) {
                        evaluateJavascript(JSApi.onDeviceScanned(result.toString()));
                    }
                });
    }

    private String scanDevices() {
        LinkedBlockingQueue<Object> getInfoQueue = new LinkedBlockingQueue<>();
        getInfoQueue.iterator().hasNext();
        AtomicInteger meshCounter = new AtomicInteger(0);
        mUser.scanStations(mesh -> {
            meshCounter.incrementAndGet();

            List<IEspDevice> cacheDevices = new LinkedList<>();
            @SuppressWarnings("MismatchedQueryAndUpdateOfCollection")
            Set<Integer> cidset = new HashSet<>();
            List<IEspDevice> newDevices = new LinkedList<>();
            newDevices.iterator().hasNext();
            Observable.fromIterable(mesh)
                    .map(ingDev -> {
                        List<EspDeviceCharacteristic> ingCharaters = ingDev.getCharacteristics();
                        if (ingCharaters.isEmpty()) {
                            newDevices.add(ingDev);
                        } else {
                            cacheDevices.add(ingDev);
                        }
                        return ingCharaters;
                    })
                    .flatMap(Observable::fromIterable)
                    .doOnNext(chara -> cidset.add(chara.getCid()))
                    .subscribe();

            if (!cacheDevices.isEmpty()) {
                JSONArray ingArray = new EspActionJSON().doActionParseDevices(cacheDevices);
                evaluateJavascript(JSApi.onDeviceScanning(ingArray.toString()));
            }

            Observable.create(emitter -> {
                new EspActionDeviceInfo().doActionGetDevicesInfoLocal(mesh);
                getInfoQueue.add(new Object());
                emitter.onNext(Boolean.TRUE);
                emitter.onComplete();
            }).subscribeOn(Schedulers.io())
                    .subscribe();
        });

        for (int meshCount = 0; meshCount < meshCounter.get(); meshCount++) {
            try {
                getInfoQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                return null;
            }
        }

        List<IEspDevice> devices = mUser.getAllDeviceList();
        JSONArray array = new EspActionJSON().doActionParseDevices(devices);
        return array.toString();
    }

    private String requestDevice(String request) {
        try {
            JSONObject postJSON = new JSONObject(request);
            String mac = postJSON.getString(KEY_MAC);
            postJSON.remove(KEY_MAC);
            postJSON.remove(KEY_CALLBACK);
            postJSON.remove(KEY_TAG);
            postJSON.remove(KEY_HOST);
            IEspDevice device = mUser.getDeviceForMac(mac);
            if (device == null) {
                return null;
            }

            boolean rootResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            EspHttpHeader rootRespHeader = rootResp ? DeviceUtil.HEADER_ROOT_RESP : null;
            postJSON.remove(KEY_ROOT_RESP);
            EspHttpResponse response = DeviceUtil.httpLocalRequest(device, postJSON.toString().getBytes(),
                    null, rootRespHeader);
            if (response != null) {
                return response.getContentString();
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }

    void requestDeviceAsync(String request) {
        String callback;
        String callbackTag;
        try {
            JSONObject json = new JSONObject(request);
            callback = json.isNull(KEY_CALLBACK) ? null : json.getString(KEY_CALLBACK);
            callbackTag = json.isNull(KEY_TAG) ? null : json.getString(KEY_TAG);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        Observable.just(request)
                .subscribeOn(Schedulers.io())
                .doOnNext(rqst -> {
                    String result = requestDevice(rqst);
                    if (callback != null) {
                        JSONObject json = new JSONObject();
                        try {
                            JSONObject tagJSON = new JSONObject(callbackTag);
                            json.put(KEY_TAG, tagJSON);
                        } catch (JSONException | NullPointerException e) {
                            json.put(KEY_TAG, callbackTag);
                        }
                        try {
                            JSONObject resultJSON = new JSONObject(result);
                            json.put(KEY_RESULT, resultJSON);
                        } catch (JSONException | NullPointerException e) {
                            json.put(KEY_RESULT, result);
                        }
                        evaluateJavascript(String.format("%s(\'%s\')", callback, json.toString()));
                    }
                })
                .subscribe();
    }

    void requestDevicesMulticastAsync(String request) {
        String callback;
        String callbackTag;
        try {
            JSONObject json = new JSONObject(request);
            callback = json.isNull(KEY_CALLBACK) ? null : json.getString(KEY_CALLBACK);
            callbackTag = json.isNull(KEY_TAG) ? null : json.getString(KEY_TAG);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        Observable.just(request)
                .subscribeOn(Schedulers.io())
                .doOnNext(rqst -> {
                    String result = requestDevicesMulticast(rqst);
                    if (callback != null) {
                        JSONObject json = new JSONObject();
                        try {
                            JSONObject tagJSON = new JSONObject(callbackTag);
                            json.put(KEY_TAG, tagJSON);
                        } catch (JSONException | NullPointerException e) {
                            json.put(KEY_TAG, callbackTag);
                        }

                        Object resultObj;
                        try {
                            resultObj = new JSONObject(result);
                        } catch (JSONException e) {
                            try {
                                resultObj = new JSONArray(result);
                            } catch (JSONException e1) {
                                resultObj = result;
                            }
                        } catch (NullPointerException e) {
                            resultObj = result;
                        }
                        json.put(KEY_RESULT, resultObj);

                        evaluateJavascript(String.format("%s(\'%s\')", callback, json.toString()));
                    }
                })
                .subscribe();
    }

    private String requestDevicesMulticast(String request) {
        try {
            JSONObject postJSON = new JSONObject(request);
            JSONArray macArray = postJSON.getJSONArray(KEY_MAC);
            List<IEspDevice> devices = new ArrayList<>(macArray.length());
            for (int i = 0; i < macArray.length(); i++) {
                String mac = macArray.getString(i);
                IEspDevice device = mUser.getDeviceForMac(mac);
                if (device != null) {
                    devices.add(device);
                }
            }

            postJSON.remove(KEY_MAC);
            postJSON.remove(KEY_CALLBACK);
            postJSON.remove(KEY_TAG);
            postJSON.remove(KEY_HOST);
            boolean rootResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            EspHttpHeader rootRespHeader = rootResp ? DeviceUtil.HEADER_ROOT_RESP : null;
            postJSON.remove(KEY_ROOT_RESP);
            List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(devices,
                    postJSON.toString().getBytes(), null, true, rootRespHeader);
            JSONArray result = new JSONArray();
            for (EspHttpResponse response : responseList) {
                try {
                    String mac = response.findHeaderValue(IEspActionDevice.HEADER_NODE_MAC);
                    JSONObject respJSON = response.getContentJSON();
                    if (mac != null && respJSON != null) {
                        respJSON.put(KEY_MAC, mac);
                        result.put(respJSON);
                    }
                } catch (JSONException e1) {
                    e1.printStackTrace();
                }
            }
            return result.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    void startConfigureBlufi(String request) {
        stopConfigureBlufi();

        String bleAddress;
        int version;
        BlufiConfigureParams params;
        try {
            params = new BlufiConfigureParams();
            params.setOpMode(BlufiParameter.OP_MODE_STA);

            JSONObject json = new JSONObject(request);
            bleAddress = json.getString("ble_addr");
            version = json.getInt("version");

            String ssid = json.getString("ssid");
            params.setStaSSID(ssid);

            String bssid = json.optString("bssid", null);
            params.setStaBSSID(bssid);

            String password = json.getString("password");
            params.setStaPassword(password);

            JSONArray whiteListArray = json.getJSONArray("white_list");
            for (int i = 0; i < whiteListArray.length(); i++) {
                String mac = whiteListArray.getString(i);
                params.addWhiteAddress(DeviceUtil.convertColonBssid(mac).toUpperCase());
            }

            JSONArray meshIdArray = json.getJSONArray("mesh_id");
            byte[] meshIdData = new byte[meshIdArray.length()];
            for (int i = 0; i < meshIdData.length; i++) {
                meshIdData[i] = (byte) meshIdArray.getInt(i);
            }
            params.setMeshID(meshIdData);

            if (!json.isNull("mesh_type")) {
                params.setMeshType(json.getInt("mesh_type"));
            }

            if (!json.isNull("vote_percentage")) {
                params.setVotePercentage(json.getInt("vote_percentage"));
            }
            if (!json.isNull("vote_max_count")) {
                params.setVoteMaxCount(json.getInt("vote_max_count"));
            }
            if (!json.isNull("backoff_rssi")) {
                params.setBackoffRssi(json.getInt("backoff_rssi"));
            }
            if (!json.isNull("scan_min_count")) {
                params.setScanMinCount(json.getInt("scan_min_count"));
            }
            if (!json.isNull("scan_fail_count")) {
                params.setScanFailCount(json.getInt("scan_fail_count"));
            }
            if (!json.isNull("monitor_ie_count")) {
                params.setMonitorIeCount(json.getInt("monitor_ie_count"));
            }
            if (!json.isNull("root_healing_ms")) {
                params.setRootHealingMS(json.getInt("root_healing_ms"));
            }
            if (!json.isNull("root_conflicts_enable")) {
                params.setRootConflictsEnable(json.getBoolean("root_conflicts_enable"));
            }
            if (!json.isNull("fix_root_enable")) {
                params.setFixRootEnalble(json.getBoolean("fix_root_enable"));
            }
            if (!json.isNull("capacity_num")) {
                params.setCapacityNum(json.getInt("capacity_num"));
            }
            if (!json.isNull("max_layer")) {
                params.setMaxLayer(json.getInt("max_layer"));
            }
            if (!json.isNull("max_connection")) {
                params.setMaxConnection(json.getInt("max_connection"));
            }
            if (!json.isNull("assoc_expire_ms")) {
                params.setAssocExpireMS(json.getInt("assoc_expire_ms"));
            }
            if (!json.isNull("beacon_interval_ms")) {
                params.setBeaconIntervalMS(json.getInt("beacon_interval_ms"));
            }
            if (!json.isNull("passive_scan_ms")) {
                params.setPassiveScanMS(json.getInt("passive_scan_ms"));
            }
            if (!json.isNull("monitor_duration_ms")) {
                params.setMonitorDurationMS(json.getInt("monitor_duration_ms"));
            }
            if (!json.isNull("cnx_rssi")) {
                params.setCnxRssi(json.getInt("cnx_rssi"));
            }
            if (!json.isNull("select_rssi")) {
                params.setSelectRssi(json.getInt("select_rssi"));
            }
            if (!json.isNull("switch_rssi")) {
                params.setSwitchRssi(json.getInt("switch_rssi"));
            }
            if (!json.isNull("xon_qsize")) {
                params.setXonQsize(json.getInt("xon_qsize"));
            }
            if (!json.isNull("retransmit_enable")) {
                params.setRetransmitEnable(json.getBoolean("retransmit_enable"));
            }
            if (!json.isNull("data_drop_enable")) {
                params.setDataDropEnable(json.getBoolean("data_drop_enable"));
            }

        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        synchronized (mBlufiLock) {
            String deviceMac = DeviceUtil.convertColonBssid(bleAddress).toUpperCase();
            mBlufi = new EspActionDeviceConfigure2().doActionConfigureBlufi2(
                    deviceMac, version, params, new ConfigureProgressCB());
        }

    }

    private class ConfigureProgressCB implements IEspActionDeviceConfigure2.ProgressCallback {
        private int mStatusCode = IEspActionDeviceConfigure2.CODE_IDLE;

        @Override
        public void onUpdate(int progress, int status, String message) {
            if (mActivity == null) {
                return;
            }
            if (mStatusCode < IEspActionDeviceConfigure2.CODE_SUC
                    || mStatusCode > IEspActionDeviceConfigure2.CODE_IDLE) {
                return;
            }

            mStatusCode = status;
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_PROGRESS, progress)
                        .put(KEY_CODE, status)
                        .put(KEY_MESSAGE, message);

                evaluateJavascript(JSApi.onConfigureProgress(json.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }

    void stopConfigureBlufi() {
        synchronized (mBlufiLock) {
            if (mBlufi != null) {
                mBlufi.close();
                mBlufi = null;
            }
        }

    }

    String loadDevice(String prefName, String mac) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        return sp.getString(mac, null);
    }

    String loadDevices(String prefName) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        try {
            JSONArray array = new JSONArray();
            for (Map.Entry<String, ?> entry : map.entrySet()) {
                Object info = entry.getValue();
                if (info != null) {
                    JSONObject json = new JSONObject(info.toString());
                    array.put(json);
                }
            }
            return array.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    boolean saveDevice(String prefName, String info) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        try {
            JSONObject json = new JSONObject(info);
            String mac = json.getString(KEY_MAC);
            sp.edit().putString(mac, info).apply();
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    boolean saveDevices(String prefName, String info) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();
            JSONArray array = new JSONArray(info);
            for (int i = 0; i < array.length(); i++) {
                JSONObject json = array.getJSONObject(i);
                String mac = json.getString(KEY_MAC);
                editor.putString(mac, json.toString());
            }
            editor.apply();
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    void removeDevice(String prefName, String mac) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        sp.edit().remove(mac).apply();
    }

    boolean removeDevices(String prefName, String macs) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();
            JSONArray array = new JSONArray(macs);
            for (int i = 0; i < array.length(); i++) {
                String mac = array.getString(i);
                editor.remove(mac);
            }
            editor.apply();
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    void removeAllDevices(String prefName) {
        SharedPreferences sp = mApp.getSharedPreferences(prefName, Context.MODE_PRIVATE);
        sp.edit().clear().apply();
    }

    void saveDeviceTable(String table) {
        try {
            JSONObject json = new JSONObject(table);
            int row = json.getInt(KEY_ROW);
            int column = json.getInt(KEY_COLUMN);

            SharedPreferences sp = mApp.getSharedPreferences(PREF_DEVICE_TAB, Context.MODE_PRIVATE);
            sp.edit().putInt(KEY_ROW, row)
                    .putInt(KEY_COLUMN, column)
                    .apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    void loadDeviceTable() {
        SharedPreferences sp = mApp.getSharedPreferences(PREF_DEVICE_TAB, Context.MODE_PRIVATE);
        int row = sp.getInt(KEY_ROW, -1);
        int column = sp.getInt(KEY_COLUMN, -1);

        if (row == -1 && column == -1) {
            evaluateJavascript(JSApi.onLoadDeviceTable(""));
            return;
        }

        JSONObject json = new JSONObject();
        try {
            if (row >= 0) {
                json.put(KEY_ROW, row);
            }
            if (column >= 0) {
                json.put(KEY_COLUMN, column);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        evaluateJavascript(JSApi.onLoadDeviceTable(json.toString()));
    }

    void saveTableDevices(String devices) {
        try {
            JSONArray array = new JSONArray(devices);

            SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();

            for (int i = 0; i < array.length(); i++) {
                JSONObject json = array.getJSONObject(i);
                String mac = json.getString(KEY_MAC);
                editor.putString(mac, json.toString());
            }

            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadTableDevices() {
        JSONArray array = new JSONArray();

        SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        for (Object obj : map.values()) {
            if (obj != null) {
                try {
                    JSONObject json = new JSONObject(obj.toString());
                    array.put(json);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        evaluateJavascript(JSApi.onLoadTableDevices(array.toString()));
    }

    String loadTableDevices(String macs) {
        JSONArray array = new JSONArray();

        try {
            JSONArray macArray = new JSONArray(macs);
            SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
            for (int i = 0; i < macArray.length(); i++) {
                String mac = macArray.getString(i);
                String device = sp.getString(mac, null);
                if (device != null) {
                    JSONObject json = new JSONObject(device);
                    array.put(json);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return array.toString();
    }

    String loadTableDevice(String mac) {
        SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
        String device = sp.getString(mac, null);
        if (device != null) {
            try {
                return new JSONObject(device).toString();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return null;
    }

    void removeAllTableDevices() {
        SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
        sp.edit().clear().apply();
    }

    void removeTableDevices(String devices) {
        try {
            JSONArray macArray = new JSONArray(devices);

            SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();

            for (int i = 0; i < macArray.length(); i++) {
                String mac = macArray.getString(i);
                editor.remove(mac);
            }

            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadAPs() {
        List<ApDB> aps = MeshObjectBox.getInstance().ap().loadAllAps();
        JSONArray array = new JSONArray();
        for (ApDB db : aps) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_SSID, db.ssid)
                        .put(KEY_PASSWORD, db.password);

                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        evaluateJavascript(JSApi.onLoadAPs(array.toString()));
    }

    void loadSniffers(String request) {
        long minTime;
        long maxTime;
        boolean delDuplicate;
        String callback;
        try {
            JSONObject json = new JSONObject(request);
            minTime = json.getLong(KEY_MIN_TIME);
            maxTime = json.getLong(KEY_MAX_TIME);
            delDuplicate = json.getBoolean(KEY_DEL_DUPLICATE);
            callback = json.getString(KEY_CALLBACK);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        List<SnifferDB> snifferDBS = MeshObjectBox.getInstance()
                .sniffer()
                .loadSniffers(minTime, maxTime, delDuplicate);
        JSONArray snifferArray = new JSONArray();
        for (SnifferDB sniffer : snifferDBS) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_TYPE, sniffer.type)
                        .put(KEY_MAC, sniffer.bssid)
                        .put(KEY_CHANNEL, sniffer.channel)
                        .put(KEY_TIME, sniffer.utc_time + TimeZone.getDefault().getRawOffset())
                        .put(KEY_RSSI, sniffer.rssi)
                        .put(KEY_NAME, sniffer.name)
                        .put(KEY_ORG, sniffer.organization);
                snifferArray.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        evaluateJavascript(String.format("%s(\'%s\')", callback, snifferArray.toString()));
    }

    void startScanSniffer() {
        if (mSnifferTask != null) {
            mSnifferTask.dispose();
        }

        List<IEspDevice> deviceList = new LinkedList<>();
        for (IEspDevice device : mUser.getAllDeviceList()) {
            if (device.isState(EspDeviceState.State.LOCAL)) {
                deviceList.add(device);
            }
        }

        LinkedBlockingQueue<Collection<Sniffer>> sniffersQueue = new LinkedBlockingQueue<>();
        MainDeviceNotifyHelper helper = mActivity.getDeviceNotifyHelper();
        helper.setSnifferListener(sniffers -> {
            if (sniffers == null || sniffers.isEmpty()) {
                return;
            }

            sniffersQueue.add(sniffers);
        });

        mSnifferTask = Observable.just(deviceList)
                .subscribeOn(Schedulers.io())
                .doOnNext(devices -> {
                    Thread thread = Thread.currentThread();
                    while (!thread.isInterrupted()) {
                        // Show sniffers
                        if (thread.isInterrupted()) {
                            return;
                        }

                        Collection<Sniffer> querySnifferList;
                        try {
                            querySnifferList = sniffersQueue.take();
                        } catch (InterruptedException e) {
                            mLog.w("SnifferTask queue take catch InterruptedException");
                            return;
                        }

                        LinkedList<Sniffer> snifferList = new LinkedList<>(querySnifferList);
                        Collections.sort(snifferList, (o1, o2) -> {
                                    Long i1 = o1.getUTCTime();
                                    Long i2 = o2.getUTCTime();
                                    return i2.compareTo(i1);
                                }
                        );

                        if (thread.isInterrupted()) {
                            return;
                        }

                        JSONArray snifferArray = new JSONArray();
                        long timeZoneOffset = TimeZone.getDefault().getRawOffset();
                        for (Sniffer sniffer : snifferList) {
                            JSONObject json = new JSONObject()
                                    .put(KEY_TYPE, sniffer.getType())
                                    .put(KEY_MAC, sniffer.getBssid())
                                    .put(KEY_CHANNEL, sniffer.getChannel())
                                    .put(KEY_TIME, sniffer.getUTCTime() + timeZoneOffset)
                                    .put(KEY_RSSI, sniffer.getRssi())
                                    .put(KEY_NAME, sniffer.getName())
                                    .put(KEY_ORG, sniffer.getOrganization());
                            snifferArray.put(json);
                        }
                        snifferList.clear();

                        evaluateJavascript(JSApi.onSniffersDiscovered(snifferArray.toString()));
                    } // end while
                })
                .doOnComplete(() -> {
                    helper.setSnifferListener(null);
                    mLog.d("Sniffer task over");
                })
                .subscribe();
    }

    void stopScanSniffer() {
        if (mSnifferTask != null) {
            mSnifferTask.dispose();
            mSnifferTask = null;
        }
    }

    String userLogin(String email, String password) {
        EspLoginResult result = mUser.login(email, password, false);
        int status = result.ordinal();
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_STATUS, status)
                    .put(KEY_USERNAME, mUser.getName());
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    String userGuestLogin() {
        mUser.logout();
        mUser.setKey("123456789012345678901234567890123456789");
        mUser.setEmail("guest@guest.com");
        mUser.setName("Guest");
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_STATUS, EspLoginResult.SUC.ordinal())
                    .put(KEY_USERNAME, mUser.getName());
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    String userLoadLastLogged() {
        new EspActionUserLoadLastLogged().doActionLoadLastLogged();
        int status = mUser.isLogged() ? 0 : -1;
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_STATUS, status)
                    .put(KEY_USERNAME, mUser.getName());
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

    }

    void userLogout() {
        mUser.logout();
    }

    String userRegister(String email, String username, String password) {
        EspRegisterResult result = new EspActionUserRegister().doActionRegister(username, email, password);
        int status = result.ordinal();
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_STATUS, status)
                    .put(KEY_MESSAGE, result.name());
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    String userResetPassword(String email) {
        EspResetPasswordResult result = new EspActionUserResetPassword().doActionResetPassword(email);
        int status = result.ordinal();
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_STATUS, status);
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    void getUpgradeFiles() {
        File[] files = new EspActionDeviceOTA().doActionFindUpgradeFiles();
        JSONArray array = new JSONArray();
        if (files != null) {
            for (File file : files) {
                array.put(file.getPath());
            }
        }

        mActivity.evaluateJavascript(JSApi.onGetUpgradeFiles(array.toString()));
    }

    void startOTA(String request) {
        String bin;
        List<IEspDevice> devices = new LinkedList<>();
        int otaType;
        try {
            JSONObject json = new JSONObject(request);
            bin = json.getString(KEY_BIN);

            JSONArray macArray = json.getJSONArray(KEY_MACS);
            for (int i = 0; i < macArray.length(); i++) {
                String mac = macArray.getString(i);
                IEspDevice device = mUser.getDeviceForMac(mac);
                if (device != null) {
                    devices.add(device);
                }
            }
            if (devices.isEmpty()) {
                mLog.w("OTA device is empty");
                return;
            }

            otaType = json.optInt(KEY_TYPE, EspOTAClient.OTA_TYPE_PIECES);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        synchronized (mOtaLock) {
            EspOTAClient.OTACallback otaCallback = new EspOTAClient.OTACallback() {
                @Override
                public Handler getHandler() {
                    return null;
                }

                @Override
                public void onOTAPrepare(EspOTAClient client) {
                    if (mActivity == null) {
                        client.close();
                    }
                }

                @Override
                public void onOTAProgressUpdate(EspOTAClient client, List<EspOTAClient.OTAProgress> progressList) {
                    if (mActivity == null) {
                        client.close();
                        return;
                    }

                    JSONArray array = new JSONArray();
                    for (EspOTAClient.OTAProgress otaProgress : progressList) {
                        try {
                            JSONObject json = new JSONObject()
                                    .put(KEY_MAC, otaProgress.getDeviceMac())
                                    .put(KEY_PROGRESS, otaProgress.getProgress())
                                    .put(KEY_MESSAGE, otaProgress.getMessage());
                            array.put(json);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                    mLog.i("js ota progress jarray = " + array.toString());
                    evaluateJavascript(JSApi.onOTAProgressChanged(array.toString()));
                }

                @Override
                public void onOTAResult(EspOTAClient client, List<String> completeMacs) {
                    client.close();

                    if (mActivity == null) {
                        return;
                    }

                    JSONArray array = new JSONArray();
                    for (String mac : completeMacs) {
                        array.put(mac);
                    }
                    evaluateJavascript(JSApi.onOTAResult(array.toString()));
                }
            };
            EspOTAClient client = null;
            EspOTAClient.Builder builder = new EspOTAClient.Builder(otaType);
            switch (otaType) {
                case EspOTAClient.OTA_TYPE_PIECES: {
                    File file = new File(bin);
                    if (!file.exists()) {
                        mLog.w("ota No such file " + bin);
                        return;
                    }

                    client = builder.setBin(file)
                            .setDevices(devices)
                            .setOTACallback(otaCallback)
                            .build();
                    break;
                }
                case EspOTAClient.OTA_TYPE_HTTP_POST: {
                    File file = new File(bin);
                    if (!file.exists()) {
                        mLog.w("ota No such file " + bin);
                        return;
                    }

                    IEspDevice firstDev = devices.get(0);
                    client = builder.setBin(file)
                            .setDevices(devices)
                            .setProtocol(firstDev.getProtocol())
                            .setHostAddress(firstDev.getLanHostAddress())
                            .setOTACallback(otaCallback)
                            .build();
                    break;
                }
                case EspOTAClient.OTA_TYPE_DOWNLOAD: {
                    try {
                        new URL(bin);
                    } catch (MalformedURLException e) {
                        e.printStackTrace();
                        return;
                    }
                    IEspDevice firstDev = devices.get(0);
                    client = builder.setBinUrl(bin)
                            .setDevices(devices)
                            .setProtocol(firstDev.getProtocol())
                            .setHostAddress(firstDev.getLanHostAddress())
                            .setOTACallback(otaCallback)
                            .build();
                    break;
                }
            }

            if (client != null) {
                String address = client.getAddress();
                EspOTAClient mapClient = mOtaClientMap.remove(address);
                if (mapClient != null) {
                    mapClient.close();
                }

                mOtaClientMap.put(address, client);
                client.start();
            }
        }
    }

    void stopOTA() {
        synchronized (mOtaLock) {
            for (EspOTAClient client : mOtaClientMap.values()) {
                client.close();
                Observable.just(client)
                        .subscribeOn(Schedulers.io())
                        .doOnNext(EspOTAClient::stop)
                        .subscribe();
            }
            mOtaClientMap.clear();
        }
    }

    void stopOTA(String request) {
        try {
            JSONObject json = new JSONObject(request);
            JSONArray addrArray = json.getJSONArray(KEY_HOST);
            synchronized (mOtaLock) {
                for (int i = 0; i < addrArray.length(); i++) {
                    String address = addrArray.getString(i);
                    EspOTAClient client = mOtaClientMap.remove(address);
                    if (client != null) {
                        client.close();
                        Observable.just(client)
                                .subscribeOn(Schedulers.io())
                                .doOnNext(EspOTAClient::stop)
                                .subscribe();
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void otaReboot(String info) {
        Observable.just(info)
                .subscribeOn(Schedulers.io())
                .doOnNext(infoStr -> {
                    List<IEspDevice> devices = new LinkedList<>();
                    try {
                        JSONObject json = new JSONObject(infoStr);
                        JSONArray macArray = json.getJSONArray(KEY_MACS);
                        for (int i = 0; i < macArray.length(); i++) {
                            String mac = macArray.getString(i);
                            IEspDevice device = mUser.getDeviceForMac(mac);
                            if (device != null) {
                                devices.add(device);
                            }
                        }
                        if (devices.isEmpty()) {
                            mLog.w("OTA device is empty");
                            return;
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                        return;
                    }

                    EspHttpParams params = new EspHttpParams();
                    params.setTryCount(3);
                    DeviceUtil.delayRequestRetry(devices, IEspActionDeviceOTA.REQUEST_OTA_REBOOT, params);
                })
                .subscribe();
    }

    void reboot(String info) {
        Observable.just(info)
                .subscribeOn(Schedulers.io())
                .doOnNext(infoStr -> {
                    List<IEspDevice> devices = new LinkedList<>();
                    try {
                        JSONObject json = new JSONObject(infoStr);
                        JSONArray macArray = json.getJSONArray(KEY_MACS);
                        for (int i = 0; i < macArray.length(); i++) {
                            String mac = macArray.getString(i);
                            IEspDevice device = mUser.getDeviceForMac(mac);
                            if (device != null) {
                                devices.add(device);
                            }
                        }
                        if (devices.isEmpty()) {
                            mLog.w("Reboot device is empty");
                            return;
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                        return;
                    }

                    EspHttpParams params = new EspHttpParams();
                    params.setTryCount(3);
                    DeviceUtil.delayRequestRetry(devices, IEspActionDeviceReboot.REQUEST_REBOOT, params);
                })
                .subscribe();
    }

    String saveGroup(String groupJSON) {
        long groupId;
        String groupName;
        boolean isUser;
        boolean isMesh;
        JSONArray deviceMacs;
        List<String> deviceMacList = null;
        try {
            JSONObject json = new JSONObject(groupJSON);
            groupId = json.optLong(KEY_GROUP_ID, 0);
            groupName = json.getString(KEY_GROUP_NAME);
            isUser = json.getBoolean(KEY_GROUP_IS_USER);
            isMesh = json.getBoolean(KEY_GROUP_IS_MESH);
            deviceMacs = json.optJSONArray(KEY_DEVICE_MACS);
            if (deviceMacs != null) {
                deviceMacList = new ArrayList<>(deviceMacs.length());
                for (int i = 0; i < deviceMacs.length(); i++) {
                    deviceMacList.add(deviceMacs.getString(i));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

        long id = new EspActionGroup().doActionSaveGroup(groupId, groupName, isUser, isMesh, deviceMacList);
        return String.valueOf(id);
    }

    void saveGroups(String array) {
        try {
            JSONArray jsonArray = new JSONArray(array);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject json = jsonArray.getJSONObject(i);
                saveGroup(json.toString());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadGroups() {
        mUser.loadGroups();
        List<IEspGroup> groupList = mUser.getAllGroupList();
        JSONArray result = new JSONArray();
        for (IEspGroup group : groupList) {
            JSONObject groupJSON = new JSONObject();

            long groupId = group.getId();
            String groupName = group.getName();
            boolean isUser = group.isUser();
            boolean isMesh = group.isMesh();

            try {
                groupJSON.put(KEY_GROUP_ID, groupId)
                        .put(KEY_GROUP_NAME, groupName)
                        .put(KEY_GROUP_IS_MESH, isMesh)
                        .put(KEY_GROUP_IS_USER, isUser);
                JSONArray macArray = new JSONArray();
                for (String mac : group.getDeviceBssids()) {
                    macArray.put(mac);
                }
                groupJSON.put(KEY_DEVICE_MACS, macArray);

                result.put(groupJSON);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        evaluateJavascript(JSApi.onLoadGroups(result.toString()));
    }

    void deleteGroup(String groupId) {
        long id = Long.parseLong(groupId);
        new EspActionGroup().doActionDeleteGroup(id);
    }

    void saveOperation(String type, String identity) {
        MeshObjectBox.getInstance().operation().saveOperation(type, identity);
    }

    String loadLastOperations(String countStr) {
        int count = Integer.parseInt(countStr);
        List<OperationDB> dbs = MeshObjectBox.getInstance().operation().loadLastOperations(count);
        JSONArray result = new JSONArray();
        for (OperationDB db : dbs) {
            String type = db.type;
            String identity = db.identity;
            long time = db.time;

            try {
                JSONObject json = new JSONObject()
                        .put(KEY_TYPE, type)
                        .put(KEY_IDENTITY, identity)
                        .put(KEY_TIME, time);
                result.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return result.toString();
    }

    void deleteUntilLeftOperations(String leftCountStr) {
        int leftCount = Integer.parseInt(leftCountStr);
        MeshObjectBox.getInstance().operation().deleteUntilLeftOperations(leftCount);
    }

    boolean isLocationEnable() {
        return mActivity.isLocationEnable();
    }

    void hideCoverImage() {
        mActivity.hideCoverImage();
    }

    void finish() {
        mActivity.finish();
    }

    void registerPhoneStateChange() {
        mActivity.registerPhoneStateChange();
    }

    long saveScene(String name, String icon, String background) {
        return MeshObjectBox.getInstance().scene().saveScene(name, icon, background);
    }

    long saveScene(long id, String name, String icon, String background) {
        return MeshObjectBox.getInstance().scene().saveScene(id, name, icon, background);
    }

    String loadScenes() {
        List<SceneDB> sceneDBList = MeshObjectBox.getInstance().scene().loadAllScenes();
        JSONArray sceneArray = new JSONArray();
        for (SceneDB sceneDB : sceneDBList) {
            try {
                JSONObject sceneJSON = new JSONObject()
                        .put(KEY_ID, sceneDB.id)
                        .put(KEY_NAME, sceneDB.name)
                        .put(KEY_ICON, sceneDB.icon)
                        .put(KEY_BACKGROUND, sceneDB.background);

                sceneArray.put(sceneJSON);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return sceneArray.toString();
    }

    void deleteScene(long id) {
        MeshObjectBox.getInstance().scene().deleteScene(id);
    }

    void startBleScan() {
        mActivity.startBleScan();
    }

    void stopBleScan() {
        mActivity.stopBleScan();
    }

    void checkLatestApk() {
        Observable.just(new EspActionDownloadFromIotEsp())
                .subscribeOn(Schedulers.io())
                .map(action -> {
                    String iotKey = Customer.INSTANCE.getIotKey();
                    EspRomQueryResult queryResult = action.doActionQueryLatestVersion(iotKey);
                    if (queryResult != null) {
                        int version = Integer.parseInt(queryResult.getVersion());
                        String fileName = queryResult.getFileNames().get(0);
                        return new JSONObject()
                                .put(KEY_STATUS, 0)
                                .put(KEY_NAME, fileName)
                                .put(KEY_VERSION, version);
                    } else {
                        return new JSONObject()
                                .put(KEY_STATUS, -1);
                    }
                })
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new EspRxObserver<JSONObject>() {
                    @Override
                    public void onError(Throwable e) {
                        e.printStackTrace();
                    }

                    @Override
                    public void onNext(JSONObject json) {
                        evaluateJavascript(JSApi.onCheckAppVersion(json.toString()));
                    }
                });
    }

    void downloadApkAndInstall(String request) {
        String version;
        String fileName;

        try {
            JSONObject json = new JSONObject(request);
            version = json.getString(KEY_VERSION);
            fileName = json.getString(KEY_NAME);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        String apkDir = EspApplication.getInstance().getEspRootSDPath() + "apk/";
        String apkName = "mesh.apk";

        Observable.just(new EspActionDownloadFromIotEsp())
                .subscribeOn(Schedulers.io())
                .filter(action -> {
                    File dir = new File(apkDir);
                    return dir.exists() || dir.mkdirs();
                })
                .map(action -> {
                    action.setDownloadCallback((totalSize, downloadSize) -> {
                        try {
                            JSONObject dlJSON = new JSONObject()
                                    .put(KEY_TOTAL_SIZE, totalSize)
                                    .put(KEY_DOWNLOAD_SIZE, downloadSize);

                            evaluateJavascript(JSApi.onApkDownloading(dlJSON.toString()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    });
                    String iotKey = Customer.INSTANCE.getIotKey();
                    return action.doActionDownloadFromIotEsp(iotKey, version, fileName, new File(apkDir, apkName));
                })
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new EspRxObserver<Boolean>() {
                    @Override
                    public void onError(Throwable e) {
                        e.printStackTrace();
                    }

                    @Override
                    public void onNext(Boolean suc) {
                        try {
                            JSONObject json = new JSONObject().put(KEY_RESULT, suc);
                            evaluateJavascript(JSApi.onApkDownloadResult(json.toString()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        if (suc) {
                            AppUtil.installApk(mActivity, new File(apkDir, apkName));
                        }
                    }
                });
    }

    void downloadLatestRom() {
        EspActionDeviceOTA action = new EspActionDeviceOTA();
        EspDownloadResult romVersion = action.doActionDownloadLastestRomVersionCloud();
        try {
            JSONObject json = new JSONObject();
            if (romVersion == null) {
                json.put(KEY_DOWNLOAD, false);
            } else {
                File bin = romVersion.getFile();
                json.put(KEY_DOWNLOAD, bin != null);
                json.put(KEY_NAME, romVersion.getFileName());
                json.put(KEY_VERSION, romVersion.getVersion());
                if (bin != null) {
                    json.put(KEY_FILE, bin.getPath());
                }
            }

            evaluateJavascript(JSApi.onDownloadLatestRom(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void getAppInfo() {
        String versionName;
        int versionCode;

        try {
            PackageInfo pi = mActivity.getPackageManager().getPackageInfo(mActivity.getPackageName(), 0);
            versionName = pi.versionName;
            versionCode = pi.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            versionName = "unknow";
            versionCode = -1;
        }

        try {
            JSONObject json = new JSONObject()
                    .put("os", "Android")
                    .put(KEY_VERSION_NAME, versionName)
                    .put(KEY_VERSION_CODE, versionCode);

            evaluateJavascript(JSApi.onGetAppInfo(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void saveDeviceEventsPosition(String request) {
        String mac;
        String events;
        String position;
        try {
            JSONObject json = new JSONObject(request);
            mac = json.getString(KEY_MAC);
            events = json.getString(KEY_EVENTS);
            position = json.getString(KEY_POSITION);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        IEspDevice device = mUser.getDeviceForMac(mac);
        device.setEvents(events);
        device.setPosition(position);
        MeshObjectBox.getInstance().device().saveDevice(device);
    }

    void loadDeviceEventsPositioin(String request) {
        String mac;
        String callback;
        String tag;
        try {
            JSONObject json = new JSONObject(request);
            mac = json.getString(KEY_MAC);
            callback = json.getString(KEY_CALLBACK);
            tag = json.getString(KEY_TAG);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        DeviceDB deviceDB = MeshObjectBox.getInstance().device().loadDevice(mac);
        if (deviceDB == null) {
            return;
        }
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_MAC, deviceDB.mac)
                    .put(KEY_TAG, tag)
                    .put(KEY_EVENTS, deviceDB.events)
                    .put(KEY_POSITION, deviceDB.position == null ? JSONObject.NULL : deviceDB.position);
            String string = URLEncoder.encode(json.toString(), "UTF-8");
            evaluateJavascript(String.format("%s(\'%s\')", callback, string));
        } catch (JSONException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    void loadAllDeviceEventsPosition(String request) {
        String callback;
        String tag;

        try {
            JSONObject json = new JSONObject(request);
            callback = json.getString(KEY_CALLBACK);
            tag = json.getString(KEY_TAG);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        List<DeviceDB> deviceList = MeshObjectBox.getInstance().device().loadAllDevices();
        JSONArray array = new JSONArray();
        for (DeviceDB device : deviceList) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_MAC, device.mac)
                        .put(KEY_EVENTS, device.events)
                        .put(KEY_POSITION, device.position == null ? JSONObject.NULL : device.position);
                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        try {
            JSONObject result = new JSONObject()
                    .put(KEY_TAG, tag)
                    .put(KEY_CONTENT, URLEncoder.encode(array.toString(), "UTF-8"));

            evaluateJavascript(String.format("%s(\'%s\')", callback, result.toString()));
        } catch (JSONException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    void deleteDeviceEventsPosition(String mac) {
        IEspDevice device = mUser.getDeviceForMac(mac);
        device.setPosition(null);
        device.setEvents(null);
        MeshObjectBox.getInstance().device().saveDevice(device);
    }

    void deleteAllDeviceEventsPosition() {
        for (IEspDevice device : mUser.getAllDeviceList()) {
            device.setPosition(null);
            device.setEvents(null);
            MeshObjectBox.getInstance().device().saveDevice(device);
        }
    }

    void removeDeviceForMac(String mac) {
        mUser.removeDevice(mac);
    }

    void removeDevicesForMacs(String macArray) {
        try {
            JSONArray array = new JSONArray(macArray);
            for (int i = 0; i < array.length(); i++) {
                mUser.removeDevice(array.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void clearBleCache() {
        if (mActivity != null) {
            mActivity.clearBle();
        }
    }

    String getBleMacsForStaMacs(String staMacs) {
        try {
            JSONArray staArray = new JSONArray(staMacs);
            JSONArray result = new JSONArray();
            for (int i = 0; i < staArray.length(); i++) {
                String staMac = staArray.getString(i);
                long staMacValue = Long.parseLong(staMac, 16);
                long bleMacValue = staMacValue + 2;
                String bleMac = Long.toHexString(bleMacValue).toLowerCase();
                result.put(bleMac);
            }

            return result.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    String getStaMacsForBleMacs(String bleMacs) {
        try {
            JSONArray bleArray = new JSONArray(bleMacs);
            JSONArray result = new JSONArray();
            for (int i = 0; i < bleArray.length(); i++) {
                String bleMac = bleArray.getString(i);
                long bleMacValue = Long.parseLong(bleMac, 16);
                long staMacValue = bleMacValue - 2;
                String staMac = Long.toHexString(staMacValue).toLowerCase();
                result.put(staMac);
            }

            return result.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    void getLocale() {
        Locale locale;
        if (SdkUtil.isAtLeastN_24()) {
            locale = mActivity.getResources().getConfiguration().getLocales().get(0);
        } else {
            locale = mActivity.getResources().getConfiguration().locale;
        }

        String language = locale.getLanguage();
        String country = locale.getCountry();
        try {
            JSONObject json = new JSONObject()
                    .put("language", language)
                    .put("country", country)
                    .put("os", "Android");

            evaluateJavascript(JSApi.onLocaleGot(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    void loadHWDevices() {
        List<DeviceHWDB> deviceList = MeshObjectBox.getInstance().deviceHW().loadAllDeviceHWs();
        JSONArray array = new JSONArray();
        for (DeviceHWDB db : deviceList) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_CODE, db.code)
                        .put(KEY_MAC, db.mac)
                        .put(KEY_FLOOR, db.floor)
                        .put(KEY_AREA, db.area)
                        .put(KEY_TIME, db.time);

                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        evaluateJavascript(JSApi.onLoadHWDevices(array.toString()));
    }

    void saveHWDevices(String request) {
        try {
            JSONArray array = new JSONArray(request);

            for (int i = 0; i < array.length(); i++) {
                JSONObject json = array.getJSONObject(i);
                String code = json.getString(KEY_CODE);
                String mac = json.getString(KEY_MAC);
                String floor = json.getString(KEY_FLOOR);
                String area = json.getString(KEY_AREA);

                MeshObjectBox.getInstance()
                        .deviceHW().saveDeviceHW(mac, code, floor, area, System.currentTimeMillis());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void deleteHWDevices(String macArray) {
        try {
            JSONArray array = new JSONArray(macArray);

            MeshObjectBox dbManager = MeshObjectBox.getInstance();
            for (int i = 0; i < array.length(); i++) {
                String mac = array.getString(i);
                dbManager.deviceHW().deleteDeviceHW(mac);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void scanQRCode() {
        if (mActivity != null) {
            mActivity.requestCameraPermission();
        }
    }

    void loadMeshIds() {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID, Context.MODE_PRIVATE);
        Set<String> meshIdSet = sp.getAll().keySet();
        String lastMeshId = loadLastMeshId();

        JSONArray array = new JSONArray();
        if (!TextUtils.isEmpty(lastMeshId)) {
            meshIdSet.remove(lastMeshId);
            array.put(lastMeshId);
        }
        for (String meshId : meshIdSet) {
            array.put(meshId);
        }

        evaluateJavascript(JSApi.onLoadMeshIds(array.toString()));
    }

    void saveMeshId(String meshId) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID, Context.MODE_PRIVATE);
        sp.edit().putString(meshId, "").apply();

        saveLastMeshId(meshId);
    }

    void deleteMeshId(String meshId) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID, Context.MODE_PRIVATE);
        sp.edit().remove(meshId).apply();
    }

    private void saveLastMeshId(String meshId) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID_LAST, Context.MODE_PRIVATE);
        sp.edit().putString("last", meshId).apply();
    }

    private String loadLastMeshId() {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID_LAST, Context.MODE_PRIVATE);
        return sp.getString("last", "");
    }

    void saveMac(String mac) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MAC, Context.MODE_PRIVATE);
        sp.edit().putString(mac, "").apply();
    }

    void deleteMac(String mac) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MAC, Context.MODE_PRIVATE);
        sp.edit().remove(mac).apply();
    }

    void deleteMacs(String macArray) {
        try {
            JSONArray macs = new JSONArray(macArray);
            SharedPreferences sp = mActivity.getSharedPreferences(PREF_MAC, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();
            for (int i = 0; i < macs.length(); i++) {
                editor.remove(macs.getString(i));
            }
            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadMacs() {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MAC, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        JSONArray array = new JSONArray();
        for (String mac : map.keySet()) {
            array.put(mac);
        }
        evaluateJavascript(JSApi.onLoadMacs(array.toString()));
    }

    void saveValuesForKeysInFile(String request) {
        String fileName;
        JSONArray contentArray;
        try {
            JSONObject json = new JSONObject(request);
            fileName = json.getString(KEY_NAME);
            contentArray = json.getJSONArray(KEY_CONTENT);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();

            SharedPreferences.Editor lastSaveEditor = mActivity
                    .getSharedPreferences(PREF_FILE_LAST_SAVE, Context.MODE_PRIVATE)
                    .edit();
            for (int i = 0; i < contentArray.length(); i++) {
                JSONObject kvJSON = contentArray.getJSONObject(i);
                String key = kvJSON.getString(KEY_KEY);
                String value = kvJSON.getString(KEY_VALUE);
                editor.putString(key, value);

                lastSaveEditor.putString(fileName, key);
            }

            editor.apply();
            lastSaveEditor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void removeValuesForKeysInFile(String request) {
        String fileName;
        JSONArray keyArray;
        try {
            JSONObject json = new JSONObject(request);
            fileName = json.getString(KEY_NAME);
            keyArray = json.getJSONArray(KEY_KEYS);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();
            for (int i = 0; i < keyArray.length(); i++) {
                String key = keyArray.getString(i);
                editor.remove(key);
            }

            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadValueForKeyInFile(String request) {
        String fileName;
        String key;

        try {
            JSONObject json = new JSONObject(request);
            fileName = json.getString(KEY_NAME);
            key = json.getString(KEY_KEY);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        String value = sp.getString(key, null);
        try {
            JSONObject contentJSON = new JSONObject()
                    .put(key, value != null ? value : JSONObject.NULL);
            JSONObject resultJSON = new JSONObject()
                    .put(KEY_NAME, fileName)
                    .put(KEY_CONTENT, contentJSON);

            evaluateJavascript(JSApi.onLoadValueForKeyInFile(resultJSON.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadAllValuesInFile(String fileName) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        JSONObject contentJSON = new JSONObject(map);
        SharedPreferences lastSavePref = mActivity
                .getSharedPreferences(PREF_FILE_LAST_SAVE, Context.MODE_PRIVATE);
        String latestKey = lastSavePref.getString(fileName, null);
        try {
            JSONObject resultJSON = new JSONObject()
                    .put(KEY_NAME, fileName)
                    .put(KEY_LATEST_KEY, latestKey != null ? latestKey : JSONObject.NULL)
                    .put(KEY_CONTENT, contentJSON);

            evaluateJavascript(JSApi.onLoadAllValuesInFile(resultJSON.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void closeDeviceLongSocket(String host) {
        mLog.d("closeDeviceLongSocket " + host);
        if (mHttpLongSocketReadThread != null) {
            mHttpLongSocketReadThread.interrupt();
            mHttpLongSocketReadThread = null;
        }
        if (mHttpLongSocket != null) {
            mHttpLongSocket.close();
            mHttpLongSocket = null;
        }
    }

    void requestDeviceLongSocket(String request) {
        Observable.create(emitter -> {
            __requestDeviceLongSocket(request);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .subscribe();
    }

    private void __requestDeviceLongSocket(String request) {
        String host;
        List<String> macList;
        JSONObject json;
        try {
            json = new JSONObject(request);
            host = json.getString(KEY_HOST);
            json.remove(KEY_HOST);
            JSONArray macArray = json.getJSONArray(KEY_MACS);
            macList = new ArrayList<>(macArray.length());
            for (int i = 0; i < macArray.length(); i++) {
                macList.add(macArray.getString(i));
            }
            json.remove(KEY_MACS);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        mLongHttpLock.lock();
        if (mHttpLongSocket != null) {
            if (!Objects.equals(mHttpLongSocket.getHost(), host)) {
                mHttpLongSocket.close();
                mHttpLongSocket = null;

                mHttpLongSocketReadThread.interrupt();
                try {
                    mHttpLongSocketReadThread.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    return;
                } finally {
                    mHttpLongSocketReadThread = null;
                }
            }
        }
        if (mHttpLongSocket == null) {
            mHttpLongSocket = new HttpLongSocket(host);
            try {
                mHttpLongSocket.connect();
            } catch (IOException e) {
                e.printStackTrace();
                mHttpLongSocket.close();
                mHttpLongSocket = null;
                return;
            }

            mHttpLongSocketReadThread = new Thread(() -> {
                while (mHttpLongSocket != null
                        && !mHttpLongSocket.isClosed()
                        && Thread.currentThread().isInterrupted()) {
                    try {
                        mHttpLongSocket.read();
                    } catch (IOException e) {
                        e.printStackTrace();
                        break;
                    }
                }
            });
            mHttpLongSocketReadThread.start();
        }
        mLongHttpLock.unlock();

        Map<String, String> headers = new HashMap<>();
        headers.put(IEspActionDevice.HEADER_NODE_COUNT, String.valueOf(macList.size()));
        StringBuilder macBuilder = new StringBuilder();
        for (String mac : macList) {
            macBuilder.append(mac).append(',');
        }
        macBuilder.deleteCharAt(macBuilder.length() - 1);
        headers.put(IEspActionDevice.HEADER_NODE_MAC, macBuilder.toString());
        headers.put(DeviceUtil.HEADER_ROOT_RESP.getName(), DeviceUtil.HEADER_ROOT_RESP.getValue());
        headers.put(EspHttpUtils.CONTENT_TYPE, EspHttpUtils.APPLICATION_JSON);

        try {
            mHttpLongSocket.httpPost(DeviceUtil.FILE_REQUEST, headers, request.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            mLongHttpLock.lock();
            mHttpLongSocketReadThread.interrupt();
            mHttpLongSocketReadThread = null;
            mHttpLongSocket.close();
            mHttpLongSocket = null;
            mLongHttpLock.unlock();
        }
    }
}
