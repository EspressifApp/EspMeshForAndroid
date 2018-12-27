package iot.espressif.esp32.action.user;

import iot.espressif.esp32.model.user.EspRegisterResult;

public interface IEspActionUserRegister extends IEspActionUser {
    String URL_REGISTER = "https://iot.espressif.cn/v1/user/join/";

    EspRegisterResult doActionRegister(String username, String email, String password);
}
