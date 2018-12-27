package iot.espressif.esp32.action.device;

import iot.espressif.esp32.action.IEspAction;

public interface IEspActionDevice extends IEspAction {
    String KEY_REQUEST = "request";
    String KEY_STATUS_CODE = "status_code";
    String KEY_REQUIRE_RESP = "require_resp";
    String KEY_DELAY = "delay";
    String KEY_MAC = "mac";
    String KEY_PARENT_MAC = "parent_mac";
    String KEY_ROOT_MAC = "root_mac";
    String KEY_STATE = "state";
    String KEY_LAYER = "layer";
    String KEY_IP = "ip";
    String KEY_IDF_VERSION = "idf_version";
    String KEY_MDF_VERSION = "mdf_version";
    String KEY_MLINK_VERSION = "mlink_version";

    String HEADER_MESH_LAYER = "Mesh-Layer";
    String HEADER_NODE_COUNT = "Mesh-Node-Num";
    String HEADER_NODE_MAC = "Mesh-Node-Mac";
    String HEADER_PARENT_MAC = "Mesh-Parent-Mac";
    String HEADER_MESH_ID = "Mesh-Id";
    String HEADER_GROUP_MAC = "Mesh-Group-Mac";

    int DELAY_DEFAULT = 2000;

    int STATUS_CODE_SUC = 0;
}
