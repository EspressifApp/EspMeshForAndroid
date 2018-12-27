package iot.espressif.esp32.db.manager;

import org.greenrobot.greendao.query.QueryBuilder;
import org.greenrobot.greendao.query.WhereCondition;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.db.dao.SnifferDBDao;
import iot.espressif.esp32.model.device.other.Sniffer;

public class SnifferDBManager {
    private DaoSession mDaoSession;

    SnifferDBManager(DaoSession session) {
        mDaoSession = session;
    }

    public List<SnifferDB> loadSniffers() {
        List<SnifferDB> snifferDBs = mDaoSession.getSnifferDBDao()
                .queryBuilder()
                .orderDesc(SnifferDBDao.Properties.Utc_time)
                .list();
        List<SnifferDB> result = new ArrayList<>(snifferDBs.size());
        result.addAll(snifferDBs);
        return result;
    }

    public List<SnifferDB> loadSniffers(long minTime, long maxTime, boolean delDuplicate) {
        List<WhereCondition> conditions = new ArrayList<>();
        if (minTime >= 0) {
            WhereCondition minWhere = SnifferDBDao.Properties.Utc_time.ge(minTime);
            conditions.add(minWhere);
        }
        if (maxTime >= 0) {
            WhereCondition maxWhere = SnifferDBDao.Properties.Utc_time.le(maxTime);
            conditions.add(maxWhere);
        }
        QueryBuilder<SnifferDB> queryBuilder = mDaoSession.getSnifferDBDao().queryBuilder();
        if (conditions.size() == 1) {
            queryBuilder = queryBuilder.where(conditions.get(0));
        } else if (conditions.size() == 2) {
            queryBuilder = queryBuilder.where(conditions.get(0), conditions.get(1));
        }
        List<SnifferDB> snifferDBS = queryBuilder
                .orderDesc(SnifferDBDao.Properties.Utc_time)
                .list();

        if (delDuplicate) {
            // Delete duplicate bssid
            Set<String> bssidSet = new HashSet<>();
            for (int i = 0; i < snifferDBS.size(); i++) {
                SnifferDB snifferDB = snifferDBS.get(i);
                if (bssidSet.contains(snifferDB.getBssid())) {
                    snifferDBS.remove(i--);
                } else {
                    bssidSet.add(snifferDB.getBssid());
                }
            }
        }

        return snifferDBS;
    }

    public void saveSniffer(Sniffer sniffer) {
        SnifferDB db = new SnifferDB(sniffer.getId(), sniffer.getType(), sniffer.getBssid(),
                sniffer.getUTCTime(), sniffer.getRssi(), sniffer.getChannel(), sniffer.getDeviceMac(),
                sniffer.getOrganization(), sniffer.getName());
        mDaoSession.getSnifferDBDao().insertOrReplace(db);
    }
}
