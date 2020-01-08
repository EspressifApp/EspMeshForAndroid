package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothDevice;

import meshblufi.espressif.BlufiClient;

public abstract class MeshBatchBlufiCallback extends MeshBlufiCallback {
    public void onClientCreated(MeshBlufiClient client){
    }

    public void onConnectResult(BluetoothDevice device, boolean connected){
    }

    public void onBlufiClientSet(BlufiClient client){
    }
}
