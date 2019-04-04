package h5.espressif.esp32.action;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.text.TextUtils;
import android.util.Log;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import blufi.espressif.BlufiClient;
import blufi.espressif.params.BlufiConfigureParams;
import blufi.espressif.response.BlufiStatusResponse;
import iot.espressif.esp32.action.device.EspActionDeviceConfigure;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;

public class EspActionDeviceConfigure2 implements IEspActionDeviceConfigure2 {

    public MeshBlufiClient doActionConfigureBlufi2(String deviceMac, int deviceVersion, BlufiConfigureParams params,
                                                   ProgressCallback callback) {
        EspActionDeviceConfigure actionConf = new EspActionDeviceConfigure();

        if (callback != null) {
            callback.onUpdate(PROGRESS_IDLE, CODE_PROGRESS_START, "Start configure");
        }

        if (TextUtils.isEmpty(params.getStaSSID())) {
            if (callback != null) {
                callback.onUpdate(PROGRESS_FAILED, CODE_ERR_SSID, "SSID is empty");
            }
            return null;
        }
        MeshObjectBox.getInstance().ap().saveAp(params.getStaSSID(), params.getStaPassword());

        BluetoothDevice device = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(deviceMac);

        if (callback != null) {
            callback.onUpdate(PROGRESS_START, CODE_PROGRESS_START, "Start configure");
        }
        AtomicBoolean suc = new AtomicBoolean(false);
        MeshBlufiClient blufi = actionConf.doActionConfigureBlufi(device, deviceVersion, params,
                new MeshBlufiCallback(){
            @Override
            public void onGattConnectionChange(BluetoothGatt gatt, int status, boolean connected) {
                super.onGattConnectionChange(gatt, status, connected);

                if (callback != null) {
                    if (connected) {
                        callback.onUpdate(PROGRESS_BLE_CONNECTED, CODE_PROGRESS_CONNECT, "Connect BLE complete");
                    } else {
                        if (!suc.get()) {
                            callback.onUpdate(PROGRESS_FAILED, CODE_ERR_BLE_CONN, "Disconnect BLE");
                        }
                    }
                }
            }

            @Override
            public void onGattServiceDiscover(BluetoothGatt gatt, int status, UUID uuid) {
                super.onGattServiceDiscover(gatt, status, uuid);
                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_SERVICE_DISCOVER, CODE_PROGRESS_SERVICE,
                                "Discover service complete");
                    } else {
                        callback.onUpdate(PROGRESS_SERVICE_DISCOVER, CODE_ERR_GATT_SERVICE,
                                "Discover service failed");
                    }
                }
            }

            @Override
            public void onGattCharacteristicDiscover(BluetoothGatt gatt, int status, UUID uuid) {
                super.onGattCharacteristicDiscover(gatt, status, uuid);
                if (callback != null) {
                    boolean isNotifyUUID = uuid.equals(UUID_NOTIFICATION_CHARACTERISTIC);
                    String charStr = isNotifyUUID ? "notification char" : "write char";
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_CHAR_DISCOVER, CODE_PROGRESS_CHAR,
                                "Discover " + charStr + " complete");
                    } else {
                        int errCode = isNotifyUUID ? CODE_ERR_GATT_NOTIFICATION : CODE_ERR_GATT_WRITE;
                        callback.onUpdate(PROGRESS_CHAR_DISCOVER, errCode, "Discover " + charStr + " failed");
                    }
                }
            }

            @Override
            public void onGattClose(BlufiClient blufiClient) {
                super.onGattClose(blufiClient);
            }

            @Override
            public void onError(BlufiClient blufiClient, int errCode) {
                super.onError(blufiClient, errCode);

                if (callback != null) {
                    String msg;
                    switch (errCode) {
                        case CODE_ERR_WIFI_PASSWORD:
                            msg = "Wifi password error";
                            break;
                        case CODE_ERR_AP_NOT_FOUND:
                            msg = "AP not found";
                            break;
                        case CODE_ERR_AP_FORBID:
                            msg = "AP forbid";
                            break;
                        case CODE_ERR_CONFIGURE:
                            msg = "Configure data error";
                            break;
                        default:
                            msg = "Receive error code " + errCode;
                            break;
                    }
                    callback.onUpdate(PROGRESS_FAILED, errCode, msg);
                }
            }

            @Override
            public void onNegotiateSecurityResult(BlufiClient blufiClient, int status) {
                super.onNegotiateSecurityResult(blufiClient, status);

                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_SECURITY, CODE_PROGRESS_SECURITY,
                                "Negotiate security complete");
                    } else {
                        callback.onUpdate(PROGRESS_SECURITY, CODE_ERR_SECURITY,
                                "Negotiate security failed " + status);
                    }
                }
            }

            @Override
            public void onConfigureResult(BlufiClient blufiClient, int status) {
                super.onConfigureResult(blufiClient, status);

                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_CONFIGURE, CODE_PROGRESS_CONFIGURE,
                                "Post configure data complete");
                    } else {
                        callback.onUpdate(PROGRESS_CONFIGURE, CODE_ERR_CONF_POST,
                                "Post configure data failed");
                    }
                }
            }

            @Override
            public void onWifiStateResponse(BlufiClient blufiClient, BlufiStatusResponse blufiStatusResponse) {
                super.onWifiStateResponse(blufiClient, blufiStatusResponse);

                if (callback != null) {
                    if (blufiStatusResponse.getStaConnectionStatus() == 0) {
                        suc.set(true);
                        callback.onUpdate(PROGRESS_COMPLETE, CODE_SUC, "All configure step complete");
                    } else {
                        callback.onUpdate(PROGRESS_FAILED, CODE_ERR_CONF_RECV_WIFI,
                                "Device connect wifi failed");
                    }
                }
            }
        });

        Log.d(getClass().getSimpleName(), "Start doActionConfigureBlufi2");
        return blufi;
    }
}
