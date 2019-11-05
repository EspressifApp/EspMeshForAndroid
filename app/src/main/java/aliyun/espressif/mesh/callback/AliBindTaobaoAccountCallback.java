package aliyun.espressif.mesh.callback;

public interface AliBindTaobaoAccountCallback {
    void onResult(int code, byte[] data, Exception exception);
}
