package iot.espressif.esp32.action.user;

import iot.espressif.esp32.model.user.EspResetPasswordResult;

/**
 * Created by ae on 2018/3/28.
 */

public interface IEspActionUserResetPassword extends IEspActionUser {
    String URL_RESET_PASSWORD = "https://iot.espressif.cn/v1/user/resetpassword/mail";

    EspResetPasswordResult doActionResetPassword(String email);
}
