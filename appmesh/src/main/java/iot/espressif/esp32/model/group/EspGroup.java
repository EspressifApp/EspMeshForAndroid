package iot.espressif.esp32.model.group;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;

class EspGroup implements IEspGroup {
    private final HashSet<String> mBssids;
    private long mId;
    private String mName;

    EspGroup() {
        mBssids = new HashSet<>();
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
    public String getName() {
        return mName;
    }

    @Override
    public void setName(String name) {
        mName = name;
    }

    @Override
    public void addDeviceBssid(String bssid) {
        synchronized (mBssids) {
            mBssids.add(bssid);
        }
    }

    @Override
    public void addDeviceBssids(Collection<String> bssids) {
        synchronized (mBssids) {
            mBssids.addAll(bssids);
        }
    }

    @Override
    public void removeBssid(String bssid) {
        synchronized (mBssids) {
            mBssids.remove(bssid);
        }
    }

    @Override
    public void removeBssids(Collection<String> bssids) {
        synchronized (mBssids) {
            mBssids.removeAll(bssids);
        }
    }

    @Override
    public List<String> getDeviceBssids() {
        synchronized (mBssids) {
            LinkedList<String> result = new LinkedList<>();
            result.addAll(mBssids);
            return result;
        }
    }

    @Override
    public boolean containBssid(String bssid) {
        synchronized (mBssids) {
            return mBssids.contains(bssid);
        }
    }
}
