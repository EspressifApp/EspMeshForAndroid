package h5.espressif.esp32.module.model.web;

public class JSApi {

    /**
     * @param info:
    [
        {
            "type":1,
            "mac":"device mac",
            "channel":8,
            "time":1548140239254,
            "rssi":-45,
            "name":"device name",
            "org":"Espressif"
        },
        ...
    ]
     */
    public static String onSniffersDiscovered(String info) {
        return String.format("onSniffersDiscovered(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "mac":"self mac",
        "parent_mac":"parent device mac",
        "root_mac":"root device mac",
        "tid":1,
        "name":"device name",
        "position":1,
        "layer":1,
        "version":"device rom version",
        "idf_version":"idf version",
        "mdf_version":"mdf version",
        "mlink_version":1,
        "mesh_id":"mesh id",
        "state":["local","cloud"],
        "ip":"192.168.1.110",
        "characteristics":[
            {
            "cid":2,
            "name":"char name",
            "format":"int",
            "perm":3,
            "min":5;
            "max":10,
            "step":1,
            "value":8
            },
            ...
        ]
    }
     */
    public static String onDeviceFound(String info) {
        return String.format("onDeviceFound(\'%s\')", info);
    }

    /**
     * @param mac deivce mac
     */
    public static String onDeviceLost(String mac) {
        return String.format("onDeviceLost(\'%s\')", mac);
    }

    /**
     * @param info:
    {
        "mac":"self mac",
        "characteristics":[
            {
            "cid":2,
            "name":"char name",
            "format":"int",
            "perm":3,
            "min":5;
            "max":10,
            "step":1,
            "value":8
            },
            ...
        ]
    }
     */
    public static String onDeviceStatusChanged(String info) {
        return String.format("onDeviceStatusChanged(\'%s\')", info);
    }

    public static String onUserLogin(String info) {
        return String.format("onUserLogin(\'%s\')", info);
    }

    /**
     * @param info:
    [
        {
            "mac":"device mac",
            "progress":50,
            "message":"ota message"
        },
        ...
    ]
     */
    public static String onOTAProgressChanged(String info) {
        return String.format("onOTAProgressChanged(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "success device mac 1",
        "success device mac 2",
        ...
    ]
     */
    public static String onOTAResult(String info) {
        return String.format("onOTAResult(\'%s\')", info);
    }

    public static String onBackPressed() {
        return "onBackPressed()";
    }

    /**
     * @param info:
    {
        "connected":true,
        "ssid":"SSID",
        "bssid":"BSSID",
        "frequency":"2400"
    }
     */
    public static String onWifiStateChanged(String info) {
        return String.format("onWifiStateChanged(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "enable":true
    }
     */
    public static String onBluetoothChanged(String info) {
        return String.format("onBluetoothStateChanged(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "mac":"BLE mac",
        "name":"BLE name",
        "beacon":"MDF", // "MDF" or "MGW"
        "rssi":-55,
        "version":1,
        "bssid":"STA mac",
        "tid":10,
        "only_beacon":false
    }
     */
    public static String onScanBLE(String info) {
        return String.format("onScanBLE(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "progress":10,
        "status":101,
        "message":"Connect BLE complete"
    }
     */
    public static String onConfigureProgress(String info) {
        return String.format("onConfigureProgress(\'%s\')", info);
    }

    /**
     * @param info:
    [
        {
            "mac":"self mac",
            "parent_mac":"parent device mac",
            "root_mac":"root device mac",
            "tid":1,
            "name":"device name",
            "position":1,
            "layer":1,
            "version":"device rom version",
            "idf_version":"idf version",
            "mdf_version":"mdf version",
            "mlink_version":1,
            "trigger":1,
            "mesh_id":"mesh id",
            "state":["local","cloud"],
            "ip":"192.168.1.110",
            "characteristics":[
                {
                "cid":2,
                "name":"char name",
                "format":"int",
                "perm":3,
                "min":5;
                "max":10,
                "step":1,
                "value":8
                },
                ...
            ]
        },
        ...
    ]
     */
    public static String onDeviceScanned(String info) {
        return String.format("onDeviceScanned(\'%s\')", info);
    }

    /**
     * @param info same as {@link #onDeviceScanned(String)}
     */
    public static String onDeviceScanning(String info) {
        return String.format("onDeviceScanning(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "aabbccddeeff",
        "112233445566",
        ...
    ]
     */
    public static String onTopoScanned(String info) {
        return String.format("onTopoScanned(\'%s\')", info);
    }

    /**
     * @param qrCode QR code
     */
    public static String onQRCodeScanned(String qrCode) {
        return String.format("onQRCodeScanned(\'%s\')", qrCode);
    }

    /**
     * @param info:
    {
        "status":0, // -1 is get App version online failed
        "version_name":"1.0.6",
        "version":44,
        "total_size":11192913,
        "url":"https://github.com/EspressifApp/EspMeshForAndroid/releases/download/v1.0.6/mesh-1.0.6-44.apk",
        "notes":"release notes" // Base64 encode
    }
     */
    public static String onCheckAppVersion(String info) {
        return String.format("onCheckAppVersion(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "total_size":12000,
        "download_size":1000,
    }
     */
    public static String onApkDownloading(String info) {
        return String.format("onApkDownloading(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "result":true
    }
     */
    public static String onApkDownloadResult(String info) {
        return String.format("onApkDownloadResult(\'%s\')", info);
    }

    /**
     * @param info {"language":"zh", "country":"cn"}
     */
    public static String onLocaleGot(String info) {
        return String.format("onLocaleGot(\'%s\')", info);
    }

    /**
     * @param info:
    [
        {
            "code":"code",
            "mac":"mac",
            "floor":"floor",
            "area":"area",
            "time":time
        }
    ]
     */
    public static String onLoadHWDevices(String info) {
        return String.format("onLoadHWDevices(\'%s\')", info);
    }

    /**
     * @param info:
    [
        {
            "id":1,
            "name":"group_name",
            "is_mesh":true,
            "is_user":false,
            "macs":["aabbccddeeff","112233445566"]
        }
    ]
     */
    public static String onLoadGroups(String info) {
        return String.format("onLoadGroups(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "aabbccddeeff",
        "112233445566",
        ...
    ]
     */
    public static String onLoadMacs(String info) {
        return String.format("onLoadMacs(\'%s\')", info);
    }

    /**
     * @param info:
    [
        {
            "ssid":"ssid",
            "password":"password"
        },
        ...
    }
     */
    public static String onLoadAPs(String info) {
        return String.format("onLoadAPs(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "last used mesh id",
        "mesh id 1",
        "mesh id 2",
        ...
    ]
     */
    public static String onLoadMeshIds(String info) {
        return String.format("onLoadMeshIds(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "name":"fileName",
        "content":{
            "key":"value"
        }
    }
     * @return script
     */
    public static String onLoadValueForKeyInFile(String info) {
        return String.format("onLoadValueForKeyInFile(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "name":"fileName",
        "latest_key":"latestKey",
        "content":{
            "key1":"value1",
            "key2":"value2",
            "key3":"value3",
            ...
        }
    }
     */
    public static String onLoadAllValuesInFile(String info) {
        return String.format("onLoadAllValuesInFile(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "os":"Android",
        "version_name":"v1.2.3",
        "version_code":40
    }
     */
    public static String onGetAppInfo(String info) {
        return String.format("onGetAppInfo(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "file1 path",
        "file2 path",
        ...
    ]
     */
    public static String onGetUpgradeFiles(String info) {
        return String.format("onGetUpgradeFiles(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "download":true,
        "name":"file name",
        "version":"version",
        "file":"bin path"
    }
     */
    public static String onDownloadLatestRom(String info) {
        return String.format("onDownloadLatestRom(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "row":1,
        "column":2
    }
     */
    public static String onLoadDeviceTable(String info) {
        return String.format("onLoadDeviceTable(\'%s\')", info);
    }

    /**
     * @param info:
    [
        "table device1",
        "table device2",
        ...
    ]
     */
    public static String onLoadTableDevices(String info) {
        return String.format("onLoadTableDevices(\'%s\')", info);
    }

    /**
     * @param info:
    {
        "result":true,
        ...
    }
     */
    public static String onAddQueueTask(String info) {
        return String.format("onAddQueueTask(\'%s\')", info);
    }

    public static String onGetStringForBuffer(String string) {
        return String.format("onGetStringForBuffer(\'%s\')", string);
    }

    /**
     * @param buffer [1, 2, 3]
     */
    public static String onGetBufferForString(String buffer) {
        return String.format("onGetBufferForString(\'%s\')", buffer);
    }

    /**
     *
     * @param info: {"connected":true}
     */
    public static String onMeshBLEDeviceConnectionChanged(String info) {
        return String.format("onMeshBLEDeviceConnectionChanged(\'%s\')", info);
    }
}
