package aliyun.espressif.mesh.callback;

public interface AliUnbindThirdPartyAccountCallback {
    void onResult(int code, byte[] data, Exception exception);
}
