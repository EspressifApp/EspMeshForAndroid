package iot.espressif.esp32.model.user;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import iot.espressif.esp32.action.device.EspActionDeviceStation;
import iot.espressif.esp32.action.group.EspActionGroup;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.group.IEspGroup;
import libs.espressif.log.EspLog;
import libs.espressif.security.EspMD5;
import libs.espressif.utils.TextUtils;

/**
 * Created by ae on 2018/2/24.
 */

class EspUserImpl {
    private final EspLog mLog = new EspLog(getClass());

    private final Object mDeviceLock = new Object();
    private final Object mGroupLock = new Object();
    private Map<String, IEspDevice> mDeviceMap = new HashMap<>();
    private Map<Long, IEspGroup> mGroupMap = new HashMap<>();

    private long mId;
    private String mKey;
    private String mEmail;
    private String mName;
    private byte[] mToken;

    public long getId() {
        return mId;
    }

    public void setId(long id) {
        mId = id;
    }

    public String getKey() {
        return mKey;
    }

    public void setKey(String key) {
        mKey = key;

        if (TextUtils.isEmpty(mKey)) {
            mToken = null;
        } else {
            mToken = EspMD5.getMD5Byte(mKey.getBytes());
        }
    }

    public byte[] getToken() {
        return mToken;
    }

    public String getEmail() {
        return mEmail;
    }

    public void setEmail(String email) {
        mEmail = email;
    }

    public String getName() {
        return mName;
    }

    public void setName(String name) {
        mName = name;
    }

    public void clear() {
        mKey = null;
        mToken = null;
        mEmail = null;
        mName = null;
        synchronized (mDeviceLock) {
            mDeviceMap.clear();
        }
        synchronized (mGroupLock) {
            mGroupMap.clear();
        }
    }

    IEspDevice getDeviceForMac(String mac) {
        synchronized (mDeviceLock) {
            return mDeviceMap.get(mac);
        }
    }

    List<IEspDevice> getAllDeviceList() {
        synchronized (mDeviceLock) {
            return new ArrayList<>(mDeviceMap.values());
        }
    }

    private void syncState(IEspDevice device, IEspDevice stateDev) {
        if (stateDev.isState(EspDeviceState.State.DELETED)) {
            device.addState(EspDeviceState.State.DELETED);
        }
    }

    private void __syncDevice(IEspDevice device) {
        IEspDevice mapDev = mDeviceMap.get(device.getMac());
        if (device.isState(EspDeviceState.State.DELETED)) {
            mLog.d("__syncDevice state DELETE " + device.getMac());
            if (mapDev != null) {
                mDeviceMap.remove(mapDev.getMac());
            }
        } else {
            if (mapDev == null) {
                mLog.d("__syncDevice add " + device.getMac());
                mDeviceMap.put(device.getMac(), device);
            } else {
                mLog.d("__syncDevice sync state " + device.getMac());
                for (EspDeviceCharacteristic characteristic : device.getCharacteristics()) {
                    if (mapDev.getCharacteristic(characteristic.getCid()) == null) {
                        mapDev.addOrReplaceCharacteristic(characteristic);
                    }
                }
                syncState(mapDev, device);
            }
        }
    }

    void syncDevice(IEspDevice device) {
        synchronized (mDeviceLock) {
            __syncDevice(device);
        }
    }

    void syncDevices(Collection<IEspDevice> devices) {
        synchronized (mDeviceLock) {
            for (IEspDevice device : devices) {
                __syncDevice(device);
            }
        }
    }

    IEspDevice removeDevice(String mac) {
        synchronized (mDeviceLock) {
            return mDeviceMap.remove(mac);
        }
    }

    void updateDevices(Collection<IEspDevice> devices) {
        List<IEspDevice> newDevices = new LinkedList<>(devices);

        synchronized (mDeviceLock) {
            mDeviceMap.clear();

            // Remove delete state devices
            for (IEspDevice newDev : newDevices) {
                if (!newDev.isState(EspDeviceState.State.DELETED)) {
                    mDeviceMap.put(newDev.getMac(), newDev);
                }
            }
        }
    }

    void scanStations(DeviceScanCallback callback) {
        List<IEspDevice> scanResult = new EspActionDeviceStation().doActionScanStationsLocal(callback);
        updateDevices(scanResult);
    }

    List<IEspGroup> getAllGroupList() {
        synchronized (mGroupLock) {
            return new ArrayList<>(mGroupMap.values());
        }
    }

    IEspGroup getGroupById(long id) {
        synchronized (mGroupLock) {
            return mGroupMap.get(id);
        }
    }

    void loadGroups() {
        EspActionGroup action = new EspActionGroup();
        List<IEspGroup> groups = action.doActionLoadGroups();
        synchronized (mGroupLock) {
            mGroupMap.clear();
            for (IEspGroup group : groups) {
                mGroupMap.put(group.getId(), group);
            }
        }
    }
}
