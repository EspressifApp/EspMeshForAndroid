package h5.espressif.esp32.module;

import android.app.Application;
import android.util.Log;

import androidx.multidex.MultiDex;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import iot.espressif.esp32.app.EspApplication;

public class MeshApp extends EspApplication {
    private static final String TAG = "MeshApp";

    @Override
    public void onCreate() {
        super.onCreate();
        MultiDex.install(this);

        initAliyun();
    }

    private void initAliyun() {
        try {
            Class<?> aliInitCls = Class.forName("aliyun.espressif.mesh.AliInitialize");
            Method initMethod = aliInitCls.getMethod("initAliyun", Application.class);
            initMethod.invoke(aliInitCls, this);
            Log.d(TAG, "Init Aliyun suc");
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            Log.w(TAG, "Init Aliyun failed");
        }
    }
}
