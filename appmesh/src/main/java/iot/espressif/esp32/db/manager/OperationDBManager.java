package iot.espressif.esp32.db.manager;

import java.util.List;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.OperationDB;
import iot.espressif.esp32.db.dao.OperationDBDao;

public final class OperationDBManager {
    private DaoSession mDaoSession;

    OperationDBManager(DaoSession session) {
        mDaoSession = session;
    }

    public void saveOperation(String type, String identity) {
        OperationDB db =  mDaoSession.getOperationDBDao()
                .queryBuilder()
                .where(OperationDBDao.Properties.Type.eq(type), OperationDBDao.Properties.Identity.eq(identity))
                .unique();
        if (db == null) {
            db = new OperationDB(null, type, identity, System.currentTimeMillis());
        } else {
            db.setTime(System.currentTimeMillis());
        }
        mDaoSession.insertOrReplace(db);
    }

    public List<OperationDB> loadLastOperations(int count) {
        return mDaoSession.getOperationDBDao()
                .queryBuilder()
                .orderDesc(OperationDBDao.Properties.Time)
                .limit(count)
                .list();
    }

    public void deleteUntilLeftOperations(int leftCount) {
        List<OperationDB> operationDBS = mDaoSession.getOperationDBDao()
                .queryBuilder().orderDesc(OperationDBDao.Properties.Time).list();
        for (int i = leftCount; i < operationDBS.size(); i++) {
            OperationDB db = operationDBS.get(i);
            mDaoSession.getOperationDBDao().delete(db);
        }

    }
}
