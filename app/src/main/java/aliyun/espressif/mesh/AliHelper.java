package aliyun.espressif.mesh;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.aliyun.alink.business.devicecenter.api.add.AddDeviceBiz;
import com.aliyun.alink.business.devicecenter.api.add.DeviceInfo;
import com.aliyun.alink.business.devicecenter.api.add.IAddDeviceListener;
import com.aliyun.alink.business.devicecenter.api.add.ProvisionStatus;
import com.aliyun.alink.business.devicecenter.api.discovery.DiscoveryType;
import com.aliyun.alink.business.devicecenter.api.discovery.IDeviceDiscoveryListener;
import com.aliyun.alink.business.devicecenter.api.discovery.IOnDeviceTokenGetListener;
import com.aliyun.alink.business.devicecenter.api.discovery.LocalDeviceMgr;
import com.aliyun.alink.business.devicecenter.base.DCErrorCode;
import com.aliyun.alink.linksdk.tmp.device.panel.PanelDevice;
import com.aliyun.iot.aep.component.router.Router;
import com.aliyun.iot.aep.sdk.apiclient.IoTAPIClient;
import com.aliyun.iot.aep.sdk.apiclient.IoTAPIClientFactory;
import com.aliyun.iot.aep.sdk.apiclient.callback.IoTCallback;
import com.aliyun.iot.aep.sdk.apiclient.callback.IoTResponse;
import com.aliyun.iot.aep.sdk.apiclient.request.IoTRequest;
import com.aliyun.iot.aep.sdk.apiclient.request.IoTRequestBuilder;
import com.aliyun.iot.aep.sdk.credential.IotCredentialManager.IoTCredentialListener;
import com.aliyun.iot.aep.sdk.credential.IotCredentialManager.IoTCredentialManage;
import com.aliyun.iot.aep.sdk.credential.IotCredentialManager.IoTCredentialManageError;
import com.aliyun.iot.aep.sdk.credential.IotCredentialManager.IoTCredentialManageImpl;
import com.aliyun.iot.aep.sdk.credential.data.IoTCredentialData;
import com.aliyun.iot.aep.sdk.login.ILoginCallback;
import com.aliyun.iot.aep.sdk.login.ILogoutCallback;
import com.aliyun.iot.aep.sdk.login.LoginBusiness;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import aliyun.espressif.mesh.bean.DeviceInfoBean;
import aliyun.espressif.mesh.bean.ota.OTADeviceDetailInfo;
import aliyun.espressif.mesh.bean.ota.OTADeviceSimpleInfo;
import aliyun.espressif.mesh.bean.ota.OTAStatusInfo;
import aliyun.espressif.mesh.callback.AliBindDeviceCallback;
import aliyun.espressif.mesh.callback.AliBindTaobaoAccountCallback;
import aliyun.espressif.mesh.callback.AliConfigureCallback;
import aliyun.espressif.mesh.callback.AliGetDevicePropertiesCallback;
import aliyun.espressif.mesh.callback.AliGetDeviceStatusCallback;
import aliyun.espressif.mesh.callback.AliGetThirdPartyAccountCallback;
import aliyun.espressif.mesh.callback.AliListBindingDevicesCallback;
import aliyun.espressif.mesh.callback.AliListUpgradingDevicesCallback;
import aliyun.espressif.mesh.callback.AliLoginCallback;
import aliyun.espressif.mesh.callback.AliLogoutCallback;
import aliyun.espressif.mesh.callback.AliOTAListPreDevicesCallback;
import aliyun.espressif.mesh.callback.AliOTAQueryProgressCallback;
import aliyun.espressif.mesh.callback.AliOTAStartCallback;
import aliyun.espressif.mesh.callback.AliOTAStopCallback;
import aliyun.espressif.mesh.callback.AliSetDevicePropertiesCallback;
import aliyun.espressif.mesh.callback.AliUnbindDeviceCallback;
import aliyun.espressif.mesh.callback.AliUnbindThirdPartyAccountCallback;
import aliyun.espressif.mesh.task.AliDeviceConfigureTask;
import io.reactivex.Completable;
import io.reactivex.Observable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.model.device.ble.IMeshBleDevice;
import iot.espressif.esp32.model.device.ble.MeshConfigureParams;
import iot.espressif.esp32.model.other.EspRxObserver;

public class AliHelper implements IAliHelper {
    private static final String TAG = AliHelper.class.getSimpleName();

    private Context mContext;

    private Map<String, PanelDevice> mPanelDevices;

    private final Object mConfigureLock = new Object();
    private volatile AliDeviceConfigureTask mConfigureTask;

    public AliHelper(Context context) {
        mContext = context.getApplicationContext();
        mPanelDevices = new HashMap<>();
    }

    @Override
    public void release() {
        stopDiscovery();
        mPanelDevices.clear();
        mContext = null;
    }

    @Override
    public boolean isLogged() {
        return LoginBusiness.isLogin();
    }

    @Override
    public void startConfigure(@NonNull IMeshBleDevice meshBleDevice, @NonNull MeshConfigureParams params,
                               AliConfigureCallback callback) {
        synchronized (mConfigureLock) {
            stopConfigure();

            mConfigureTask = new AliDeviceConfigureTask(mContext, this, meshBleDevice, params);
            Completable.fromRunnable(() -> mConfigureTask.execute(callback))
                    .subscribeOn(Schedulers.io())
                    .subscribe();
        }
    }

    @Override
    public void stopConfigure() {
        synchronized (mConfigureLock) {
            if (mConfigureTask != null) {
                mConfigureTask.cancel();
                mConfigureTask = null;
            }
        }
    }

    @Override
    public void login(AliLoginCallback callback) {
        if (isLogged()) {
            if (callback != null) {
                callback.onLogin(STATUS_HTTP_OK, LoginBusiness.getUserInfo());
            }
            return;
        }
        LoginBusiness.login(new ILoginCallback() {
            @Override
            public void onLoginSuccess() {
                if (callback != null) {
                    callback.onLogin(STATUS_HTTP_OK, LoginBusiness.getUserInfo());
                }
            }

            @Override
            public void onLoginFailed(int code, String message) {
                if (callback != null) {
                    callback.onLogin(code, message);
                }
            }
        });
    }

    @Override
    public void logout(AliLogoutCallback callback) {
        if (!LoginBusiness.isLogin()) {
            if (callback != null) {
                callback.onLogout(STATUS_HTTP_OK, "Logout Aliyun");
            }
            return;
        }

        LoginBusiness.logout(new ILogoutCallback() {
            @Override
            public void onLogoutSuccess() {
                if (callback != null) {
                    callback.onLogout(STATUS_HTTP_OK, "Logout Aliyun");
                }
            }

            @Override
            public void onLogoutFailed(int code, String message) {
                if (callback != null) {
                    callback.onLogout(code, message);
                }
            }
        });
    }

    @Override
    public void listBindingDevices(AliListBindingDevicesCallback callback) {
        // 构建请求
        IoTRequest request = new IoTRequestBuilder()
//                .setScheme(scheme) // 如果是HTTPS，可以省略本设置
//                .setHost(host) // 如果是IoT官方服务，可以省略本设置
//                .setPath("/kit/debug/ping") // 参考业务API文档，设置path
                .setPath("/uc/listBindingByAccount")
                .setApiVersion("1.0.2")  // 参考业务API文档，设置apiVersion
                .addParam("pageNo", 1) // 参考业务API文档，设置params,也可使用setParams(Map<Strign,Object> params)
                .addParam("pageSize", 100)
                .setAuthType(AUTH_TYPE)
                .build();

        // 获取Client实例，并发送请求
        IoTAPIClient ioTAPIClient = new IoTAPIClientFactory().getClient();
        ioTAPIClient.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest request, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest request, IoTResponse response) {
                Log.d(TAG, "code=" + response.getCode() + " , data=" + response.getData() +
                        " , msg=" + response.getLocalizedMsg());
                if (callback == null) {
                    return;
                }

                int code = response.getCode();
                AtomicReference<List<DeviceInfoBean>> deviceInfoBeans = new AtomicReference<>();
                Observable.just(response)
                        .filter(resp -> resp.getCode() == 200)
                        .filter(resp -> resp.getData() != null)
                        .map(resp -> {
                            JSONObject jsonObject = JSON.parseObject(resp.getData().toString());
                            JSONArray jsonArray = jsonObject.getJSONArray(KEY_DATA);
                            return JSON.parseArray(jsonArray.toString(), DeviceInfoBean.class);
                        })
                        .doOnNext(deviceInfoBeans::set)
                        .flatMap(Observable::fromIterable)
                        .filter(bean -> !mPanelDevices.containsKey(bean.getIotId()))
                        .doOnNext(bean -> {
                            PanelDevice panelDevice = new PanelDevice(bean.getIotId());
                            mPanelDevices.put(bean.getIotId(), panelDevice);
                        })
                        .subscribe(new EspRxObserver<DeviceInfoBean>() {
                            @Override
                            public void onError(Throwable e) {
                                e.printStackTrace();
                            }
                        });

                Exception exception = code == 200 ? null : new AliApiClientException(code, response.getLocalizedMsg());
                callback.onResult(response.getCode(), response.getRawData(), deviceInfoBeans.get(), exception);
            }
        });
    }

    @Override
    public void startDiscovery(IDeviceDiscoveryListener listener) {
        Log.d(TAG, "startDiscovery");
        EnumSet<DiscoveryType> enumSet = EnumSet.allOf(DiscoveryType.class);
//        enumSet = EnumSet.of(DiscoveryType.LOCAL_ONLINE_DEVICE);
        Context appContext = mContext.getApplicationContext();
        LocalDeviceMgr.getInstance().startDiscovery(appContext, enumSet, null, (discoveryType, list) -> {
            // 发现的设备
            // LOCAL_ONLINE_DEVICE 当前和手机在同一局域网已配网在线的设备
            // CLOUD_ENROLLEE_DEVICE 零配或智能路由器发现的待配设备
            // BLE_ENROLLEE_DEVICE 发现的是蓝牙设备，需要根据设备的productId查询设备是否是wifi+蓝牙双模设备
            // SOFT_AP_DEVICE 发现的设备热点
            // 注意：发现蓝牙设备需添加 breeze SDK依赖
            if (listener != null) {
                listener.onDeviceFound(discoveryType, list);
            }
        });
    }

    @Override
    public void stopDiscovery() {
        Log.d(TAG, "stopDiscovery");
        LocalDeviceMgr.getInstance().stopDiscovery();
    }

    public void getDeviceToken(String productKey, String deviceName, IOnDeviceTokenGetListener listener) {
        LocalDeviceMgr.getInstance().getDeviceToken(mContext.getApplicationContext(),
                productKey, deviceName, 60 * 1000, 5 * 1000, new IOnDeviceTokenGetListener() {
                    @Override
                    public void onSuccess(String token) {
                        if (listener != null) {
                            listener.onSuccess(token);
                        }
                    }

                    @Override
                    public void onFail(String reason) {
                        if (listener != null) {
                            listener.onFail(reason);
                        }
                    }
                });
    }

    @Override
    public void bindDevice(String productKey, String deviceName, String token, AliBindDeviceCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/awss/token/user/bind")
                .setApiVersion("1.0.3")
                .addParam(KEY_PRODUCT_KEY, productKey)
                .addParam(KEY_DEVICE_NAME, deviceName)
                .addParam(KEY_TOKEN, token)
                .setAuthType(AUTH_TYPE)
                .build();
        IoTAPIClient ioTAPIClient = new IoTAPIClientFactory().getClient();
        ioTAPIClient.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    String iotId;
                    AliApiClientException exception;
                    int code = ioTResponse.getCode();
                    if (code == 200) {
                        iotId = ioTResponse.getData().toString();
                        exception = null;
                    } else {
                        iotId = null;
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, iotId, exception);
                }
            }
        });
    }

    @Override
    public void unbindDevice(String iotId, AliUnbindDeviceCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/uc/unbindAccountAndDev")
                .setApiVersion("1.0.2")
                .addParam(KEY_IOT_ID, iotId)
                .setAuthType(AUTH_TYPE)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    AliApiClientException exception = code == 200 ?
                            null : new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    callback.onResult(code, ioTResponse.getRawData(), exception);
                }
            }
        });
    }

    private interface PanelDeviceTask {
        void run();
    }

    private interface PanelDeviceInitFailedCB {
        void onFailed(Object o);
    }

    @NonNull
    private PanelDevice getPanelDevice(String iotId) {
        PanelDevice panelDevice = mPanelDevices.get(iotId);
        if (panelDevice == null) {
            panelDevice = new PanelDevice(iotId);
            mPanelDevices.put(iotId, panelDevice);
        }
        return panelDevice;
    }

    private void runPanelDeviceTask(PanelDevice panelDevice, PanelDeviceTask task, PanelDeviceInitFailedCB callback) {
        if (panelDevice.isInit()) {
            task.run();
            return;
        }

        panelDevice.init(mContext, (initFlag, o) -> {
            if (initFlag) {
                task.run();
            } else {
                if (callback != null) {
                    callback.onFailed(o);
                }
            }
        });
    }

    @Override
    public void statusGet(String iotId, AliGetDeviceStatusCallback callback) {
        PanelDevice panelDevice = getPanelDevice(iotId);
        PanelDeviceTask task = () -> panelDevice.getStatus((b, o) -> {
            if (callback != null) {
                callback.onResult(b, o);
            }
        });
        PanelDeviceInitFailedCB failedCB = o -> {
            if (callback != null) {
                callback.onResult(false, "PanelDevice init failed: " + o);
            }
        };
        runPanelDeviceTask(panelDevice, task, failedCB);
    }


    @Override
    public void propertiesGet(String iotId, AliGetDevicePropertiesCallback callback) {
        PanelDevice panelDevice = getPanelDevice(iotId);
        runPanelDeviceTask(panelDevice,
                () -> panelDevice.getProperties((b, o) -> {
                    if (callback != null) {
                        callback.onResult(b, o);
                    }
                }),
                o -> {
                    if (callback != null) {
                        callback.onResult(false, "PanelDevice init failed: " + o);
                    }
                });
    }

    @Override
    public void propertiesSet(String iotId, Map<String, Object> items, AliSetDevicePropertiesCallback callback) {
        PanelDevice panelDevice = getPanelDevice(iotId);
        JSONObject json = new JSONObject();
        json.put(KEY_IOT_ID, iotId);
        JSONObject itemsJSON = new JSONObject(items);
        json.put(KEY_ITEMS, itemsJSON);
        Log.i(TAG, json.toString());
        PanelDeviceTask task = () -> panelDevice.setProperties(json.toString(), (b, o) -> {
            if (callback != null) {
                callback.onSetProperties(b, o);
            }
        });
        PanelDeviceInitFailedCB failedCB = o -> {
            if (callback != null) {
                callback.onSetProperties(false, "PanelDevice init failed: " + o);
            }
        };
        runPanelDeviceTask(panelDevice, task, failedCB);
    }

    @Override
    public void listOTAPreDevices(AliOTAListPreDevicesCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/thing/ota/listByUser")
                .setApiVersion("1.0.2")
                .setAuthType(AUTH_TYPE)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    List<OTADeviceSimpleInfo> infos = null;
                    AliApiClientException exception = null;
                    if (code == 200) {
                        infos = JSON.parseArray(ioTResponse.getData().toString(), OTADeviceSimpleInfo.class);
                    } else {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(ioTResponse.getCode(), ioTResponse.getRawData(), infos, exception);
                }
            }
        });
    }

    @Override
    public void startOTA(List<String> iotIds, AliOTAStartCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/thing/ota/batchUpgradeByUser")
                .setApiVersion("1.0.2")
                .setAuthType(AUTH_TYPE)
                .addParam(KEY_IOT_IDS, iotIds)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    AliApiClientException exception = code == 200 ? null :
                            new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    callback.onResult(ioTResponse.getCode(), ioTResponse.getRawData(), exception);
                }
            }
        });
    }

    @Override
    public void stopOTA(String iotId, String version, AliOTAStopCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/thing/ota/unupgradeByUser")
                .setApiVersion("1.0.2")
                .setAuthType(AUTH_TYPE)
                .addParam(KEY_IOT_ID, iotId)
                .addParam(KEY_VERSION, version)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, false, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    boolean suc;
                    try {
                        suc = Boolean.valueOf(ioTResponse.getData().toString());
                    } catch (Exception e) {
                        e.printStackTrace();
                        suc = false;
                    }
                    int code = ioTResponse.getCode();
                    AliApiClientException exception = code == 200 ? null :
                            new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    callback.onResult(code, ioTResponse.getRawData(), suc, exception);
                }
            }
        });
    }

    @Override
    public void queryOTAProgress(String iotId, AliOTAQueryProgressCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/thing/ota/info/progress/getByUser")
                .setApiVersion("1.0.2")
                .setAuthType(AUTH_TYPE)
                .addParam(KEY_IOT_ID, iotId)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    OTADeviceDetailInfo detailInfo = null;
                    AliApiClientException exception = null;
                    if (code == 200) {
                        detailInfo = JSON.parseObject(ioTResponse.getData().toString(), OTADeviceDetailInfo.class);
                    } else {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, ioTResponse.getRawData(), detailInfo, exception);
                }
            }
        });
    }

    @Override
    public void listUpgradingDevices(AliListUpgradingDevicesCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setPath("/thing/ota/upgrade/listByUser")
                .setApiVersion("1.0.2")
                .setAuthType(AUTH_TYPE)
                .build();
        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    List<OTAStatusInfo> infoList = null;
                    AliApiClientException exception = null;
                    if (code == 200) {
                        infoList = JSON.parseArray(ioTResponse.getData().toString(), OTAStatusInfo.class);
                    } else {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, ioTResponse.getRawData(), infoList, exception);
                }
            }
        });
    }

    @Override
    public void bindTaobaoAccount(String authCode, AliBindTaobaoAccountCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setAuthType(AUTH_TYPE)
                .setApiVersion("1.0.5")
                .setPath("/account/taobao/bind")
                .addParam(KEY_AUTH_CODE, authCode)
                .build();

        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    byte[] data = ioTResponse.getRawData();
                    AliApiClientException exception = null;
                    if (code != 200) {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, data, exception);
                }
            }
        });
    }

    @Override
    public void unbindThirdPartyAccount(String accountType, AliUnbindThirdPartyAccountCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setAuthType(AUTH_TYPE)
                .setApiVersion("1.0.5")
                .setPath("/account/thirdparty/unbind")
                .addParam(KEY_ACCOUNT_TYPE, accountType)
                .build();

        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    byte[] data = ioTResponse.getRawData();
                    AliApiClientException exception = null;
                    if (code != 200) {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, data, exception);
                }
            }
        });
    }

    @Override
    public void getThirdPartyAccount(String accountType, AliGetThirdPartyAccountCallback callback) {
        IoTRequest request = new IoTRequestBuilder()
                .setAuthType(AUTH_TYPE)
                .setApiVersion("1.0.5")
                .setPath("/account/thirdparty/get")
                .addParam(KEY_ACCOUNT_TYPE, accountType)
                .build();

        IoTAPIClient client = new IoTAPIClientFactory().getClient();
        client.send(request, new IoTCallback() {
            @Override
            public void onFailure(IoTRequest ioTRequest, Exception e) {
                e.printStackTrace();
                if (callback != null) {
                    callback.onResult(CODE_CATCH_EXCEPTION, null, e);
                }
            }

            @Override
            public void onResponse(IoTRequest ioTRequest, IoTResponse ioTResponse) {
                if (callback != null) {
                    int code = ioTResponse.getCode();
                    byte[] data = ioTResponse.getRawData();
                    AliApiClientException exception = null;
                    if (code != 200) {
                        exception = new AliApiClientException(code, ioTResponse.getLocalizedMsg());
                    }
                    callback.onResult(code, data, exception);
                }
            }
        });
    }

    private void log(String message) {
        Log.i(TAG, message);
    }

    public void refreshIoTCredential(Application application) {
        IoTCredentialManage ioTCredentialManage = IoTCredentialManageImpl.getInstance(application);
        if (ioTCredentialManage != null) {
            IoTCredentialData credentialData = ioTCredentialManage.getIoTCredential();
            if (credentialData == null) {
                log("IoTCredentialData is null");
            } else {
                log("IoTCredentialData = " + credentialData.toString());
            }

            ioTCredentialManage.asyncRefreshIoTCredential(new IoTCredentialListener() {
                @Override
                public void onRefreshIoTCredentialSuccess(IoTCredentialData ioTCredentialData) {
                    if (ioTCredentialData == null) {
                        log("onRefreshIoTCredentialSuccess is null");
                    } else {
                        log("onRefreshIoTCredentialSuccess = " + ioTCredentialData.toString());
                    }
                }

                @Override
                public void onRefreshIoTCredentialFailed(IoTCredentialManageError ioTCredentialManageError) {
                    log("onRefreshIoTCredentialFailed: " + ioTCredentialManageError.toString());
                }
            });
        } else {
            log("IoTCredentialManage is null");
        }
    }

    void config(Activity activity, String productKey) {
        Bundle bundle = new Bundle();
        bundle.putString("productKey", productKey);
        String url = "link://router/connectConfig";
        Router.getInstance().toUrlForResult(activity, url, REQUEST_CONFIGURE, bundle);
    }

    private void addDevice(@NonNull String productKey) {
        DeviceInfo deviceInfo = new DeviceInfo();
        deviceInfo.productKey = productKey; // 商家后台注册的 productKey，不可为空
//        deviceInfo.deviceName = "xxx";// 设备名, 可为空
//        deviceInfo.productId = "xxx";// 产品 ID， 蓝牙辅助配网必须
//        deviceInfo.id= "xxx";// 设备热点的id，在发现热点设备返回到APP的时候会带这个字段，设备热点必须
        // 设备热点配网 ForceAliLinkTypeSoftAP  蓝牙辅助配网 ForceAliLinkTypeBLE
        // 二维码配网 ForceAliLinkTypeQR   手机热点配网 ForceAliLinkTypePhoneAP
        deviceInfo.linkType = "ForceAliLinkTypeNone"; // 默认一键配网

        //设置待添加设备的基本信息
        AddDeviceBiz.getInstance().setDevice(deviceInfo);

        // 开始添加设备
        AddDeviceBiz.getInstance().startAddDevice(mContext.getApplicationContext(), new IAddDeviceListener() {
            @Override
            public void onPreCheck(boolean b, DCErrorCode dcErrorCode) {
                // 参数检测回调
                log("onPreCheck");
            }

            @Override
            public void onProvisionPrepare(int prepareType) {
                // 手机热点配网、设备热点配网、一键配网、蓝牙辅助配网、二维码配网会走到该流程，
                // 零配和智能路由器配网不会走到该流程。
                // prepareType = 1提示用户输入账号密码
                // prepareType = 2提示用户手动开启指定热点 aha 12345678
                // 执行完上述操作之后，调用toggleProvision接口继续执行配网流程
                log("onProvisionPrepare " + prepareType);
            }

            @Override
            public void onProvisioning() {
                // 配网中
            }

            @Override
            public void onProvisionStatus(ProvisionStatus provisionStatus) {
                // 二维码配网会走到这里  provisionStatus=ProvisionStatus.QR_PROVISION_READY表示二维码ready了
                // ProvisionStatus.QR_PROVISION_READY.message() 获取二维码内容
                // 注意：返回二维码时已开启监听设备是否已配网成功的通告，并开始计时，UI端应提示用户尽快扫码；
                // 如果在指定时间配网超时了，重新调用开始配网流程并刷新二维码；
            }

            @Override
            public void onProvisionedResult(boolean b, DeviceInfo deviceInfo, DCErrorCode errorCode) {
                // 配网结果
            }
        });
    }
}
