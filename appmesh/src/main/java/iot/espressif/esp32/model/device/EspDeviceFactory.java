package iot.espressif.esp32.model.device;

import java.net.InetAddress;
import java.net.UnknownHostException;

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
        device.setEvents(db.events);
        device.setPosition(db.position);
        EspDeviceState state = new EspDeviceState();
        state.addState(EspDeviceState.State.OFFLINE);
        device.setDeviceState(state);

        return device;
    }
}
