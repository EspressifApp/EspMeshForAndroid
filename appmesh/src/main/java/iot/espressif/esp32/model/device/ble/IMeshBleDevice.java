package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothDevice;

public interface IMeshBleDevice {
    /**
     * [MANUFACTURER_ID 2B][MDF 3B][#DATA 1B][STA_BSSID 6B][TID 2B]
     *
     * #DATA: bit[0] bit[1] = mesh version, bit[4] = only beacon
     */
    String OUI_MDF = "MDF";
    /**
     * [MANUFACTURER_ID 2B][MGW 3B][#DATA 1B][STA_BSSID 6B]
     */
    String OUI_MGW = "MGW";
    /**
     * [MANUFACTURER_ID 2B][ALI 3B][#DATA 1B][STA_BSSID 6B][TID 2B]
     *
     * #DATA: bit[0] bit[1] = mesh version, bit[4] = only beacon
     */
    String OUI_ALI = "MAY";

    void setDevice(BluetoothDevice device);

    BluetoothDevice getDevice();

    void setRssi(int rssi);

    int getRssi();

    /**
     * Set manufacturer Id filter
     *
     * @param manufacturerId filter
     */
    void setManufacturerId(int manufacturerId);

    /**
     * @return manufacturer Id filter
     */
    int getManufacturerId();

    /**
     * Set scan record raw data
     *
     * @param scanRecord raw data
     */
    void setScanRecord(byte[] scanRecord);

    /**
     * @return scan record raw data
     */
    byte[] getScanRecord();

    /**
     * @return station bssid, format like aabbccddeeff
     */
    String getStaBssid();

    /**
     * @return mesh version
     */
    int getMeshVersion();

    /**
     * @return is only beacon device or not
     */
    boolean isOnlyBeacon();

    /**
     * @return device type id
     */
    int getTid();

    /**
     * @return mdf oui
     */
    String getOUI();
}
