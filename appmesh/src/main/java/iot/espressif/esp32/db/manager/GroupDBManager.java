package iot.espressif.esp32.db.manager;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.GroupDB;
import iot.espressif.esp32.db.dao.GroupDBDao;
import iot.espressif.esp32.db.model.GroupDeviceDB;
import iot.espressif.esp32.db.dao.GroupDeviceDBDao;

public final class GroupDBManager {
    private DaoSession mDaoSession;

    GroupDBManager(DaoSession session) {
        mDaoSession = session;
    }

    public long saveGroup(String name, boolean isUser, boolean isMesh) {
        for (long id = -1; ; id--) {
            GroupDB groupDB = mDaoSession.getGroupDBDao()
                    .queryBuilder()
                    .where(GroupDBDao.Properties.Id.eq(id))
                    .unique();
            if (groupDB == null) {
                GroupDB newDB = new GroupDB(id, name, isUser, isMesh);
                mDaoSession.getGroupDBDao().insertOrReplace(newDB);
                return id;
            }
        }
    }

    public boolean saveGroup(long id, String name, boolean isUser, boolean isMesh) {
        GroupDB groupDB = mDaoSession.getGroupDBDao()
                .queryBuilder()
                .where(GroupDBDao.Properties.Id.notEq(id), GroupDBDao.Properties.Name.eq(name))
                .unique();
        if (groupDB != null) {
            return false;
        }

        GroupDB newDB = new GroupDB(id, name, isUser, isMesh);
        mDaoSession.getGroupDBDao().insertOrReplace(newDB);
        return true;
    }

    public GroupDB loadGroup(long id) {
        GroupDB groupDB = mDaoSession.getGroupDBDao()
                .queryBuilder()
                .where(GroupDBDao.Properties.Id.eq(id))
                .unique();
        return groupDB;
    }

    public GroupDB loadGroup(String name) {
        GroupDB groupDB = mDaoSession.getGroupDBDao()
                .queryBuilder()
                .where(GroupDBDao.Properties.Name.eq(name))
                .unique();
        return groupDB;
    }

    public List<GroupDB> loadGroups() {
        List<GroupDB> groupDBs = mDaoSession.getGroupDBDao().loadAll();

        return new LinkedList<>(groupDBs);
    }

    public void deleteGroup(long id) {
        mDaoSession.getGroupDBDao()
                .deleteByKey(id);
        List<GroupDeviceDB> dbs = mDaoSession.getGroupDeviceDBDao()
                .queryBuilder()
                .where(GroupDeviceDBDao.Properties.Group_id.eq(id))
                .list();
        for (GroupDeviceDB db : dbs) {
            db.delete();
        }
    }

    public List<GroupDeviceDB> loadDeviceBssids(long groupId) {
        List<GroupDeviceDB> gdDBs = mDaoSession.getGroupDeviceDBDao()
                .queryBuilder()
                .where(GroupDeviceDBDao.Properties.Group_id.eq(groupId))
                .list();

        List<GroupDeviceDB> result = new ArrayList<>(gdDBs.size());
        result.addAll(gdDBs);
        return result;
    }

    public void saveGroupDeviceBssid(String bssid, long groupId) {
        GroupDeviceDB db = mDaoSession.getGroupDeviceDBDao()
                .queryBuilder()
                .where(GroupDeviceDBDao.Properties.Group_id.eq(groupId), GroupDeviceDBDao.Properties.Device_bssid.eq(bssid))
                .unique();
        if (db == null) {
            db = new GroupDeviceDB(null, groupId, bssid);
            mDaoSession.getGroupDeviceDBDao().insertOrReplace(db);
        }
    }

    public void deleteGroupDeviceBssid(String bssid, long groupId) {
        GroupDeviceDB db = mDaoSession.getGroupDeviceDBDao()
                .queryBuilder()
                .where(GroupDeviceDBDao.Properties.Group_id.eq(groupId), GroupDeviceDBDao.Properties.Device_bssid.eq(bssid))
                .unique();
        if (db != null) {
            db.delete();
        }
    }
}
