package iot.espressif.esp32.model.net;

public class MeshNode {
    private String mMac;
    private String mHost;

    private String mVer;
    private String mParentMac;
    private String[] mChildrenMac;
    private String mRootMac;
    private int mMeshLevel;
    private String mMeshId;

    private int mProtocolPort;
    private String mProtocolName;

    public String getHost() {
        return mHost;
    }

    public void setHost(String host) {
        mHost = host;
    }

    public String getVer() {
        return mVer;
    }

    public void setVer(String ver) {
        mVer = ver;
    }

    public String getMac() {
        return mMac;
    }

    public void setMac(String mac) {
        mMac = mac;
    }

    public String getParentMac() {
        return mParentMac;
    }

    public void setParentMac(String mac) {
        mParentMac = mac;
    }

    public String[] getChildrenMac() {
        return mChildrenMac;
    }

    public void setChildrenMac(String[] macs) {
        mChildrenMac = macs;
    }

    public String getRootMac() {
        return mRootMac;
    }

    public void setRootMac(String bssid) {
        mRootMac = bssid;
    }

    public int getMeshLevel() {
        return mMeshLevel;
    }

    public void setMeshLevel(int level) {
        mMeshLevel = level;
    }

    public String getMeshId() {
        return mMeshId;
    }

    public void setMeshId(String meshId) {
        mMeshId = meshId;
    }

    public int getProtocolPort() {
        return mProtocolPort;
    }

    public void setProtocolPort(int protocolPort) {
        mProtocolPort = protocolPort;
    }

    public String getProtocolName() {
        return mProtocolName;
    }

    public void setProtocolName(String protocolName) {
        mProtocolName = protocolName;
    }
}
