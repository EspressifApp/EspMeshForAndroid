package iot.espressif.esp32.db.manager;

import android.support.annotation.NonNull;

import java.util.List;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.LastLoginUserDB;
import iot.espressif.esp32.db.dao.LastLoginUserDBDao;
import iot.espressif.esp32.db.model.UserDB;
import iot.espressif.esp32.db.dao.UserDBDao;

public final class UserDBManager {
    private static final long LAST_LOGIN_DB_ID = 0L;

    private DaoSession mDaoSession;

    UserDBManager(DaoSession session) {
        mDaoSession = session;
    }

    /**
     * Load last login user info
     *
     * @return last login UserDB
     */
    public UserDB loadLastLoginUser() {
        UserDB result = null;

        LastLoginUserDB lastLoginUser = mDaoSession.getLastLoginUserDBDao()
                .queryBuilder()
                .where(LastLoginUserDBDao.Properties.Id.eq(LAST_LOGIN_DB_ID))
                .unique();
        if (lastLoginUser != null) {
            long userId = lastLoginUser.getUser_id();
            result = mDaoSession.getUserDBDao()
                    .queryBuilder()
                    .where(UserDBDao.Properties.Id.eq(userId))
                    .unique();
        }

        return result;
    }

    public void saveLastLoginUser(long userId) {
        LastLoginUserDB db = new LastLoginUserDB(LAST_LOGIN_DB_ID, userId);
        mDaoSession.getLastLoginUserDBDao().insertOrReplace(db);
    }

    public void removeLastLoginUser() {
        mDaoSession.getLastLoginUserDBDao().deleteAll();
    }

    /**
     * Save user
     *
     * @param id       user id
     * @param userKey  user key
     * @param userName user name
     * @param email    user email
     * @param password user password
     */
    public void saveUser(long id, @NonNull String userKey, @NonNull String userName, @NonNull String email, String password) {
        UserDB db = new UserDB(id, email, userKey, userName, password);
        mDaoSession.getUserDBDao().insertOrReplace(db);
    }

    public List<UserDB> loadLoggedUsers() {
        return mDaoSession.getUserDBDao().loadAll();
    }
}