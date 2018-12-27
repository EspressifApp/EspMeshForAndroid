package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;

public interface IEspActionDeviceDelete extends IEspActionDevice {
    void doActionDelete(IEspDevice device);
    void doActionDelete(Collection<IEspDevice> devices);
}
