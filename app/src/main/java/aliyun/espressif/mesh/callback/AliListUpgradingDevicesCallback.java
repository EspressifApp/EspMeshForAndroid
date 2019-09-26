package aliyun.espressif.mesh.callback;

import java.util.List;

import aliyun.espressif.mesh.bean.ota.OTAStatusInfo;

public interface AliListUpgradingDevicesCallback {
    /**
     * @param code 200 is successful, otherwise is failed
     * @param data
     * @param infoList
     * @param exception
     */
    void onResult(int code, byte[] data, List<OTAStatusInfo> infoList, Exception exception);
}
