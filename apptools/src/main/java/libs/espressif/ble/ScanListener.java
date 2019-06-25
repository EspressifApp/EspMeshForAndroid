package libs.espressif.ble;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanResult;

public interface ScanListener {
    void onLeScan(BluetoothDevice device, int rssi, byte[] scanRecord, ScanResult scanResult);
}
