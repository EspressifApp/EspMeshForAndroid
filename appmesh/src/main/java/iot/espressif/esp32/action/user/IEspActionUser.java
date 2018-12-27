package iot.espressif.esp32.action.user;

import iot.espressif.esp32.action.IEspAction;

public interface IEspActionUser extends IEspAction {
    String KEY_USER_NAME = "username";
    String KEY_EMAIL = "email";
    String KEY_PASSWORD = "password";
}
