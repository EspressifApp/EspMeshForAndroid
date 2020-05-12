package iot.espressif.esp32.app;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.text.TextUtils;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.io.File;
import java.util.HashMap;
import java.util.UUID;

import iot.espressif.esp32.db.box.MeshObjectBox;

public class EspApplication extends Application {
    private static EspApplication instance;
    private final Object mCacheLock = new Object();
    private HashMap<String, Object> mCacheMap;
    private boolean mSupportBLE;
    private LocalBroadcastManager mBroadcastManager;

    public static EspApplication getEspApplication() {
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
        mBroadcastManager = LocalBroadcastManager.getInstance(this);
        mCacheMap = new HashMap<>();

        mSupportBLE = getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE);

        MeshObjectBox.getInstance().init(this);
    }

    private void release() {
        MeshObjectBox.getInstance().close();

        mCacheMap.clear();
        mCacheMap = null;
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
            String key = UUID.randomUUID().toString();
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
        File dir = getExternalFilesDir(null);
        return dir == null ? null : dir.getPath();
    }

    public void sendLocalBroadcast(Intent intent) {
        mBroadcastManager.sendBroadcast(intent);
    }

    public void registerLocalReceiver(BroadcastReceiver receiver, IntentFilter filter) {
        mBroadcastManager.registerReceiver(receiver, filter);
    }

    public void unregisterLocalReceiver(BroadcastReceiver receiver) {
        mBroadcastManager.unregisterReceiver(receiver);
    }
}
