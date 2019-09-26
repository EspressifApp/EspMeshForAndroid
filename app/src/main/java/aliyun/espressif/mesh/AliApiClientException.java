package aliyun.espressif.mesh;

import androidx.annotation.Nullable;

public class AliApiClientException extends Exception {
    private int mCode;
    private String mMessage;

    public AliApiClientException(int code, String message) {
        super(message);

        mCode = code;
        mMessage = message;
    }

    public int getCode() {
        return mCode;
    }

    @Nullable
    @Override
    public String getMessage() {
        return mMessage;
    }
}
