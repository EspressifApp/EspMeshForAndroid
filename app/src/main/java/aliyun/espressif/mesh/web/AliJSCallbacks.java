package aliyun.espressif.mesh.web;

public class AliJSCallbacks {
    private static String getCallbackScript(String method, String param) {
        return String.format("%s(\'%s\')", method, param);
    }

    public static String onAliUserLogin(String info) {
        return getCallbackScript("onAliUserLogin", info);
    }

    public static String onIsAliUserLogin(String info) {
        return getCallbackScript("onIsAliUserLogin", info);
    }

    public static String onGetAliUserInfo(String info) {
        return getCallbackScript("onGetAliUserInfo", info);
    }

    public static String onGetAliDeviceList(String info) {
        return getCallbackScript("onGetAliDeviceList", info);
    }

    public static String onAliStartDiscovery(String info) {
        return getCallbackScript("onAliStartDiscovery", info);
    }

    public static String onAliDeviceBind(String info) {
        return getCallbackScript("onAliDeviceBind", info);
    }

    public static String onAliDeviceUnbind(String info) {
        return getCallbackScript("onAliDeviceUnbind", info);
    }

    public static String onGetAliDeviceStatus(String info) {
        return getCallbackScript("onGetAliDeviceStatus", info);
    }

    public static String onGetAliDeviceProperties(String info) {
        return getCallbackScript("onGetAliDeviceProperties", info);
    }

    public static String onSetAliDeviceProperties(String info) {
        return getCallbackScript("onSetAliDeviceProperties", info);
    }

    public static String onGetAliOTAUpgradeDeviceList(String info) {
        return getCallbackScript("onGetAliOTAUpgradeDeviceList", info);
    }

    public static String onAliUpgradeWifiDevice(String info) {
        return getCallbackScript("onAliUpgradeWifiDevice", info);
    }

    public static String onAliQueryDeviceUpgradeStatus(String info) {
        return getCallbackScript("onAliQueryDeviceUpgradeStatus", info);
    }

    public static String onGetAliOTAIsUpgradingDeviceList(String info) {
        return getCallbackScript("onGetAliOTAIsUpgradingDeviceList", info);
    }

    public static String onAliUserBindTaobaoId(String info) {
        return getCallbackScript("onAliUserBindTaobaoId", info);
    }

    public static String onAliUserUnbindId(String info) {
        return getCallbackScript("onAliUserUnbindId", info);
    }

    public static String onGetAliUserId(String info) {
        return getCallbackScript("onGetAliUserId", info);
    }
}
