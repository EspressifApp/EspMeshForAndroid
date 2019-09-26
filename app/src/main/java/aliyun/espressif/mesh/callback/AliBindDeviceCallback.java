package aliyun.espressif.mesh.callback;

public interface AliBindDeviceCallback {
    /**
     * @param code 200 is successful, otherwise is failed.
     * @param iotId Aliyun iotId
     * @param exception null if successful
     */
    void onResult(int code, String iotId, Exception exception);
}
