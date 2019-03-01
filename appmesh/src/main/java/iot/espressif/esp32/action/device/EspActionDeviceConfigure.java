package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;

import java.util.Locale;

import blufi.espressif.BlufiCallback;
import blufi.espressif.BlufiClient;
import blufi.espressif.params.BlufiConfigureParams;
import blufi.espressif.response.BlufiStatusResponse;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import libs.espressif.app.SdkUtil;
import libs.espressif.log.EspLog;

public class EspActionDeviceConfigure implements IEspActionDeviceConfigure {
    private final EspLog mLog = new EspLog(getClass());

    public MeshBlufiClient doActionConfigureBlufi(BluetoothDevice device, BlufiConfigureParams params,
                                                  MeshBlufiCallback userCallback) {
        return doActionConfigureBlufi(device, -1, params, userCallback);
    }

    public MeshBlufiClient doActionConfigureBlufi(BluetoothDevice device, int meshVersion, BlufiConfigureParams params,
                                           MeshBlufiCallback userCallback) {
        MeshBlufiClient blufi = new MeshBlufiClient();
        blufi.setMeshVersion(meshVersion);

        Context context = EspApplication.getInstance().getApplicationContext();
        BleCallback bleCallback = new BleCallback(blufi, params, userCallback);
        BluetoothGatt gatt;
        if (SdkUtil.isAtLeastM_23()) {
            gatt = device.connectGatt(context, false, bleCallback, BluetoothDevice.TRANSPORT_LE);
        } else {
            gatt = device.connectGatt(context, false, bleCallback);
        }
        blufi.setBluetoothGatt(gatt);

        return blufi;
    }

    private class BleCallback extends BluetoothGattCallback {
        private MeshBlufiClient mBlufi;

        private BlufiConfigureParams mConfParams;
        private BlufiCallbackImpl mActionCallback;
        private MeshBlufiCallback mUserCallback;

        BleCallback(MeshBlufiClient blufi, BlufiConfigureParams params, MeshBlufiCallback userCallback) {
            mBlufi = blufi;
            mConfParams = params;
            mActionCallback = new BlufiCallbackImpl();
            mUserCallback = userCallback;
        }

        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            mLog.d(String.format(Locale.ENGLISH, "onConnectionStateChange status=%d, newState=%d", status, newState));
            if (status == BluetoothGatt.GATT_SUCCESS) {
                switch (newState) {
                    case BluetoothProfile.STATE_CONNECTED:
                        mUserCallback.onGattConnectionChange(gatt, BlufiCallback.STATUS_SUCCESS, true);
                        gatt.discoverServices();
                        break;
                    case BluetoothProfile.STATE_DISCONNECTED:
                        mUserCallback.onGattConnectionChange(gatt, BlufiCallback.STATUS_SUCCESS, false);
                        gatt.close();
                        mActionCallback.onGattClose(mBlufi.getBlufiClient());
                        break;
                }
            } else {
                mUserCallback.onGattConnectionChange(gatt, status, false);
                gatt.close();
                mActionCallback.onGattClose(mBlufi.getBlufiClient());
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            mLog.d(String.format(Locale.ENGLISH, "onServicesDiscovered status=%d", status));
            if (status == BluetoothGatt.GATT_SUCCESS) {
                BluetoothGattService service = gatt.getService(UUID_SERVICE);
                if (service == null) {
                    mLog.w("Discover service failed");
                    mUserCallback.onGattServiceDiscover(gatt, -1, UUID_SERVICE);
                    gatt.disconnect();
                    return;
                }
                mUserCallback.onGattServiceDiscover(gatt, BlufiCallback.STATUS_SUCCESS, UUID_SERVICE);

                BluetoothGattCharacteristic writeCharact = service.getCharacteristic(UUID_WRITE_CHARACTERISTIC);
                if (writeCharact == null) {
                    mLog.w("Get wite characteristic failed");
                    mUserCallback.onGattCharacteristicDiscover(gatt, -1, UUID_WRITE_CHARACTERISTIC);
                    gatt.disconnect();
                    return;
                }
                mUserCallback.onGattServiceDiscover(gatt, BlufiCallback.STATUS_SUCCESS, UUID_WRITE_CHARACTERISTIC);

                BluetoothGattCharacteristic notifyCharact = service.getCharacteristic(UUID_NOTIFICATION_CHARACTERISTIC);
                if (notifyCharact == null) {
                    mLog.w("Get notification characteristic failed");
                    mUserCallback.onGattCharacteristicDiscover(gatt, -1, UUID_NOTIFICATION_CHARACTERISTIC);
                    gatt.disconnect();
                    return;
                }
                mUserCallback.onGattCharacteristicDiscover(gatt, BlufiCallback.STATUS_SUCCESS,
                        UUID_NOTIFICATION_CHARACTERISTIC);

                BlufiClient blufiClient = new BlufiClient(gatt, writeCharact, notifyCharact, mActionCallback);
                blufiClient.setDeviceVersion(mBlufi.getMeshVersion());
                mBlufi.setBlufiClient(blufiClient);

                gatt.setCharacteristicNotification(notifyCharact, true);

                if (SdkUtil.isAtLeastL_21()) {
                    gatt.requestConnectionPriority(BluetoothGatt.CONNECTION_PRIORITY_HIGH);
                    boolean requestMtu = gatt.requestMtu(DEFAULT_MTU_LENGTH);
                    if (!requestMtu) {
                        mLog.w("Request mtu failed");
                        mBlufi.getBlufiClient().negotiateSecurity();
                    }
                } else {
                    mBlufi.getBlufiClient().negotiateSecurity();
                }

            } else {
                gatt.disconnect();
            }
        }

        @Override
        public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
            mLog.d(String.format(Locale.ENGLISH, "onMtuChanged status=%d, mtu=%d", status, mtu));
            mUserCallback.onMtuChanged(gatt, status);
            mBlufi.getBlufiClient().negotiateSecurity();
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            mLog.d("onCharacteristicChanged");
            mBlufi.getBlufiClient().onCharacteristicChanged(gatt, characteristic);
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            mLog.d(String.format(Locale.ENGLISH, "onCharacteristicWrite status=%d", status));
            if (status == BluetoothGatt.GATT_SUCCESS) {
                mBlufi.getBlufiClient().onCharacteristicWrite(gatt, characteristic, status);
            } else {
                gatt.disconnect();
            }
        }

        class BlufiCallbackImpl extends BlufiCallback {
            @Override
            public void onNotification(BlufiClient client, int pkgType, int subType, byte[] data) {
                mLog.d(String.format(Locale.ENGLISH, "onNotification pkgType=%d, subType=%d", pkgType, subType));
                mUserCallback.onNotification(client, pkgType, subType, data);
            }

            @Override
            public void onGattClose(BlufiClient client) {
                mLog.d("onGattClose");
                mUserCallback.onGattClose(client);
            }

            @Override
            public void onError(BlufiClient client, int errCode) {
                mLog.w(String.format(Locale.ENGLISH, "onError errCode=%d", errCode));
                mBlufi.getBluetoothGatt().disconnect();

                mUserCallback.onError(client, errCode);
            }

            @Override
            public void onNegotiateSecurityResult(BlufiClient client, int status) {
                mLog.d(String.format(Locale.ENGLISH, "onNegotiateSecurityResult status=%d", status));
                if (status == STATUS_SUCCESS) {
                    mBlufi.getBlufiClient().configure(mConfParams);
                } else {
                    mBlufi.getBluetoothGatt().disconnect();
                }

                mUserCallback.onNegotiateSecurityResult(client, status);
            }

            @Override
            public void onConfigureResult(BlufiClient client, int status) {
                mLog.d(String.format(Locale.ENGLISH, "onConfigureResult status=%d", status));
                if (status != STATUS_SUCCESS) {
                    mBlufi.getBluetoothGatt().disconnect();
                }

                mUserCallback.onConfigureResult(client, status);
            }

            @Override
            public void onWifiStateResponse(BlufiClient client, BlufiStatusResponse response) {
                mLog.d(String.format(Locale.ENGLISH, "onWifiStateResponse %s", response.generateValidInfo()));
                mUserCallback.onWifiStateResponse(client, response);
            }
        }
    }
}
