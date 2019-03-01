package iot.espressif.esp32.model.device.ble;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class MeshConfigureParams {
    private String mAPSsid;
    private String mAPBssid;
    private String mAPPassword;

    private byte[] mMeshID;
    private String mMeshPassword;

    private Set<String> mWhiteList;

    public MeshConfigureParams() {
        mWhiteList = new HashSet<>();
    }

    public void setAPSsid(String APSsid) {
        mAPSsid = APSsid;
    }

    public String getAPSsid() {
        return mAPSsid;
    }

    public void setAPBssid(String APBssid) {
        mAPBssid = APBssid;
    }

    public String getAPBssid() {
        return mAPBssid;
    }

    public void setAPPassword(String APPassword) {
        mAPPassword = APPassword;
    }

    public String getAPPassword() {
        return mAPPassword;
    }

    public void setMeshID(byte[] meshID) {
        mMeshID = meshID;
    }

    public byte[] getMeshID() {
        return mMeshID;
    }

    public void setMeshPassword(String meshPassword) {
        mMeshPassword = meshPassword;
    }

    public String getMeshPassword() {
        return mMeshPassword;
    }

    public void setWhiteList(Collection<String> whiteList) {
        mWhiteList.clear();
        mWhiteList.addAll(whiteList);
    }

    public Set<String> getWhiteList() {
        return mWhiteList;
    }
}
