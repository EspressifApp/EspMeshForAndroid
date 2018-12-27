package iot.espressif.esp32.model.callback;

import iot.espressif.esp32.model.device.IEspDevice;
import libs.espressif.net.EspHttpResponse;

public interface DeviceRequestCallable {
    void onResponse(IEspDevice device, EspHttpResponse response);
}
