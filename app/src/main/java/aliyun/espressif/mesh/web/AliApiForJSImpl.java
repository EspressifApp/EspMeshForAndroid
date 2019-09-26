package aliyun.espressif.mesh.web;

import android.content.Context;

import com.aliyun.alink.business.devicecenter.api.add.DeviceInfo;
import com.aliyun.iot.aep.sdk.login.LoginBusiness;
import com.aliyun.iot.aep.sdk.login.data.UserInfo;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import aliyun.espressif.mesh.AliHelper;
import aliyun.espressif.mesh.IAliHelper;
import aliyun.espressif.mesh.constants.AliConstants;
import h5.espressif.esp32.module.action.EspActionDeviceConfigure2;
import h5.espressif.esp32.module.action.IEspActionDeviceConfigure2;
import h5.espressif.esp32.module.model.web.JSCallbacks;
import h5.espressif.esp32.module.model.web.WebUtils;
import io.reactivex.Observable;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.log.EspLog;

class AliApiForJSImpl implements AliConstants {
    private final EspLog mLog = new EspLog(getClass());

    private IAliHelper mAliHelper;
    private AliApiForJS.JSEvaluate mJSEvaluate;

    private final Object mConfigLock = new Object();
    private MeshBlufiClient mBlufi;

    private volatile boolean mReleased = false;

    AliApiForJSImpl(Context context, AliApiForJS.JSEvaluate evaluate) {
        mAliHelper = new AliHelper(context);
        mJSEvaluate = evaluate;
    }

    void release() {
        mReleased = true;
        mAliHelper.release();
        mAliHelper = null;
        mJSEvaluate = null;
    }

    private void evaluateJavascript(String script) {
        if (mJSEvaluate != null) {
            mJSEvaluate.evaluateJavascript(script);
        }
    }

    void startConfig(String request) {
        stopConfig();

        WebUtils.ConfigRequest configRequest = WebUtils.parseConfigRequest(request);
        if (configRequest == null) {
            return;
        }

        synchronized (mConfigLock) {
            String deviceMac = DeviceUtil.convertToColonBssid(configRequest.bleAddress).toUpperCase();
            String devStaBssid = DeviceUtil.getStaMacForBleMac(configRequest.bleAddress);
            devStaBssid = DeviceUtil.convertToColonBssid(devStaBssid).toUpperCase();
            Set<String> bssids = new HashSet<>();
            bssids.add(devStaBssid);
            bssids.addAll(configRequest.params.getWhiteList());
            mBlufi = new EspActionDeviceConfigure2().doActionConfigureBlufi2(
                    deviceMac, configRequest.version, configRequest.params,
                    new ConfigureProgressCB(bssids));
        }
    }

    void stopConfig() {
        synchronized (mConfigLock) {
            if (mBlufi != null) {
                mBlufi.close();
                mBlufi = null;
            }
        }
    }

    private class ConfigureProgressCB implements IEspActionDeviceConfigure2.ProgressCallback {
        private int mStatusCode = IEspActionDeviceConfigure2.CODE_IDLE;

        private Set<String> mEntryBssids;
        private Map<String, DeviceInfo> mDiscoveredDevices;

        private AtomicInteger mBindCounter;
        private LinkedBlockingQueue<JSONObject> mBoundResults;

        ConfigureProgressCB(Set<String> bssids) {
            mEntryBssids = bssids;
            mDiscoveredDevices = new HashMap<>();

            mBindCounter = new AtomicInteger(0);
            mBoundResults = new LinkedBlockingQueue<>();
        }

        @Override
        public void onUpdate(int progress, int status, String message) {
            if (mReleased) {
                return;
            }
            if (mStatusCode < IEspActionDeviceConfigure2.CODE_SUC
                    || mStatusCode > IEspActionDeviceConfigure2.CODE_IDLE) {
                return;
            }

            mStatusCode = status;

            switch (mStatusCode) {
                case IEspActionDeviceConfigure2.CODE_SUC: {
                    mBlufi.close();
                    configAliDiscovery();
                    break;
                }
                case IEspActionDeviceConfigure2.CODE_SUC_DISCONNECT: {
                    break;
                }
                default: {
                    callJS(progress, status, message);
                    break;
                }
            }
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

        private void configAliDiscovery() {
            mLog.d("Config configAliDiscovery");
            callJS(IEspActionDeviceConfigure2.PROGRESS_ALI_DISCOVERING,
                    IEspActionDeviceConfigure2.CODE_NORMAL_ALI_DISCOVERING,
                    "Start discovery Ali device");
            mAliHelper.startDiscovery((discoveryType, list) -> {
                Observable.fromIterable(list)
                        .filter(info -> {
                            mLog.d("DiscoveryAli DeviceInfo= " + info.deviceName + " " + info.token);
                            if (info.mac == null) {
                                return false;
                            }
                            String mac = info.mac.toUpperCase();
                            if (!mEntryBssids.contains(mac)) {
                                return false;
                            }

                            mDiscoveredDevices.put(mac, info);
                            return true;
                        })
                        .doOnNext(info -> {
                            if (info.token != null && info.token.length() > 2) {
                                char c0 = info.token.charAt(0);
                                char c1 = info.token.charAt(1);
                                if ((c0 == 'f' || c0 == 'F') && (c1 == 'f' || c1 == 'F')) {
                                    mBindCounter.incrementAndGet();
                                    configAliBindDevice(info.productKey, info.deviceName, info.token);
                                }
                            }
                        })
//                        .filter(info -> mDiscoveredDevices.size() == mEntryBssids.size())
//                        .doOnNext(info -> {
//                            mAliHelper.stopDiscovery();
//
//                            boolean allSuc = true;
//                            for (int i = 0; i < mBindCounter.get(); i++) {
//                                try {
//                                    JSONObject json = mBoundResults.take();
//                                    boolean suc = json.getBoolean("bound");
//                                    if (!suc) {
//                                        allSuc = false;
//                                    }
//                                } catch (InterruptedException e) {
//                                    mLog.w("Wait ali conf bound result interrupted");
//                                    return;
//                                }
//                            }
//                            if (allSuc) {
//                                callJS(IEspActionDeviceConfigure2.PROGRESS_COMPLETE,
//                                        IEspActionDeviceConfigure2.CODE_SUC,
//                                        "Bind device complete");
//                            }
//                        })
                        .filter(info -> mBindCounter.get() > 0 || mDiscoveredDevices.size() == mEntryBssids.size())
                        .doOnNext(info -> {
                            mAliHelper.stopDiscovery();
                            boolean suc = true;
                            if (mBindCounter.get() > 0) {
                                try {
                                    JSONObject json = mBoundResults.take();
                                    suc = json.getBoolean("bound");
                                } catch (InterruptedException e) {
                                    mLog.w("Wait ali conf bound result interrupted");
                                }
                            }

                            if (suc) {
                                callJS(IEspActionDeviceConfigure2.PROGRESS_COMPLETE,
                                        IEspActionDeviceConfigure2.CODE_SUC,
                                        "Bind device complete");
                            }
                        })
                        .subscribe();
            });
        }

        private void configAliBindDevice(String productKey, String deviceName, String token) {
            mLog.d("Config aliBindDevice");
            callJS(IEspActionDeviceConfigure2.PROGRESS_ALI_DEVICE_BINDING,
                    IEspActionDeviceConfigure2.CODE_NORMAL_ALI_DEVICE_BINDING,
                    "Start bind device");
            mAliHelper.bindDevice(productKey, deviceName, token, (code, iotId, exception) -> {
                mLog.d("Config bindCB = " + code + " , " + iotId);
                int progress;
                int progressCode;
                String progressMsg;
                boolean bound = code == 200;
                if (bound) {
                    progress = IEspActionDeviceConfigure2.PROGRESS_ALI_DEVICE_BINDING + (mBoundResults.size() + 1);
                    progress = Math.min(progress, IEspActionDeviceConfigure2.PROGRESS_ALI_ALL_DEVICE_BOUND);
                    progressCode = IEspActionDeviceConfigure2.CODE_NORMAL_ALI_DEVICE_BOUND;
                    progressMsg = "Bind device " + deviceName + " complete";
                } else {
                    progress = IEspActionDeviceConfigure2.PROGRESS_FAILED;
                    progressCode = IEspActionDeviceConfigure2.CODE_ERR_ALI_DEVICE_BOUND;
                    progressMsg = "Bind device " + deviceName + " failed";
                }
                callJS(progress, progressCode, progressMsg);

                try {
                    JSONObject json = new JSONObject()
                            .put("bound", bound)
                            .put(KEY_PRODUCT_KEY, productKey)
                            .put(KEY_DEVICE_NAME, deviceName)
                            .put(KEY_TOKEN, token);
                    mBoundResults.add(json);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            });
        }
    }

    void aliUserLogin() {
        mAliHelper.login((status, message) -> {
            if (status == 200) {
                JSONObject json = toUserInfoJSON((UserInfo) message);
                evaluateJavascript(AliJSCallbacks.onAliUserLogin(json.toString()));
            }
        });
    }

    void aliUserLogout() {
        mAliHelper.logout((status, message) -> mLog.d("aliUserLogout: " + status + " , " + message));
    }

    void isAliUserLogin() {
        try {
            JSONObject json = new JSONObject().put("isLogin", mAliHelper.isLogged());
            evaluateJavascript(AliJSCallbacks.onIsAliUserLogin(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private JSONObject toUserInfoJSON(UserInfo info) {
        try {
            return new JSONObject()
                    .put(KEY_ACCOUNT_ID, info.userId)
                    .put(KEY_OPEN_ID, info.openId)
                    .put(KEY_USER_NICK, info.userNick)
                    .put(KEY_USER_AVATAR_URL, info.userAvatarUrl)
                    .put(KEY_MOBILE_LOCATION_CODE, info.mobileLocationCode)
                    .put(KEY_MOBILE, info.userPhone)
                    .put(KEY_USER_EMAIL, info.userEmail);
        } catch (JSONException e) {
            e.printStackTrace();
            return new JSONObject();
        }
    }

    void getAliUserInfo() {
        JSONObject json = toUserInfoJSON(LoginBusiness.getUserInfo());
        evaluateJavascript(AliJSCallbacks.onGetAliUserInfo(json.toString()));
    }

    void getAliDeviceList() {
        mAliHelper.listBindingDevices((code, data, beans, exception) -> {
            try {
                JSONObject json = data != null ? new JSONObject(new String(data)) : new JSONObject();
                json.put(KEY_CODE, code);
                if (exception != null) {
                    json.put(KEY_MESSAGE, exception.getMessage());
                }
                evaluateJavascript(AliJSCallbacks.onGetAliDeviceList(json.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    void aliStartDiscovery() {
        mAliHelper.startDiscovery((discoveryType, list) -> {
            JSONArray array = new JSONArray();
            for (DeviceInfo info : list) {
                try {
                    JSONObject json = new JSONObject()
                            .put(KEY_PRODUCT_KEY, info.productKey)
                            .put(KEY_DEVICE_NAME, info.deviceName)
                            .put(KEY_TOKEN, info.token);
                    array.put(json);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            evaluateJavascript(AliJSCallbacks.onAliStartDiscovery(array.toString()));
        });
    }

    void aliStopDiscovery() {
        mAliHelper.stopDiscovery();
    }

    void aliDeviceBinding(String request) {
        JSONObject requestJSON;
        String productKey;
        String deviceName;
        String token;
        try {
            requestJSON = new JSONObject(request);
            productKey = requestJSON.getString(KEY_PRODUCT_KEY);
            deviceName = requestJSON.getString(KEY_DEVICE_NAME);
            token = requestJSON.getString(KEY_TOKEN);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        mAliHelper.bindDevice(productKey, deviceName, token, (code, iotId, exception) -> {
            mLog.d("onBondDevice:" + code + " , " + iotId);
            try {
                JSONObject cbJSON = new JSONObject()
                        .put(KEY_CODE, code)
                        .put(KEY_IOT_ID, iotId)
                        .put("deviceInfo", requestJSON);
                evaluateJavascript(AliJSCallbacks.onAliDeviceBind(cbJSON.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    void aliDeviceUnbindRequest(String request) {
        try {
            AtomicInteger counter = new AtomicInteger(0);
            JSONArray resultArray = new JSONArray();
            JSONArray iotIdArray = new JSONArray(request);
            for (int i = 0; i < iotIdArray.length(); i++) {
                String iotId = iotIdArray.getString(i);
                mAliHelper.unbindDevice(iotId, (code, data, exception) -> {
                    if (code == 200) {
                        resultArray.put(iotId);
                    }
                    int count = counter.incrementAndGet();
                    if (count == iotIdArray.length()) {
                        evaluateJavascript(AliJSCallbacks.onAliDeviceUnbind(resultArray.toString()));
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void getAliDeviceStatus(String request) {
        try {
            JSONArray resultArray = new JSONArray();
            AtomicInteger counter = new AtomicInteger(0);

            JSONArray iotIdArray = new JSONArray(request);
            for (int i = 0; i < iotIdArray.length(); i++) {
                String iotId = iotIdArray.getString(i);
                mAliHelper.statusGet(iotId, (suc, data) -> {
                    if (suc && data != null) {
                        try {
                            JSONObject statusJSON = new JSONObject(data.toString());
                            JSONObject dataJSON = statusJSON.getJSONObject(KEY_DATA);
                            dataJSON.put(KEY_IOT_ID, iotId);
                            resultArray.put(dataJSON);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }

                    int c = counter.incrementAndGet();
                    if (c == iotIdArray.length()) {
                        evaluateJavascript(AliJSCallbacks.onGetAliDeviceStatus(resultArray.toString()));
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void getAliDeviceProperties(String request) {
        try {
            JSONArray resultArray = new JSONArray();
            AtomicInteger counter = new AtomicInteger(0);

            JSONArray iotIdArray = new JSONArray(request);
            for (int i = 0; i < iotIdArray.length(); i++) {
                String iotId = iotIdArray.getString(i);
                mAliHelper.propertiesGet(iotId, (suc, data) -> {
                    mLog.i("getAliDeviceProperties " + suc + " , " + data);
                    if (suc && data != null) {
                        try {
                            JSONObject json = new JSONObject(data.toString());
                            JSONObject dataJSON = json.getJSONObject(KEY_DATA);
                            dataJSON.put(KEY_IOT_ID, iotId);
                            synchronized (resultArray) {
                                resultArray.put(dataJSON);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }

                    int c = counter.incrementAndGet();
                    if (c == iotIdArray.length()) {
                        evaluateJavascript(AliJSCallbacks.onGetAliDeviceProperties(resultArray.toString()));
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void setAliDeviceProperties(String request) {
        try {
            JSONArray resultArray = new JSONArray();
            AtomicInteger counter = new AtomicInteger(0);

            JSONObject json = new JSONObject(request);
            JSONArray iotIdArray = json.getJSONArray(KEY_IOT_ID);
            JSONObject itemsJSON = json.getJSONObject(KEY_PROPERTIES);
            Map<String, Object> itemsMap = new HashMap<>();
            Iterator<String> keys = itemsJSON.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                itemsMap.put(key, itemsJSON.get(key));
            }
            for (int i = 0; i < iotIdArray.length(); i++) {
                String iotId = iotIdArray.getString(i);
                mAliHelper.propertiesSet(iotId, itemsMap, (suc, data) -> {
                    mLog.i("getAliDeviceProperties " + suc + " , " + data);
                    if (suc && data != null) {
                        try {
//                            JSONObject resultJSON = new JSONObject(data.toString());
                            JSONObject dataJSON = new JSONObject();
                            dataJSON.put(KEY_IOT_ID, iotId);
                            synchronized (resultArray) {
                                resultArray.put(dataJSON);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }

                    int c = counter.incrementAndGet();
                    if (c == iotIdArray.length()) {
                        evaluateJavascript(AliJSCallbacks.onSetAliDeviceProperties(resultArray.toString()));
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void getAliOTAUpgradeDeviceList() {
        mAliHelper.listOTAPreDevices((code, data, infoList, exception) -> {
            JSONArray dataArray = null;
            if (data != null) {
                try {
                    dataArray = new JSONArray(new String(data));
                } catch (JSONException e) {
                    mLog.w("Parse getAliOTAUpgradeDeviceList data failed");
                }
            }

            try {
                JSONObject resultJSON = new JSONObject()
                        .put(KEY_CODE, code)
                        .put(KEY_DATA, dataArray != null ? dataArray : data);
                evaluateJavascript(AliJSCallbacks.onGetAliOTAUpgradeDeviceList(resultJSON.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    void aliUpgradeWifiDevice(String request) {
        List<String> iotIdList;
        try {
            JSONArray array = new JSONArray(request);
            iotIdList = new ArrayList<>(array.length());
            for (int i = 0; i < array.length(); i++) {
                iotIdList.add(array.getString(i));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }
        mAliHelper.startOTA(iotIdList, (code, data, exception) -> {
            JSONObject dataJSON = null;
            if (data != null) {
                try {
                    dataJSON = new JSONObject(new String(data));
                } catch (JSONException e) {
                    mLog.w("Parse aliUpgradeWifiDevice data failed");
                }
            }

            try {
                JSONObject resultJSON = new JSONObject()
                        .put(KEY_CODE, code)
                        .put(KEY_DATA, dataJSON != null ? dataJSON : data);
                evaluateJavascript(AliJSCallbacks.onAliUpgradeWifiDevice(resultJSON.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    void aliQueryDeviceUpgradeStatus(String request) {
        final String iotId = request;
        mAliHelper.queryOTAProgress(iotId, (status, data, info, exception) -> {
            JSONObject dataJSON = null;
            if (data != null) {
                try {
                    dataJSON = new JSONObject(new String(data));
                } catch (JSONException e) {
                    mLog.w("Parse aliQueryDeviceUpgradeStatus data failed");
                }
            }

            try {
                JSONObject resultJSON = new JSONObject()
                        .put(KEY_IOT_ID, iotId)
                        .put(KEY_CODE, status)
                        .put(KEY_DATA, dataJSON != null ? dataJSON : data);
                evaluateJavascript(AliJSCallbacks.onAliQueryDeviceUpgradeStatus(resultJSON.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    void getAliOTAIsUpgradingDeviceList() {
        mAliHelper.listUpgradingDevices((code, data, infoList, exception) -> {
            JSONArray dataArray = null;
            if (data != null) {
                try {
                    dataArray = new JSONArray(new String(data));
                } catch (JSONException e) {
                    mLog.w("Parse getAliOTAIsUpgradingDeviceList data failed");
                }
            }

            try {
                JSONObject resultJSON = new JSONObject()
                        .put(KEY_CODE, code)
                        .put(KEY_DATA, dataArray != null ? dataArray : data);
                evaluateJavascript(AliJSCallbacks.onGetAliOTAIsUpgradingDeviceList(resultJSON.toString()));
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }
}
