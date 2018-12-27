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
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import blufi.espressif.params.BlufiConfigureParams;
import blufi.espressif.params.BlufiParameter;
import h5.espressif.esp32.action.EspActionDeviceConfigure;
import h5.espressif.esp32.action.EspActionJSON;
import h5.espressif.esp32.action.IEspActionDeviceConfigure;
import h5.espressif.esp32.main.EspWebActivity;
import h5.espressif.esp32.main.MainDeviceNotifyHelper;
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
import iot.espressif.esp32.action.user.EspActionUserLoadLastLogged;
import iot.espressif.esp32.action.user.EspActionUserRegister;
import iot.espressif.esp32.action.user.EspActionUserResetPassword;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.db.manager.EspDBManager;
import iot.espressif.esp32.db.manager.SceneDBManager;
import iot.espressif.esp32.db.model.ApDB;
import iot.espressif.esp32.db.model.DeviceOtherDB;
import iot.espressif.esp32.db.model.GroupDB;
import iot.espressif.esp32.db.model.GroupDeviceDB;
import iot.espressif.esp32.db.model.HWDeviceDB;
import iot.espressif.esp32.db.model.OperationDB;
import iot.espressif.esp32.db.model.SceneDB;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ota.EspOTAClient;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.other.EspDownloadResult;
import iot.espressif.esp32.model.other.EspRomQueryResult;
import iot.espressif.esp32.model.other.EspRxObserver;
import iot.espressif.esp32.model.user.EspLoginResult;
import iot.espressif.esp32.model.user.EspRegisterResult;
import iot.espressif.esp32.model.user.EspResetPasswordResult;
import iot.espressif.esp32.model.user.EspUser;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.app.AppUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;

class AppApiForJSImpl {
    private static final String KEY_MAC = IEspActionDevice.KEY_MAC;
    private static final String KEY_MACS = "macs";
    private static final String KEY_SSID = "ssid";
    private static final String KEY_BSSID = "bssid";
    private static final String KEY_FREQ = "frequency";
    private static final String KEY_PASSWORD = "password";
    private static final String KEY_ROOT_RESP = "root_response";
    private static final String KEY_ROW = "row";
    private static final String KEY_COLUMN = "column";
    private static final String KEY_TAG = "tag";
    private static final String KEY_RESULT = "result";
    private static final String KEY_STATUS = "status";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_GROUP_ID = "id";
    private static final String KEY_GROUP_NAME = "name";
    private static final String KEY_GROUP_IS_USER = "is_user";
    private static final String KEY_GROUP_IS_MESH = "is_mesh";
    private static final String KEY_DEVICE_MACS = "device_macs";
    private static final String KEY_TYPE = "type";
    private static final String KEY_IDENTITY = "identity";
    private static final String KEY_TIME = "time";
    private static final String KEY_PROGRESS = "progress";
    private static final String KEY_ID = "id";
    private static final String KEY_NAME = "name";
    private static final String KEY_ICON = "icon";
    private static final String KEY_BACKGROUND = "background";
    private static final String KEY_CODE = IEspActionDeviceConfigure.KEY_CODE;
    private static final String KEY_MESSAGE = IEspActionDeviceConfigure.KEY_MESSAGE;
    private static final String KEY_DOWNLOAD = "download";
    private static final String KEY_VERSION = "version";
    private static final String KEY_FILE = "file";
    private static final String KEY_VERSION_NAME = "version_name";
    private static final String KEY_VERSION_CODE = "version_code";
    private static final String KEY_EVENTS = "events";
    private static final String KEY_POSITION = "position";
    private static final String KEY_FLOOR = "floor";
    private static final String KEY_AREA = "area";
    private static final String KEY_BIN = "bin";
    private static final String KEY_ADDRESS = "address";
    private static final String KEY_TOTAL_SIZE = "total_size";
    private static final String KEY_DOWNLOAD_SIZE = "download_size";
    private static final String KEY_CALLBACK = "callback";

    private static final String PREF_DEVICE_TAB = "pref_device_tab";
    private static final String PREF_TAB_DEVICES = "pref_tab_devices";
    private static final String PREF_MESH_ID = "pref_mesh_id";
    private static final String PREF_MESH_ID_LAST = "pref_mesh_id_last";
    private static final String PREF_MAC = "pref_mac";

    private static final String IOT_KEY = "39a073cf2be1672e272e57fff03ca744ad77abc8";

    private final EspLog mLog = new EspLog(getClass());

    private ExecutorService mThreadPool;

    private final String mNoArgMark = new String("noargmark".getBytes());
    private final LinkedBlockingQueue<Task> mTaskQueue;
    private final Thread mTaskThread;

    private EspWebActivity mActivity;
    private EspApplication mApp;

    private AppApiForJS mOrigin;

    private EspUser mUser = EspUser.INSTANCE;

    private Disposable mSnifferTask;

    private final Object mBlufiLock = new Object();
    private iot.espressif.esp32.action.device.IEspActionDeviceConfigure.EspBlufi mBlufi;

    private final Object mOtaLock = new Object();
    private Map<String, EspOTAClient> mOtaClientMap = new HashMap<>();

    private static class Task {
        Method method;
        String argument;
    }

    AppApiForJSImpl(EspWebActivity activity, AppApiForJS api) {
        mActivity = activity;
        mApp = EspApplication.getInstance();
        mOrigin = api;
        mThreadPool = Executors.newCachedThreadPool();
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
                    e.printStackTrace();
                    break;
                }
            }

            mLog.d("Task thread end");
        });
        mTaskThread.start();
    }

    void log(String msg) {
        mLog.i(msg);
    }

    void release() {
        mOrigin = null;
        mThreadPool.shutdownNow();
        mTaskQueue.clear();
        mTaskThread.interrupt();
        mApp = null;
        mActivity = null;
    }

    boolean addQueueTask(String methodName) {
        return addQueueTask(methodName, mNoArgMark);
    }

    boolean addQueueTask(String methodName, String argument) {
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

            return true;
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return false;
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
                        if (mActivity != null) {
                            mActivity.notifyTopoScanned(topo.toString());
                        }
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
                        if (mActivity != null) {
                            mActivity.notifyDevicesScanned(result.toString());
                        }
                    }
                });
    }

    String scanDevices() {
        LinkedBlockingQueue<Object> getInfoQueue = new LinkedBlockingQueue<>();
        AtomicInteger meshCounter = new AtomicInteger(0);
        mUser.scanStations(mesh -> {
            meshCounter.incrementAndGet();

            List<IEspDevice> cacheDevices = new LinkedList<>();
            Set<Integer> cidset = new HashSet<>();
            List<IEspDevice> newDevices = new LinkedList<>();
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
                Observable.just(ingArray)
                        .subscribeOn(AndroidSchedulers.mainThread())
                        .doOnNext(array -> {
                            if (mActivity != null) {
                                mActivity.notifyDevicesScanning(array.toString());
                            }
                        })
                        .subscribe();

            }

//            if (!cacheDevices.isEmpty()) {
//                int[] cids = new int[cidset.size()];
//                int i = 0;
//                for (int cid : cidset) {
//                    cids[i] = cid;
//                    i++;
//                }
//                new EspActionDeviceInfo().doActionGetStatusLocal(cacheDevices, cids);
//            }
//            if (!newDevices.isEmpty()) {
//                new EspActionDeviceInfo().doActionGetDevicesInfoLocal(newDevices);
//            }

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

    String requestDevice(String request) {
        try {
            JSONObject postJSON = new JSONObject(request);
            String mac = postJSON.getString(KEY_MAC);
            postJSON.remove(KEY_MAC);
            postJSON.remove(KEY_CALLBACK);
            postJSON.remove(KEY_TAG);
            IEspDevice device = mUser.getDeviceForMac(mac);
            if (device == null) {
                return null;
            }

            boolean noResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            EspHttpHeader noRespHeader = noResp ? DeviceUtil.HEADER_ROOT_RESP : null;
            postJSON.remove(KEY_ROOT_RESP);
            EspHttpResponse response = DeviceUtil.httpLocalRequest(device, postJSON.toString().getBytes(),
                    null, noRespHeader);
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
                        mActivity.evaluateJavascript(String.format("%s(\'%s\')", callback, json.toString()));
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

                        mActivity.evaluateJavascript(String.format("%s(\'%s\')", callback, json.toString()));
                    }
                })
                .subscribe();
    }

    String requestDevicesMulticast(String request) {
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
            boolean noResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            EspHttpHeader noRespHeader = noResp ? DeviceUtil.HEADER_ROOT_RESP : null;
            postJSON.remove(KEY_ROOT_RESP);
            List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(devices,
                    postJSON.toString().getBytes(), null, true, noRespHeader);
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
            if (!json.isNull("root_conflicts_enable")){
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
            mBlufi = new EspActionDeviceConfigure().doActionConfigureBlufi2(
                    deviceMac, version, params,
                    (progress, status, message) -> {
                        Observable.create(emitter -> {
                            JSONObject json = new JSONObject()
                                    .put(KEY_PROGRESS, progress)
                                    .put(KEY_CODE, status)
                                    .put(KEY_MESSAGE, message);
                            mActivity.notifyConfigureProgressUpdate(json);
                            emitter.onNext(json);
                            emitter.onComplete();
                        }).subscribeOn(AndroidSchedulers.mainThread())
                                .subscribe();
                    });
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

    String loadDeviceTable() {
        SharedPreferences sp = mApp.getSharedPreferences(PREF_DEVICE_TAB, Context.MODE_PRIVATE);
        int row = sp.getInt(KEY_ROW, -1);
        int column = sp.getInt(KEY_COLUMN, -1);
        if (row == -1 && column == -1) {
            return null;
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

        return json.toString();
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

    String loadTableDevices() {
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

        return array.toString();
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

    String loadAPs() {
        List<ApDB> aps = EspDBManager.getInstance().ap().loadAps();
        JSONArray array = new JSONArray();
        for (ApDB db : aps) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_SSID, db.getSsid())
                        .put(KEY_PASSWORD, db.getPassword());

                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return array.toString();
    }

    String loadSniffers(long minTime, long maxTime, boolean delDuplicate) {
        List<SnifferDB> snifferDBS = EspDBManager.getInstance()
                .sniffer()
                .loadSniffers(minTime, maxTime, delDuplicate);
        JSONArray snifferArray = new JSONArray();
        for (SnifferDB sniffer : snifferDBS) {
            try {
                JSONObject json = new JSONObject()
                        .put("type", sniffer.getType())
                        .put("mac", sniffer.getBssid())
                        .put("channel", sniffer.getChannel())
                        .put("time", sniffer.getUtc_time() + TimeZone.getDefault().getRawOffset())
                        .put("rssi", sniffer.getRssi())
                        .put("name", sniffer.getName())
                        .put("org", sniffer.getOrganization());
                snifferArray.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }

        }

        return snifferArray.toString();
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

                        LinkedList<Sniffer> snifferList = new LinkedList<>();
                        snifferList.addAll(querySnifferList);
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
                                    .put("type", sniffer.getType())
                                    .put("mac", sniffer.getBssid())
                                    .put("channel", sniffer.getChannel())
                                    .put("time", sniffer.getUTCTime() + timeZoneOffset)
                                    .put("rssi", sniffer.getRssi())
                                    .put("name", sniffer.getName())
                                    .put("org", sniffer.getOrganization());
                            snifferArray.put(json);
                        }
                        snifferList.clear();
                        Observable.just(snifferArray)
                                .subscribeOn(AndroidSchedulers.mainThread())
                                .subscribe(array -> {
                                    if (mActivity != null) {
                                        mActivity.notifySnifferInfo(array);
                                    }
                                });
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

    String getUpgradeFiles() {
        File[] files = new EspActionDeviceOTA().doActionFindUpgradeFiles();
        JSONArray array = new JSONArray();
        if (files != null) {
            for (File file : files) {
                array.put(file.getPath());
            }
        }

        return array.toString();
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
                        return;
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
                    String method = JSApi.onOTAProgressChanged(array.toString());
                    mActivity.evaluateJavascript(method);
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
                    mActivity.evaluateJavascript(JSApi.onOTAResult(array.toString()));
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
                            .setHostAddress(firstDev.getHostAddress())
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
                            .setHostAddress(firstDev.getHostAddress())
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
            }
            mOtaClientMap.clear();
        }
    }

    void stopOTA(String request) {
        try {
            JSONObject json = new JSONObject(request);
            JSONArray addrArray = json.getJSONArray(KEY_ADDRESS);
            synchronized (mOtaLock) {
                for (int i = 0; i < addrArray.length(); i++) {
                    String address = addrArray.getString(i);
                    EspOTAClient client = mOtaClientMap.remove(address);
                    if (client != null) {
                        client.close();
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void otaReboot(String macs) {
        Observable.just(macs)
                .subscribeOn(Schedulers.io())
                .doOnNext(macsStr -> {
                    List<IEspDevice> devices = new LinkedList<>();
                    try {
                        JSONArray macArray = new JSONArray(macsStr);
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

    void reboot(String macs) {
        Observable.just(macs)
                .subscribeOn(Schedulers.io())
                .doOnNext(macsStr -> {
                    List<IEspDevice> devices = new LinkedList<>();
                    try {
                        JSONArray macArray = new JSONArray(macsStr);
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
        String groupId;
        String groupName;
        boolean isUser;
        boolean isMesh;
        JSONArray deviceMacs;
        try {
            JSONObject json = new JSONObject(groupJSON);
            groupId = json.optString(KEY_GROUP_ID, null);
            groupName = json.getString(KEY_GROUP_NAME);
            isUser = json.getBoolean(KEY_GROUP_IS_USER);
            isMesh = json.getBoolean(KEY_GROUP_IS_MESH);
            deviceMacs = json.optJSONArray(KEY_DEVICE_MACS);

        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

        EspDBManager manager = EspDBManager.getInstance();
        long id;
        if (groupId == null) {
            id = manager.group().saveGroup(groupName, isUser, isMesh);
        } else {
            id = Long.parseLong(groupId);
            if (groupName != null) {
                manager.group().saveGroup(id, groupName, isUser, isMesh);
            }
        }

        if (deviceMacs != null) {
            try {
                HashSet<String> macSet = new HashSet<>();
                for (int i = 0; i < deviceMacs.length(); i++) {
                    macSet.add(deviceMacs.getString(i));
                }

                List<GroupDeviceDB> gddbs = manager.group().loadDeviceBssids(id);
                for (int i = gddbs.size() - 1; i >= 0; i--) {
                    GroupDeviceDB db = gddbs.get(i);
                    String dbDevMac = db.getDevice_bssid();
                    if (macSet.contains(dbDevMac)) {
                        macSet.remove(dbDevMac);
                        gddbs.remove(i);
                    }
                }

                for (GroupDeviceDB db : gddbs) {
                    manager.group().deleteGroupDeviceBssid(db.getDevice_bssid(), id);
                }
                for (String mac : macSet) {
                    manager.group().saveGroupDeviceBssid(mac, id);
                }
            } catch (JSONException e) {
                e.printStackTrace();
                return null;
            }
        }

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

    String loadGroups() {
        EspDBManager manager = EspDBManager.getInstance();
        List<GroupDB> groupDBs = manager.group().loadGroups();
        JSONArray result = new JSONArray();
        for (GroupDB groupDB : groupDBs) {
            JSONObject groupJSON = new JSONObject();

            long groupId = groupDB.getId();
            String groupName = groupDB.getName();
            boolean isUser = groupDB.getIs_user();
            boolean isMesh = groupDB.getIs_mesh();
            List<GroupDeviceDB> groupDeviceDBs = manager.group().loadDeviceBssids(groupId);

            try {
                groupJSON.put(KEY_GROUP_ID, groupId)
                        .put(KEY_GROUP_NAME, groupName)
                        .put(KEY_GROUP_IS_MESH, isMesh)
                        .put(KEY_GROUP_IS_USER, isUser);
                JSONArray macArray = new JSONArray();
                for (GroupDeviceDB groupDeviceDB : groupDeviceDBs) {
                    macArray.put(groupDeviceDB.getDevice_bssid());
                }
                groupJSON.put(KEY_DEVICE_MACS, macArray);

                result.put(groupJSON);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        return result.toString();
    }

    void deleteGroup(String groupId) {
        EspDBManager manager = EspDBManager.getInstance();
        long id = Long.parseLong(groupId);
        manager.group().deleteGroup(id);
    }

    void saveOperation(String type, String identity) {
        EspDBManager manager = EspDBManager.getInstance();
        manager.operation().saveOperation(type, identity);
    }

    String loadLastOperations(String countStr) {
        int count = Integer.parseInt(countStr);
        EspDBManager manager = EspDBManager.getInstance();
        List<OperationDB> dbs = manager.operation().loadLastOperations(count);
        JSONArray result = new JSONArray();
        for (OperationDB db : dbs) {
            String type = db.getType();
            String identity = db.getIdentity();
            long time = db.getTime();

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
        EspDBManager manager = EspDBManager.getInstance();
        manager.operation().deleteUntilLeftOperations(leftCount);
    }

    boolean isBluetoothEnable() {
        return mActivity.isBluetoothEnable();
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

    void registerWifiChange() {
        mActivity.registerWifiChange();
    }

    long saveScene(String name, String icon, String background) {
        SceneDBManager manager = EspDBManager.getInstance().scene();
        return manager.saveScene(name, icon, background);
    }

    long saveScene(long id, String name, String icon, String background) {
        SceneDBManager manager = EspDBManager.getInstance().scene();
        return manager.saveScene(id, name, icon, background);
    }

    String loadScenes() {
        SceneDBManager manager = EspDBManager.getInstance().scene();
        List<SceneDB> sceneDBList = manager.loadScenes();
        JSONArray sceneArray = new JSONArray();
        for (SceneDB sceneDB : sceneDBList) {
            try {
                JSONObject sceneJSON = new JSONObject()
                        .put(KEY_ID, sceneDB.getId())
                        .put(KEY_NAME, sceneDB.getName())
                        .put(KEY_ICON, sceneDB.getIcon())
                        .put(KEY_BACKGROUND, sceneDB.getBackround());

                sceneArray.put(sceneJSON);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return sceneArray.toString();
    }

    void deleteScene(long id) {
        SceneDBManager manager = EspDBManager.getInstance().scene();
        manager.deleteScene(id);
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
                    EspRomQueryResult queryResult= action.doActionQueryLatestVersion(IOT_KEY);
                    if (queryResult != null) {
                        int version = Integer.parseInt(queryResult.getVersion());
                        String fileName = queryResult.getFileNames().get(0);
                        return new JSONObject()
                                .put(KEY_RESULT, true)
                                .put(KEY_NAME, fileName)
                                .put(KEY_VERSION, version);
                    } else {
                        return new JSONObject()
                                .put(KEY_RESULT, false);
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
                        mActivity.evaluateJavascript(JSApi.onCheckLatestApk(json.toString()));
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

                            mActivity.evaluateJavascript(JSApi.onApkDownloading(dlJSON.toString()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    });
                    return action.doActionDownloadFromIotEsp(IOT_KEY, version, fileName, new File(apkDir, apkName));
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
                            mActivity.evaluateJavascript(JSApi.onApkDownloadResult(json.toString()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        if (suc) {
                            AppUtil.installApk(mActivity, new File(apkDir, apkName));
                        }
                    }
                });
    }

    String downloadLatestRom() {
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

            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }

    String getAppInfo() {
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
                    .put(KEY_VERSION_NAME, versionName)
                    .put(KEY_VERSION_CODE, versionCode);
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    void saveDeviceEventsPosition(String mac, String events, String position) {
        EspDBManager manager = EspDBManager.getInstance();
        manager.device().saveDeviceOther(mac, events, position);
    }

    String loadDeviceEventsPositioin(String mac) {
        EspDBManager manager = EspDBManager.getInstance();
        DeviceOtherDB db = manager.device().loadDeviceOther(mac);
        if (db == null) {
            return null;
        }
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_MAC, db.getMac())
                    .put(KEY_EVENTS, db.getEvents())
                    .put(KEY_POSITION, db.getPosition() == null ? JSONObject.NULL : db.getPosition());
            return json.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    String loadAllDeviceEventsPosition() {
        EspDBManager manager = EspDBManager.getInstance();
        List<DeviceOtherDB> dbs = manager.device().loadDeviceOtherList();
        JSONArray result = new JSONArray();
        for (DeviceOtherDB db : dbs) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_MAC, db.getMac())
                        .put(KEY_EVENTS, db.getEvents())
                        .put(KEY_POSITION, db.getPosition() == null ? JSONObject.NULL : db.getPosition());
                result.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return result.toString();
    }

    void deleteDeviceEventsPosition(String mac) {
        EspDBManager manager = EspDBManager.getInstance();
        manager.device().deleteDeviceOther(mac);
    }

    void deleteAllDeviceEventsPosition() {
        EspDBManager manager = EspDBManager.getInstance();
        manager.device().deleteAllDeviceOther();
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
        mActivity.clearBle();
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

    String getLocale() {
        JSONObject json = mActivity.getLocaleJSON();
        return json.toString();
    }

    String loadHWDevices() {
        EspDBManager manager = EspDBManager.getInstance();
        List<HWDeviceDB> dbs = manager.device().loadHWDevicesList();
        JSONArray array = new JSONArray();
        for (HWDeviceDB db : dbs) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_CODE, db.getCode())
                        .put(KEY_MAC, db.getMac())
                        .put(KEY_FLOOR, db.getFloor())
                        .put(KEY_AREA, db.getArea())
                        .put(KEY_TIME, db.getTime());

                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return array.toString();
    }

    void saveHWDevice(String mac, String code, String floor, String area) {
        EspDBManager.getInstance().device().saveHWDevice(mac, code, floor, area, System.currentTimeMillis());
    }

    void saveHWDevices(String arrayStr) {
        try {
            JSONArray array = new JSONArray(arrayStr);
            for (int i = 0; i < array.length(); i++) {
                JSONObject json = array.getJSONObject(i);
                String code = json.getString(KEY_CODE);
                String mac = json.getString(KEY_MAC);
                String floor = json.getString(KEY_FLOOR);
                String area = json.getString(KEY_AREA);

                saveHWDevice(mac, code, floor, area);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void deleteHWDevice(String mac) {
        EspDBManager.getInstance().device().deleteHWDevice(mac);
    }

    void deleteHWDevices(String macArray) {
        try {
            JSONArray array = new JSONArray(macArray);
            for (int i = 0; i < array.length(); i++) {
                String mac = array.getString(i);
                deleteHWDevice(mac);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void scanQRCode() {
        mActivity.requestCameraPermission();
    }

    String loadMeshIds() {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID, Context.MODE_PRIVATE);
        Set<String> meshIdSet = sp.getAll().keySet();
        JSONArray array = new JSONArray();
        for (String meshId : meshIdSet) {
            array.put(meshId);
        }

        return array.toString();
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

    void saveLastMeshId(String meshId) {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MESH_ID_LAST, Context.MODE_PRIVATE);
        sp.edit().putString("last", meshId).apply();
    }

    String loadLastMeshId() {
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

    String loadMacs() {
        SharedPreferences sp = mActivity.getSharedPreferences(PREF_MAC, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        JSONArray array = new JSONArray();
        for (String mac : map.keySet()) {
            array.put(mac);
        }
        return array.toString();
    }

    void savePrefKV(String fileName, String key, String value) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        sp.edit().putString(key, value).apply();
    }

    void savePrefKVMap(String fileName, String kvMap) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();

            JSONObject json = new JSONObject(kvMap);
            Iterator<String> iterator = json.keys();
            while (iterator.hasNext()) {
                String key = iterator.next();
                String value = json.getString(key);
                editor.putString(key, value);
            }

            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void removePrefK(String fileName, String key) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        sp.edit().remove(key).apply();
    }

    void removePrefKArray(String fileName, String kArray) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        try {
            SharedPreferences.Editor editor = sp.edit();

            JSONArray array = new JSONArray(kArray);
            for (int i = 0; i < array.length(); i++) {
                editor.remove(array.getString(i));
            }

            editor.apply();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    String loadPrefV(String fileName, String key) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        return sp.getString(key, null);
    }

    String loadPrefAllV(String fileName) {
        SharedPreferences sp = mActivity.getSharedPreferences(fileName, Context.MODE_PRIVATE);
        Map<String, ?> map = sp.getAll();
        JSONObject json = new JSONObject(map);
        return json.toString();
    }
}
