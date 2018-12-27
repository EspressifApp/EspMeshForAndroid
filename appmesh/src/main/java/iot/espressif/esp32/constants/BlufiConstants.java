package iot.espressif.esp32.constants;

public final class BlufiConstants {
    public static final String BLUFI_PREFIX = "MESH";

    public static final String KEY_CONFIGURE_DEVICE = "configure_device";
    public static final String KEY_CONFIGURE_PARAM = "configure_param";
    public static final String KEY_CONFIGURE_WHITE_LIST = "configure_white_list";
    public static final String KEY_CONFIGURE_VERSION = "configure_version";

    public static final int DEFAULT_MTU_LENGTH = 128;
    public static final int MIN_MTU_LENGTH = 30;

    public static final String PREF_MESH_IDS_NAME = "espblufi_mesh_ids";
    public static final String KEY_PREV_MESH_ID = "prev_mesh_id";
}
