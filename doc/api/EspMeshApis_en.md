[[简体中文]](EspMeshApis_zh_rCN.md)

# EspMeshApi
Class iot.espressif.esp32.api.EspMeshApi

```java
/**
 * Get API single instance
 *
 * @return implemented API instance
 */
public static EspMeshApis getImplInstance();
```

```java
/**
 * Starts a scan for Mesh BLE devices.
 *
 * @param listener the callback Mesh BLE device scan results are delivered.
 */
abstract public void startScanMeshBleDevice(@NonNull MeshScanListener listener);
```

```java
/**
 * Stops an ongoing Mesh BLE device scan.
 *
 * @param listener used to identify which scan to stop
 *                 must be the same handle used to start the scan
 */
abstract public void stopScanMeshBleDevice(@NonNull MeshScanListener listener);
```

```java
/**
 * Configure the device to connect the specific AP.
 * If the device connect the specific AP successfully, {@link MeshBlufiCallback#onWifiStateResponse(BlufiClient, BlufiStatusResponse)} will be invoked.
 *
 * @param device        Mesh BLE device
 * @param meshVersion   the version from MDF manufacturer data
 * @param params        AP info and mesh options
 * @param blufiCallback Blufi callback
 * @return MeshBlufiClient
 */
abstract public MeshBlufiClient startConfigureNetwork(@NonNull BluetoothDevice device, int meshVersion, @NonNull MeshConfigureParams params, @Nullable MeshBlufiCallback blufiCallback);
```

```java
/**
 * Stop the configuring process
 *
 * @param client ongoing client
 */
abstract public void stopConfigureNetwork(@NonNull MeshBlufiClient client);
```

```java
/**
 * Scan all station devices in LAN
 *
 * @return station devices list
 */
abstract public List<IEspDevice> scanStations();
```

```java
/**
 * Scan all station devices in LAN
 *
 * @param callback the callback station device scan results are delivered
 * @return station device list
 */
abstract public List<IEspDevice> scanStations(@Nullable DeviceScanCallback callback);
```

```java
/**
 * Start upgrade device rom version. The App will post the bin data to devices.
 *
 * @param bin      bin file
 * @param devices  the devices need upgrade
 * @param callback the callback ota progress is updated
 * @return EspOTAClient
 */
abstract public EspOTAClient startOTA(@NonNull File bin, @NonNull Collection<IEspDevice> devices, @Nullable EspOTAClient.OTACallback callback);
```

```java
/**
 * Start upgrade device rom version. The devices will download bin data from the specific URL.
 * The OTA task will running in an async thread.
 *
 * @param url      bin url
 * @param devices  the devices need upgrade
 * @param callback the callback ota progress is updated
 * @return EspOTAClient
 */
abstract public EspOTAClient startOTA(@NonNull String url, @NonNull Collection<IEspDevice> devices, @Nullable EspOTAClient.OTACallback callback);
```

```java
/**
 * Stop OTA process.
 *
 * @param client ongoing client
 */
abstract public void stopOTA(@NonNull EspOTAClient client);
```

```java
/**
 * Update device info.
 *
 * @param device MDF device
 * @return true if get device info successfully
 */
abstract public boolean getDeviceInfo(@NonNull IEspDevice device);
```

```java
/**
 * Update devices info.
 *
 * @param devices MDF devices
 */
abstract public void getDevicesInfo(@NonNull Collection<IEspDevice> devices);
```

```java
/**
 * Change the device status
 *
 * @param device          MDF device
 * @param characteristics the EspDeviceCharacteristic items require to set cid and value
 * @return true if post request successfully
 */
abstract public boolean setDeviceStatus(@NonNull IEspDevice device, @NonNull Collection<EspDeviceCharacteristic> characteristics);
```

```java
/**
 * Change the devices status
 *
 * @param devices         MDF devices
 * @param characteristics the EspDeviceCharacteristic items require to set cid and value
 */
abstract public void setDevicesStatus(@NonNull Collection<IEspDevice> devices, @NonNull Collection<EspDeviceCharacteristic> characteristics);
```

```java
/**
 * Update specific status
 *
 * @param device MDF device
 * @param cids   the EspDeviceCharacteristic need to update
 * @return true if update successfully
 */
abstract public boolean getDeviceStatus(@NonNull IEspDevice device, int... cids);
```

```java
/**
 * Update specific status
 *
 * @param devices MDF devices
 * @param cids    the EspDeviceCharacteristic need to update
 */
abstract public void getDevicesStatus(@NonNull Collection<IEspDevice> devices, int... cids);
```

```java
/**
 * Post a request to reboot the device
 *
 * @param device MDF device
 * @return true if post the request succefully
 */
abstract public boolean reboot(@NonNull IEspDevice device);
```

```java
/**
 * Post a request to reboot the devices
 *
 * @param devices MDF devices
 */
abstract public void reboot(@NonNull Collection<IEspDevice> devices);
```

## Example

1. Register **iot.espressif.esp32.app.EspApplication** in AndroidManifest.xml

2. Codes:
    ```java
    // 1. Start scan Mesh devices
    MeshScanListener meshScanListener = new MeshScanListener() {
        @Override
        public void onMeshDeviceScanned(MeshBleDevice meshBleDevice) {
            // Get BLE device
            BluetoothDevice bluetoothDevice  = meshBleDevice.getDevice();
            // Get mesh version
            int meshVersion = meshBleDevice.getMeshVersion();
            // Get station bssid
            String staBssid = meshBleDevice.getStaBssid();
            // Get rssi
            int rssi = meshBleDevice.getRssi();
            // Get device type id
            int tid = meshBleDevice.getTid();
        }
    };
    EspMeshApis.getImplInstance().startScanMeshBleDevice(meshScanListener);

    // 2. Stop scan Mesh devices
    EspMeshApis.getImplInstance().stopScanMeshBleDevice(meshScanListener);

    // 3. Configure network
    int meshVersion = 0; // Mesh version, get from MeshBleDevice
    BluetoothDevice device = null; // BLE device，get from MeshBleDevice
    List<String> whiteList = new ArrayList<>();
    // Add station bssid into the list to configure the devices connect the same mesh network, get station bssid from MeshBleDevice
    whiteList.add("staBssid1");
    whiteList.add("staBssid2");

    MeshConfigureParams params = new MeshConfigureParams();
    params.setAPSsid("ssid"); // Requirement
    params.setAPBssid("bssid"); // Requirement
    params.setAPPassword("password"); // Requirement
    params.setMeshID("meshid".getBytes()); // Requirement，6 bytes，configre the device connect the specific mesh network
    params.setMeshPassword("mesh password"); // Not requirement
    params.setWhiteList(whiteList); // Not requirement

    MeshBlufiClient meshBlufiClient = EspMeshApis.getImplInstance().startConfigureNetwork(device, meshVersion, params, new MeshBlufiCallback() {
        @Override
        public void onWifiStateResponse(BlufiClient client, BlufiStatusResponse response) {
            boolean success = response.isStaConnected(); // The device has connected the specific AP
        }

        // It will call different functions if configure failed, see the functions in class MeshBlufiCallback
    });

    // 4. Stop configure network and release resources created in configuring progress
    EspMeshApis.getImplInstance().stopConfigureNetwork(meshBlufiClient);

    // 5. Get the devices in LAN, the results has no device information
    List<IEspDevice> deviceList = EspMeshApis.getImplInstance().scanStations();

    // 6. Get device information
    EspMeshApis.getImplInstance().getDeviceInfo(IEspDevice); // Get one device info
    EspMeshApis.getImplInstance().getDevicesInfo(deviceList); // Batch get device info

    // 7. Change device status
    EspDeviceCharacteristic characteristic = EspDeviceCharacteristic.newInstance(EspDeviceCharacteristic.FORMAT_INT); // Create EspDeviceCharacteristic with format
    characteristic.setCid(0x01); // Set target cid
    characteristic.setValue(100); // Set status value
    List<EspDeviceCharacteristic> characteristics = new ArrayList<>();
    characteristics.add(characteristic);
    EspMeshApis.getImplInstance().setDevicesStatus(IEspDevice, characteristics); // Change one device's status
    EspMeshApis.getImplInstance().setDevicesStatus(deviceList, characteristics); // Batch change devices' status
    
    // 8. OTA upgrade device version
    EspOTAClient otaClient = EspMeshApis.getImplInstance().startOTA(bin, deviceList, new EspOTAClient.OTACallback() {
        @Override
        public Handler getHandler() {
            return null; // Set callback handler, it is nullable
        }

        @Override
        public void onOTAPrepare(EspOTAClient client) {
            // Call before OTA start
        }

        @Override
        public void onOTAProgressUpdate(EspOTAClient client, List<EspOTAClient.OTAProgress> progressList) {
            // Call when OTA
            for (EspOTAClient.OTAProgress progress : progressList) {
                String mac = progress.getDeviceMac(); // Device MAC
                int progressValue = progress.getProgress(); // Upgrade progress
                String message = progress.getMessage(); // Upgrade message
            }
        }

        @Override
        public void onOTAResult(EspOTAClient client, List<String> sucMacList) {
            // OTA result
            // sucMacList is the list contain OTA success devices
            // The devices need reboot if OTA successfully
            EspMeshApis.getImplInstance().reboot(sucDevices);
        }
    });
    
    // 9. Stop OTA and release resources created in OTA progress
    EspMeshApis.getImplInstance().stopOTA(otaClient);
    ```