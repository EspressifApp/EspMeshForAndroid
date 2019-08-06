package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothDevice;

import java.util.Arrays;
import java.util.List;

import libs.espressif.ble.BleAdvData;
import libs.espressif.ble.EspBleUtils;

public class MeshBleDevice {
    private static final int BLE_MANUFACTURER_ADV_TYPE = 0xff;

    /**
     * [MANUFACTURER_ID 2B][MDF 3B][#DATA 1B][STA_BSSID 6B][TID 2B]
     *
     * #DATA: bit[0] bit[1] = mesh version, bit[4] = only beacon
     */
    private static final String OUI_MDF = "MDF";
    /**
     * [MANUFACTURER_ID 2B][MGW 3B][#DATA 1B][STA_BSSID 6B]
     */
    private static final String OUI_MGW = "MGW";

    private int mManufacturerId = 0;

    private BluetoothDevice mDevice = null;
    private int mRssi = 1;
    private byte[] mScanRecord = null;

    private String mStaBssid = null;
    private int mMeshVersion = -1;
    private boolean mOnlyBeacon = false;
    private int mTid = -1;

    private String mOUI;

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

    public String getOUI() {
        return mOUI;
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
            if (manuData.length < 5) {
                continue;
            }
            // Check manufacturer id
            int advManuId = (manuData[0] & 0xff) | ((manuData[1] & 0xff) << 8);
            if (mManufacturerId != 0 && advManuId != mManufacturerId) {
                continue;
            }
            // Check OUI
            byte[] oui = {manuData[2], manuData[3], manuData[4]};
            if (Arrays.equals(oui, OUI_MDF.getBytes())) {
                // MDF
                if (manuData.length < 14) {
                    continue;
                }
                mOUI = OUI_MDF;
                mMeshVersion = manuData[5] & 0b11;
                mOnlyBeacon = (manuData[5] & 0b10000) != 0;
                mStaBssid = String.format("%02x%02x%02x%02x%02x%02x",
                        manuData[6], manuData[7], manuData[8], manuData[9], manuData[10], manuData[11]);
                mTid = (manuData[12] & 0xff) | ((manuData[13] & 0xff) << 8);
                return;
            } else if (Arrays.equals(oui, OUI_MGW.getBytes())) {
                // MGW
                if (manuData.length < 12) {
                    continue;
                }
                mOUI = OUI_MGW;
                mMeshVersion = manuData[5] & 0b11;
                mStaBssid = String.format("%02x%02x%02x%02x%02x%02x",
                        manuData[6], manuData[7], manuData[8], manuData[9], manuData[10], manuData[11]);
                return;
            }
        }

        initVars();
    }
}
