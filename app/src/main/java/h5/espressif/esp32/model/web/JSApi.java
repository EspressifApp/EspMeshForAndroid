package h5.espressif.esp32.model.web;

import java.util.Locale;

public class JSApi {

    public static String onSniffersDiscovered(String sniffers) {
        return String.format(Locale.ENGLISH, "onSniffersDiscovered(\'%s\')", sniffers);
    }

    public static String onDevicesChanged(String devices) {
        return String.format(Locale.ENGLISH, "onDevicesChanged(\'%s\')", devices);
    }

    public static String onDeviceFound(String device) {
        return String.format(Locale.ENGLISH, "onDeviceFound(\'%s\')", device);
    }

    public static String onDeviceLost(String mac) {
        return String.format(Locale.ENGLISH, "onDeviceLost(\'%s\')", mac);
    }

    public static String onDeviceStatusChanged(String status) {
        return String.format(Locale.ENGLISH, "onDeviceStatusChanged(\'%s\')", status);
    }

    public static String onUserLogin(String info) {
        return String.format(Locale.ENGLISH, "onUserLogin(\'%s\')", info);
    }

    public static String onOTAProgressChanged(String info) {
        return String.format(Locale.ENGLISH, "onOTAProgressChanged(\'%s\')", info);
    }

    public static String onOTAResult(String result) {
        return String.format(Locale.ENGLISH, "onOTAResult(\'%s\')", result);
    }

    public static String onBackPressed() {
        return "onBackPressed()";
    }

    public static String onWifiStateChanged(String info) {
        return String.format(Locale.ENGLISH, "onWifiStateChanged(\'%s\')", info);
    }

    public static String onBluetoothChanged(String info) {
        return String.format(Locale.ENGLISH, "onBluetoothStateChanged(\'%s\')", info);
    }

    public static String onScanBLE(String bles) {
        return String.format(Locale.ENGLISH, "onScanBLE(\'%s\')", bles);
    }

    public static String onConfigureProgress(String info) {
        return String.format(Locale.ENGLISH, "onConfigureProgress(\'%s\')", info);
    }

    public static String onDeviceScanned(String devices) {
        return String.format(Locale.ENGLISH, "onDeviceScanned(\'%s\')", devices);
    }

    public static String onDeviceScanning(String devices) {
        return String.format(Locale.ENGLISH, "onDeviceScanning(\'%s\')", devices);
    }

    public static String onTopoScanned(String topo) {
        return String.format(Locale.ENGLISH, "onTopoScanned(\'%s\')", topo);
    }

    public static String onQRCodeScanned(String qrCode) {
        return String.format(Locale.ENGLISH, "onQRCodeScanned(\'%s\')", qrCode);
    }

    public static String onCheckLatestApk(String info) {
        return String.format(Locale.ENGLISH, "onCheckLatestApk(\'%s\')", info);
    }

    public static String onApkDownloading(String info) {
        return String.format(Locale.ENGLISH, "onApkDownloading(\'%s\')", info);
    }

    public static String onApkDownloadResult(String info) {
        return String.format(Locale.ENGLISH, "onApkDownloadResult(\'%s\')", info);
    }
}
