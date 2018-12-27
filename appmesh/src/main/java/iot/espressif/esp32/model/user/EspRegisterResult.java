package iot.espressif.esp32.model.user;

import java.net.HttpURLConnection;

public enum EspRegisterResult {
    SUC,
    USER_OR_EMAIL_EXIST_ALREADY,
    USER_NAME_EXIST_ALREADY,
    CONTENT_FORMAT_ERROR,
    NETWORK_UNACCESSIBLE,
    FAILED;

    public static EspRegisterResult getEspLoginResult(int status) {
        if (status == HttpURLConnection.HTTP_OK) {
            return SUC;
        } else if (status == HttpURLConnection.HTTP_CONFLICT) {
            return USER_OR_EMAIL_EXIST_ALREADY;
        } else if (status == HttpURLConnection.HTTP_INTERNAL_ERROR) {
            return USER_NAME_EXIST_ALREADY;
        } else if (status == HttpURLConnection.HTTP_BAD_REQUEST) {
            return CONTENT_FORMAT_ERROR;
        } else if (status == -HttpURLConnection.HTTP_OK) {
            return NETWORK_UNACCESSIBLE;
        } else {
            return FAILED;
        }
    }
}
