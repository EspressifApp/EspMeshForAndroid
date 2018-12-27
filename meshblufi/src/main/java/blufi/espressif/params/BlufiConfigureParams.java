package blufi.espressif.params;

import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class BlufiConfigureParams implements Serializable {
    private int mOpMode;

    private String mStaBSSID;
    private String mStaSSID;
    private String mStaPassword;
    private int mWifiChannel = -1;
    private byte[] mMeshID;
    private String mMeshPassword;
    private int mMeshType = -1;
    private final Set<String> mWhiteList = new HashSet<>();
    private int mVotePercentage = -1;
    private int mVoteMaxCount = -1;
    private int mBackoffRssi = 1;
    private int mScanMinCount = -1;
    private int mScanFailCount = -1;
    private int mMonitorIeCount = -1;
    private int mRootHealingMS = -1;
    private Boolean mRootConflictsEnable;
    private Boolean mFixRootEnalble;
    private int mCapacityNum = -1;
    private int mMaxLayer = -1;
    private int mMaxConnection = -1;
    private int mAssocExpireMS = -1;
    private int mBeaconIntervalMS = -1;
    private int mPassiveScanMS = -1;
    private int mMonitorDurationMS = -1;
    private int mCnxRssi = 1;
    private int mSelectRssi = 1;
    private int mSwitchRssi = 1;
    private int mXonQsize = -1;
    private Boolean mRetransmitEnable;
    private Boolean mDataDropEnable;

    private int mSoftAPSecurity;
    private String mSoftAPSSID;
    private String mSoftAPPassword;
    private int mSoftAPChannel;
    private int mSoftAPMaxConnection;

    public int getOpMode() {
        return mOpMode;
    }

    public void setOpMode(int mode) {
        mOpMode = mode;
    }

    public String getStaBSSID() {
        return mStaBSSID;
    }

    public void setStaBSSID(String bssid) {
        mStaBSSID = bssid;
    }

    public String getStaSSID() {
        return mStaSSID;
    }

    public void setStaSSID(String ssid) {
        mStaSSID = ssid;
    }

    public String getStaPassword() {
        return mStaPassword;
    }

    public void setStaPassword(String password) {
        mStaPassword = password;
    }

    public int getWifiChannel() {
        return mWifiChannel;
    }

    public void setWifiChannel(int channel) {
        mWifiChannel = channel;
    }

    public byte[] getMeshID() {
        return mMeshID;
    }

    public void setMeshID(byte[] id) {
        mMeshID = id;
    }

    public void setMeshPassword(String meshPassword) {
        mMeshPassword = meshPassword;
    }

    public String getMeshPassword() {
        return mMeshPassword;
    }

    public void setMeshType(int meshType) {
        mMeshType = meshType;
    }

    public int getMeshType() {
        return mMeshType;
    }

    public void addWhiteAddress(String bleAddr) {
        mWhiteList.add(bleAddr);
    }

    public void removeWhiteAddress(String bleAddr) {
        mWhiteList.remove(bleAddr);
    }

    public Collection<String> getWhiteList() {
        return mWhiteList;
    }

    public int getVotePercentage() {
        return mVotePercentage;
    }

    public void setVotePercentage(int votePercentage) {
        mVotePercentage = votePercentage;
    }

    public int getVoteMaxCount() {
        return mVoteMaxCount;
    }

    public void setVoteMaxCount(int voteMaxCount) {
        mVoteMaxCount = voteMaxCount;
    }

    public int getBackoffRssi() {
        return mBackoffRssi;
    }

    public void setBackoffRssi(int backoffRssi) {
        mBackoffRssi = backoffRssi;
    }

    public int getScanMinCount() {
        return mScanMinCount;
    }

    public void setScanMinCount(int scanMinCount) {
        mScanMinCount = scanMinCount;
    }

    public int getScanFailCount() {
        return mScanFailCount;
    }

    public void setScanFailCount(int scanFailCount) {
        mScanFailCount = scanFailCount;
    }

    public int getMonitorIeCount() {
        return mMonitorIeCount;
    }

    public void setMonitorIeCount(int monitorIeCount) {
        mMonitorIeCount = monitorIeCount;
    }

    public int getRootHealingMS() {
        return mRootHealingMS;
    }

    public void setRootHealingMS(int rootHealingMS) {
        mRootHealingMS = rootHealingMS;
    }

    public Boolean isRootConflictsEnable() {
        return mRootConflictsEnable;
    }

    public void setRootConflictsEnable(Boolean rootConflictsEnable) {
        mRootConflictsEnable = rootConflictsEnable;
    }

    public Boolean isFixRootEnalble() {
        return mFixRootEnalble;
    }

    public void setFixRootEnalble(Boolean fixRootEnalble) {
        mFixRootEnalble = fixRootEnalble;
    }

    public int getCapacityNum() {
        return mCapacityNum;
    }

    public void setCapacityNum(int capacityNum) {
        mCapacityNum = capacityNum;
    }

    public int getMaxLayer() {
        return mMaxLayer;
    }

    public void setMaxLayer(int maxLayer) {
        mMaxLayer = maxLayer;
    }

    public int getMaxConnection() {
        return mMaxConnection;
    }

    public void setMaxConnection(int maxConnection) {
        mMaxConnection = maxConnection;
    }

    public int getAssocExpireMS() {
        return mAssocExpireMS;
    }

    public void setAssocExpireMS(int assocExpireMS) {
        mAssocExpireMS = assocExpireMS;
    }

    public int getBeaconIntervalMS() {
        return mBeaconIntervalMS;
    }

    public void setBeaconIntervalMS(int beaconIntervalMS) {
        mBeaconIntervalMS = beaconIntervalMS;
    }

    public int getPassiveScanMS() {
        return mPassiveScanMS;
    }

    public void setPassiveScanMS(int passiveScanMS) {
        mPassiveScanMS = passiveScanMS;
    }

    public int getMonitorDurationMS() {
        return mMonitorDurationMS;
    }

    public void setMonitorDurationMS(int monitorDurationMS) {
        mMonitorDurationMS = monitorDurationMS;
    }

    public int getCnxRssi() {
        return mCnxRssi;
    }

    public void setCnxRssi(int cnxRssi) {
        mCnxRssi = cnxRssi;
    }

    public int getSelectRssi() {
        return mSelectRssi;
    }

    public void setSelectRssi(int selectRssi) {
        mSelectRssi = selectRssi;
    }

    public int getSwitchRssi() {
        return mSwitchRssi;
    }

    public void setSwitchRssi(int switchRssi) {
        mSwitchRssi = switchRssi;
    }

    public int getXonQsize() {
        return mXonQsize;
    }

    public void setXonQsize(int xonQsize) {
        mXonQsize = xonQsize;
    }

    public Boolean isRetransmitEnable() {
        return mRetransmitEnable;
    }

    public void setRetransmitEnable(Boolean retransmitEnable) {
        mRetransmitEnable = retransmitEnable;
    }

    public Boolean isDataDropEnable() {
        return mDataDropEnable;
    }

    public void setDataDropEnable(Boolean dataDropEnable) {
        mDataDropEnable = dataDropEnable;
    }

    /*Start SoftAp*/
    public int getSoftAPSecurity() {
        return mSoftAPSecurity;
    }

    public void setSoftAPSecurity(int security) {
        mSoftAPSecurity = security;
    }

    public String getSoftAPSSID() {
        return mSoftAPSSID;
    }

    public void setSoftAPSSID(String ssid) {
        mSoftAPSSID = ssid;
    }

    public String getSoftAPPassword() {
        return mSoftAPPassword;
    }

    public void setSoftAPPAssword(String password) {
        mSoftAPPassword = password;
    }

    public int getSoftAPChannel() {
        return mSoftAPChannel;
    }

    public void setSoftAPChannel(int channel) {
        mSoftAPChannel = channel;
    }

    public int getSoftAPMaxConnection() {
        return mSoftAPMaxConnection;
    }

    public void setSoftAPMaxConnection(int connectionCount) {
        mSoftAPMaxConnection = connectionCount;
    }

    @Override
    public String toString() {
        return String.format(Locale.ENGLISH,
                "op mode = %d, sta bssid = %s, sta ssid = %s, sta password = %s, softap security = %d," +
                        " softap ssid = %s, softap password = %s, softap channel = %d, softap max connection = %d",
                mOpMode,
                mStaBSSID,
                mStaSSID,
                mStaPassword,
                mSoftAPSecurity,
                mSoftAPSSID,
                mSoftAPPassword,
                mSoftAPChannel,
                mSoftAPMaxConnection);
    }
}
