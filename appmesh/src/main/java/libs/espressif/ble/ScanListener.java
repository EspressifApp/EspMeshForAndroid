package libs.espressif.ble;

import android.bluetooth.le.ScanResult;

public interface ScanListener {
    void onLeScan(ScanResult scanResult);
}
