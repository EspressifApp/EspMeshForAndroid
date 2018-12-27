package iot.espressif.esp32.action.user;

import iot.espressif.esp32.model.user.EspLoginResult;

public interface IEspActionUserLogin extends IEspActionUser {
    String URL_LOGIN = "https://iot.espressif.cn/v1/user/login/";

    String KEY_USER = "user";
    String KEY_REMEMBER = "remember";

    EspLoginResult doActionLogin(String email, String password, boolean savePwd);
}
