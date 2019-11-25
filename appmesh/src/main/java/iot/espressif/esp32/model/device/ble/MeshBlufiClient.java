package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothGatt;

import meshblufi.espressif.BlufiClient;

public class MeshBlufiClient {
    private int mMeshVersion = -1;
    private BlufiClient mBlufiClient;
    private BluetoothGatt mBluetoothGatt;

    private volatile boolean mClosed = false;

    public void setMeshVersion(int meshVersion) {
        mMeshVersion = meshVersion;
    }

    public int getMeshVersion() {
        return mMeshVersion;
    }

    public void setBlufiClient(BlufiClient blufiClient) {
        mBlufiClient = blufiClient;
    }

    public BlufiClient getBlufiClient() {
        return mBlufiClient;
    }

    public void setBluetoothGatt(BluetoothGatt bluetoothGatt) {
        mBluetoothGatt = bluetoothGatt;
    }

    public BluetoothGatt getBluetoothGatt() {
        return mBluetoothGatt;
    }

    public boolean isClosed() {
        return mClosed;
    }

    public synchronized void close() {
        mClosed = true;
        if (mBluetoothGatt != null) {
            mBluetoothGatt.close();
        }
        if (mBlufiClient != null) {
            mBlufiClient.close();
        }
    }
}
