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
    public boolean isBluetoothEnable() {
        return mImpl.isBluetoothEnable();
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
    public String getAppInfo() {
        return mImpl.getAppInfo();
    }

    @JavascriptInterface
    public String getUpgradeFiles() {
        return mImpl.getUpgradeFiles();
    }

    @JavascriptInterface
    public void registerWifiChange() {
        mImpl.registerWifiChange();
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
        "password":"password",
        "white_list":["aabbccddeeff", "112233445566"],
        "mesh_id":[1,2,3,4,5,6],

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
        "address":["192.168.1.110"]
    }
     */
    @JavascriptInterface
    public void stopOTA(String request) {
        mImpl.stopOTA(request);
    }

    @JavascriptInterface
    public void otaReboot(String macs) {
        mImpl.otaReboot(macs);
    }

    @JavascriptInterface
    public void reboot(String macs) {
        mImpl.reboot(macs);
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

    @JavascriptInterface
    public String loadSniffers(long minTime, long maxTime, boolean delDuplicate) {
        return mImpl.loadSniffers(minTime, maxTime, delDuplicate);
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
    public String downloadLatestRom() {
        return mImpl.downloadLatestRom();
    }

    @JavascriptInterface
    void checkLatestApk() {
        mImpl.checkLatestApk();
    }

    /*
    {
        "name":"mesh.apk"
        "version":40
    }
     */
    @JavascriptInterface
    void downloadApkAndInstall(String request) {
        mImpl.downloadApkAndInstall(request);
    }

    @JavascriptInterface
    public boolean addQueueTask(String methodName) {
        return mImpl.addQueueTask(methodName);
    }

    @JavascriptInterface
    public boolean addQueueTask(String methodName, String argument) {
        return mImpl.addQueueTask(methodName, argument);
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
    public String loadAPs() {
        return mImpl.loadAPs();
    }

    @JavascriptInterface
    public void saveDeviceTable(String table) {
        mImpl.saveDeviceTable(table);
    }

    @JavascriptInterface
    public String loadDeviceTable() {
        return mImpl.loadDeviceTable();
    }

    @JavascriptInterface
    public void saveTableDevices(String devices) {
        mImpl.saveTableDevices(devices);
    }

    @JavascriptInterface
    public String loadTableDevices() {
        return mImpl.loadTableDevices();
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
    public String loadGroups() {
        return mImpl.loadGroups();
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

    @JavascriptInterface
    public void saveDeviceEventsPosition(String mac, String events, String position) {
        mImpl.saveDeviceEventsPosition(mac, events, position);
    }

    @JavascriptInterface
    public String loadDeviceEventsPositioin(String mac) {
        return mImpl.loadDeviceEventsPositioin(mac);
    }

    @JavascriptInterface
    public String loadAllDeviceEventsPosition() {
        return mImpl.loadAllDeviceEventsPosition();
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
    public String loadHWDevices() {
        return mImpl.loadHWDevices();
    }

    @JavascriptInterface
    public void saveHWDevice(String mac, String code, String floor, String area) {
        mImpl.saveHWDevice(mac, code, floor, area);
    }

    @JavascriptInterface
    public void saveHWDevices(String arrayStr) {
        mImpl.saveHWDevices(arrayStr);
    }

    @JavascriptInterface
    public void deleteHWDevice(String mac) {
        mImpl.deleteHWDevice(mac);
    }

    @JavascriptInterface
    public void deleteHWDevices(String macArray) {
        mImpl.deleteHWDevices(macArray);
    }

    @JavascriptInterface
    public String loadMeshIds() {
        return mImpl.loadMeshIds();
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
    public String loadLastMeshId() {
        return mImpl.loadLastMeshId();
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
    public String loadMacs() {
        return mImpl.loadMacs();
    }

    @JavascriptInterface
    public void savePrefKV(String fileName, String key, String name) {
        mImpl.savePrefKV(fileName, key, name);
    }

    @JavascriptInterface
    public void savePrefKVMap(String fileName, String kvMap) {
        mImpl.savePrefKVMap(fileName, kvMap);
    }

    @JavascriptInterface
    public void removePrefK(String fileName, String key) {
        mImpl.removePrefK(fileName, key);
    }

    @JavascriptInterface
    public void removePrefKArray(String fileName, String kArray) {
        mImpl.removePrefKArray(fileName, kArray);
    }

    @JavascriptInterface
    public String loadPrefV(String fileName, String key) {
        return mImpl.loadPrefV(fileName, key);
    }

    @JavascriptInterface
    public String loadPrefAllV(String fileName) {
        return mImpl.loadPrefAllV(fileName);
    }
}
