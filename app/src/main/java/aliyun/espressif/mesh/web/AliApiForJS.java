package aliyun.espressif.mesh.web;

import android.content.Context;
import android.webkit.JavascriptInterface;

public class AliApiForJS {
    public static final String NAME = "aliyun";

    private AliApiForJSImpl mImpl;

    public AliApiForJS(Context context, JSEvaluate evaluate) {
        mImpl = new AliApiForJSImpl(context, evaluate);
    }

    public interface JSEvaluate {
        void evaluateJavascript(String script);
    }

    public void release() {
        mImpl.release();
    }

    @JavascriptInterface
    public void aliUserLogin() {
        mImpl.aliUserLogin();
    }

    @JavascriptInterface
    public void aliUserLogout() {
        mImpl.aliUserLogout();
    }

    @JavascriptInterface
    public void isAliUserLogin() {
        mImpl.isAliUserLogin();
    }

    @JavascriptInterface
    public void getAliUserInfo() {
        mImpl.getAliUserInfo();
    }

    @JavascriptInterface
    public void startConfig(String request) {
        mImpl.startConfig(request);
    }

    @JavascriptInterface
    public void stopConfig() {
        mImpl.stopConfig();
    }

    @JavascriptInterface
    public void getAliDeviceList() {
        mImpl.getAliDeviceList();
    }

    @JavascriptInterface
    public void aliStartDiscovery() {
        mImpl.aliStartDiscovery();
    }

    @JavascriptInterface
    public void aliStopDiscovery() {
        mImpl.aliStopDiscovery();
    }

    @JavascriptInterface
    public void aliDeviceBinding(String request) {
        mImpl.aliDeviceBinding(request);
    }

    @JavascriptInterface
    public void aliDeviceUnbindRequest(String request) {
        mImpl.aliDeviceUnbindRequest(request);
    }

    @JavascriptInterface
    public void getAliDeviceStatus(String request) {
        mImpl.getAliDeviceStatus(request);
    }

    @JavascriptInterface
    public void getAliDeviceProperties(String request) {
        mImpl.getAliDeviceProperties(request);
    }

    @JavascriptInterface
    public void setAliDeviceProperties(String request) {
        mImpl.setAliDeviceProperties(request);
    }

    @JavascriptInterface
    public void getAliOTAUpgradeDeviceList() {
        mImpl.getAliOTAUpgradeDeviceList();
    }

    @JavascriptInterface
    public void aliUpgradeWifiDevice(String request) {
        mImpl.aliUpgradeWifiDevice(request);
    }

    @JavascriptInterface
    public void aliQueryDeviceUpgradeStatus(String request) {
        mImpl.aliQueryDeviceUpgradeStatus(request);
    }

    @JavascriptInterface
    public void getAliOTAIsUpgradingDeviceList() {
        mImpl.getAliOTAIsUpgradingDeviceList();
    }
}
