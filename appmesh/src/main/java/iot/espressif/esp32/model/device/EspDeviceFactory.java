package iot.espressif.esp32.model.device;

import java.net.InetAddress;
import java.net.UnknownHostException;

import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.net.IOTStation;
import iot.espressif.esp32.model.net.MeshNode;

public final class EspDeviceFactory {
    public static IEspDevice parseIOTStation(IOTStation station) {
        EspDevice device = new EspDevice();
        device.setMesh(station.isMesh());
        device.setMac(station.getMac());
        device.setParentDeviceMac(null);
        device.setRootDeviceMac(station.getMac());
        device.setInetAddress(station.getAddress());
        EspDeviceState state = new EspDeviceState();
        state.addState(EspDeviceState.State.LOCAL);
        device.setDeviceState(state);

        return device;
    }

    public static IEspDevice parseMeshNode(MeshNode node) {
        if (node == null) {
            return null;
        }

        IEspDevice result = new EspDevice();
        result.setMac(node.getMac());
        result.setMesh(true);
        result.setParentDeviceMac(node.getParentMac());
        result.setCurrentRomVersion(node.getVer());
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
                result.setInetAddress(address);
            }
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }

        return result;
    }

    public static IEspDevice parseDeviceDB(DeviceDB db) {
        IEspDevice device = new EspDevice();
        device.setMac(db.getMac());
        device.setName(db.getName());
        device.setDeviceTypeId(db.getTid());
        device.setProtocol(db.getProtocol());
        device.setProtocolPort(db.getProtocol_port());
        device.setCurrentRomVersion(db.getVersion());
        EspDeviceState state = new EspDeviceState();
        state.addState(EspDeviceState.State.OFFLINE);
        device.setDeviceState(state);

        return device;
    }
}
