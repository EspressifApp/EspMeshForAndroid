package aliyun.espressif.mesh.callback;

public interface AliOTAStartCallback {
    /**
     * @param code 200 is successful, otherwise is failed
     * @param data
     * @param exception
     */
    void onResult(int code, byte[] data, Exception exception);
}
