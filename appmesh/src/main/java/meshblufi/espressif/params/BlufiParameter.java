package meshblufi.espressif.params;

public interface BlufiParameter {
    int OP_MODE_NULL = 0x00;
    int OP_MODE_STA = 0x01;
    int OP_MODE_SOFTAP = 0x02;
    int OP_MODE_STASOFTAP = 0x03;

    int SOFTAP_SECURITY_OPEN = 0x00;
    int SOFTAP_SECURITY_WEP = 0x01;
    int SOFTAP_SECURITY_WPA = 0x02;
    int SOFTAP_SECURITY_WPA2 = 0x03;
    int SOFTAP_SECURITY_WPA_WPA2 = 0x04;

    int FRAME_CTRL_POSITION_ENCRYPTED = 0;
    int FRAME_CTRL_POSITION_CHECKSUM = 1;
    int FRAME_CTRL_POSITION_DATA_DIRECTION = 2;
    int FRAME_CTRL_POSITION_REQUIRE_ACK = 3;
    int FRAME_CTRL_POSITION_FRAG = 4;

    byte NEG_SET_SEC_TOTAL_LEN = 0x00;
    byte NEG_SET_SEC_ALL_DATA = 0x01;
    byte NEG_RQST_RSA_PUBLIC_KEY = 0x10;
    byte NEG_SET_RSA_PRIVATE_KEY = 0x11;

    final class Type {
        public final static class Ctrl {
            public static final int PACKAGE_VALUE = 0x00;

            public static final int SUBTYPE_ACK = 0x00;
            public static final int SUBTYPE_SET_SEC_MODE = 0x01;
            public static final int SUBTYPE_SET_OP_MODE = 0x02;
            public static final int SUBTYPE_CONNECT_WIFI = 0x03;
            public static final int SUBTYPE_DISCONNECT_WIFI = 0x04;
            public static final int SUBTYPE_GET_WIFI_STATUS = 0x05;
            public static final int SUBTYPE_DEAUTHENTICATE = 0x06;
            public static final int SUBTYPE_GET_VERSION = 0x07;
            public static final int SUBTYPE_CLOSE_CONNECTION = 0x08;
        }

        public final static class Data {
            public static final int PACKAGE_VALUE = 0x01;

            public static final int SUBTYPE_NEG = 0x00;
            public static final int SUBTYPE_STA_WIFI_BSSID = 0x01;
            public static final int SUBTYPE_STA_WIFI_SSID = 0x02;
            public static final int SUBTYPE_STA_WIFI_PASSWORD = 0x03;
            public static final int SUBTYPE_SOFTAP_WIFI_SSID = 0x04;
            public static final int SUBTYPE_SOFTAP_WIFI_PASSWORD = 0x05;
            public static final int SUBTYPE_SOFTAP_MAX_CONNECTION_COUNT = 0x06;
            public static final int SUBTYPE_SOFTAP_AUTH_MODE = 0x07;
            public static final int SUBTYPE_SOFTAP_CHANNEL = 0x08;
            public static final int SUBTYPE_USERNAME = 0x09;
            public static final int SUBTYPE_MDF_CUSTOM = 0x0a;
            public static final int SUBTYPE_CLIENT_CERTIFICATION = 0x0b;
            public static final int SUBTYPE_SERVER_CERTIFICATION = 0x0c;
            public static final int SUBTYPE_CLIENT_PRIVATE_KEY = 0x0d;
            public static final int SUBTYPE_SERVER_PRIVATE_KEY = 0x0e;
            public static final int SUBTYPE_WIFI_CONNECTION_STATE = 0x0f;
            public static final int SUBTYPE_VERSION = 0x10;
            public static final int SUBTYPE_WIFI_LIST = 0x11;
            public static final int SUBTYPE_ERROR = 0x12;
            public static final int SUBTYPE_CUSTOM_DATA = 0x13;
        }
    }

    class FrameCtrlData {
        private int mValue;

        public FrameCtrlData(int frameCtrlValue) {
            mValue = frameCtrlValue;
        }

        private boolean check(int position) {
            return ((mValue >> position) & 1) == 1;
        }

        public boolean isEncrypted() {
            return check(FRAME_CTRL_POSITION_ENCRYPTED);
        }

        public boolean isChecksum() {
            return check(FRAME_CTRL_POSITION_CHECKSUM);
        }

        public boolean requireAck() {
            return check(FRAME_CTRL_POSITION_REQUIRE_ACK);
        }

        public boolean hasFrag() {
            return check(FRAME_CTRL_POSITION_FRAG);
        }

    }

    class MeshData {
        public static final int BLUFI_DATA_CUSTOM                = 0;

        public static final int BLUFI_DATA_ROUTER_SSID           = 1;
        public static final int BLUFI_DATA_ROUTER_PASSWD         = 2;
        public static final int BLUFI_DATA_ROUTER_BSSID          = 3;
        public static final int BLUFI_DATA_MESH_ID               = 4;
        public static final int BLUFI_DATA_MESH_PASSWORD         = 5;
        public static final int BLUFI_DATA_MESH_TYPE             = 6;

        public static final int BLUFI_DATA_VOTE_PERCENTAGE       = 16;
        public static final int BLUFI_DATA_VOTE_MAX_COUNT        = 17;
        public static final int BLUFI_DATA_BACKOFF_RSSI          = 18;
        public static final int BLUFI_DATA_SCAN_MIN_COUNT        = 19;
        public static final int BLUFI_DATA_SCAN_FAIL_COUNT       = 20;
        public static final int BLUFI_DATA_MONITOR_IE_COUNT      = 21;
        public static final int BLUFI_DATA_ROOT_HEALING_MS       = 22;
        public static final int BLUFI_DATA_ROOT_CONFLICTS_ENABLE = 23;
        public static final int BLUFI_DATA_FIX_ROOT_ENALBLE      = 24;
        public static final int BLUFI_DATA_CAPACITY_NUM          = 25;
        public static final int BLUFI_DATA_MAX_LAYER             = 26;
        public static final int BLUFI_DATA_MAX_CONNECTION        = 27;
        public static final int BLUFI_DATA_ASSOC_EXPIRE_MS       = 28;
        public static final int BLUFI_DATA_BEACON_INTERVAL_MS    = 29;
        public static final int BLUFI_DATA_PASSIVE_SCAN_MS       = 30;
        public static final int BLUFI_DATA_MONITOR_DURATION_MS   = 31;
        public static final int BLUFI_DATA_CNX_RSSI              = 32;
        public static final int BLUFI_DATA_SELECT_RSSI           = 33;
        public static final int BLUFI_DATA_SWITCH_RSSI           = 34;
        public static final int BLUFI_DATA_XON_QSIZE             = 35;
        public static final int BLUFI_DATA_RETRANSMIT_ENABLE     = 36;
        public static final int BLUFI_DATA_DATA_DROP_ENABLE      = 37;

        public static final int BLUFI_DATA_WHITELIST             = 64;
    }
}
