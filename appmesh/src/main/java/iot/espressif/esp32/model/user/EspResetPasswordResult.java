package iot.espressif.esp32.model.user;

import java.net.HttpURLConnection;

/**
 * Created by ae on 2018/3/28.
 */

public enum EspResetPasswordResult {
    SUC,
    FAILED,
    EMAIL_NOT_EXIST;

    public static EspResetPasswordResult getResetPasswordResult(int status) {
        switch (status) {
            case HttpURLConnection.HTTP_OK:
                return SUC;
            case HttpURLConnection.HTTP_NOT_FOUND:
                return EMAIL_NOT_EXIST;
            default:
                return FAILED;
        }
    }
}
