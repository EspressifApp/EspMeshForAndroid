package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;

public interface IEspActionDeviceReset extends IEspActionDevice {
    String REQUEST_RESET = "reset";

    boolean doActionResetLocal(IEspDevice device);
    void doActionResetLocal(Collection<IEspDevice> devices);
}
