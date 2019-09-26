package aliyun.espressif.mesh.task;


import aliyun.espressif.mesh.callback.AliConfigureCallback;
import iot.espressif.esp32.action.device.IEspActionDeviceBlufi;

public interface IAliDeviceConfigureTask extends IEspActionDeviceBlufi {
    void execute(AliConfigureCallback aliCB);

    void cancel();
}
