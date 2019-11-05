package h5.espressif.esp32.module.main;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.os.SystemClock;
import android.text.TextUtils;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import h5.espressif.esp32.module.Utils;
import h5.espressif.esp32.module.web.JSCallbacks;
import iot.espressif.esp32.model.device.ble.MeshBleDevice;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.ble.ScanListener;
import libs.espressif.log.EspLog;

public class MainBleNotifyThread extends Thread implements LifecycleObserver {
    private static final int BLE_NOTIFY_INTERVAL = 1500;

    private final EspLog mLog = new EspLog(getClass());

    private volatile EspWebActivity mActivity;

    private ScanListener mBleCallback = new BleCallback();
    private final Map<BluetoothDevice, BleInfo> mBleInfoMap = new HashMap<>();
    private volatile boolean mBleScanning;
    private volatile long mBleLastClearTime;

    MainBleNotifyThread(EspWebActivity activity) {
        mActivity = activity;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void onCreate() {
        start();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void onDestroy() {
        interrupt();
        mActivity = null;
    }

    void clearBle() {
        synchronized (mBleInfoMap) {
            mBleInfoMap.clear();
        }
    }

    void startBleScan(List<ScanFilter> filters, ScanSettings settings) {
        synchronized (this) {
            if (mBleScanning) {
                EspBleUtils.stopScanBle(mBleCallback);
            }
            mBleLastClearTime = SystemClock.elapsedRealtime();

            mBleScanning = EspBleUtils.startScanBle(mBleCallback, settings, filters);
            if (mBleScanning) {
                notify();
            } else {
                mLog.w("Require to scan BLE failed");
            }
        }
    }

    void stopBleScan() {
        synchronized (this) {
            mBleScanning = false;
            EspBleUtils.stopScanBle(mBleCallback);
            clearBle();
        }
    }

    private class BleCallback implements ScanListener {

        @Override
        public void onLeScan(ScanResult scanResult) {
            if (scanResult.getScanRecord() == null) {
                return;
            }

            String name = scanResult.getDevice().getName();
            if (TextUtils.isEmpty(name)) {
                return;
            }

            synchronized (mBleInfoMap) {
                BleInfo info = new BleInfo();
                info.rssi = scanResult.getRssi();
                info.scanRecord = scanResult.getScanRecord().getBytes();
                mBleInfoMap.put(scanResult.getDevice(), info);
            }
        }
    }

    private class BleInfo {
        int rssi;
        byte[] scanRecord;
    }

    @Override
    public void run() {
        while (!isInterrupted() && mActivity != null) {
            synchronized (this) {
                if (!mBleScanning) {
                    try {
                        mLog.d("MainBleNotifyThread wait()");
                        wait();
                        mLog.d("MainBleNotifyThread notified");
                    } catch (InterruptedException e) {
                        mLog.w("MainBleNotifyThread wait interrupted");
                        break;
                    }
                }
            }

            try {
                Thread.sleep(BLE_NOTIFY_INTERVAL);
            } catch (InterruptedException e) {
                mLog.w("BleNotifyThread sleep interrupted");
                break;
            }

            Map<BluetoothDevice, BleInfo> tempMap = Collections.emptyMap();
            synchronized (mBleInfoMap) {
                if (!mBleInfoMap.isEmpty()) {
                    tempMap = new HashMap<>(mBleInfoMap);
                }
            }

            JSONArray array = new JSONArray();
            for (Map.Entry<BluetoothDevice, BleInfo> entry : tempMap.entrySet()) {
                try {
                    BluetoothDevice ble = entry.getKey();
                    BleInfo info = entry.getValue();
                    String[] addrs = ble.getAddress().split(":");
                    StringBuilder address = new StringBuilder();
                    for (String str : addrs) {
                        address.append(str.toLowerCase());
                    }
                    MeshBleDevice meshBle = new MeshBleDevice(ble, info.rssi, info.scanRecord);
                    String mac = address.toString();
                    Object name;
                    try {
                        name = ble.getName() == null ? JSONObject.NULL : Utils.base64(ble.getName());
                    } catch (NullPointerException npe) {
                        mLog.w("Catch NPE when convert BLE name");
                        break;
                    }
                    JSONObject bleJSON = new JSONObject()
                            .put("mac", mac)
                            .put("name", name)
                            .put("beacon", meshBle.getOUI() == null ? JSONObject.NULL : meshBle.getOUI())
                            .put("rssi", meshBle.getRssi())
                            .put("version", meshBle.getMeshVersion())
                            .put("bssid", meshBle.getStaBssid() == null ? mac : meshBle.getStaBssid())
                            .put("tid", meshBle.getTid())
                            .put("only_beacon", meshBle.isOnlyBeacon());
                    array.put(bleJSON);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            if (array.length() > 0 && mActivity != null) {
                mActivity.evaluateJavascript(JSCallbacks.onScanBLE(array.toString()));
            }

            // Keep cache ble 3 minutes
            if (SystemClock.elapsedRealtime() - mBleLastClearTime > 180_000L) {
                clearBle();
                mBleLastClearTime = SystemClock.elapsedRealtime();
            }
        }
    }
}
