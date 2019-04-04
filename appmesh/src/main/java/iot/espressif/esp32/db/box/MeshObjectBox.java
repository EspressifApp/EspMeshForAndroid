package iot.espressif.esp32.db.box;

import android.content.Context;

import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.MyObjectBox;

public class MeshObjectBox {
    private static MeshObjectBox sInstance;

    private BoxStore mBoxStore;
    private ApBox mApBox;
    private DeviceBox mDeviceBox;
    private GroupBox mGroupBox;
    private OperationBox mOperationBox;
    private SceneBox mSceneBox;
    private SnifferBox mSnifferBox;
    private UserBox mUserBox;
    private DeviceHWBox mDeviceHWBox;

    public static MeshObjectBox getInstance() {
        if (sInstance == null) {
            synchronized (MeshObjectBox.class) {
                if (sInstance == null) {
                    sInstance = new MeshObjectBox();
                }
            }
        }

        return sInstance;
    }

    public synchronized void init(Context context) {
            if (mBoxStore != null) {
                throw new IllegalStateException("MeshObjectBox has initialized");
            }

            mBoxStore = MyObjectBox.builder().androidContext(context).build();
            mApBox = new ApBox(mBoxStore);
            mDeviceBox = new DeviceBox(mBoxStore);
            mGroupBox = new GroupBox(mBoxStore);
            mOperationBox = new OperationBox(mBoxStore);
            mSceneBox = new SceneBox(mBoxStore);
            mSnifferBox = new SnifferBox(mBoxStore);
            mUserBox = new UserBox(mBoxStore);
            mDeviceHWBox = new DeviceHWBox(mBoxStore);
    }

    public synchronized void close() {
        if (mBoxStore != null) {
            mBoxStore.close();
        }

        mApBox = null;
        mDeviceBox = null;
        mGroupBox = null;
        mOperationBox = null;
        mSceneBox = null;
        mSnifferBox = null;
        mUserBox = null;
        mDeviceHWBox = null;
    }

    public ApBox ap() {
        return mApBox;
    }

    public DeviceBox device() {
        return mDeviceBox;
    }

    public DeviceHWBox deviceHW() {
        return mDeviceHWBox;
    }

    public GroupBox group() {
        return mGroupBox;
    }

    public OperationBox operation() {
        return mOperationBox;
    }

    public SceneBox scene() {
        return mSceneBox;
    }

    public SnifferBox sniffer() {
        return mSnifferBox;
    }

    public UserBox user() {
        return mUserBox;
    }
}
