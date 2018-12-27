package iot.espressif.esp32.db.manager;

import android.text.TextUtils;

import java.util.ArrayList;
import java.util.List;

import iot.espressif.esp32.db.model.ApDB;
import iot.espressif.esp32.db.dao.ApDBDao;
import iot.espressif.esp32.db.dao.DaoSession;

public final class ApDBManager {
    private DaoSession mDaoSession;

    ApDBManager(DaoSession session) {
        mDaoSession = session;
    }

    /**
     * Load target AP
     *
     * @param ssid of target AP
     * @return IApDB
     */
    public ApDB loadAp(String ssid) {
        if (TextUtils.isEmpty(ssid)) {
            return null;
        }

        return mDaoSession.getApDBDao()
                .queryBuilder()
                .where(ApDBDao.Properties.Ssid.eq(ssid))
                .unique();

    }

    /**
     * Load all APs
     *
     * @return ap list
     */
    public List<ApDB> loadAps() {
        List<ApDB> dbs = mDaoSession.getApDBDao().loadAll();

        List<ApDB> result = new ArrayList<>();
        result.addAll(dbs);
        return result;
    }

    /**
     * Insert an AP into the table associated
     *
     * @return row ID of newly inserted entity
     */
    public long insertOrReplace(String ssid, String password) {
        if (password == null) {
            password = "";
        }
        ApDB apDB = new ApDB(ssid, password);
        return mDaoSession.getApDBDao().insertOrReplace(apDB);
    }
}
