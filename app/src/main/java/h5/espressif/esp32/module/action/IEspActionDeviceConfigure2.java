package h5.espressif.esp32.module.action;

import iot.espressif.esp32.action.device.IEspActionDeviceConfigure;

public interface IEspActionDeviceConfigure2 extends IEspActionDeviceConfigure {

    int PROGRESS_IDLE = 0;
    int PROGRESS_START = 5;
    int PROGRESS_BLE_CONNECTED = 10;
    int PROGRESS_SERVICE_DISCOVER = 15;
    int PROGRESS_CHAR_DISCOVER = 20;
    int PROGRESS_MTU = 25;
    int PROGRESS_SECURITY = 40;
    int PROGRESS_CONFIGURE = 60;
    int PROGRESS_DEVICE_CONNECTED = 70;
    int PROGRESS_FAILED = 99;
    int PROGRESS_COMPLETE = 100;

    int PROGRESS_ALI_DISCOVERING = 72;
    int PROGRESS_ALI_DEVICE_BINDING = 90;
    int PROGRESS_ALI_ALL_DEVICE_BOUND = 98;

    // App normal code, range is [300 .. 399]
    int CODE_SUC = 300;
    int CODE_IDLE = 399;
    int CODE_SUC_DISCONNECT = 398;
    int CODE_NORMAL_START = 301;
    int CODE_NORMAL_SCANNED = 302;
    int CODE_NORMAL_CONNECTED = 303;
    int CODE_NORMAL_SERVICE_GOT = 304;
    int CODE_NORMAL_CHAR_GOT = 305;
    int CODE_NORMAL_SECURITY = 306;
    int CODE_NORMAL_RECEIVE_WIFI = 307;
    int CODE_NORMAL_CONFIGURE_POSTED = 308;
    int CODE_NORMAL_MTU_CHANGED = 309;

    int CODE_NORMAL_ALI_DISCOVERING = 330;
    int CODE_NORMAL_ALI_DEVICE_BINDING = 331;
    int CODE_NORMAL_ALI_DEVICE_BOUND = 332;

    // Mesh error code, range is [0 .. 255]
    int CODE_ERR_WIFI_PASSWORD = 0x10;
    int CODE_ERR_AP_NOT_FOUND = 0x11;
    int CODE_ERR_AP_FORBID = 0x12;
    int CODE_ERR_CONFIGURE = 0x13;

    // App error code, range is [9000 .. 9999]
    int CODE_ERR_BLE_SCAN = 9002;
    int CODE_ERR_BLE_CONN = 9003;
    int CODE_ERR_GATT_SERVICE = 9004;
    int CODE_ERR_GATT_WRITE = 9005;
    int CODE_ERR_GATT_NOTIFICATION = 9006;
    int CODE_ERR_SECURITY = 9010;
    int CODE_ERR_CONF_RECV_WIFI = 9020;
    int CODE_ERR_CONF_POST = 9022;
    int CODE_ERR_SSID = 9030;
    int CODE_ERR_WHITE_LIST = 9031;
    int CODE_ERR_EXCEPTION = 9040;

    int CODE_ERR_ALI_DISCOVERING = 9330;
    int CODE_ERR_ALI_DEVICE_BOUND = 9332;

    interface ProgressCallback {
        void onUpdate(int progress, int status, String message);
    }
}
