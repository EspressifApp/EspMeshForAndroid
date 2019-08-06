package blufi.espressif;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;

import blufi.espressif.params.BlufiConfigureParams;

public class BlufiClient {
    private BlufiClientImpl mImpl;

    public BlufiClient(BluetoothGatt gatt, BluetoothGattCharacteristic writeCharact, BluetoothGattCharacteristic notiCharact,
                       BlufiCallback callback) {
        mImpl = new BlufiClientImpl(this, gatt, writeCharact, notiCharact, callback);
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
