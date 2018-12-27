package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;

public interface IEspActionDeviceDebug extends IEspActionDevice {
    String REQUEST_CONFIGURE_MODE = "config_network";
    String REQUEST_INTERNAL_OTA = "internal_ota_mode";

    void doActionClearNetworkLocal(Collection<IEspDevice> devices);
    void doActionInternalOtaLocal(Collection<IEspDevice> devices);
    void doActionCommandLocal(Collection<IEspDevice> devices, String command);
}
