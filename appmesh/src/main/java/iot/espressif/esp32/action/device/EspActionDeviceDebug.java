package iot.espressif.esp32.action.device;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.net.EspHttpParams;

public class EspActionDeviceDebug implements IEspActionDeviceDebug {

    @Override
    public void doActionClearNetworkLocal(Collection<IEspDevice> devices) {
        EspHttpParams params = new EspHttpParams();
        params.setTryCount(3);
        DeviceUtil.delayRequestRetry(devices, REQUEST_CONFIGURE_MODE, params);
        for (IEspDevice device : devices) {
            device.clearState();
        }
    }

    @Override
    public void doActionInternalOtaLocal(Collection<IEspDevice> devices) {
        EspHttpParams params = new EspHttpParams();
        params.setTryCount(3);
        DeviceUtil.delayRequestRetry(devices, REQUEST_INTERNAL_OTA, params);
        for (IEspDevice device : devices) {
            device.clearState();
        }
    }

    @Override
    public void doActionCommandLocal(Collection<IEspDevice> devices, String command) {
        EspHttpParams params = new EspHttpParams();
        params.setTryCount(3);
        byte[] content = command.getBytes();
        DeviceUtil.httpLocalMulticastRequest(devices, content, params, false, DeviceUtil.HEADER_ROOT_RESP);
    }
}
