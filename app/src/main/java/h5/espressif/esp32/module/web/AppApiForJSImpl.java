package h5.espressif.esp32.module.web;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Handler;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Base64;
import android.view.View;

import androidx.core.os.LocaleListCompat;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import h5.espressif.esp32.module.Utils;
import h5.espressif.esp32.module.action.EspActionDeviceConfigure2;
import h5.espressif.esp32.module.action.EspActionJSON;
import h5.espressif.esp32.module.action.IEspActionDeviceConfigure2;
import h5.espressif.esp32.module.main.EspWebActivity;
import h5.espressif.esp32.module.model.event.SnifferDiscoveredEvent;
import io.reactivex.Observable;
import io.reactivex.ObservableOnSubscribe;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.common.EspActionUpgradeAPK;
import iot.espressif.esp32.action.common.IEspActionUpgradeApk;
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
import iot.espressif.esp32.db.model.CustomDB;
import iot.espressif.esp32.db.model.OperationDB;
import iot.espressif.esp32.db.model.SceneDB;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ble.MeshBLEClient;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.model.device.ota.EspOTAClient;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.group.IEspGroup;
import iot.espressif.esp32.model.other.EspDownloadResult;
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
import libs.espressif.net.EspHttpUtils;
import libs.espressif.utils.DataUtil;

class AppApiForJSImpl implements EspWebConstants {
    private final EspLog mLog = new EspLog(getClass());

    private final LinkedBlockingQueue<Runnable> mTaskQueue;
    private final Thread mTaskThread;

    private volatile EspWebActivity mActivity;
    private EspApplication mApp;

    private EspUser mUser = EspUser.INSTANCE;

    private Disposable mSnifferTask;

    private final Object mBlufiLock = new Object();
    private MeshBlufiClient mBlufi;

    private final Object mOtaLock = new Object();
    private Map<String, EspOTAClient> mOtaClientMap = new HashMap<>();

    private final LinkedBlockingQueue<LongSocketTask> mLongSocketTasks = new LinkedBlockingQueue<>();
    private Thread mLongSocketWriteThread;

    private MeshBLEClient mMeshBLEClient;


    AppApiForJSImpl(EspWebActivity activity) {
        mActivity = activity;
        mApp = EspApplication.getEspApplication();

        mMeshBLEClient = new MeshBLEClient(mActivity.getApplicationContext());
        mMeshBLEClient.setGattCallback(new MeshBLEListener());

        mTaskQueue = new LinkedBlockingQueue<>();
        mTaskThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Runnable task = mTaskQueue.take();
                    while (mTaskQueue.size() > 5) {
                        task = mTaskQueue.take();
                    }
                    task.run();
                } catch (InterruptedException e) {
                    mLog.w("JS task queue interrupted");
                    break;
                }
            }

            mLog.d("Task thread end");
        });
        mTaskThread.start();

        mLongSocketWriteThread = new LongSocketWriteThread();
        mLongSocketWriteThread.start();
    }

    private void evaluateJavascript(String script) {
        if (mActivity != null) {
            mActivity.evaluateJavascript(script);
        }
    }

    void mainPageLoad(String file) {
        mActivity.loadFile(file);
    }

    void log(String msg) {
        mLog.i(msg);
    }

    boolean isOTAing() {
        return !mOtaClientMap.isEmpty();
    }

    void release() {
        mTaskQueue.clear();
        mTaskThread.interrupt();

        mLongSocketTasks.clear();
        mLongSocketWriteThread.interrupt();

        mApp = null;
        mActivity = null;

        mMeshBLEClient.close();
        mMeshBLEClient = null;
    }

    void addQueueTask(String request) {
        String methodName;
        String argument;
        try {
            JSONObject json = new JSONObject(request);
            methodName = json.getString(KEY_METHOD);
            argument = json.optString(KEY_ARGUMENT, null);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        boolean suc = true;
        switch (methodName) {
            case "requestDevice": {
                Runnable runnable = () -> requestDeviceSinglecast(argument, false);
                mTaskQueue.add(runnable);
                break;
            }
            case "requestDevicesMulticast": {
                Runnable runnable = () -> requestDevicesMulticast(argument, false);
                mTaskQueue.add(runnable);
                break;
            }
            case "requestDeviceLongSocket": {
                Runnable runnable = () -> requestDeviceLongSocket(argument);
                mTaskQueue.add(runnable);
            }
            default: {
                suc = false;
            }
        }

        try {
            JSONObject resultJSON = new JSONObject()
                    .put(KEY_RESULT, suc);

            evaluateJavascript(JSCallbacks.onAddQueueTask(resultJSON.toString()));
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
                        evaluateJavascript(JSCallbacks.onTopoScanned(topo.toString()));
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
                        evaluateJavascript(JSCallbacks.onDeviceScanned(result.toString()));
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
                evaluateJavascript(JSCallbacks.onDeviceScanning(ingArray.toString()));
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

    private String requestGroup(JSONArray macArray, JSONArray groupArray, byte[] postData, Map<String, String> headers)
            throws JSONException {
        Map<String, List<IEspDevice>> addressDeviceMap = new HashMap<>();
        Map<String, Set<String>> addressGroupMap = new HashMap<>();
        List<IEspDevice> userDevices = mUser.getAllDeviceList();
        for (int i = 0; i < groupArray.length(); ++i) {
            String group = groupArray.getString(i);

            for (IEspDevice device : userDevices) {
                if (device.isState(EspDeviceState.State.LOCAL) && device.isInGroup(group)) {
                    String address = device.getLanHostAddress();

                    List<IEspDevice> deviceList = addressDeviceMap.get(address);
                    if (deviceList == null) {
                        deviceList = new LinkedList<>();
                        addressDeviceMap.put(address, deviceList);
                    }
                    deviceList.add(device);

                    Set<String> groupSet = addressGroupMap.get(address);
                    if (groupSet == null) {
                        groupSet = new HashSet<>();
                        addressGroupMap.put(address, groupSet);
                    }
                    groupSet.add(group);
                }
            }
        }

        Map<List<IEspDevice>, EspHttpHeader> deviceHeaderMap = new HashMap<>();
        for (Map.Entry<String, List<IEspDevice>> entry : addressDeviceMap.entrySet()) {
            String address = entry.getKey();
            List<IEspDevice> devices = entry.getValue();
            Set<String> groups = addressGroupMap.get(address);

            deviceHeaderMap.put(devices, null);
            if (groups != null && !groups.isEmpty()) {
                StringBuilder groupSB = new StringBuilder();
                for (String group : groups) {
                    groupSB.append(group).append(",");
                }
                groupSB.deleteCharAt(groupSB.length() - 1);
                EspHttpHeader groupHeader = new EspHttpHeader(IEspActionDevice.HEADER_NODE_GROUP, groupSB.toString());
                deviceHeaderMap.put(devices, groupHeader);
            }
        }

        LinkedBlockingQueue<Object> queue = new LinkedBlockingQueue<>();
        JSONArray respArray = new JSONArray();
        Observable.fromIterable(deviceHeaderMap.entrySet())
                .subscribeOn(Schedulers.io())
                .doOnNext(entry -> {
                    List<IEspDevice> groupDevices = entry.getKey();
                    Map<String, String> groupHeaders = new HashMap<>(headers);
                    EspHttpHeader groupHeader = entry.getValue();
                    if (groupHeader != null) {
                        groupHeaders.put(groupHeader.getName(), groupHeader.getValue());
                    }
                    List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(
                            groupDevices, postData, null, groupHeaders);
                    for (EspHttpResponse response : responseList) {
                        respArray.put(response.getContentJSON());
                    }
                })
                .subscribe(new EspRxObserver<Map.Entry<List<IEspDevice>, EspHttpHeader>>() {
                    @Override
                    public void onError(Throwable e) {
                        e.printStackTrace();
                        queue.add(e);
                    }

                    @Override
                    public void onNext(Map.Entry<List<IEspDevice>, EspHttpHeader> entry) {
                        queue.add(Boolean.TRUE);
                    }
                });

        for (int i = 0; i < deviceHeaderMap.size(); ++i) {
            try {
                queue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                Thread.currentThread().interrupt();
                return null;
            }
        }

        return respArray.toString();
    }

    private String executeDeviceSinglecast(String request) {
        try {
            JSONObject postJSON = new JSONObject(request);
            postJSON.remove(KEY_CALLBACK);
            postJSON.remove(KEY_TAG);
            postJSON.remove(KEY_HOST);

            JSONArray groupArray = null;
            IEspDevice device = null;

            boolean isGroup = postJSON.optBoolean(KEY_IS_GROUP, false);
            postJSON.remove(KEY_IS_GROUP);
            if (isGroup) {
                if (!postJSON.isNull(KEY_GROUP)) {
                    groupArray = postJSON.getJSONArray(KEY_GROUP);
                }
                postJSON.remove(KEY_GROUP);
            }

            if (!postJSON.isNull(KEY_MAC)) {
                String mac = postJSON.getString(KEY_MAC);
                device = mUser.getDeviceForMac(mac);
            }
            postJSON.remove(KEY_MAC);

            if (device == null && groupArray == null) {
                return null;
            }

            boolean rootResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            postJSON.remove(KEY_ROOT_RESP);
            Map<String, String> headers = new HashMap<>();
            if (rootResp) {
                headers.put(DeviceUtil.HEADER_ROOT_RESP, String.valueOf(true));
            }

            if (groupArray != null) {
                JSONArray macArray = new JSONArray();
                if (device != null) {
                    macArray.put(device.getMac());
                }
                return requestGroup(macArray, groupArray, postJSON.toString().getBytes(), headers);
            } else {
                EspHttpResponse response = DeviceUtil.httpLocalRequest(device, postJSON.toString().getBytes(),
                        null, headers);
                if (response != null) {
                    return response.getContentString();
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }

    void requestDevice(String request) {
        requestDeviceSinglecast(request, true);
    }

    private void requestDeviceSinglecast(String request, boolean async) {
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

        if (async) {
            Observable.just(request)
                    .subscribeOn(Schedulers.io())
                    .doOnNext(rqst -> {
                        String result = executeDeviceSinglecast(rqst);
                        processDeviceSinglecastResult(result, callback, callbackTag);
                    })
                    .subscribe();
        } else {
            String result = executeDeviceSinglecast(request);
            try {
                processDeviceSinglecastResult(result, callback, callbackTag);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

    }

    private void processDeviceSinglecastResult(String result, String callback, String callbackTag)
            throws JSONException {
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
    }

    void requestDevicesMulticast(String request) {
        requestDevicesMulticast(request, true);
    }

    private void requestDevicesMulticast(String request, boolean async) {
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

        if (async) {
            Observable.just(request)
                    .subscribeOn(Schedulers.io())
                    .doOnNext(rqst -> {
                        String result = executeDevicesMulticast(rqst);
                        processDeviceMulticastResult(result, callback, callbackTag);
                    })
                    .subscribe(new EspRxObserver<String>() {
                        @Override
                        public void onError(Throwable e) {
                            e.printStackTrace();
                        }
                    });
        } else {
            String result = executeDevicesMulticast(request);
            try {
                processDeviceMulticastResult(result, callback, callbackTag);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    private void processDeviceMulticastResult(String result, String callback, String callbackTag)
            throws JSONException {
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
    }

    private String executeDevicesMulticast(String request) {
        try {
            JSONObject postJSON = new JSONObject(request);
            JSONArray macArray = null;
            if (!postJSON.isNull(KEY_MAC)) {
                macArray = postJSON.getJSONArray(KEY_MAC);
            }
            postJSON.remove(KEY_MAC);

            JSONArray groupArray = null;
            boolean isGroup = postJSON.optBoolean(KEY_IS_GROUP, false);
            postJSON.remove(KEY_IS_GROUP);
            if (isGroup) {
                if (!postJSON.isNull(KEY_GROUP)) {
                    groupArray = postJSON.getJSONArray(KEY_GROUP);
                }
                postJSON.remove(KEY_GROUP);
            }

            if (groupArray == null && macArray == null) {
                return null;
            }

            postJSON.remove(KEY_CALLBACK);
            postJSON.remove(KEY_TAG);
            postJSON.remove(KEY_HOST);

            boolean rootResp = postJSON.optBoolean(KEY_ROOT_RESP, false);
            postJSON.remove(KEY_ROOT_RESP);
            Map<String, String> headers = new HashMap<>();

            if (rootResp) {
                headers.put(DeviceUtil.HEADER_ROOT_RESP, String.valueOf(true));
            }
            if (groupArray != null) {
                return requestGroup(macArray, groupArray, postJSON.toString().getBytes(), headers);
            } else {
                List<IEspDevice> devices = new ArrayList<>(macArray.length());
                for (int i = 0; i < macArray.length(); ++i) {
                    String mac = macArray.getString(i);
                    IEspDevice device = mUser.getDeviceForMac(mac);
                    if (device != null) {
                        devices.add(device);
                    }
                }
                List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(devices,
                        postJSON.toString().getBytes(), null, headers);
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
            }


        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    void startConfigureBlufi(String request) {
        stopConfigureBlufi();

        WebUtils.ConfigRequest configRequest = WebUtils.parseConfigRequest(request);
        if (configRequest == null) {
            return;
        }
        synchronized (mBlufiLock) {
            String deviceMac = DeviceUtil.convertToColonBssid(configRequest.bleAddress).toUpperCase();
            mBlufi = new EspActionDeviceConfigure2().doActionConfigureBlufi2(
                    deviceMac, configRequest.version, configRequest.params, new ConfigureProgressCB());
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
            callJS(progress, status, message);
        }

        private void callJS(int progress, int code, String message) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_PROGRESS, progress)
                        .put(KEY_CODE, code)
                        .put(KEY_MESSAGE, message);

                evaluateJavascript(JSCallbacks.onConfigureProgress(json.toString()));
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
            for (int i = 0; i < array.length(); ++i) {
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
            for (int i = 0; i < array.length(); ++i) {
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
            evaluateJavascript(JSCallbacks.onLoadDeviceTable(""));
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

        evaluateJavascript(JSCallbacks.onLoadDeviceTable(json.toString()));
    }

    void saveTableDevices(String devices) {
        try {
            JSONArray array = new JSONArray(devices);

            SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();

            for (int i = 0; i < array.length(); ++i) {
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

        evaluateJavascript(JSCallbacks.onLoadTableDevices(array.toString()));
    }

    String loadTableDevices(String macs) {
        JSONArray array = new JSONArray();

        try {
            JSONArray macArray = new JSONArray(macs);
            SharedPreferences sp = mApp.getSharedPreferences(PREF_TAB_DEVICES, Context.MODE_PRIVATE);
            for (int i = 0; i < macArray.length(); ++i) {
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

            for (int i = 0; i < macArray.length(); ++i) {
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

        evaluateJavascript(JSCallbacks.onLoadAPs(array.toString()));
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

        Observable.create((ObservableOnSubscribe<String>) emitter -> {
            List<SnifferDB> snifferDBS = MeshObjectBox.getInstance()
                    .sniffer()
                    .loadSniffers(minTime, maxTime, delDuplicate);
            JSONArray snifferArray = new JSONArray();
            for (SnifferDB sniffer : snifferDBS) {
                try {
                    String name = sniffer.name == null ? null : Utils.base64(sniffer.name);
                    JSONObject json = new JSONObject()
                            .put(KEY_TYPE, sniffer.type)
                            .put(KEY_MAC, sniffer.bssid)
                            .put(KEY_CHANNEL, sniffer.channel)
                            .put(KEY_TIME, sniffer.utc_time + TimeZone.getDefault().getRawOffset())
                            .put(KEY_RSSI, sniffer.rssi)
                            .put(KEY_NAME, name)
                            .put(KEY_SCANNER, sniffer.device_mac)
                            .put(KEY_ORG, sniffer.organization);
                    snifferArray.put(json);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            emitter.onNext(snifferArray.toString());
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .doOnNext(sniffers -> evaluateJavascript(String.format("%s(\'%s\')", callback, sniffers)))
                .subscribe();
    }

    public static class SnifferSubscriber {
        final LinkedBlockingQueue<Collection<Sniffer>> sniffersQueue = new LinkedBlockingQueue<>();

        @Subscribe
        public void onSniffersDiscovered(SnifferDiscoveredEvent event) {
            List<Sniffer> sniffers = event.getSniffers();
            if (sniffers.isEmpty()) {
                return;
            }

            sniffersQueue.add(sniffers);
        }
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

        SnifferSubscriber snifferSubscriber = new SnifferSubscriber();
        EventBus.getDefault().register(snifferSubscriber);
        mSnifferTask = Observable.just(deviceList)
                .subscribeOn(Schedulers.io())
                .doOnNext(devices -> {
                    Thread thread = Thread.currentThread();
                    while (!thread.isInterrupted()) {
                        // Show sniffers
                        Collection<Sniffer> querySnifferList;
                        try {
                            querySnifferList = snifferSubscriber.sniffersQueue.take();
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
                            String name = sniffer.getName() == null ?
                                    null : Utils.base64(sniffer.getName());
                            JSONObject json = new JSONObject()
                                    .put(KEY_TYPE, sniffer.getType())
                                    .put(KEY_MAC, sniffer.getBssid())
                                    .put(KEY_CHANNEL, sniffer.getChannel())
                                    .put(KEY_TIME, sniffer.getUTCTime() + timeZoneOffset)
                                    .put(KEY_RSSI, sniffer.getRssi())
                                    .put(KEY_NAME, name)
                                    .put(KEY_SCANNER, sniffer.getDeviceMac())
                                    .put(KEY_ORG, sniffer.getOrganization());
                            snifferArray.put(json);
                        }
                        snifferList.clear();

                        evaluateJavascript(JSCallbacks.onSniffersDiscovered(snifferArray.toString()));
                    } // end while
                })
                .doOnNext(devices -> {
                    EventBus.getDefault().unregister(snifferSubscriber);
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

        mActivity.evaluateJavascript(JSCallbacks.onGetUpgradeFiles(array.toString()));
    }

    void startOTA(String request) {
        String bin;
        List<IEspDevice> devices = new LinkedList<>();
        int otaType;
        try {
            JSONObject json = new JSONObject(request);
            bin = json.getString(KEY_BIN);

            JSONArray macArray = json.getJSONArray(KEY_MACS);
            for (int i = 0; i < macArray.length(); ++i) {
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
                    evaluateJavascript(JSCallbacks.onOTAProgressChanged(array.toString()));
                }

                @Override
                public void onOTAResult(EspOTAClient client, List<String> completeMacs) {
                    mLog.i("onOTAResult: " + client.getAddress() + " : " + completeMacs.toString());
                    client.close();
                    mOtaClientMap.remove(client.getAddress());

                    if (mActivity == null) {
                        return;
                    }

                    JSONArray array = new JSONArray();
                    for (String mac : completeMacs) {
                        array.put(mac);
                    }

                    evaluateJavascript(JSCallbacks.onOTAResult(array.toString()));
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

    private void stopOTAClient(EspOTAClient client) {
        Observable.just(client)
                .subscribeOn(Schedulers.io())
                .doOnNext(EspOTAClient::stop)
                .subscribe();
    }

    void stopOTA() {
        mLog.d("StopOTA()");
        synchronized (mOtaLock) {
            for (EspOTAClient client : mOtaClientMap.values()) {
                mLog.d("OTA Client Stop " + client.getAddress());
                stopOTAClient(client);
            }
            mOtaClientMap.clear();
        }
    }

    void stopOTA(String request) {
        mLog.d("StopOTA " + request);
        try {
            JSONObject json = new JSONObject(request);
            JSONArray addrArray = json.getJSONArray(KEY_HOST);
            synchronized (mOtaLock) {
                for (int i = 0; i < addrArray.length(); ++i) {
                    String address = addrArray.getString(i);
                    EspOTAClient client = mOtaClientMap.remove(address);
                    if (client != null) {
                        mLog.d("OTA Client Stop " + client.getAddress());
                        stopOTAClient(client);
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
                        for (int i = 0; i < macArray.length(); ++i) {
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
                        for (int i = 0; i < macArray.length(); ++i) {
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
                for (int i = 0; i < deviceMacs.length(); ++i) {
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
            for (int i = 0; i < jsonArray.length(); ++i) {
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

        evaluateJavascript(JSCallbacks.onLoadGroups(result.toString()));
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
        ScanSettings settings = new ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_BALANCED)
                .build();
        mActivity.startBleScan(null, settings);
    }

    void startBleScan(String request) {
        JSONObject json;
        List<ScanFilter> filterList = null;
        int scanMode = ScanSettings.SCAN_MODE_BALANCED;
        try {
            json = new JSONObject(request);
            if (!json.isNull(KEY_FILTERS)) {
                JSONArray filterArray = json.getJSONArray(KEY_FILTERS);
                filterList = new ArrayList<>(filterArray.length());
                for (int i = 0; i < filterArray.length(); ++i) {
                    JSONObject filterJSON = filterArray.getJSONObject(i);
                    String filterAddress = filterJSON.optString(KEY_ADDRESS, null);
                    String filterName = filterJSON.optString(KEY_NAME, null);

                    ScanFilter.Builder filterBuilder = null;
                    if (filterAddress != null || filterName != null) {
                        filterBuilder = new ScanFilter.Builder();
                    }
                    if (filterAddress != null) {
                        filterBuilder.setDeviceAddress(filterAddress);
                    }
                    if (filterName != null) {
                        filterBuilder.setDeviceName(filterName);
                    }

                    if (filterBuilder != null) {
                        filterList.add(filterBuilder.build());
                    }
                }

            }
            if (!json.isNull(KEY_SETTINGS)) {
                JSONObject settingsJSON = json.getJSONObject(KEY_SETTINGS);
                scanMode = settingsJSON.optInt(KEY_SCAN_MODE, ScanSettings.SCAN_MODE_BALANCED);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        ScanSettings settings = new ScanSettings.Builder()
                .setScanMode(scanMode)
                .build();

        mActivity.startBleScan(filterList, settings);
    }

    void stopBleScan() {
        mActivity.stopBleScan();
    }

    void checkLatestApk() {
        Observable.just(new EspActionUpgradeAPK())
                .subscribeOn(Schedulers.io())
                .map(action -> {
                    IEspActionUpgradeApk.ReleaseInfo releaseInfo = action.doActionGetLatestRelease();
                    if (releaseInfo != null) {
                        String notes = releaseInfo.getNotes();
                        if (notes != null) {
                            notes = Base64.encodeToString(notes.getBytes(), Base64.NO_WRAP);
                        }
                        return new JSONObject()
                                .put(KEY_STATUS, 0)
                                .put(KEY_VERSION, releaseInfo.getVersionCode())
                                .put(KEY_VERSION_NAME, releaseInfo.getVersionName())
                                .put(KEY_TOTAL_SIZE, releaseInfo.getApkSize())
                                .put(KEY_URL, releaseInfo.getDownloadUrl())
                                .put(KEY_NOTES, notes);
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
                        evaluateJavascript(JSCallbacks.onCheckAppVersion(json.toString()));
                    }
                });
    }

    void downloadApkAndInstall(String request) {
        String url;
        long size;

        try {
            JSONObject json = new JSONObject(request);
            url = json.getString(KEY_URL);
            size = json.optLong(KEY_TOTAL_SIZE, -1);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        String apkDir = EspApplication.getEspApplication().getEspRootSDPath() + "/apk";
        String apkName = "mesh.apk";
        long apkSize = size;

        Observable.just(new EspActionUpgradeAPK())
                .subscribeOn(Schedulers.io())
                .filter(action -> {
                    File dir = new File(apkDir);
                    return dir.exists() || dir.mkdirs();
                })
                .map(action -> {
                    action.setDownloadCallback((totalSize, downloadSize) -> {
                        try {
                            JSONObject dlJSON = new JSONObject()
                                    .put(KEY_TOTAL_SIZE, totalSize < 0 ? apkSize : totalSize)
                                    .put(KEY_DOWNLOAD_SIZE, downloadSize);

                            evaluateJavascript(JSCallbacks.onApkDownloading(dlJSON.toString()));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    });
                    return action.doActionDownloadAPK(url, new File(apkDir, apkName));
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
                            evaluateJavascript(JSCallbacks.onApkDownloadResult(json.toString()));
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

            evaluateJavascript(JSCallbacks.onDownloadLatestRom(json.toString()));
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
            versionName = "unknown";
            versionCode = -1;
        }

        try {
            JSONObject json = new JSONObject()
                    .put(KEY_OS, "Android")
                    .put(KEY_VERSION_NAME, versionName)
                    .put(KEY_VERSION_CODE, versionCode);

            evaluateJavascript(JSCallbacks.onGetAppInfo(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void saveDeviceEventsCoordinate(String request) {
        String mac;
        String events;
        String coordinate;
        try {
            JSONObject json = new JSONObject(request);
            mac = json.getString(KEY_MAC);
            events = json.getString(KEY_EVENTS);
            coordinate = json.getString(KEY_COORDINATE);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        MeshObjectBox.getInstance().custom().saveDeviceEvents(mac, events, coordinate);
    }

    void loadDeviceEventsCoordinate(String request) {
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

        CustomDB db = MeshObjectBox.getInstance().custom().loadDeviceEvents(mac);
        if (db == null) {
            return;
        }
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_MAC, db.key)
                    .put(KEY_TAG, tag)
                    .put(KEY_EVENTS, db.value1)
                    .put(KEY_COORDINATE, db.value2 == null ? JSONObject.NULL : db.value2);
            String string = URLEncoder.encode(json.toString(), "UTF-8");
            evaluateJavascript(String.format("%s(\'%s\')", callback, string));
        } catch (JSONException | UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    void loadAllDeviceEventsCoordinate(String request) {
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

        List<CustomDB> deviceList = MeshObjectBox.getInstance().custom().loadAllDeviceEvents();
        JSONArray array = new JSONArray();
        for (CustomDB device : deviceList) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_MAC, device.key)
                        .put(KEY_EVENTS, device.value1)
                        .put(KEY_COORDINATE, device.value2 == null ? JSONObject.NULL : device.value2);
                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        try {
            JSONObject result = new JSONObject()
                    .put(KEY_TAG, tag)
                    .put(KEY_CONTENT, Utils.base64(array.toString()));

            evaluateJavascript(String.format("%s(\'%s\')", callback, result.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void deleteDeviceEventsCoordinate(String mac) {
        MeshObjectBox.getInstance().custom().deleteDeviceEvents(mac);
    }

    void deleteAllDeviceEventsCoordinate() {
        MeshObjectBox.getInstance().custom().deleteAllDeviceEvents();
    }

    void removeDeviceForMac(String mac) {
        mUser.removeDevice(mac);
    }

    void removeDevicesForMacs(String macArray) {
        try {
            JSONArray array = new JSONArray(macArray);
            for (int i = 0; i < array.length(); ++i) {
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
            for (int i = 0; i < staArray.length(); ++i) {
                String staMac = staArray.getString(i);
                String bleMac = DeviceUtil.getBleMacForStaMac(staMac);
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
            for (int i = 0; i < bleArray.length(); ++i) {
                String bleMac = bleArray.getString(i);
                String staMac = DeviceUtil.getStaMacForBleMac(bleMac);
                result.put(staMac);
            }

            return result.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    void getLocale() {
        Locale locale = LocaleListCompat.getDefault().get(0);
        String language = locale.getLanguage();
        String country = locale.getCountry();
        try {
            JSONObject json = new JSONObject()
                    .put(KEY_LANGUAGE, language)
                    .put(KEY_COUNTRY, country)
                    .put(KEY_OS, "Android");

            evaluateJavascript(JSCallbacks.onLocaleGot(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    void loadHWDevices() {
        List<CustomDB> deviceList = MeshObjectBox.getInstance().custom().loadAllDeviceHWs();
        JSONArray array = new JSONArray();
        for (CustomDB db : deviceList) {
            try {
                JSONObject json = new JSONObject()
                        .put(KEY_MAC, db.key)
                        .put(KEY_CODE, db.value1)
                        .put(KEY_FLOOR, db.value2)
                        .put(KEY_AREA, db.value3)
                        .put(KEY_TIME, Long.parseLong(db.value4));

                array.put(json);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        evaluateJavascript(JSCallbacks.onLoadHWDevices(array.toString()));
    }

    void saveHWDevices(String request) {
        try {
            JSONArray array = new JSONArray(request);

            for (int i = 0; i < array.length(); ++i) {
                JSONObject json = array.getJSONObject(i);
                String code = json.getString(KEY_CODE);
                String mac = json.getString(KEY_MAC);
                String floor = json.getString(KEY_FLOOR);
                String area = json.getString(KEY_AREA);

                MeshObjectBox.getInstance()
                        .custom().saveDeviceHW(mac, code, floor, area, System.currentTimeMillis());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void deleteHWDevices(String macArray) {
        try {
            JSONArray array = new JSONArray(macArray);

            MeshObjectBox dbManager = MeshObjectBox.getInstance();
            for (int i = 0; i < array.length(); ++i) {
                String mac = array.getString(i);
                dbManager.custom().deleteDeviceHW(mac);
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

        evaluateJavascript(JSCallbacks.onLoadMeshIds(array.toString()));
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
            for (int i = 0; i < macs.length(); ++i) {
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
        evaluateJavascript(JSCallbacks.onLoadMacs(array.toString()));
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
            for (int i = 0; i < contentArray.length(); ++i) {
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
            for (int i = 0; i < keyArray.length(); ++i) {
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

            evaluateJavascript(JSCallbacks.onLoadValueForKeyInFile(resultJSON.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void loadAllValuesInFile(String request) {
        String fileName;
        String callback;
        try {
            JSONObject json = new JSONObject(request);
            fileName = json.getString(KEY_NAME);
            callback = json.getString(KEY_CALLBACK);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

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

            evaluateJavascript(String.format("%s(\'%s\')", callback, resultJSON.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void closeDeviceLongSocket(String host) {
        mLog.d("closeDeviceLongSocket " + host);
        mLongSocketTasks.clear();
    }

    private class LongSocketTask {
        String host;
        String file;
        Map<String, String> headers;
        byte[] content;
    }

    private class LongSocketWriteThread extends Thread {
        @Override
        public void run() {
            LongSocketTask task;
            while (true) {
                try {
                    task = mLongSocketTasks.take();
                } catch (InterruptedException e) {
                    mLog.w("LongSocketWriteThread interrupted");
                    break;
                }

                EspHttpUtils.Post("http://" + task.host + task.file, task.content, null, task.headers);
            }

            mLog.d("LongSocketWriteThread over");
        }
    }

    void requestDeviceLongSocket(String request) {
        String host;
        List<String> macList;
        boolean rootResp;
        JSONObject json;
        try {
            json = new JSONObject(request);
            host = json.getString(KEY_HOST);
            JSONArray macArray = json.getJSONArray(KEY_MACS);
            macList = new ArrayList<>(macArray.length());
            for (int i = 0; i < macArray.length(); ++i) {
                macList.add(macArray.getString(i));
            }
            rootResp = json.optBoolean(KEY_ROOT_RESP, false);

            json.remove(KEY_HOST);
            json.remove(KEY_MACS);
            json.remove(KEY_ROOT_RESP);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        Map<String, String> headers = new HashMap<>();
        headers.put(IEspActionDevice.HEADER_NODE_COUNT, String.valueOf(macList.size()));
        StringBuilder macBuilder = new StringBuilder();
        for (String mac : macList) {
            macBuilder.append(mac).append(',');
        }
        macBuilder.deleteCharAt(macBuilder.length() - 1);
        headers.put(IEspActionDevice.HEADER_NODE_MAC, macBuilder.toString());
        headers.put(DeviceUtil.HEADER_ROOT_RESP, String.valueOf(rootResp));
        headers.put(EspHttpUtils.CONTENT_TYPE, EspHttpUtils.APPLICATION_JSON);

        LongSocketTask task = new LongSocketTask();
        task.host = host;
        task.file = DeviceUtil.FILE_REQUEST;
        task.headers = headers;
        task.content = json.toString().getBytes();
        mLongSocketTasks.add(task);
    }

    void gotoSystemSettings(String setting) {
        String action = null;
        int request = -1;
        switch (setting) {
            case "wifi":
                action = Settings.ACTION_WIFI_SETTINGS;
                request = EspWebActivity.REQUEST_WIFI;
                break;
            case "bluetooth":
                action = Settings.ACTION_BLUETOOTH_SETTINGS;
                request = EspWebActivity.REQUEST_BLUETOOTH;
                break;
            case "location":
                action = Settings.ACTION_LOCATION_SOURCE_SETTINGS;
                request = EspWebActivity.REQUEST_LOCATION;
                break;
        }
        if (action != null) {
            Intent intent = new Intent(action);
            mActivity.startActivityForResult(intent, request);
        }
    }

    void newWebView(String url) {
        mActivity.newWebView(url);
    }

    String getStringForBuffer(String buffer) {
        try {
            JSONArray array = new JSONArray(buffer);
            byte[] data = new byte[array.length()];
            for (int i = 0; i < array.length(); ++i) {
                data[i] = (byte) array.getInt(i);
            }

            try {
                String string = new String(data, "GBK");
                evaluateJavascript(JSCallbacks.onGetStringForBuffer(string));
                return string;
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return null;
    }

    String getBufferForString(String string) {
        try {
            byte[] data = string.getBytes("GBK");
            JSONArray array = new JSONArray();
            for (byte b : data) {
                array.put(b & 0xff);
            }
            evaluateJavascript(JSCallbacks.onGetBufferForString(array.toString()));
            return array.toString();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return null;
    }

    void updateDeviceGroup(String request) {
        try {
            JSONObject json = new JSONObject(request);
            Map<String, Set<String>> macGroupMap = new HashMap<>();
            Iterator<String> groups = json.keys();
            while (groups.hasNext()) {
                String group = groups.next();
                JSONArray macArray = json.getJSONArray(group);

                for (int i = 0; i < macArray.length(); ++i) {
                    String mac = macArray.getString(i);

                    Set<String> groupSet = macGroupMap.get(mac);
                    if (groupSet == null) {
                        groupSet = new HashSet<>();
                        macGroupMap.put(mac, groupSet);
                    }
                    groupSet.add(group);
                }
            }

            for (Map.Entry<String, Set<String>> entry : macGroupMap.entrySet()) {
                IEspDevice device = mUser.getDeviceForMac(entry.getKey());
                if (device != null) {
                    device.setGroups(entry.getValue());
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private class MeshBLEListener extends BluetoothGattCallback {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            JSONObject json = new JSONObject();
            try {
                json.put(KEY_ADDRESS, gatt.getDevice().getAddress());
            } catch (JSONException e) {
                e.printStackTrace();
            }
            if (status == BluetoothGatt.GATT_SUCCESS) {
                if (newState == BluetoothGatt.STATE_CONNECTED) {
                    try {
                        json.put(KEY_CONNECTED, true);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                } else if (newState == BluetoothGatt.STATE_DISCONNECTED) {
                    try {
                        json.put(KEY_CONNECTED, false);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            } else {
                try {
                    json.put(KEY_CONNECTED, false);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            evaluateJavascript(JSCallbacks.onMeshBLEDeviceConnectionChanged(json.toString()));
        }
    }

    void connectMeshBLEDevice(String request) {
        if (mMeshBLEClient == null) {
            return;
        }

        String address;
        try {
            JSONObject json = new JSONObject(request);
            address = json.getString(KEY_ADDRESS);
            if (address.length() == 12) {
                byte[] bytes = DataUtil.hexStringToBigEndianBytes(address);
                address = String.format(Locale.ENGLISH, "%02X:%02X:%02X:%02X:%02X:%02X",
                        bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        mMeshBLEClient.connect(address);
    }

    void disconnectMeshBLEDevice() {
        if (mMeshBLEClient == null) {
            return;
        }

        mMeshBLEClient.close();
    }

    void postDataToMeshBLEDevice(String request) {
        if (mMeshBLEClient == null) {
            return;
        }

        byte[] value;
        try {
            JSONObject json = new JSONObject(request);
            String type = json.getString(KEY_TYPE);
            switch (type) {
                case "string":
                    value = json.getString(KEY_VALUE).getBytes();
                    break;
                case "json":
                    value = json.getJSONObject(KEY_VALUE).toString().getBytes();
                    break;
                case "buffer":
                    JSONArray buffer = json.getJSONArray(KEY_VALUE);
                    value = new byte[buffer.length()];
                    for (int i = 0; i < buffer.length(); ++i) {
                        value[i] = (byte) buffer.getInt(i);
                    }
                    break;
                default:
                    mLog.w("postDataToMeshBLEDevice() unsupported type");
                    return;
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        mMeshBLEClient.write(value);
    }

    void setStatusBar(String request) {
        int r, g, b, a;
        boolean defalutStyle;

        try {
            JSONObject requestJSON = new JSONObject(request);
            JSONArray rgba = requestJSON.getJSONArray("background");
            r = rgba.getInt(0);
            g = rgba.getInt(1);
            b = rgba.getInt(2);
            a = rgba.getInt(3);
            defalutStyle = requestJSON.optBoolean("defaultStyle", true);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        int styleFlags = defalutStyle ? View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        int bgColor = Color.argb(a, r, g, b);
        mActivity.runOnUiThread(() -> {
            mActivity.getWindow().getDecorView().setSystemUiVisibility(styleFlags);
            mActivity.getWindow().setStatusBarColor(bgColor);
        });
    }

    void openBrowser(String url) {
        mActivity.runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri uri = Uri.parse(url);
            intent.setData(uri);
            mActivity.startActivity(intent);
        });
    }

    private Map<String, String> json2Map(JSONObject json) throws JSONException {
        if (json == null) {
            return null;
        }

        Map<String, String> map = new HashMap<>();
        Iterator<String> iterator = json.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            Object value = json.get(key);
            map.put(key, value.toString());
        }
        return map;
    }

    private EspHttpResponse executeHttpRequest(String url, String method, Map<String, String> headers, byte[] content)
            throws IllegalArgumentException {
        EspHttpResponse response;
        switch (method) {
            case EspHttpUtils.METHOD_GET: {
                response = EspHttpUtils.Get(url, null, headers);
                break;
            }
            case EspHttpUtils.METHOD_POST: {
                response = EspHttpUtils.Post(url, content, null, headers);
                break;
            }
            case EspHttpUtils.METHOD_PUT: {
                response = EspHttpUtils.Put(url, content, null, headers);
                break;
            }
            case EspHttpUtils.METHOD_DELETE: {
                response = EspHttpUtils.Delete(url, content, null, headers);
                break;
            }
            default: {
                throw new IllegalArgumentException("Unsupported Method");
            }
        }

        return response;
    }

    void httpRequest(String request) {
        String url;
        Map<String, String> headers;
        String method;
        String content;
        String callback;

        try {
            JSONObject requestJSON = new JSONObject(request);
            url = requestJSON.getString("url");
            method = requestJSON.getString("method");
            JSONObject headersJSON = requestJSON.optJSONObject("headers");
            headers = json2Map(headersJSON);
            content = requestJSON.has("content") ? requestJSON.get("content").toString() : "";
            callback = requestJSON.getString(KEY_CALLBACK);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        Observable.just(new AtomicReference<EspHttpResponse>())
                .subscribeOn(Schedulers.io())
                .filter(ref -> {
                    try {
                        EspHttpResponse response = executeHttpRequest(url, method, headers,
                                content.getBytes());
                        ref.set(response);
                        return callback != null;
                    } catch (Exception e) {
                        e.printStackTrace();
                        return false;
                    }
                })
                .observeOn(AndroidSchedulers.mainThread())
                .doOnNext(ref -> {
                    EspHttpResponse response = ref.get();
                    int code;
                    String message;
                    JSONObject respHeaders;
                    String respContent;
                    if (response == null) {
                        code = 600;
                        message = "Connect failed";
                        respHeaders = null;
                        respContent = "";
                    } else {
                        code = response.getCode();
                        message = response.getMessage();
                        respHeaders = new JSONObject();
                        for (EspHttpHeader header : response.getHeaders()) {
                            try {
                                respHeaders.put(header.getName(), header.getValue());
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                        byte[] contentData = response.getContent();
                        respContent = contentData != null ? Utils.base64(contentData) : "";
                    }

                    try {
                        JSONObject respJSON = new JSONObject()
                                .put("code", code)
                                .put("message", message)
                                .put("headers", respHeaders)
                                .put("content", respContent);
                        String script = String.format("%s(\'%s\')", callback, respJSON.toString());
                        mActivity.evaluateJavascript(script);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                })
                .subscribe();


    }
}
