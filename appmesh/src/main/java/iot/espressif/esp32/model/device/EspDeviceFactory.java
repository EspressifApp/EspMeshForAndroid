package iot.espressif.esp32.model.device;

import org.json.JSONArray;
import org.json.JSONException;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.net.MeshNode;

public final class EspDeviceFactory {

    public static IEspDevice parseMeshNode(MeshNode node) {
        if (node == null) {
            return null;
        }

        IEspDevice result = new EspDevice();
        result.setMac(node.getMac());
        result.setParentDeviceMac(node.getParentMac());
        result.setRomVersion(node.getVer());
        result.setRootDeviceMac(node.getRootMac());
        result.setMeshLayerLevel(node.getMeshLevel());
        result.setMeshId(node.getMeshId());
        result.setProtocol(node.getProtocolName());
        result.setProtocolPort(node.getProtocolPort());
        EspDeviceState state = new EspDeviceState();
        state.addState(EspDeviceState.State.LOCAL);
        result.setDeviceState(state);
        try {
            String host = node.getHost();
            if (host != null) {
                InetAddress address = InetAddress.getByName(node.getHost());
                result.setLanAddress(address);
            }
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }

        return result;
    }

    public static IEspDevice parseDeviceDB(DeviceDB db) {
        IEspDevice device = new EspDevice();
        device.setId(db.id);
        device.setMac(db.mac);
        device.setName(db.name);
        device.setDeviceTypeId(db.tid);
        device.setProtocol(db.protocol);
        device.setProtocolPort(db.protocol_port);
        device.setRomVersion(db.rom_version);
        device.setIdfVersion(db.idf_version);
        device.setMlinkVersion(db.mlink_version);
        device.setTrigger(db.trigger);
        device.setPosition(db.position);
        EspDeviceState state = new EspDeviceState();
        state.addState(EspDeviceState.State.OFFLINE);
        device.setDeviceState(state);

        if (db.group_ids != null) {
            try {
                JSONArray groupArray = new JSONArray(db.group_ids);
                List<String> groupList = new ArrayList<>(groupArray.length());
                for (int i = 0; i < groupArray.length(); i++) {
                    groupList.add(groupArray.getString(i));
                }
                device.setGroups(groupList);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }


        return device;
    }
}
