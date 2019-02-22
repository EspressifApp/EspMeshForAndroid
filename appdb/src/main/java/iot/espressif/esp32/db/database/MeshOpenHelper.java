package iot.espressif.esp32.db.database;

import android.content.Context;
import android.util.Log;

import org.greenrobot.greendao.database.Database;

import iot.espressif.esp32.db.dao.ApDBDao;
import iot.espressif.esp32.db.dao.DaoMaster;
import iot.espressif.esp32.db.dao.DeviceDBDao;
import iot.espressif.esp32.db.dao.DeviceOtherDBDao;
import iot.espressif.esp32.db.dao.GroupDBDao;
import iot.espressif.esp32.db.dao.GroupDeviceDBDao;
import iot.espressif.esp32.db.dao.HWDeviceDBDao;
import iot.espressif.esp32.db.dao.LastLoginUserDBDao;
import iot.espressif.esp32.db.dao.OperationDBDao;
import iot.espressif.esp32.db.dao.SceneDBDao;
import iot.espressif.esp32.db.dao.SnifferDBDao;
import iot.espressif.esp32.db.dao.UserDBDao;

public class MeshOpenHelper extends DaoMaster.OpenHelper {
    public MeshOpenHelper(Context context, String name) {
        super(context, name);
    }

    @Override
    public void onCreate(Database db) {
        Log.d("MeshDB", "onCreate");
        DaoMaster.createAllTables(db, false);
    }

    @Override
    public void onUpgrade(Database db, int oldVersion, int newVersion) {
        Log.d("MeshDB", String.format("onUpgrade oldVersion=%d, newVersion=%d", oldVersion, newVersion));
        for (int v = oldVersion; v < newVersion; v++) {
            switch (v) {
                case 18:
                    upgradeVersion18(db);
                    break;
                default:
                    DaoMaster.dropAllTables(db, true);
                    DaoMaster.createAllTables(db, false);
                    break;
            }
        }
    }

    private void upgradeVersion18(Database db) {
        MigrationHelper migrationHelper = MigrationHelper.getInstance();
        migrationHelper.migrate(db, ApDBDao.class, DeviceDBDao.class, DeviceOtherDBDao.class,
                GroupDBDao.class, GroupDeviceDBDao.class, HWDeviceDBDao.class, OperationDBDao.class,
                SceneDBDao.class, SnifferDBDao.class, UserDBDao.class, LastLoginUserDBDao.class);
    }
}
