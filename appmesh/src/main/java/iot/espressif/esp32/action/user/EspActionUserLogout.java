package iot.espressif.esp32.action.user;

import iot.espressif.esp32.db.manager.EspDBManager;
import iot.espressif.esp32.model.user.EspUser;

public class EspActionUserLogout implements IEspActionUserLogout {
    @Override
    public void doActionLogout() {
        EspUser user = EspUser.INSTANCE;
        if (!user.isLogged()) {
            return;
        }

        EspDBManager dbManager = EspDBManager.getInstance();
        dbManager.user().removeLastLoginUser();

        user.setEmail(null);
        user.setName(null);
        user.setId(-1);
        user.setKey(null);
    }
}
