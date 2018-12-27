package iot.espressif.esp32.model.user;

import java.net.HttpURLConnection;

public enum EspLoginResult {
    SUC,
    PASSWORD_ERR,
    NOT_REGISTER,
    NETWORK_UNACCESSIBLE,
    FAILED;

    public static EspLoginResult getEspLoginResult(int status) {
        if (status == HttpURLConnection.HTTP_OK) {
            return SUC;
        } else if (status == HttpURLConnection.HTTP_FORBIDDEN) {
            return PASSWORD_ERR;
        } else if (status == HttpURLConnection.HTTP_NOT_FOUND) {
            return NOT_REGISTER;
        } else if (status == -HttpURLConnection.HTTP_OK) {
            return NETWORK_UNACCESSIBLE;
        } else {
            return FAILED;
        }
    }
}
