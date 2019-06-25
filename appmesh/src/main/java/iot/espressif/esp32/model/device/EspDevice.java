package iot.espressif.esp32.model.device;

import android.text.TextUtils;
import android.util.SparseArray;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.utils.DeviceUtil;

class EspDevice implements IEspDevice {
    private final SparseArray<EspDeviceCharacteristic> mCharaArray;

    private long mId;
    private String mKey;
    private String mMac;
    private String mRomVersion;
    private String mName;
    private int mTypeId;
    private String mTypeName;
    private InetAddress mLanAddress;
    private EspDeviceState mState;
    private String mParentDeviceMac;
    private String mRootDeviceMac;
    private int mMeshLayerLevel;
    private String mMeshId;
    private String mProtocol;
    private int mProtocolPort = -1;
    private Map<String, Object> mCacheMap;
    private String mPosition;
    private int mRssi = RSSI_NULL;

    private String mIdfVersion;
    private String mMdfVersion;
    private int mMlinkVersion;
    private int mTrigger;

    private final Set<String> mGroups;

    EspDevice() {
        mCharaArray = new SparseArray<>();
        mCacheMap = new Hashtable<>();
        mMeshLayerLevel = LAYER_UNKNOW;
        mGroups = new HashSet<>();
    }

    @Override
    public long getId() {
        return mId;
    }

    @Override
    public void setId(long id) {
        mId = id;
    }

    @Override
    public String getKey() {
        return mKey;
    }

    @Override
    public void setKey(String key) {
        mKey = key;
    }

    @Override
    public String getMac() {
        return mMac;
    }

    @Override
    public void setMac(String mac) {
        mMac = mac;
    }

    @Override
    public String getRomVersion() {
        return mRomVersion;
    }

    @Override
    public void setRomVersion(String version) {
        mRomVersion = version;
    }

    @Override
    public String getName() {
        if (TextUtils.isEmpty(mName)) {
            return DeviceUtil.getNameByBssid(mMac);
        }
        return mName;
    }

    @Override
    public void setName(String name) {
        mName = name;
    }

    @Override
    public int getDeviceTypeId() {
        return mTypeId;
    }

    @Override
    public void setDeviceTypeId(int tid) {
        mTypeId = tid;
    }

    @Override
    public String getDeviceTypeName() {
        return mTypeName;
    }

    @Override
    public void setDeviceTypeName(String name) {
        mTypeName = name;
    }

    @Override
    public InetAddress getLanAddress() {
        return mLanAddress;
    }

    @Override
    public String getLanHostAddress() {
        return mLanAddress == null ? null : mLanAddress.getHostAddress();
    }

    @Override
    public void setLanAddress(InetAddress lanAddress) {
        mLanAddress = lanAddress;
    }

    @Override
    public void setDeviceState(EspDeviceState state) {
        mState = state;
    }

    @Override
    public void addState(EspDeviceState.State state) {
        mState.addState(state);
    }

    @Override
    public void removeState(EspDeviceState.State state) {
        mState.removeState(state);
    }

    @Override
    public void clearState() {
        mState.clearState();
    }

    @Override
    public boolean isState(EspDeviceState.State state) {
        return mState.isState(state);
    }

    @Override
    public String getParentDeviceMac() {
        return mParentDeviceMac;
    }

    @Override
    public void setParentDeviceMac(String parentMac) {
        mParentDeviceMac = parentMac;
    }

    @Override
    public String getRootDeviceMac() {
        return mRootDeviceMac;
    }

    @Override
    public void setRootDeviceMac(String rootMac) {
        mRootDeviceMac = rootMac;
    }

    @Override
    public int getMeshLayerLevel() {
        return mMeshLayerLevel;
    }

    @Override
    public void setMeshLayerLevel(int level) {
        mMeshLayerLevel = level;
    }

    public String getMeshId() {
        return mMeshId;
    }

    @Override
    public String getProtocol() {
        return mProtocol;
    }

    @Override
    public void setProtocol(String protocol) {
        mProtocol = protocol;
    }

    @Override
    public void setProtocolPort(int port) {
        mProtocolPort = port;
    }

    @Override
    public int getProtocolPort() {
        return mProtocolPort;
    }

    public void setMeshId(String meshId) {
        mMeshId = meshId;
    }

    @Override
    public EspDeviceCharacteristic getCharacteristic(int cid) {
        synchronized (mCharaArray) {
            return mCharaArray.get(cid);
        }
    }

    @Override
    public List<EspDeviceCharacteristic> getCharacteristics() {
        synchronized (mCharaArray) {
            List<EspDeviceCharacteristic> result = new ArrayList<>();
            for (int i = 0; i < mCharaArray.size(); i++) {
                result.add(mCharaArray.valueAt(i));
            }
            return result;
        }
    }

    @Override
    public void addOrReplaceCharacteristic(EspDeviceCharacteristic characteristic) {
        synchronized (mCharaArray) {
            mCharaArray.append(characteristic.getCid(), characteristic);
        }
    }

    @Override
    public void addOrReplaceCharacteristic(Collection<EspDeviceCharacteristic> characteristics) {
        synchronized (mCharaArray) {
            for (EspDeviceCharacteristic c : characteristics) {
                mCharaArray.append(c.getCid(), c);
            }
        }
    }

    @Override
    public void removeCharacteristic(int cid) {
        synchronized (mCharaArray) {
            mCharaArray.remove(cid);
        }
    }

    @Override
    public void clearCharacteristics() {
        synchronized (mCharaArray) {
            mCharaArray.clear();
        }
    }

    @Override
    public void putCahce(String key, Object value) {
        mCacheMap.put(key, value);
    }

    @Override
    public Object getCache(String key) {
        return mCacheMap.get(key);
    }

    @Override
    public void removeCache(String key) {
        mCacheMap.remove(key);
    }

    @Override
    public void setPosition(String position) {
        mPosition = position;
    }

    @Override
    public String getPosition() {
        return mPosition;
    }

    @Override
    public void setIdfVersion(String idfVersion) {
        mIdfVersion = idfVersion;
    }

    @Override
    public String getIdfVersion() {
        return mIdfVersion;
    }

    @Override
    public void setMdfVersion(String mdfVersion) {
        mMdfVersion = mdfVersion;
    }

    @Override
    public String getMdfVersion() {
        return mMdfVersion;
    }

    @Override
    public void setMlinkVersion(int mlinkVersion) {
        mMlinkVersion = mlinkVersion;
    }

    @Override
    public int getMlinkVersion() {
        return mMlinkVersion;
    }

    @Override
    public void setTrigger(int trigger) {
        mTrigger = trigger;
    }

    @Override
    public int getTrigger() {
        return mTrigger;
    }

    @Nonnull
    @Override
    public Collection<String> getGroupIds() {
        synchronized (mGroups) {
            return new ArrayList<>(mGroups);
        }
    }

    @Override
    public void setGroups(Collection<String> groupIds) {
        synchronized (mGroups) {
            mGroups.clear();
            mGroups.addAll(groupIds);
        }
    }

    @Override
    public boolean isInGroup(String groupId) {
        synchronized (mGroups) {
            return mGroups.contains(groupId);
        }
    }

    @Override
    public int getRssi() {
        return mRssi;
    }

    @Override
    public void setRssi(int rssi) {
        mRssi = rssi;
    }

    @Override
    public void release() {
        mCharaArray.clear();
        mCacheMap.clear();
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof IEspDevice)) {
            return false;
        }

        if (this == obj) {
            return true;
        }

        IEspDevice other = (IEspDevice) obj;
        return other.getMac().equals(mMac);
    }

    @Override
    public int hashCode() {
        return mMac == null ? super.hashCode() : mMac.hashCode();
    }
}
