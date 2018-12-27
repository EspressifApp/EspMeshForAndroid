package iot.espressif.esp32.action.device;

import java.util.List;

import iot.espressif.esp32.model.net.MeshNode;

public interface IEspActionDeviceTopology extends IEspActionDevice {
    List<MeshNode> doActionGetMeshNodeLocal(String protocol, String host, int port);
}
