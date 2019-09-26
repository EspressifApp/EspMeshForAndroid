package libs.espressif.ble;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import libs.espressif.utils.DataUtil;

public class EspBleUtils {
    private static final String UUID_INDICATION_DESCRIPTOR = "00002902-0000-1000-8000-00805f9b34fb";
    private static final String BASE_UUID_FORMAT = "0000%s-0000-1000-8000-00805f9b34fb";

    private static final Map<ScanListener, ScanCallback> mScanListenerMap = new HashMap<>();

    public static UUID newUUID(String address) {
        String string = String.format(BASE_UUID_FORMAT, address);
        return UUID.fromString(string);
    }

    private static class BleScanCallback extends ScanCallback {
        ScanListener mScanListener;

        BleScanCallback(ScanListener scanListener) {
            mScanListener = scanListener;
        }

        void onScanDevice(ScanResult result) {
            if (mScanListenerMap.get(mScanListener) != null) {
                mScanListener.onLeScan(result);
            }
        }

        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            onScanDevice(result);
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            for (ScanResult result : results) {
                onScanDevice(result);
            }
        }

        @Override
        public void onScanFailed(int errorCode) {
            super.onScanFailed(errorCode);
        }
    }

    /**
     * Starts a scan for Bluetooth LE devices.
     *
     * @param listener the callback LE scan results are delivered.
     * @return true, if the scan was started successfully.
     */
    public static boolean startScanBle(@NonNull final ScanListener listener) {
        ScanSettings settings = new ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_BALANCED)
                .build();
        return startScanBle(listener, settings, null);
    }

    public static boolean startScanBle(@NonNull ScanListener listener, ScanSettings settings, List<ScanFilter> filters) {
        synchronized (mScanListenerMap) {
            // This listener scanning has started.
            if (mScanListenerMap.get(listener) != null) {
                return false;
            }

            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (!adapter.isEnabled()) {
                mScanListenerMap.clear();
                return false;
            }
            BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
            if (scanner == null) {
                mScanListenerMap.clear();
                return false;
            }

            BleScanCallback scanCallback = new BleScanCallback(listener);
            mScanListenerMap.put(listener, scanCallback);

            scanner.startScan(filters, settings, scanCallback);
            return true;
        }
    }

    /**
     * Stops an ongoing Bluetooth LE device scan.
     *
     * @param listener callback used to identify which scan to stop
     *                 must be the same handle used to start the scan
     */
    public static void stopScanBle(@NonNull ScanListener listener) {
        synchronized (mScanListenerMap) {
            ScanCallback callback = mScanListenerMap.remove(listener);
            if (callback == null) {
                return;
            }

            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (!adapter.isEnabled()) {
                mScanListenerMap.clear();
                return;
            }
            BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
            if (scanner == null) {
                mScanListenerMap.clear();
                return;
            }
            scanner.stopScan(callback);
        }
    }

    public static UUID getIndicationDescriptorUUID() {
        return UUID.fromString(UUID_INDICATION_DESCRIPTOR);
    }

    public static BluetoothGatt connectGatt(BluetoothDevice device, Context context, BluetoothGattCallback callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return device.connectGatt(context, false, callback, BluetoothDevice.TRANSPORT_LE);
        } else {
            return device.connectGatt(context, false, callback);
        }
    }

    public static List<BleAdvData> resolveScanRecord(byte[] record) {
        if (record == null) {
            return Collections.emptyList();
        }

        List<BleAdvData> result = new ArrayList<>();

        int offset = 0;

        do {
            int len = record[offset] & 0xff;
            if (len == 0) {
                break;
            }
            if (offset + 1 + len >= record.length) {
                break;
            }

            int type = record[offset + 1] & 0xff;
            byte[] data = DataUtil.subBytes(record, offset + 2, len - 1);

            BleAdvData advData = new BleAdvData();
            advData.setType(type);
            advData.setData(data);
            result.add(advData);

            offset += (len + 1);
        } while (offset < record.length);

        return result;
    }
}
