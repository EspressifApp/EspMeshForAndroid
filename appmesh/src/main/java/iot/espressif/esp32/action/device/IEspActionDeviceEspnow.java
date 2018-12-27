package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.Espnow;

public interface IEspActionDeviceEspnow extends IEspActionDevice {
    String KEY_TYPE = "type";
    String KEY_OPRT = "oprt";
    String KEY_PARAMS = "params";
    String KEY_RECV_MAC = "recv_mac";

    void doActionPostLocal(Collection<IEspDevice> devices, Espnow espnow);
}
