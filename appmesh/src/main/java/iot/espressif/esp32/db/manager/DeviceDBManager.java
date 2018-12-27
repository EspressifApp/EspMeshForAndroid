package iot.espressif.esp32.db.manager;

import android.support.annotation.NonNull;

import java.util.List;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.db.dao.DeviceDBDao;
import iot.espressif.esp32.db.model.DeviceOtherDB;
import iot.espressif.esp32.db.model.HWDeviceDB;
import iot.espressif.esp32.db.dao.HWDeviceDBDao;
import iot.espressif.esp32.model.device.IEspDevice;

public final class DeviceDBManager {
    private DaoSession mDaoSession;

    DeviceDBManager(DaoSession session) {
        mDaoSession = session;
    }

    public void saveDevice(@NonNull IEspDevice device) {
        DeviceDB staDB = new DeviceDB(device.getMac(), device.getName(), device.getDeviceTypeId(),
                device.getCurrentRomVersion(), device.getProtocol(), device.getProtocolPort());
        mDaoSession.getDeviceDBDao().insertOrReplace(staDB);
    }

    public List<DeviceDB> loadDeviceList() {
        return mDaoSession.getDeviceDBDao().loadAll();
    }

    public void deleteDevice(@NonNull String mac) {
        DeviceDB staDB = mDaoSession.getDeviceDBDao()
                .queryBuilder()
                .where(DeviceDBDao.Properties.Mac.eq(mac))
                .unique();
        if (staDB != null) {
            staDB.delete();
        }
    }

    public void saveDeviceOther(@NonNull String mac, String event, String position) {
        DeviceOtherDB db = new DeviceOtherDB(mac, event, position);
        mDaoSession.getDeviceOtherDBDao().insertOrReplace(db);
    }

    public DeviceOtherDB loadDeviceOther(String mac) {
        DeviceOtherDB db =  mDaoSession.getDeviceOtherDBDao().load(mac);
        return db;
    }

    public List<DeviceOtherDB> loadDeviceOtherList() {
        return mDaoSession.getDeviceOtherDBDao().loadAll();
    }

    public void deleteDeviceOther(@NonNull String mac) {
        mDaoSession.getDeviceOtherDBDao().deleteByKey(mac);
    }

    public void deleteAllDeviceOther() {
        mDaoSession.getDeviceOtherDBDao().deleteAll();
    }

    public List<HWDeviceDB> loadHWDevicesList() {
        return mDaoSession.getHWDeviceDBDao()
                .queryBuilder()
                .orderAsc(HWDeviceDBDao.Properties.Floor)
                .orderAsc(HWDeviceDBDao.Properties.Area)
                .orderAsc(HWDeviceDBDao.Properties.Code)
                .list();
    }

    public void saveHWDevice(String mac, String code, String floor, String area, Long time) {
        HWDeviceDB db = new HWDeviceDB(mac, code, floor, area, time);
        mDaoSession.getHWDeviceDBDao().insertOrReplace(db);
    }

    public void deleteHWDevice(String mac) {
        mDaoSession.getHWDeviceDBDao().deleteByKey(mac);
    }
}
