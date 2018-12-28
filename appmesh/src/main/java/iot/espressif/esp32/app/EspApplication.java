package iot.espressif.esp32.app;

import android.app.Application;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.database.sqlite.SQLiteDatabase;
import android.os.Environment;
import android.support.v4.content.LocalBroadcastManager;

import java.util.HashMap;
import java.util.Random;

import iot.espressif.esp32.db.dao.DaoMaster;
import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.manager.EspDBManager;
import libs.espressif.utils.RandomUtil;

public class EspApplication extends Application {
    private static EspApplication instance;
    private final Object mCacheLock = new Object();
    private String mVersionName;
    private int mVersionCode;
    private DaoMaster.DevOpenHelper mDBHelper;
    private HashMap<String, Object> mCacheMap;
    private boolean mSupportBLE;

    public static EspApplication getInstance() {
        if (instance == null) {
            throw new NullPointerException("EspApplication instance is null, please register in AndroidManifest.xml first");
        }
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        instance = this;
        init();
    }

    @Override
    public void onTerminate() {
        super.onTerminate();

        release();
    }

    private void init() {
        mCacheMap = new HashMap<>();

        mSupportBLE = getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);

        try {
            PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            mVersionName = pi.versionName;
            mVersionCode = pi.versionCode;
        } catch (NameNotFoundException e) {
            e.printStackTrace();
            mVersionName = "Not found version";
            mVersionCode = -1;
        }

        mDBHelper = new DaoMaster.DevOpenHelper(this, EspDBManager.DB_NAME, null);
        SQLiteDatabase db = mDBHelper.getWritableDatabase();
        DaoSession daoSession = new DaoMaster(db).newSession();
        EspDBManager.init(daoSession);
    }

    private void release() {
        mDBHelper.close();

        mCacheMap.clear();
        mCacheMap = null;
    }

    public String getVersionName() {
        return mVersionName;
    }

    public int getVersionCode() {
        return mVersionCode;
    }

    public void putCache(String key, Object value) {
        synchronized (mCacheLock) {
            mCacheMap.put(key, value);
        }
    }

    /**
     * Save an object in app
     *
     * @param value the object will be saved
     * @return the key to used in #takeCache
     */
    public String putCache(Object value) {
        synchronized (mCacheLock) {
            String key;
            while (true) {
                int keyLength = new Random().nextInt(20) + 20;
                key = RandomUtil.randomString(keyLength);
                if (!mCacheMap.containsKey(key)) {
                    break;
                }
            }

            mCacheMap.put(key, value);
            return key;
        }
    }

    /**
     * Take the object and remove from app
     *
     * @param key the key generated when put
     * @return the target object
     */
    public Object takeCache(String key) {
        synchronized (mCacheLock) {
            Object result = mCacheMap.get(key);
            if (result != null) {
                mCacheMap.remove(key);
            }

            return result;
        }
    }

    public Object getCache(String key) {
        synchronized (mCacheLock) {
            return mCacheMap.get(key);
        }
    }

    /**
     * Check the Android device support Ble
     */
    public boolean hasBleFeature() {
        return mSupportBLE;
    }

    /**
     * Get the application default phone storage dir path
     */
    public String getEspRootSDPath() {
        String path = null;
        if (Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED)) {
            path = Environment.getExternalStorageDirectory().toString() + "/Espressif/Esp32/";
        }
        return path;
    }

    public void sendLocalBroadcast(Intent intent) {
        LocalBroadcastManager manager = LocalBroadcastManager.getInstance(this);
        manager.sendBroadcast(intent);
    }
}
