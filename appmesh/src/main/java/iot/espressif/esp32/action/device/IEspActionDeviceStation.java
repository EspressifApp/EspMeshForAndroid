package iot.espressif.esp32.action.device;

import java.util.List;

import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.IEspDevice;

public interface IEspActionDeviceStation extends IEspActionDevice {
    int MDNS_TIMEOUT = 1500;
    String MDNS_TYPE_HTTP = "_mesh-http._tcp.local.";
    String MDNS_TYPE_HTTPS = "_mesh-https._tcp.local.";
    String MDNS_KEY_MAC = "mac";
    String MDNS_KEY_TOPO_FLAG = "topology-flag";
    String MDNS_KEY_STATUS_FLAG = "status-flag";
    String MDNS_KEY_STATUS_MAC = "status-mac";

    int UDP_DEVICE_PORT = 1025;
    int UDP_TIMEOUT = 2000;
    String UDP_SEND_DATA = "Are You Espressif IOT Smart Device?";

    List<IEspDevice> doActionLoadStationsDB();
    List<IEspDevice> doActionScanStationsLocal(DeviceScanCallback callback);
}
