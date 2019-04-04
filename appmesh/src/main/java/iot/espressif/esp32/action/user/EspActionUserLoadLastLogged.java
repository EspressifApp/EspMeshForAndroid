package iot.espressif.esp32.action.user;

import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.db.model.UserDB;
import iot.espressif.esp32.model.user.EspUser;

public class EspActionUserLoadLastLogged implements IEspActionUserLoadLastLogged {
    @Override
    public void doActionLoadLastLogged() {
        EspUser user = EspUser.INSTANCE;
        MeshObjectBox dbManager = MeshObjectBox.getInstance();
        UserDB userDB = dbManager.user().loadLastLoginUser();
        if (userDB != null) {
            user.setId(userDB.id);
            user.setKey(userDB.key);
            user.setName(userDB.name);
            user.setEmail(userDB.email);
        }
    }
}
