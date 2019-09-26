package aliyun.espressif.mesh.callback;

import java.util.List;

import aliyun.espressif.mesh.bean.ota.OTADeviceSimpleInfo;

public interface AliOTAListPreDevicesCallback {
    /**
     * @param code 200 is successful, otherwise is failed
     * @param data
     * @param infoList
     * @param exception
     */
    void onResult(int code, byte[] data, List<OTADeviceSimpleInfo> infoList, Exception exception);
}
