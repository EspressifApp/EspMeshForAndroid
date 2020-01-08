package meshblufi.espressif;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;

import meshblufi.espressif.params.BlufiConfigureParams;

public class BlufiClient {
    private BlufiClientImpl mImpl;

    public BlufiClient(BluetoothGatt gatt, BluetoothGattCharacteristic writeChar, BluetoothGattCharacteristic notifyChar,
                       BlufiCallback callback) {
        mImpl = new BlufiClientImpl(this, gatt, writeChar, notifyChar, callback);
    }

    public BluetoothDevice getDevice() {
        return mImpl.getDevice();
    }

    public void setDeviceVersion(int version) {
        mImpl.setDeviceVersion(version);
    }

    public void setPostPackageLengthLimit(int lengthLimit) {
        mImpl.setPostPackageLengthLimit(lengthLimit);
    }

    public void close() {
        mImpl.close();
    }

    public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        mImpl.onCharacteristicChanged(gatt, characteristic);
    }

    public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        mImpl.onCharacteristicWrite(gatt, characteristic, status);
    }

    public void negotiateSecurity() {
        mImpl.negotiateSecurity();
    }

    public void configure(final BlufiConfigureParams params) {
        mImpl.configure(params);
    }

    public void sendMDFCustomData(byte[] data) {
        mImpl.sendMDFCustomData(data);
    }
}
