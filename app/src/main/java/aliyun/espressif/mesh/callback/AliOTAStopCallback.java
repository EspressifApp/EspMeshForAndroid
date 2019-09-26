package aliyun.espressif.mesh.callback;

public interface AliOTAStopCallback {
    /**
     * @param code 200 is successful, otherwise is failed
     * @param data
     * @param success stop ota successfully or not
     * @param exception
     */
    void onResult(int code, byte[] data, boolean success, Exception exception);
}
