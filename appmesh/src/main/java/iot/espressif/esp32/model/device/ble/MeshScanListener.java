package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanResult;

import libs.espressif.ble.ScanListener;

public abstract class MeshScanListener implements ScanListener {
    abstract public void onMeshDeviceScanned(MeshBleDevice meshBleDevice);

    private int mManufacturerID = 0;

    public void setManufacturerIDFilter(int manufacturerID) {
        mManufacturerID = manufacturerID;
    }

    @Override
    public void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord, ScanResult scanResult) {
        MeshBleDevice meshBleDevice = new MeshBleDevice(device, rssi, scanRecord, mManufacturerID);
        if (meshBleDevice.getMeshVersion() >= 0) {
            onMeshDeviceScanned(meshBleDevice);
        }
    }
}
