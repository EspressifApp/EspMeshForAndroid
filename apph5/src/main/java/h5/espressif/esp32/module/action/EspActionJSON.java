package h5.espressif.esp32.module.action;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;

public class EspActionJSON implements IEspActionJSON {
    public JSONObject doActionParseDevice(IEspDevice device) {
        if (device.getDeviceTypeId() == DeviceConstants.TID_UNKNOW) {
            return null;
        }

        try {
            JSONObject json = new JSONObject()
                    .put(KEY_MAC, device.getMac())
                    .put(KEY_PARENT_MAC, device.getParentDeviceMac())
                    .put(KEY_ROOT_MAC, device.getRootDeviceMac())
                    .put(KEY_TID, device.getDeviceTypeId())
                    .put(KEY_NAME, device.getName())
                    .put(KEY_POSITION, device.getPosition())
                    .put(KEY_LAYER, device.getMeshLayerLevel())
                    .put(KEY_VERSION, device.getRomVersion())
                    .put(KEY_IDF_VERSION, device.getIdfVersion())
                    .put(KEY_MDF_VERSION, device.getMdfVersion())
                    .put(KEY_MLINK_VERSION, device.getMlinkVersion())
                    .put(KEY_TRIGGER, device.getTrigger())
                    .put(KEY_RSSI, device.getRssi())
                    .put(KEY_MESH_ID, device.getMeshId());
            String ip = "";
            JSONArray stateArray = new JSONArray();
            if (device.isState(EspDeviceState.State.LOCAL)) {
                stateArray.put("local");
                ip = device.getLanAddress().getHostAddress();
            }
            if (device.isState(EspDeviceState.State.CLOUD)) {
                stateArray.put("cloud");
            }
            json.put(KEY_STATE, stateArray)
                    .put(KEY_HOST, ip);

            Collection<String> groups = device.getGroupIds();
            JSONArray groupArray = new JSONArray(groups);
            json.put(KEY_GROUP, groupArray);

            JSONArray charaArray = new JSONArray();
            for (EspDeviceCharacteristic chara : device.getCharacteristics()) {
                JSONObject charaJSON = new JSONObject()
                        .put(KEY_CID, chara.getCid())
                        .put(KEY_NAME, chara.getName())
                        .put(KEY_FORMAT, chara.getFormat())
                        .put(KEY_PERMS, chara.getPerms())
                        .put(KEY_MIN, chara.getMin())
                        .put(KEY_MAX, chara.getMax())
                        .put(KEY_VALUE, chara.getValue());
                switch (chara.getFormat()) {
                    case EspDeviceCharacteristic.FORMAT_DOUBLE:
                        charaJSON.put(KEY_STEP, (double)chara.getStep());
                        break;
                    case EspDeviceCharacteristic.FORMAT_INT:
                        charaJSON.put(KEY_STEP, (int)chara.getStep());
                        break;
                    default:
                        break;
                }

                charaArray.put(charaJSON);
            }
            json.put(KEY_CHARACTERISTICS, charaArray);

            return json;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    public JSONArray doActionParseDevices(Collection<IEspDevice> devices) {
        JSONArray result = new JSONArray();

        List<IEspDevice> sortList = new LinkedList<>(devices);
        //Collections.sort(sortList, new EspDeviceComparator<>());
        for (IEspDevice device : sortList) {
            JSONObject devJSON = doActionParseDevice(device);
            if (devJSON != null) {
                result.put(devJSON);
            }
        }

        return result;
    }

    public JSONObject doActionParseDeviceStatus(IEspDevice device) {
        JSONObject json = new JSONObject();
        try {
            json.put(KEY_MAC, device.getMac());
            JSONArray array = new JSONArray();
            for (EspDeviceCharacteristic characteristic : device.getCharacteristics()) {
                try {
                    JSONObject cjson = new JSONObject()
                            .put(KEY_CID, characteristic.getCid())
                            .put(KEY_VALUE, characteristic.getValue());
                    array.put(cjson);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            json.put(KEY_CHARACTERISTICS, array);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return json;
    }
}
