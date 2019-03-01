package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothDevice;

import java.util.List;

import libs.espressif.ble.BleAdvData;
import libs.espressif.ble.EspBleUtils;

public class MeshBleDevice {
    private static final int BLE_MANUFACTURER_ADV_TYPE = 0xff;

    private int mManufacturerId = 0;

    private BluetoothDevice mDevice = null;
    private int mRssi = 1;
    private byte[] mScanRecord = null;

    private String mStaBssid = null;
    private int mMeshVersion = -1;
    private boolean mOnlyBeacon = false;
    private int mTid = -1;

    public MeshBleDevice(BluetoothDevice device, int rssi, byte[] scanRecord) {
        this(device, rssi, scanRecord, 0);
    }

    public MeshBleDevice(BluetoothDevice device, int rssi, byte[] scanRecord, int manufacturerId) {
        mDevice = device;
        mRssi = rssi;
        mScanRecord = scanRecord;
        mManufacturerId = manufacturerId;
        parseMesh();
    }

    public void setDevice(BluetoothDevice device) {
        mDevice = device;
    }

    public BluetoothDevice getDevice() {
        return mDevice;
    }

    public void setRssi(int rssi) {
        mRssi = rssi;
    }

    public int getRssi() {
        return mRssi;
    }

    public void setScanRecord(byte[] scanRecord) {
        mScanRecord = scanRecord;
        parseMesh();
    }

    public byte[] getScanRecord() {
        return mScanRecord;
    }

    public String getStaBssid() {
        return mStaBssid;
    }

    public int getMeshVersion() {
        return mMeshVersion;
    }

    public boolean isOnlyBeacon() {
        return mOnlyBeacon;
    }

    public int getTid() {
        return mTid;
    }

    public void setManufacturerId(int manufacturerId) {
        mManufacturerId = manufacturerId;
        parseMesh();
    }

    public int getManufacturerId() {
        return mManufacturerId;
    }

    private void initVars() {
        mMeshVersion = -1;
        mOnlyBeacon = false;
        mStaBssid = null;
        mTid = -1;
    }

    private void parseMesh() {
        try {
            _parseMeshVersion();
        } catch (Exception e) {
            e.printStackTrace();
            initVars();
        }
    }

    private void _parseMeshVersion() {
        List<BleAdvData> dataList = EspBleUtils.resolveScanRecord(mScanRecord);
        for (BleAdvData advData : dataList) {
            // Check manufacturer adv type(0xff)
            if (advData.getType() != BLE_MANUFACTURER_ADV_TYPE) {
                continue;
            }

            byte[] manuData = advData.getData();
            // Check data length
            if (manuData.length < 14) {
                continue;
            }
            // Check manufacturer id
            int advManuId = (manuData[0] & 0xff) | ((manuData[1] & 0xff) << 8);
            if (mManufacturerId != 0 && advManuId != mManufacturerId) {
                continue;
            }
            // Check (MDF)
            if ((manuData[2] & 0xff) != 0x4d
                    || (manuData[3] & 0xff) != 0x44
                    || (manuData[4] & 0xff) != 0x46) {
                continue;
            }

            mMeshVersion = manuData[5] & 3;
            mOnlyBeacon = ((manuData[5] >> 4) & 1) == 1;
            mStaBssid = String.format("%02x%02x%02x%02x%02x%02x",
                    manuData[6], manuData[7], manuData[8], manuData[9], manuData[10], manuData[11]);
            mTid = (manuData[12] & 0xff) | ((manuData[13] & 0xff) << 8);
            return;
        }

        initVars();
    }
}
