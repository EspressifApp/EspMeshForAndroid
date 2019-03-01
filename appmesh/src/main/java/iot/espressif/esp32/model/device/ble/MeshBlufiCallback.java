package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothGatt;

import java.util.UUID;

import blufi.espressif.BlufiCallback;

public abstract class MeshBlufiCallback extends BlufiCallback {
    public void onGattConnectionChange(BluetoothGatt gatt, int status, boolean connected) {
    }

    public void onGattServiceDiscover(BluetoothGatt gatt, int status, UUID uuid) {
    }

    public void onGattCharacteristicDiscover(BluetoothGatt gatt, int status, UUID uuid) {
    }

    public void onMtuChanged(BluetoothGatt gatt, int status) {
    }
}
