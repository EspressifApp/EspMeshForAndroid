package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;

public interface IEspActionDeviceReboot extends IEspActionDevice {
    String REQUEST_REBOOT = "reboot";

    boolean doActionRebootLocal(IEspDevice device);
    void doActionRebootLocal(Collection<IEspDevice> devices);
}
