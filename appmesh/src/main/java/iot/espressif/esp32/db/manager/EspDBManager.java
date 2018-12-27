package iot.espressif.esp32.db.manager;

import iot.espressif.esp32.db.dao.DaoSession;

public class EspDBManager {
    public static final String DB_NAME = "esp_iot_db";

    private static final Object sInitLock = new Object();
    private static EspDBManager instance;

    private UserDBManager mUserManager;
    private DeviceDBManager mDeviceManager;
    private ApDBManager mApDBManager;
    private GroupDBManager mGroupManager;
    private SnifferDBManager mSnifferManager;
    private OperationDBManager mOperationManager;
    private SceneDBManager mSceneDBManager;

    private EspDBManager(DaoSession session) {
        mUserManager = new UserDBManager(session);
        mDeviceManager = new DeviceDBManager(session);
        mApDBManager = new ApDBManager(session);
        mGroupManager = new GroupDBManager(session);
        mSnifferManager = new SnifferDBManager(session);
        mOperationManager = new OperationDBManager(session);
        mSceneDBManager = new SceneDBManager(session);
    }

    public static void init(DaoSession session) {
        synchronized (sInitLock) {
            instance = new EspDBManager(session);
        }
    }

    public static EspDBManager getInstance() {
        if (instance == null) {
            throw new NullPointerException("EspDBManager instance is null, call init(DaoSession) first");
        }

        return instance;
    }

    public UserDBManager user() {
        return mUserManager;
    }

    public DeviceDBManager device() {
        return mDeviceManager;
    }

    public GroupDBManager group() {
        return mGroupManager;
    }

    public ApDBManager ap() {
        return mApDBManager;
    }

    public SnifferDBManager sniffer() {
        return mSnifferManager;
    }

    public OperationDBManager operation() {
        return mOperationManager;
    }

    public SceneDBManager scene() {
        return mSceneDBManager;
    }
}
