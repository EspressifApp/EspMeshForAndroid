package iot.espressif.esp32.constants;

public final class DeviceConstants {
    public static final String KEY_DEVICE = "device";
    public static final String KEY_DEVICE_BSSID = "device_bssid";
    public static final String KEY_DEBUG = "device_debug";

    public static final String KEY_REPORT_CHECK = "ota_report_check";
    public static final String KEY_REPORT_POST = "ota_report_post";
    public static final String KEY_REPORT_TOTAL = "ota_report_total";
    public static final String KEY_REPORT_SUC_MACS = "ota_report_suc_macs";
    public static final String KEY_REPORT_FAIL_MACS = "ota_report_fail_macs";

    public static final String KEY_OTA_BIN = "ota_bin";
    public static final String KEY_OTA_DEVICES = "ota_devices";

    public static final String ACTION_DEVICE_STATUS_CHANGED = "action_device_status_changed";
    public static final String ACTION_OTA_STATUS_CHANGED = "action_ota_status_changed";
    public static final String KEY_DEVICE_MACS = "device_macs";

    public static final int CID_DEVICE_TIME = 10;
    public static final int CID_SNIFFER = 11;
    public static final int CID_RSSI_PARENT = 20;
    public static final int CID_RSSI_SELF = 21;
    public static final int CID_CAPACITY = 26;

    public static final int PORT_HTTP_DEFAULT = 80;
    public static final int PORT_HTTPS_DEFAULT = 443;

    public static final int TID_UNKNOW = 0;

    public static final int TID_LIGHT_BTC = 0x0001; // Brightness, Color Temperature, Color
    public static final int BTC_BRIGHTNESS_MAX = 100;
    public static final int CID_SWITCH = 0;
    public static final int CID_HUE = 1;
    public static final int CID_SATURATION = 2;
    public static final int CID_VALUE = 3;
    public static final int CID_LIGHT_BRIGHTNESS = 5;
    public static final int CID_COLOR_TEMPERATURE = 4;
    public static final int SWITCH_ON = 1;
    public static final int SWITCH_OFF = 0;

    public static final String[] ESPNOW_TYPES = new String[]{
            "DEBUG_LOG",
            "DEBUG_COREDUMP",
            "DEBUG_CONFIG",
            "DEBUG_ACK",
            "DEBUG_LIGHT",
    };
    public static final int[] ESPNOW_TYPE_VALUES = {
            0,
            1,
            2,
            3,
            10
    };
    public static final String[] ESPNOW_OPRTS = new String[]{
            "CONFIG_LOG",
            "CONFIG_DEST",
            "CONFIG_ALL",
    };
    public static final String[] ESPNOW_PARAMSES = new String[]{
            "LOG_NONE",
            "LOG_ERROR",
            "LOG_WARN",
            "LOG_INFO",
            "LOG_DEBUG",
            "LOG_VERBOSE",
            "LOG_RESTORE",
    };

    public static final String MAC_BROADCAST = "ffffffffffff";
}
