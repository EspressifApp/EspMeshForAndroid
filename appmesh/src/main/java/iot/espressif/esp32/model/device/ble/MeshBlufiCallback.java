package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothGatt;

import java.util.UUID;

import meshblufi.espressif.BlufiCallback;
import meshblufi.espressif.BlufiClient;

public abstract class MeshBlufiCallback extends BlufiCallback {
    /**
     * Callback indicating when GATT client has connected/disconnected to/from a remote
     * GATT server.
     *
     * @param gatt GATT client
     * @param status Status of the connect or disconnect operation
     * @param connected connection state
     */
    public void onGattConnectionChange(BluetoothGatt gatt, int status, boolean connected) {
    }

    /**
     * Callback invoked when the mesh gatt service has been discovered
     *
     * @param gatt GATT client
     * @param status Status of the connect or disconnect operation
     * @param uuid Service UUID
     */
    public void onGattServiceDiscover(BluetoothGatt gatt, int status, UUID uuid) {
    }

    /**
     * Call invoked when the mesh gatt characteristic has been discovered
     *
     * @param gatt GATT client
     * @param status Status of the connect or disconnect operation
     * @param uuid Characteristic UUID
     */
    public void onGattCharacteristicDiscover(BluetoothGatt gatt, int status, UUID uuid) {
    }

    /**
     * Callback indicating the MTU for a given device connection has changed.
     *
     * @param gatt GATT client
     * @param mtu The new MTU size
     * @param status {@link BluetoothGatt#GATT_SUCCESS} if the MTU has been changed successfully
     */
    public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
    }

    /**
     * Callback indicating the BlufiClient has been created.
     *
     * @param client BlufiClient
     */
    public void onBlufiClientSet(BlufiClient client){
    }
}
