package iot.espressif.esp32.action.user;

import iot.espressif.esp32.db.model.UserDB;
import iot.espressif.esp32.db.manager.EspDBManager;
import iot.espressif.esp32.model.user.EspUser;

public class EspActionUserLoadLastLogged implements IEspActionUserLoadLastLogged {
    @Override
    public void doActionLoadLastLogged() {
        EspUser user = EspUser.INSTANCE;
        EspDBManager dbManager = EspDBManager.getInstance();
        UserDB userDB = dbManager.user().loadLastLoginUser();
        if (userDB != null) {
            user.setId(userDB.getId());
            user.setKey(userDB.getKey());
            user.setName(userDB.getName());
            user.setEmail(userDB.getEmail());
        }
    }
}
