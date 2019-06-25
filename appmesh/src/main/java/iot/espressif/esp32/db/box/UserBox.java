package iot.espressif.esp32.db.box;

import androidx.annotation.NonNull;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.UserDB;
import iot.espressif.esp32.db.model.UserLastLoginDB;

public class UserBox {
    private static final long LAST_LOGIN_DB_ID = 1L;

    private Box<UserDB> mUserBox;
    private Box<UserLastLoginDB> mLastLoginBox;

    UserBox(BoxStore boxStore) {
        mUserBox = boxStore.boxFor(UserDB.class);
        mLastLoginBox = boxStore.boxFor(UserLastLoginDB.class);
    }

    public UserDB loadLastLoginUser() {
        UserLastLoginDB lastLoginDB = mLastLoginBox.get(LAST_LOGIN_DB_ID);
        if (lastLoginDB != null) {
            return mUserBox.get(lastLoginDB.user_id);
        }

        return null;
    }

    public void removeLastLoginUser() {
        mUserBox.remove(LAST_LOGIN_DB_ID);
    }

    public void saveLastLoginUser(long userId) {
        UserLastLoginDB entity = new UserLastLoginDB();
        entity.id = LAST_LOGIN_DB_ID;
        entity.user_id = userId;
        mLastLoginBox.put(entity);
    }

    public void saveUser(long id, @NonNull String userKey, @NonNull String userName, @NonNull String email,
                         String password) {
        UserDB entity = new UserDB();
        entity.id = id;
        entity.key = userKey;
        entity.name = userName;
        entity.email = email;
        entity.password = password;
        mUserBox.put(entity);
    }
}
