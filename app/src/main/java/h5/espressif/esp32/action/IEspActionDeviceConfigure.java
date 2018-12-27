package h5.espressif.esp32.action;

import java.util.UUID;

public interface IEspActionDeviceConfigure {
    UUID UUID_WIFI_SERVICE = UUID.fromString("0000ffff-0000-1000-8000-00805f9b34fb");
    UUID UUID_WRITE_CHARACTERISTIC = UUID.fromString("0000ff01-0000-1000-8000-00805f9b34fb");
    UUID UUID_NOTIFICATION_CHARACTERISTIC = UUID.fromString("0000ff02-0000-1000-8000-00805f9b34fb");


    String PREFIX_BLUFI = "MESH";

    String KEY_CODE = "code";
    String KEY_MESSAGE = "message";

    int PROGRESS_IDEA = 0;
    int PROGRESS_START = 5;
    int PROGRESS_BLE_CONNECTED = 10;
    int PROGRESS_SERVICE_DISCOVER = 15;
    int PROGRESS_CHAR_DISCOVER = 20;
    int PROGRESS_SECURITY = 50;
    int PROGRESS_CONFIGURE = 90;
    int PROGRESS_FAILED = 99;
    int PROGRESS_COMPLETE = 100;

    int CODE_SUC = 200;

    int CODE_PROGRESS_START = 100;
    int CODE_PROGRESS_SCAN = 101;
    int CODE_PROGRESS_CONNECT = 102;
    int CODE_PROGRESS_SERVICE = 103;
    int CODE_PROGRESS_CHAR = 104;
    int CODE_PROGRESS_SECURITY = 105;
    int CODE_PROGRESS_CONFIGURE = 106;
    int CODE_PROGRESS_RECEIVE_WIFI = 107;

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
    int CODE_ERR_WIFI_CONN = 1;
    int CODE_ERR_WIFI_PASSWORD = 2;

    interface ProgressCallback {
        void onUpdate(int progress, int status, String message);
    }
}
