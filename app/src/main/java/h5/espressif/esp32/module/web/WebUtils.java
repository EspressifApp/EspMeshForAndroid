package h5.espressif.esp32.module.web;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import iot.espressif.esp32.utils.DeviceUtil;
import meshblufi.espressif.params.BlufiConfigureParams;
import meshblufi.espressif.params.BlufiParameter;

public class WebUtils {

    public static class ConfigRequest {
        public String bleAddress;
        public int version;
        public BlufiConfigureParams params;
    }

    public static ConfigRequest parseConfigRequest(String request) {
        String bleAddress;
        int version;
        BlufiConfigureParams params;
        try {
            params = new BlufiConfigureParams();
            params.setOpMode(BlufiParameter.OP_MODE_STA);

            JSONObject json = new JSONObject(request);

            bleAddress = json.getString("ble_addr");
            version = json.getInt("version");

            String ssid = json.getString("ssid");
            params.setStaSSID(ssid);

            String bssid = json.optString("bssid", null);
            params.setStaBSSID(bssid);

            String password = json.getString("password");
            params.setStaPassword(password);

            JSONArray whiteListArray = json.getJSONArray("white_list");
            for (int i = 0; i < whiteListArray.length(); ++i) {
                String mac = whiteListArray.getString(i);
                params.addWhiteAddress(DeviceUtil.convertToColonBssid(mac).toUpperCase());
            }

            JSONArray meshIdArray = json.getJSONArray("mesh_id");
            byte[] meshIdData = new byte[meshIdArray.length()];
            for (int i = 0; i < meshIdData.length; ++i) {
                meshIdData[i] = (byte) meshIdArray.getInt(i);
            }
            params.setMeshID(meshIdData);

            if (!json.isNull("mesh_type")) {
                params.setMeshType(json.getInt("mesh_type"));
            }

            if (!json.isNull("mesh_password")) {
                params.setMeshPassword(json.getString("mesh_password"));
            }

            if (!json.isNull("custom_data")) {
                String customData = json.getString("custom_data");
                params.setCustomData(customData.getBytes());
            }

            if (!json.isNull("vote_percentage")) {
                params.setVotePercentage(json.getInt("vote_percentage"));
            }
            if (!json.isNull("vote_max_count")) {
                params.setVoteMaxCount(json.getInt("vote_max_count"));
            }
            if (!json.isNull("backoff_rssi")) {
                params.setBackoffRssi(json.getInt("backoff_rssi"));
            }
            if (!json.isNull("scan_min_count")) {
                params.setScanMinCount(json.getInt("scan_min_count"));
            }
            if (!json.isNull("scan_fail_count")) {
                params.setScanFailCount(json.getInt("scan_fail_count"));
            }
            if (!json.isNull("monitor_ie_count")) {
                params.setMonitorIeCount(json.getInt("monitor_ie_count"));
            }
            if (!json.isNull("root_healing_ms")) {
                params.setRootHealingMS(json.getInt("root_healing_ms"));
            }
            if (!json.isNull("root_conflicts_enable")) {
                params.setRootConflictsEnable(json.getBoolean("root_conflicts_enable"));
            }
            if (!json.isNull("fix_root_enable")) {
                params.setFixRootEnalble(json.getBoolean("fix_root_enable"));
            }
            if (!json.isNull("capacity_num")) {
                params.setCapacityNum(json.getInt("capacity_num"));
            }
            if (!json.isNull("max_layer")) {
                params.setMaxLayer(json.getInt("max_layer"));
            }
            if (!json.isNull("max_connection")) {
                params.setMaxConnection(json.getInt("max_connection"));
            }
            if (!json.isNull("assoc_expire_ms")) {
                params.setAssocExpireMS(json.getInt("assoc_expire_ms"));
            }
            if (!json.isNull("beacon_interval_ms")) {
                params.setBeaconIntervalMS(json.getInt("beacon_interval_ms"));
            }
            if (!json.isNull("passive_scan_ms")) {
                params.setPassiveScanMS(json.getInt("passive_scan_ms"));
            }
            if (!json.isNull("monitor_duration_ms")) {
                params.setMonitorDurationMS(json.getInt("monitor_duration_ms"));
            }
            if (!json.isNull("cnx_rssi")) {
                params.setCnxRssi(json.getInt("cnx_rssi"));
            }
            if (!json.isNull("select_rssi")) {
                params.setSelectRssi(json.getInt("select_rssi"));
            }
            if (!json.isNull("switch_rssi")) {
                params.setSwitchRssi(json.getInt("switch_rssi"));
            }
            if (!json.isNull("xon_qsize")) {
                params.setXonQsize(json.getInt("xon_qsize"));
            }
            if (!json.isNull("retransmit_enable")) {
                params.setRetransmitEnable(json.getBoolean("retransmit_enable"));
            }
            if (!json.isNull("data_drop_enable")) {
                params.setDataDropEnable(json.getBoolean("data_drop_enable"));
            }

            ConfigRequest configRequest = new ConfigRequest();
            configRequest.bleAddress = bleAddress;
            configRequest.version = version;
            configRequest.params = params;
            return configRequest;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }
}
