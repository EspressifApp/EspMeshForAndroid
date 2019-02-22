package h5.espressif.esp32.action;

import java.util.UUID;

import iot.espressif.esp32.action.device.IEspActionDeviceConfigure;

public interface IEspActionDeviceConfigure2 extends IEspActionDeviceConfigure {

    String PREFIX_BLUFI = "MESH";

    int PROGRESS_IDLE = 0;
    int PROGRESS_START = 5;
    int PROGRESS_BLE_CONNECTED = 10;
    int PROGRESS_SERVICE_DISCOVER = 15;
    int PROGRESS_CHAR_DISCOVER = 20;
    int PROGRESS_SECURITY = 50;
    int PROGRESS_CONFIGURE = 90;
    int PROGRESS_FAILED = 99;
    int PROGRESS_COMPLETE = 100;

    // App normal code, range is [300 - 399]
    int CODE_SUC = 300;
    int CODE_IDLE = 399;
    int CODE_PROGRESS_START = 301;
    int CODE_PROGRESS_SCAN = 302;
    int CODE_PROGRESS_CONNECT = 303;
    int CODE_PROGRESS_SERVICE = 304;
    int CODE_PROGRESS_CHAR = 305;
    int CODE_PROGRESS_SECURITY = 306;
    int CODE_PROGRESS_CONFIGURE = 307;
    int CODE_PROGRESS_RECEIVE_WIFI = 308;

    // Mesh error code, range is [0 - 255]
    int CODE_ERR_WIFI_PASSWORD = 0x10;
    int CODE_ERR_AP_NOT_FOUND = 0x11;
    int CODE_ERR_AP_FORBID = 0x12;
    int CODE_ERR_CONFIGURE = 0x13;

    // App error code
    int CODE_ERR_BLE_SCAN = -2;
    int CODE_ERR_BLE_CONN = -3;
    int CODE_ERR_GATT_SERVICE = -4;
    int CODE_ERR_GATT_WRITE = -5;
    int CODE_ERR_GATT_NOTIFICATION = -6;
    int CODE_ERR_SECURITY = -10;
    int CODE_ERR_NEG_POST_PGK = -11;
    int CODE_ERR_NEG_RECV_K = -12;
    int CODE_ERR_NEG_SET_MODE = -13;
    int CODE_ERR_NEG_CHECK = -14;
    int CODE_ERR_NEG_GEN_K = -15;
    int CODE_ERR_CONF_RECV_WIFI = -20;
    int CODE_ERR_CONF_PARSE_WIFI = -21;
    int CODE_ERR_CONF_POST = -22;
    int CODE_ERR_SSID = -30;
    int CODE_ERR_WHITE_LIST = -31;
    int CODE_ERR_EXCEPTION = -40;

    interface ProgressCallback {
        void onUpdate(int progress, int status, String message);
    }
}
