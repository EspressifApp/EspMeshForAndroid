package aliyun.espressif.mesh;

import androidx.annotation.NonNull;

import com.aliyun.alink.business.devicecenter.api.discovery.IDeviceDiscoveryListener;

import java.util.List;
import java.util.Map;

import aliyun.espressif.mesh.callback.AliBindDeviceCallback;
import aliyun.espressif.mesh.callback.AliConfigureCallback;
import aliyun.espressif.mesh.callback.AliGetDevicePropertiesCallback;
import aliyun.espressif.mesh.callback.AliGetDeviceStatusCallback;
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
import aliyun.espressif.mesh.constants.AliConstants;
import iot.espressif.esp32.model.device.ble.IMeshBleDevice;
import iot.espressif.esp32.model.device.ble.MeshConfigureParams;

public interface IAliHelper extends AliConstants {
    int STATUS_HTTP_OK = 200;
    int CODE_CATCH_EXCEPTION = 10100;

    int REQUEST_CONFIGURE = 24566;

    /**
     * Release the resources
     */
    void release();

    /**
     * @return logged or not
     */
    boolean isLogged();

    /**
     * Start config Mesh Aliyun device to connect the AP
     *
     * @param meshBleDevice
     * @param params
     * @param callback
     */
    void startConfigure(@NonNull IMeshBleDevice meshBleDevice, @NonNull MeshConfigureParams params,
                        AliConfigureCallback callback);

    /**
     * Stop config task
     */
    void stopConfigure();

    /**
     * Login Aliyun
     *
     * @param callback
     */
    void login(AliLoginCallback callback);

    /**
     * Logout Aliyun
     *
     * @param callback
     */
    void logout(AliLogoutCallback callback);

    /**
     * List user's bound devices
     *
     * @param callback
     */
    void listBindingDevices(AliListBindingDevicesCallback callback);

    /**
     * Start discovery local devices
     *
     * @param listener
     */
    void startDiscovery(IDeviceDiscoveryListener listener);

    /**
     * Stop discovery local devices
     */
    void stopDiscovery();

    /**
     * Bind device with user
     *
     * @param productKey
     * @param deviceName
     * @param token
     * @param callback
     */
    void bindDevice(String productKey, String deviceName, String token, AliBindDeviceCallback callback);

    /**
     * Unbind device with user
     *
     * @param iotId
     * @param callback
     */
    void unbindDevice(String iotId, AliUnbindDeviceCallback callback);

    /**
     * Get device status
     *
     * @param iotId
     * @param callback
     */
    void statusGet(String iotId, AliGetDeviceStatusCallback callback);

    /**
     * Get device properties
     *
     * @param iotId
     * @param callback
     */
    void propertiesGet(String iotId, AliGetDevicePropertiesCallback callback);

    /**
     * Set device properties
     *
     * @param iotId
     * @param items
     * @param callback
     */
    void propertiesSet(String iotId, Map<String, Object> items, AliSetDevicePropertiesCallback callback);

    /**
     * List devices can OTA
     *
     * @param callback
     */
    void listOTAPreDevices(AliOTAListPreDevicesCallback callback);

    /**
     * Start OTA
     *
     * @param iotIds
     * @param callback
     */
    void startOTA(List<String> iotIds, AliOTAStartCallback callback);

    /**
     * Stop OTA
     *
     * @param iotId
     * @param version
     * @param callback
     */
    void stopOTA(String iotId, String version, AliOTAStopCallback callback);

    /**
     * Query device OTA progress
     *
     * @param iotId
     * @param callback
     */
    void queryOTAProgress(String iotId, AliOTAQueryProgressCallback callback);

    /**
     * List devices are upgrading
     *
     * @param callback
     */
    void listUpgradingDevices(AliListUpgradingDevicesCallback callback);
}
