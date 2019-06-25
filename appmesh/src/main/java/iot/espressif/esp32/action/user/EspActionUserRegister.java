package iot.espressif.esp32.action.user;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;

import iot.espressif.esp32.model.user.EspRegisterResult;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;

public class EspActionUserRegister implements IEspActionUserRegister {
    @Override
    public EspRegisterResult doActionRegister(String username, String email, String password) {
        try {
            JSONObject postJSON = new JSONObject()
                    .put(KEY_USER_NAME, username)
                    .put(KEY_EMAIL, email)
                    .put(KEY_PASSWORD, password);

            EspHttpResponse response = EspHttpUtils.Post(URL_REGISTER, postJSON.toString().getBytes(), null, null);
            if (response == null) {
                return EspRegisterResult.NETWORK_UNACCESSIBLE;
            }
            JSONObject respJSON = response.getContentJSON();
            if (respJSON == null) {
                return EspRegisterResult.FAILED;
            }
            int status = respJSON.getInt(KEY_STATUS);
            if (status == HttpURLConnection.HTTP_OK) {
                EspUser user = EspUser.INSTANCE;
                user.setEmail(email);
            }
            return EspRegisterResult.getEspLoginResult(status);
        } catch (JSONException e) {
            e.printStackTrace();

            return EspRegisterResult.FAILED;
        }
    }
}
