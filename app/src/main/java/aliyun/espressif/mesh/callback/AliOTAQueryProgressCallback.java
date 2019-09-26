package aliyun.espressif.mesh.callback;

import aliyun.espressif.mesh.bean.ota.OTADeviceDetailInfo;

public interface AliOTAQueryProgressCallback {
    /**
     * @param status 200 is successful, otherwise is failed
     * @param data
     * @param info
     * @param exception
     */
    void onResult(int status, byte[] data, OTADeviceDetailInfo info, Exception exception);
}
