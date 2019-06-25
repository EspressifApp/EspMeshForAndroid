package iot.espressif.esp32.action.user;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;

import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.user.EspLoginResult;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;

public class EspActionUserLogin implements IEspActionUserLogin {
    @Override
    public EspLoginResult doActionLogin(String email, String password, boolean savePwd) {
        try {
            JSONObject postJSON = new JSONObject()
                    .put(KEY_EMAIL, email)
                    .put(KEY_PASSWORD, password)
                    .put(KEY_REMEMBER, 1);

            EspHttpResponse response = EspHttpUtils.Post(URL_LOGIN, postJSON.toString().getBytes(), null, null);
            if (response == null) {
                return EspLoginResult.NETWORK_UNACCESSIBLE;
            }
            JSONObject respJSON = response.getContentJSON();
            if (respJSON == null) {
                return EspLoginResult.FAILED;
            }
            int status = respJSON.getInt(KEY_STATUS);
            if (status == HttpURLConnection.HTTP_OK) {
                JSONObject userJSON = respJSON.getJSONObject(KEY_USER);
                long userId = userJSON.getLong(KEY_ID);
                String userName = userJSON.getString(KEY_USER_NAME);
                JSONObject keyJSON = respJSON.getJSONObject(KEY_KEY);
                String userKey = keyJSON.getString(KEY_TOKEN);

                EspUser user = EspUser.INSTANCE;
                user.setId(userId);
                user.setKey(userKey);
                user.setName(userName);
                user.setEmail(email);

                String pwd = savePwd ? password : null;
                MeshObjectBox dbManager = MeshObjectBox.getInstance();
                dbManager.user().saveUser(userId, userKey, userName, email, pwd);
                dbManager.user().saveLastLoginUser(userId);
            }

            return EspLoginResult.getEspLoginResult(status);
        } catch (JSONException e) {
            e.printStackTrace();

            return EspLoginResult.FAILED;
        }
    }
}
