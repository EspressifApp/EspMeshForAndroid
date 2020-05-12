package h5.espressif.esp32.module.action;

import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.content.Context;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.StringRes;

import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import h5.espressif.esp32.R;
import h5.espressif.esp32.module.MeshApp;
import iot.espressif.esp32.action.device.EspActionDeviceConfigure;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import meshblufi.espressif.BlufiClient;
import meshblufi.espressif.params.BlufiConfigureParams;
import meshblufi.espressif.response.BlufiStatusResponse;

public class EspActionDeviceConfigure2 extends EspActionDeviceConfigure implements IEspActionDeviceConfigure2 {

    @Override
    public MeshBlufiClient doActionConfigureBlufi(@NonNull BluetoothDevice device, int meshVersion, BlufiConfigureParams params, @NonNull MeshBlufiCallback userCallback) {
        throw new IllegalStateException("Please use function doActionConfigureBlufi2");
    }

    private String getString(@StringRes int res) {
        Context context = MeshApp.getEspApplication().getApplicationContext();
        return context.getString(res);
    }

    public MeshBlufiClient doActionConfigureBlufi2(String deviceMac, int deviceVersion, BlufiConfigureParams params,
                                                   ProgressCallback callback) {

        EspActionDeviceConfigure actionConf = new EspActionDeviceConfigure();

        if (callback != null) {
            callback.onUpdate(PROGRESS_IDLE, CODE_NORMAL_START, getString(R.string.esp_provision_start));
        }

        if (TextUtils.isEmpty(params.getStaSSID())) {
            if (callback != null) {
                callback.onUpdate(PROGRESS_FAILED, CODE_ERR_SSID, getString(R.string.esp_provision_ssid_empty));
            }
            return null;
        }
        MeshObjectBox.getInstance().ap().saveAp(params.getStaSSID(), params.getStaPassword());

        BluetoothDevice device = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(deviceMac);

        if (callback != null) {
            callback.onUpdate(PROGRESS_START, CODE_NORMAL_START, getString(R.string.esp_provision_start));
        }
        AtomicBoolean suc = new AtomicBoolean(false);
        MeshBlufiClient blufi = actionConf.doActionConfigureBlufi(device, deviceVersion, params, new MeshBlufiCallback() {
            @Override
            public void onGattConnectionChange(BluetoothGatt gatt, int status, boolean connected) {
                super.onGattConnectionChange(gatt, status, connected);

                if (callback != null) {
                    if (connected) {
                        callback.onUpdate(PROGRESS_BLE_CONNECTED, CODE_NORMAL_CONNECTED, getString(R.string.esp_provision_connect_ble));
                    } else {
                        if (!suc.get()) {
                            callback.onUpdate(PROGRESS_FAILED, CODE_ERR_BLE_CONN, getString(R.string.esp_provision_disconnect_ble));
                        } else {
                            callback.onUpdate(PROGRESS_COMPLETE, CODE_SUC_DISCONNECT, getString(R.string.esp_provision_disconnect_ble));
                        }
                    }
                }
            }

            @Override
            public void onGattServiceDiscover(BluetoothGatt gatt, int status, UUID uuid) {
                super.onGattServiceDiscover(gatt, status, uuid);
                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_SERVICE_DISCOVER, CODE_NORMAL_SERVICE_GOT,
                                getString(R.string.esp_provision_discover_service_suc));
                    } else {
                        callback.onUpdate(PROGRESS_SERVICE_DISCOVER, CODE_ERR_GATT_SERVICE,
                                getString(R.string.esp_provision_discover_service_failed));
                    }
                }
            }

            @Override
            public void onGattCharacteristicDiscover(BluetoothGatt gatt, int status, UUID uuid) {
                super.onGattCharacteristicDiscover(gatt, status, uuid);
                if (callback != null) {
                    boolean isNotifyUUID = uuid.equals(UUID_NOTIFICATION_CHARACTERISTIC);
                    int msgRes = status == STATUS_SUCCESS ?
                            (isNotifyUUID ? R.string.esp_provision_discover_char_notify_suc :
                                    R.string.esp_provision_discover_char_write_suc) :
                            (isNotifyUUID ? R.string.esp_provision_discover_char_notify_failed :
                                    R.string.esp_provision_discover_char_write_failed);
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_CHAR_DISCOVER, CODE_NORMAL_CHAR_GOT, getString(msgRes));
                    } else {
                        int errCode = isNotifyUUID ? CODE_ERR_GATT_NOTIFICATION : CODE_ERR_GATT_WRITE;
                        callback.onUpdate(PROGRESS_CHAR_DISCOVER, errCode, getString(msgRes));
                    }
                }
            }

            @Override
            public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                super.onMtuChanged(gatt, mtu, status);

                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        String msg = String.format(Locale.ENGLISH, "%s, MTU=%d", getString(R.string.esp_provision_set_mtu_suc), mtu);
                        callback.onUpdate(PROGRESS_MTU, CODE_NORMAL_MTU_CHANGED, msg);
                    } else {
                        String msg = String.format(Locale.ENGLISH, "%s, status=%d", getString(R.string.esp_provision_set_mtu_failed), status);
                        callback.onUpdate(PROGRESS_MTU, CODE_NORMAL_MTU_CHANGED, msg);
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
                            msg = getString(R.string.esp_provision_error_wifi_password);
                            break;
                        case CODE_ERR_AP_NOT_FOUND:
                            msg = getString(R.string.esp_provision_error_ap_not_found);
                            break;
                        case CODE_ERR_AP_FORBID:
                            msg = getString(R.string.esp_provision_error_ap_forbid);
                            break;
                        case CODE_ERR_CONFIGURE:
                            msg = getString(R.string.esp_provision_error_data);
                            break;
                        default:
                            msg = getString(R.string.esp_provision_error_code) + " " + errCode;
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
                        callback.onUpdate(PROGRESS_SECURITY, CODE_NORMAL_SECURITY,
                                getString(R.string.esp_provision_security_suc));
                    } else {
                        callback.onUpdate(PROGRESS_SECURITY, CODE_ERR_SECURITY,
                                getString(R.string.esp_provision_security_failed) + ", status=" + status);
                    }
                }
            }

            @Override
            public void onConfigureResult(BlufiClient blufiClient, int status) {
                super.onConfigureResult(blufiClient, status);

                if (callback != null) {
                    if (status == STATUS_SUCCESS) {
                        callback.onUpdate(PROGRESS_CONFIGURE, CODE_NORMAL_CONFIGURE_POSTED,
                                getString(R.string.esp_provision_post_configure_suc));
                    } else {
                        callback.onUpdate(PROGRESS_CONFIGURE, CODE_ERR_CONF_POST,
                                getString(R.string.esp_provision_post_configure_failed) + ", status=" + status);
                    }
                }
            }

            @Override
            public void onWifiStateResponse(BlufiClient blufiClient, BlufiStatusResponse blufiStatusResponse) {
                super.onWifiStateResponse(blufiClient, blufiStatusResponse);

                if (callback != null) {
                    if (blufiStatusResponse.getStaConnectionStatus() == 0) {
                        callback.onUpdate(PROGRESS_DEVICE_CONNECTED, CODE_NORMAL_RECEIVE_WIFI,
                                getString(R.string.esp_provision_device_connect_suc));
                        suc.set(true);
                        callback.onUpdate(PROGRESS_COMPLETE, CODE_SUC, getString(R.string.esp_provision_complete));
                    } else {
                        callback.onUpdate(PROGRESS_FAILED, CODE_ERR_CONF_RECV_WIFI,
                                getString(R.string.esp_provision_device_connect_failed));
                    }
                }
            }
        });

        Log.d(getClass().getSimpleName(), "Start doActionConfigureBlufi2");
        return blufi;
    }
}
