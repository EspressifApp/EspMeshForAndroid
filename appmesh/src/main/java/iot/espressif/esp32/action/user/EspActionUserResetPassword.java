package iot.espressif.esp32.action.user;

import org.json.JSONException;
import org.json.JSONObject;

import iot.espressif.esp32.model.user.EspResetPasswordResult;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;

/**
 * Created by ae on 2018/3/28.
 */

public class EspActionUserResetPassword implements IEspActionUserResetPassword {
    @Override
    public EspResetPasswordResult doActionResetPassword(String email) {
        try {
            JSONObject postJSON = new JSONObject()
                    .put(KEY_EMAIL, email);

            EspHttpResponse response = EspHttpUtils.Post(URL_RESET_PASSWORD, postJSON.toString().getBytes(), null, null);
            if (response == null) {
                return EspResetPasswordResult.FAILED;
            }
            JSONObject respJSON = response.getContentJSON();
            if (respJSON == null) {
                return EspResetPasswordResult.FAILED;
            }

            int status = respJSON.getInt(KEY_STATUS);
            return EspResetPasswordResult.getResetPasswordResult(status);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return EspResetPasswordResult.FAILED;
    }
}
