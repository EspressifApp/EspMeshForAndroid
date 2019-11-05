package aliyun.espressif.mesh.callback;

public interface AliGetThirdPartyAccountCallback {
    void onResult(int code, byte[] data, Exception exception);
}
