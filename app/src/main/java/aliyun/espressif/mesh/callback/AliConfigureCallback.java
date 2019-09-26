package aliyun.espressif.mesh.callback;

import com.aliyun.alink.business.devicecenter.api.add.DeviceInfo;

import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;

public abstract class AliConfigureCallback extends MeshBlufiCallback {
    public void onDiscoveryDevice(DeviceInfo deviceInfo, boolean willBind){
    }

    public void onDiscoveryComplete() {
    }

    public void onBindDevice(DeviceInfo deviceInfo, boolean suc) {
    }
}
