package aliyun.espressif.mesh.callback;

import java.util.List;

import aliyun.espressif.mesh.bean.DeviceInfoBean;

public interface AliListBindingDevicesCallback {
    /**
     * @param code 200 is successful, otherwise is failed
     * @param data
     * @param beans
     * @param exception
     */
    void onResult(int code, byte[] data, List<DeviceInfoBean> beans, Exception exception);
}
