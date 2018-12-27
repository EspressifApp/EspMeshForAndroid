package iot.espressif.esp32.action.device;

import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.utils.DeviceUtil;

public interface IEspActionDeviceSniffer extends IEspActionDevice {
    String REQUEST_GET_SNIFFER = "get_sniffer_info";

    String CONTENT_TYPE_BIN = DeviceUtil.CONTENT_TYPE_BIN;

    int TYPE_WIFI = Sniffer.TYPE_WIFI;
    int TYPE_BLE = Sniffer.TYPE_BLE;

    byte TYPE_RSSI = 1;
    byte TYPE_BSSID = 2;
    byte TYPE_TIME = 3;
    byte TYPE_NAME = 4;
    byte TYPE_CHANNEL = 5;
    byte TYPE_MANUFACTURER = 6;

    List<Sniffer> doActionLoadSnifferDB();

    List<Sniffer> doActionGetSniffersLocal(Collection<IEspDevice> devices);
}
