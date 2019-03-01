package iot.espressif.esp32.api;

import android.bluetooth.BluetoothDevice;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import java.io.File;
import java.util.Collection;
import java.util.List;

import blufi.espressif.BlufiClient;
import blufi.espressif.response.BlufiStatusResponse;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.model.device.ble.MeshConfigureParams;
import iot.espressif.esp32.model.device.ble.MeshScanListener;
import iot.espressif.esp32.model.device.ota.EspOTAClient;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;

public abstract class EspMeshApis {
    private static final Object sLock = new Object();
    private static EspMeshApis sInstance;

    EspMeshApis() {
    }

    /**
     * Get single instance
     *
     * @return implemented API instance
     */
    public static EspMeshApis getImplInstance() {
        if (sInstance == null) {
            synchronized (sLock) {
                if (sInstance == null) {
                    sInstance = new EspMeshApisImpl();
                }
            }
        }

        return sInstance;
    }

    /**
     * Starts a scan for Mesh BLE devices.
     *
     * @param listener the callback Mesh BLE device scan results are delivered.
     */
    abstract public void startScanMeshBleDevice(@NonNull MeshScanListener listener);

    /**
     * Stops an ongoing Mesh BLE device scan.
     *
     * @param listener used to identify which scan to stop
     *                 must be the same handle used to start the scan
     */
    abstract public void stopScanMeshBleDevice(@NonNull MeshScanListener listener);

    /**
     * Configure the device to connect the specific AP.
     * If the device connect the specific AP successfully, {@link MeshBlufiCallback#onWifiStateResponse(BlufiClient, BlufiStatusResponse)}
     * will be invoked.
     *
     * @param device        Mesh BLE device
     * @param meshVersion   the version from MDF manufacturer data
     * @param params        AP info and mesh options
     * @param blufiCallback Blufi callback
     * @return MeshBlufiClient
     */
    abstract public MeshBlufiClient startConfigureNetwork(@NonNull BluetoothDevice device, int meshVersion,
                                                          @NonNull MeshConfigureParams params,
                                                          @Nullable MeshBlufiCallback blufiCallback);

    /**
     * Stop the configuring process
     *
     * @param client ongoing client
     */
    abstract public void stopConfigureNetwork(@NonNull MeshBlufiClient client);

    /**
     * Scan all station devices in LAN
     *
     * @return station devices list
     */
    abstract public List<IEspDevice> scanStations();

    /**
     * Scan all station devices in LAN
     *
     * @param callback the callback station device scan results are delivered
     * @return station device list
     */
    abstract public List<IEspDevice> scanStations(@Nullable DeviceScanCallback callback);

    /**
     * Start upgrade device rom version. The App will post the bin data to devices.
     *
     * @param bin      bin file
     * @param devices  the devices need upgrade
     * @param callback the callback ota progress is updated
     * @return EspOTAClient
     */
    abstract public EspOTAClient startOTA(@NonNull File bin, @NonNull Collection<IEspDevice> devices,
                                          @Nullable EspOTAClient.OTACallback callback);

    /**
     * Start upgrade device rom version. The devices will download bin data from the specific URL.
     * The OTA task will running in an async thread.
     *
     * @param url      bin url
     * @param devices  the devices need upgrade
     * @param callback the callback ota progress is updated
     * @return EspOTAClient
     */
    abstract public EspOTAClient startOTA(@NonNull String url, @NonNull Collection<IEspDevice> devices,
                                          @Nullable EspOTAClient.OTACallback callback);

    /**
     * Stop OTA process.
     *
     * @param client ongoing client
     */
    abstract public void stopOTA(@NonNull EspOTAClient client);

    /**
     * Update device info.
     *
     * @param device MDF device
     * @return true if get device info successfully
     */
    abstract public boolean getDeviceInfo(@NonNull IEspDevice device);

    /**
     * Update devices info.
     *
     * @param devices MDF devices
     */
    abstract public void getDevicesInfo(@NonNull Collection<IEspDevice> devices);

    /**
     * Change the device status
     *
     * @param device          MDF device
     * @param characteristics the EspDeviceCharacteristic items require to set cid and value
     * @return true if post request successfully
     */
    abstract public boolean setDeviceStatus(@NonNull IEspDevice device,
                                            @NonNull Collection<EspDeviceCharacteristic> characteristics);

    /**
     * Change the devices status
     *
     * @param devices         MDF devices
     * @param characteristics the EspDeviceCharacteristic items require to set cid and value
     */
    abstract public void setDevicesStatus(@NonNull Collection<IEspDevice> devices,
                                          @NonNull Collection<EspDeviceCharacteristic> characteristics);

    /**
     * Update specific status
     *
     * @param device MDF device
     * @param cids   the EspDeviceCharacteristic need to update
     * @return true if update successfully
     */
    abstract public boolean getDeviceStatus(@NonNull IEspDevice device, int... cids);

    /**
     * Update specific status
     *
     * @param devices MDF devices
     * @param cids    the EspDeviceCharacteristic need to update
     */
    abstract public void getDevicesStatus(@NonNull Collection<IEspDevice> devices, int... cids);

    /**
     * Post a request to reboot the device
     *
     * @param device MDF devices
     * @return true if post the request succefully
     */
    abstract public boolean reboot(@NonNull IEspDevice device);

    /**
     * Post a request to reboot the devices
     *
     * @param devices MDF devices
     */
    abstract public void reboot(@NonNull Collection<IEspDevice> devices);
}
