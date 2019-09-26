[[English]](EspMeshApis_en.md)

# EspMeshApis
Class [iot.espressif.esp32.api.EspMeshApis](../../appmesh/src/main/java/iot/espressif/esp32/api/EspMeshApis.java)

```java
/**
 * 获取API单例
 *
 * @return API实例
 */
public static EspMeshApis getImplInstance();
```

```java
/**
 * 开始扫描Mesh蓝牙信号
 *
 * @param listener 发现Mesh设备时回调
 */
abstract public void startScanMeshBleDevice(@NonNull MeshScanListener listener);
```

```java
/**
 * 停止正在进行的扫描进程
 *
 * @param listener 停止扫描的标识，必须与开始扫描的接口是同一个
 */
abstract public void stopScanMeshBleDevice(@NonNull MeshScanListener listener);
```

```java
/**
 * 将设备配置到指定的路由器
 * 如果设备成功连接路由器将调用回调接口{@link MeshBlufiCallback#onWifiStateResponse(BlufiClient, BlufiStatusResponse)} 
 *
 * @param device        Mesh BLE设备
 * @param meshVersion   从MDF蓝牙广播数据中获取的版本
 * @param params        配网参数
 * @param blufiCallback 回调接口
 * @return MeshBlufiClient
 */
abstract public MeshBlufiClient startConfigureNetwork(@NonNull BluetoothDevice device, int meshVersion, @NonNull MeshConfigureParams params, @Nullable MeshBlufiCallback blufiCallback);
```

```java
/**
 * 停止回调进程
 *
 * @param client 配网中的客户端
 */
abstract public void stopConfigureNetwork(@NonNull MeshBlufiClient client);
```

```java
/**
 * 扫描路由器下的所有节点设备
 *
 * @return 节点设备列表
 */
abstract public List<IEspDevice> scanStations();
```

```java
/**
 * 扫描路由器下的所有节点设备
 *
 * @param callback 获的一组Mesh设备时触发
 * @return 节点设备列表
 */
abstract public List<IEspDevice> scanStations(@Nullable DeviceScanCallback callback);
```

```java
/**
 * 开始升级设备固件版本，APP将会把固件数据发送给设备
 *
 * @param bin      升级固件
 * @param devices  需要升级的设备
 * @param callback 升级过程中的回调接口
 * @return EspOTAClient
 */
abstract public EspOTAClient startOTA(@NonNull File bin, @NonNull Collection<IEspDevice> devices, @Nullable EspOTAClient.OTACallback callback);
```

```java
/**
 * 开始升级设备固件版本，设备将会从给定的地址下载数据
 * OTA将在异步线程中运行
 *
 * @param url      固件地址
 * @param devices  需要升级的设备
 * @param callback 升级过程中的回调接口
 * @return EspOTAClient
 */
abstract public EspOTAClient startOTA(@NonNull String url, @NonNull Collection<IEspDevice> devices, @Nullable EspOTAClient.OTACallback callback);
```

```java
/**
 * 停止升级进程
 *
 * @param client ongoing client
 */
abstract public void stopOTA(@NonNull EspOTAClient client);
```

```java
/**
 * 更新设备详细信息
 *
 * @param device MDF设备
 * @return true 若获取信息成功
 */
abstract public boolean getDeviceInfo(@NonNull IEspDevice device);
```

```java
/**
 * 更新设备详细信息
 *
 * @param devices MDF设备列表
 */
abstract public void getDevicesInfo(@NonNull Collection<IEspDevice> devices);
```

```java
/**
 * 修改设备状态
 *
 * @param device          MDF设备
 * @param characteristics EspDeviceCharacteristic需要设置cid和value
 * @return true 若发送请求成功
 */
abstract public boolean setDeviceStatus(@NonNull IEspDevice device, @NonNull Collection<EspDeviceCharacteristic> characteristics);
```

```java
/**
 * 修改设备状态
 *
 * @param devices         MDF设备列表
 * @param characteristics EspDeviceCharacteristic需要设置cid和value
 */
abstract public void setDevicesStatus(@NonNull Collection<IEspDevice> devices, @NonNull Collection<EspDeviceCharacteristic> characteristics);
```

```java
/**
 * 更新指定的状态信息
 *
 * @param device MDF设备
 * @param cids   需要更新的属性id
 * @return true 若获取信息成功
 */
abstract public boolean getDeviceStatus(@NonNull IEspDevice device, int... cids);
```

```java
/**
 * 更新指定的状态信息
 *
 * @param devices MDF设备列表
 * @param cids    需要更新的属性id
 */
abstract public void getDevicesStatus(@NonNull Collection<IEspDevice> devices, int... cids);
```

```java
/**
 * 请求设备重启
 *
 * @param device MDF设备
 * @return true 若发送请求成功
 */
abstract public boolean reboot(@NonNull IEspDevice device);
```

```java
/**
 * 请求设备重启
 *
 * @param devices MDF设备列表
 */
abstract public void reboot(@NonNull Collection<IEspDevice> devices);
```

## 示例

1. 在AndroidManifest.xml中注册**iot.espressif.esp32.app.EspApplication**

2. 代码调用:
    ```java
    // 1. 开始扫描Mesh BLE设备
    MeshScanListener meshScanListener = new MeshScanListener() {
        @Override
        public void onMeshDeviceScanned(MeshBleDevice meshBleDevice) {
            // 获取BLE设备
            BluetoothDevice bluetoothDevice  = meshBleDevice.getDevice();
            // 获取mesh版本
            int meshVersion = meshBleDevice.getMeshVersion();
            // 获取station bssid
            String staBssid = meshBleDevice.getStaBssid();
            // 获取rssi
            int rssi = meshBleDevice.getRssi();
            // 获取设备类型id
            int tid = meshBleDevice.getTid();
        }
    };
    EspMeshApis.getImplInstance().startScanMeshBleDevice(meshScanListener);

    // 2. 停止扫描Mesh BLE设备
    EspMeshApis.getImplInstance().stopScanMeshBleDevice(meshScanListener);

    // 3. 配网
    int meshVersion = 0; // Mesh version, 从MeshBleDevice获取
    BluetoothDevice device = null; // BLE device，从MeshBleDevice获取
    List<String> whiteList = new ArrayList<>();
    // 将需要配到同一个Mesh网络下的设备的station bssid加入白名单, station bssid从MeshBleDevice获取
    whiteList.add("staBssid1");
    whiteList.add("staBssid2");

    MeshConfigureParams params = new MeshConfigureParams();
    params.setAPSsid("ssid"); // 必需
    params.setAPBssid("bssid"); // 必需
    params.setAPPassword("password"); // 必需
    params.setMeshID("meshid".getBytes()); // 必需，6个字节，将设备配置到指定的Mesh网络
    params.setMeshPassword("mesh password"); // 非必需
    params.setWhiteList(whiteList); // 非必需

    MeshBlufiClient meshBlufiClient = EspMeshApis.getImplInstance().startConfigureNetwork(device, meshVersion, params, new MeshBlufiCallback() {
        @Override
        public void onWifiStateResponse(BlufiClient client, BlufiStatusResponse response) {
            boolean success = response.isStaConnected(); // 设备已经连上了指定的路由器
        }

        // 配网失败有多种回调, 具体可参考类MeshBlufiCallback
    });

    // 4. 停止配网并释放配网过程中申请的资源
    EspMeshApis.getImplInstance().stopConfigureNetwork(meshBlufiClient);

    // 5. 获取路由器下的所有节点设备，此时获取的设备是没有设备详情的
    List<IEspDevice> deviceList = EspMeshApis.getImplInstance().scanStations();

    // 6. 获取设备详情
    EspMeshApis.getImplInstance().getDeviceInfo(IEspDevice); // 获取一个设备的信息
    EspMeshApis.getImplInstance().getDevicesInfo(deviceList); // 批量获取设备信息

    // 7. 修改设备状态
    EspDeviceCharacteristic characteristic = EspDeviceCharacteristic.newInstance(EspDeviceCharacteristic.FORMAT_INT); // 根据format建立
    characteristic.setCid(0x01); // 设置需要修改的属性的cid
    characteristic.setValue(100); // 设置需要修改的数据的值
    List<EspDeviceCharacteristic> characteristics = new ArrayList<>();
    characteristics.add(characteristic);
    EspMeshApis.getImplInstance().setDevicesStatus(IEspDevice, characteristics); // 修改一个设备的状态
    EspMeshApis.getImplInstance().setDevicesStatus(deviceList, characteristics); // 批量修改设备的状态
    
    // 8. OTA升级设备版本
    EspOTAClient otaClient = EspMeshApis.getImplInstance().startOTA(bin, deviceList, new EspOTAClient.OTACallback() {
        @Override
        public Handler getHandler() {
            return null; // 设置回调Handler, 可以为null
        }

        @Override
        public void onOTAPrepare(EspOTAClient client) {
            // OTA开始前回调
        }

        @Override
        public void onOTAProgressUpdate(EspOTAClient client, List<EspOTAClient.OTAProgress> progressList) {
            // OTA过程中回调
            for (EspOTAClient.OTAProgress progress : progressList) {
                String mac = progress.getDeviceMac(); // 设备MAC
                int progressValue = progress.getProgress(); // 升级进度
                String message = progress.getMessage(); // 升级信息
            }
        }

        @Override
        public void onOTAResult(EspOTAClient client, List<String> sucMacList) {
            // OTA结果回调
            // sucMacList是升级成功的设备列表
            // 升级成功后设备需要重启
            EspMeshApis.getImplInstance().reboot(sucDevices);
        }
    });
    
    // 9. 停止OTA升级并释放升级过程中申请的资源
    EspMeshApis.getImplInstance().stopOTA(otaClient);
    ```