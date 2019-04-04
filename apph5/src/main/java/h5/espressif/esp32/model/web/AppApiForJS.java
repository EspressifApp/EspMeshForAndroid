package h5.espressif.esp32.model.web;

import android.os.Build;
import android.webkit.JavascriptInterface;

import h5.espressif.esp32.main.EspWebActivity;

public class AppApiForJS {
    public static final String NAME = "espmesh";

    private AppApiForJSImpl mImpl;

    public AppApiForJS(EspWebActivity activity) {
        mImpl = new AppApiForJSImpl(activity, this);
    }

    public void release() {
        mImpl.release();
    }

    @JavascriptInterface
    public void log(String msg) {
        mImpl.log(msg);
    }

    @JavascriptInterface
    public void hideCoverImage() {
        mImpl.hideCoverImage();
    }

    @JavascriptInterface
    public void finish() {
        mImpl.finish();
    }

    @JavascriptInterface
    public boolean isLocationEnable() {
        return mImpl.isLocationEnable();
    }

    @JavascriptInterface
    public int getSDKInt() {
        return Build.VERSION.SDK_INT;
    }

    @JavascriptInterface
    public void getLocale() {
        mImpl.getLocale();
    }

    /**
     * @return like {"version_name":"0.9.0", "version_code":20}
     */
    @JavascriptInterface
    public void getAppInfo() {
        mImpl.getAppInfo();
    }

    @JavascriptInterface
    public void getUpgradeFiles() {
        mImpl.getUpgradeFiles();
    }

    @JavascriptInterface
    public void registerPhoneStateChange() {
        mImpl.registerPhoneStateChange();
    }

    @JavascriptInterface
    public void startBleScan() {
        mImpl.startBleScan();
    }

    @JavascriptInterface
    public void stopBleScan() {
        mImpl.stopBleScan();
    }

    @JavascriptInterface
    public void clearBleCache() {
        mImpl.clearBleCache();
    }

    @JavascriptInterface
    public String getBleMacsForStaMacs(String staMacs) {
        return mImpl.getBleMacsForStaMacs(staMacs);
    }

    @JavascriptInterface
    public String getStaMacsForBleMacs(String bleMacs) {
        return mImpl.getStaMacsForBleMacs(bleMacs);
    }

    /*
    {
        "ble_addr":"aabbccddeeff",
        "version":0, // -1 is old version, 0 or greater is new version

        "ssid":"ssid",
        "bssid":"AB:CD:EF:12:34:56",
        "password":"password",
        "white_list":["aabbccddeeff", "112233445566"],
        "mesh_id":[1,2,3,4,5,6],
        "mesh_type":0,

        "vote_percentage":1,
        "vote_max_count":1,
        "backoff_rssi":-1,
        "scan_min_count":1,
        "scan_fail_count":1,
        "monitor_ie_count":1,
        "root_healing_ms":1,
        "root_conflicts_enable":true,
        "fix_root_enable":true,
        "capacity_num":1,
        "max_layer":1,
        "max_connection":1,
        "assoc_expire_ms":1,
        "beacon_interval_ms":1,
        "passive_scan_ms":1,
        "monitor_duration_ms":1,
        "cnx_rssi":-1,
        "select_rssi":-1,
        "switch_rssi":-1,
        "xon_qsize":1,
        "retransmit_enable":true,
        "data_drop_enable":true
    }
     */
    @JavascriptInterface
    public void startConfigureBlufi(String request) {
        mImpl.startConfigureBlufi(request);
    }

    @JavascriptInterface
    public void stopConfigureBlufi() {
        mImpl.stopConfigureBlufi();
    }

    @JavascriptInterface
    public void scanTopo() {
        mImpl.scanTopo();
    }

    /*
   {
       "bin":"path or url",
       "macs":["112233445566", "aabbccddeeff"],
       "type":1   // 1 is tcp post, 2 is http post, 3 is device download
   }
    */
    @JavascriptInterface
    public void startOTA(String request) {
        mImpl.startOTA(request);
    }

    @JavascriptInterface
    public void stopOTA() {
        mImpl.stopOTA();
    }

    /*
    {
        "host":["192.168.1.110"]
    }
     */
    @JavascriptInterface
    public void stopOTA(String request) {
        mImpl.stopOTA(request);
    }

    /**
     * @param info:
    {
        "host":"192.168.1.111",
        "macs":["aabbccddeeff", "112233445566"]
    }
     */
    @JavascriptInterface
    public void otaReboot(String info) {
        mImpl.otaReboot(info);
    }
    /**
     * @param info:
    {
        "host":"192.168.1.111",
        "macs":["aabbccddeeff", "112233445566"]
    }
     */
    @JavascriptInterface
    public void reboot(String info) {
        mImpl.reboot(info);
    }

    @JavascriptInterface
    public void scanQRCode() {
        mImpl.scanQRCode();
    }

    @JavascriptInterface
    public void startScanSniffer() {
        mImpl.startScanSniffer();
    }

    @JavascriptInterface
    public void stopScanSniffer() {
        mImpl.stopScanSniffer();
    }

    /**
     * @param request:
    {
        "min_time":10000, // UTC time
        "max_time":20000, // UTC time
        "del_duplicate":true,
        "callback":"js_method"
    }
     */
    @JavascriptInterface
    public void loadSniffers(String request) {
        mImpl.loadSniffers(request);
    }

    @JavascriptInterface
    public String userLogin(String email, String password) {
        return mImpl.userLogin(email, password);
    }

    @JavascriptInterface
    public String userGuestLogin() {
        return mImpl.userGuestLogin();
    }

    @JavascriptInterface
    public String userLoadLastLogged() {
        return mImpl.userLoadLastLogged();
    }

    @JavascriptInterface
    public void userLogout() {
        mImpl.userLogout();
    }

    @JavascriptInterface
    public String userRegister(String email, String username, String password) {
        return mImpl.userRegister(email, username, password);
    }

    @JavascriptInterface
    public String userResetPassword(String email) {
        return mImpl.userResetPassword(email);
    }

    @JavascriptInterface
    public void downloadLatestRom() {
        mImpl.downloadLatestRom();
    }

    @JavascriptInterface
    public void checkAppVersion() {
        mImpl.checkLatestApk();
    }

    /*
    {
        "name":"mesh.apk"
        "version":40
    }
     */
    @JavascriptInterface
    public void appVersionUpdate(String request) {
        mImpl.downloadApkAndInstall(request);
    }

    /**
     * @param request:
    {
        "method":"method_name",
        "argument":"argument"
    }
     */
    @JavascriptInterface
    public void addQueueTask(String request) {
        mImpl.addQueueTask(request);
    }

    @JavascriptInterface
    public void scanDevicesAsync() {
        mImpl.scanDevicesAsync();
    }

    /**
    @param request:
    {
        "mac":"aabbccddeeff",
        "no_response":false, // Not requirement
        "callback":"onCallbak", // Not requirement
        "tag":"tag", // Not requirement, callback tag
        ... // request content
    }
     */
    @JavascriptInterface
    public void requestDeviceAsync(String request) {
        mImpl.requestDeviceAsync(request);
    }

    /**
    @param request:
    {
        "mac":["aabbccddeeff", "112233445566"],
        "root_response":false, // Not requirement
        "callback":"onCallbak", // Not requirement
        "tag":"tag", // Not requirement, callback tag
        ... // request content
    }
     */
    @JavascriptInterface
    public void requestDevicesMulticastAsync(String request) {
        mImpl.requestDevicesMulticastAsync(request);
    }

    @JavascriptInterface
    public String loadDevice(String fileName, String mac) {
        return mImpl.loadDevice(fileName, mac);
    }

    @JavascriptInterface
    public String loadDevices(String fileName) {
        return mImpl.loadDevices(fileName);
    }

    @JavascriptInterface
    public boolean saveDevice(String fileName, String info) {
        return mImpl.saveDevice(fileName, info);
    }

    @JavascriptInterface
    public boolean saveDevices(String fileName, String info) {
        return mImpl.saveDevices(fileName, info);
    }

    @JavascriptInterface
    public void removeDevice(String fileName, String mac) {
        mImpl.removeDevice(fileName, mac);
    }

    @JavascriptInterface
    public boolean removeDevices(String fileName, String macs) {
        return mImpl.removeDevices(fileName, macs);
    }

    @JavascriptInterface
    public void removeAllDevices(String fileName) {
        mImpl.removeAllDevices(fileName);
    }

    @JavascriptInterface
    public void loadAPs() {
        mImpl.loadAPs();
    }

    @JavascriptInterface
    public void saveDeviceTable(String table) {
        mImpl.saveDeviceTable(table);
    }

    @JavascriptInterface
    public void loadDeviceTable() {
        mImpl.loadDeviceTable();
    }

    @JavascriptInterface
    public void saveTableDevices(String devices) {
        mImpl.saveTableDevices(devices);
    }

    @JavascriptInterface
    public void loadTableDevices() {
        mImpl.loadTableDevices();
    }

    @JavascriptInterface
    public String loadTableDevices(String macs) {
        return mImpl.loadTableDevices(macs);
    }

    @JavascriptInterface
    public String loadTableDevice(String mac) {
        return mImpl.loadTableDevice(mac);
    }

    @JavascriptInterface
    public void removeAllTableDevices() {
        mImpl.removeAllTableDevices();
    }

    @JavascriptInterface
    public void removeTableDevices(String devices) {
        mImpl.removeTableDevices(devices);
    }

    @JavascriptInterface
    public String saveGroup(String groupJSON) {
        return mImpl.saveGroup(groupJSON);
    }

    @JavascriptInterface
    public void saveGroups(String array) {
         mImpl.saveGroups(array);
    }

    @JavascriptInterface
    public void loadGroups() {
        mImpl.loadGroups();
    }

    @JavascriptInterface
    public void deleteGroup(String groupId) {
        mImpl.deleteGroup(groupId);
    }

    @JavascriptInterface
    public void saveOperation(String type, String identity) {
        mImpl.saveOperation(type, identity);
    }

    @JavascriptInterface
    public String loadLastOperations(String count) {
        return mImpl.loadLastOperations(count);
    }

    @JavascriptInterface
    public void deleteUntilLeftOperations(String leftCount) {
        mImpl.deleteUntilLeftOperations(leftCount);
    }

    @JavascriptInterface
    public long saveScene(String name, String icon, String background) {
        return mImpl.saveScene(name, icon, background);
    }

    @JavascriptInterface
    public long saveScene(long id, String name, String icon, String background) {
        return mImpl.saveScene(id, name, icon, background);
    }

    @JavascriptInterface
    public String loadScenes() {
        return mImpl.loadScenes();
    }

    @JavascriptInterface
    public void deleteScene(long id) {
        mImpl.deleteScene(id);
    }

    /**
     * @param request:
     {
        "mac":"aabbccddeeff",
        "events":"events",
        "position":"position"
     }
     */
    @JavascriptInterface
    public void saveDeviceEventsPosition(String request) {
        mImpl.saveDeviceEventsPosition(request);
    }

    /**
     * @param request:
    {
        "mac":"aabbccddeeff",
        "callback":"js_method",
        "tag":"tag"
    }
     */
    @JavascriptInterface
    public void loadDeviceEventsPositioin(String request) {
        mImpl.loadDeviceEventsPositioin(request);
    }

    /**
     * @param request:
    {
    "callback":"js_method",
    "tag":"tag"
    }
     */
    @JavascriptInterface
    public void loadAllDeviceEventsPosition(String request) {
        mImpl.loadAllDeviceEventsPosition(request);
    }

    @JavascriptInterface
    public void deleteDeviceEventsPosition(String mac) {
        mImpl.deleteDeviceEventsPosition(mac);
    }

    @JavascriptInterface
    public void deleteAllDeviceEventsPosition() {
        mImpl.deleteAllDeviceEventsPosition();
    }

    @JavascriptInterface
    public void removeDeviceForMac(String mac) {
        mImpl.removeDeviceForMac(mac);
    }

    @JavascriptInterface
    public void removeDevicesForMacs(String macArray) {
        mImpl.removeDevicesForMacs(macArray);
    }

    @JavascriptInterface
    public void loadHWDevices() {
        mImpl.loadHWDevices();
    }

    @JavascriptInterface
    public void saveHWDevices(String request) {
        mImpl.saveHWDevices(request);
    }

    @JavascriptInterface
    public void deleteHWDevices(String macArray) {
        mImpl.deleteHWDevices(macArray);
    }

    @JavascriptInterface
    public void loadMeshIds() {
        mImpl.loadMeshIds();
    }

    @JavascriptInterface
    public void saveMeshId(String meshId) {
        mImpl.saveMeshId(meshId);
    }

    @JavascriptInterface
    public void deleteMeshId(String meshId) {
        mImpl.deleteMeshId(meshId);
    }

    @JavascriptInterface
    public void saveMac(String mac) {
        mImpl.saveMac(mac);
    }

    @JavascriptInterface
    public void deleteMac(String mac) {
        mImpl.deleteMac(mac);
    }

    @JavascriptInterface
    public void deleteMacs(String macArray) {
        mImpl.deleteMacs(macArray);
    }

    @JavascriptInterface
    public void loadMacs() {
        mImpl.loadMacs();
    }

    /**
     * @param request:
    {
        "name":"fileName",
        "content":[
            {"key":"key1", "value":"value1"},
            {"key":"key2", "value":"value2"},
            ...
        ]
    }
     */
    @JavascriptInterface
    public void saveValuesForKeysInFile(String request) {
        mImpl.saveValuesForKeysInFile(request);
    }

    /**
     *
     * @param request:
    {
        "name":"fileName",
        "keys":["key1", "key2", ...]
    }
     */
    @JavascriptInterface
    public void removeValuesForKeysInFile(String request) {
        mImpl.removeValuesForKeysInFile(request);
    }

    /**
     *
     * @param request:
    {
        "name":"fileName",
        "key":"key"
    }
     */
    @JavascriptInterface
    public void loadValueForKeyInFile(String request) {
        mImpl.loadValueForKeyInFile(request);
    }

    /**
     * @param fileName
     */
    @JavascriptInterface
    public void loadAllValuesInFile(String fileName) {
        mImpl.loadAllValuesInFile(fileName);
    }

    @JavascriptInterface
    public void closeDeviceLongSocket(String host) {
        mImpl.closeDeviceLongSocket(host);
    }

    /**
     * @param request:
    {
        "host":"192.168.1.111",
        "macs":["112233445566", "aabbcccddeeff"],
        ...
    }
     */
    @JavascriptInterface
    public void requestDeviceLongSocket(String request) {
        mImpl.requestDeviceLongSocket(request);
    }
}
