package iot.espressif.esp32.model.callback;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;

public interface DeviceScanCallback {
    void onMeshDiscover(Collection<IEspDevice> mesh);
}
