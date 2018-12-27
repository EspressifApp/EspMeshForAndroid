package iot.espressif.esp32.model.device.properties;

import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

public class EspDeviceEvent {
    private String mName;
    private int mTriggerCid;
    private String mExecuteBssid;
    private HashMap<CompareType, Integer> mCompareMap;
    private HashMap<String, Collection<EspDeviceCharacteristic>> mContentMap;

    public EspDeviceEvent() {
        mCompareMap = new HashMap<>();
        mContentMap = new HashMap<>();
    }

    public String getName() {
        return mName;
    }

    public void setName(String name) {
        mName = name;
    }

    public int getTriggerCid() {
        return mTriggerCid;
    }

    public void setTriggerCid(int cid) {
        mTriggerCid = cid;
    }

    public String getExecuteBssid() {
        return mExecuteBssid;
    }

    public void setExecuteBssid(String bssid) {
        mExecuteBssid = bssid;
    }

    public void setCompare(CompareType type, int value) {
        mCompareMap.put(type, value);
    }

    public void removeCompare(CompareType type) {
        mCompareMap.remove(type);
    }

    public void clearCompare() {
        mCompareMap.clear();
    }

    public HashMap<CompareType, Integer> getComapreMap() {
        return mCompareMap;
    }

    public void setContent(String request, Collection<EspDeviceCharacteristic> characteristics) {
        mContentMap.put(request, characteristics);
    }

    public HashMap<String, Collection<EspDeviceCharacteristic>> getContentMap() {
        return mContentMap;
    }

    public String getContentRequest() {
        Iterator<String> iterator = mContentMap.keySet().iterator();
        if (iterator.hasNext()) {
            return iterator.next();
        }
        return null;
    }

    public Collection<EspDeviceCharacteristic> getContentCharacteristics() {
        Iterator<Collection<EspDeviceCharacteristic>> iterator = mContentMap.values().iterator();
        if (iterator.hasNext()) {
            return iterator.next();
        }

        return null;
    }

    public enum CompareType {
        gt(">"), lt("<"), eq("=="), neq("!="), rg("~"), up("/"), dn("\\");

        private final String mValue;

        CompareType(String value) {
            mValue = value;
        }

        public String getValue() {
            return mValue;
        }

        public static CompareType getCompareType(String value) {
            if (value.equals(gt.getValue())) {
                return gt;
            } else if (value.equals(lt.getValue())) {
                return lt;
            } else if (value.equals(eq.getValue())) {
                return eq;
            } else if (value.equals(neq.getValue())) {
                return neq;
            } else if (value.equals(rg.getValue())) {
                return rg;
            } else if (value.equals(up.getValue())) {
                return up;
            } else if (value.equals(dn.getValue())) {
                return dn;
            } else {
                return null;
            }
        }
    }
}
