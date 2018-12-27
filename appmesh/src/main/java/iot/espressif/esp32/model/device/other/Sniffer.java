package iot.espressif.esp32.model.device.other;

import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.TextUtils;
import android.text.format.DateFormat;
import android.text.style.ForegroundColorSpan;

import java.util.Locale;

import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.utils.TimeUtil;

public class Sniffer {
    public static final int TYPE_WIFI = 1 << 1;
    public static final int TYPE_BLE = 1 << 2;

    private Long mId;

    private int mType = -1;

    private String mBssid;
    private int mRssi;
    private int mChannel;
    private String mOrganization;
    private String mDeviceMac;
    private long mUTCTime;
    private String mManufacturerId;

    private String mName;

    private int mColor;

    public Long getId() {
        return mId;
    }

    public void setId(Long id) {
        mId = id;
    }

    public int getType() {
        return mType;
    }

    public void setType(int type) {
        mType = type;
    }

    public String getBssid() {
        return mBssid;
    }

    public void setBssid(String bssid) {
        mBssid = bssid;
    }

    public String getPkgTimeString() {
        return DateFormat.format("yyyy/MM/dd HH:mm:ss", TimeUtil.getSystemTime(getUTCTime())).toString();
    }

    public int getRssi() {
        return mRssi;
    }

    public void setRssi(int rssi) {
        mRssi = rssi;
    }

    public int getChannel() {
        return mChannel;
    }

    public void setChannel(int channel) {
        mChannel = channel;
    }

    public String getOrganization() {
        return mOrganization;
    }

    public void setOrganization(String org) {
        mOrganization = org;
    }

    public void setColor(int color) {
        mColor = color;
    }

    public String getDeviceMac() {
        return mDeviceMac;
    }

    public void setDeviceMac(String deviceMac) {
        mDeviceMac = deviceMac;
    }

    public long getUTCTime() {
        return mUTCTime;
    }

    public void setUTCTime(long UTCTime) {
        mUTCTime = UTCTime;
    }

    public void setManufacturerId(String manufacturerId) {
        mManufacturerId = manufacturerId;
    }

    public String getManufacturerId() {
        return mManufacturerId;
    }

    public String getName() {
        return mName;
    }

    public void setName(String name) {
        mName = name;
    }

    public CharSequence getInfoSpan() {
        String bssidStr = DeviceUtil.convertColonBssid(mBssid);
        String org = TextUtils.isEmpty(mOrganization) ? "Unknow" : mOrganization;
        String type = "Unknow";
        switch (mType) {
            case TYPE_WIFI:
                type = "WIFI";
                break;
            case TYPE_BLE:
                type = "BLE";
                break;
        }

        SpannableStringBuilder ssb = new SpannableStringBuilder();

        // Append time
        ssb.append("[").append(getPkgTimeString()).append("]").append("\n");

        int timeBegin = 0;
        int timeEnd = ssb.length();
        int orgBegin = ssb.length();

        // Append org
        ssb.append(org).append("\n");

        int orgEnd = ssb.length();

        ssb.append("Mac: ").append(bssidStr).append(", ");
        ssb.append("Type: ").append(type).append(", ");
        if (mName != null) {
            ssb.append("Name: ").append(mName).append(", ");
        }
        ssb.append("Rssi: ").append(String.valueOf(mRssi));

        if (mColor != 0) {
            ssb.setSpan(new ForegroundColorSpan(mColor), 0, ssb.length(), Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
        } else {
            ssb.setSpan(new ForegroundColorSpan(0xff26a69a), timeBegin, timeEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
            ssb.setSpan(new ForegroundColorSpan(0xff0091ea), orgBegin, orgEnd, Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
        }

        return ssb;
    }

    @Override
    public int hashCode() {
        return mBssid == null ? super.hashCode() : mBssid.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (!(obj instanceof Sniffer)) {
            return false;
        }

        Sniffer objResult = (Sniffer) obj;
        if (mBssid == null || objResult.mBssid == null) {
            return false;
        }

        return mBssid.equals(objResult.mBssid);
    }

    @Override
    public String toString() {
        return String.format(Locale.ENGLISH,
                "pkgTime=%d, mType=%d mBssid=%s, mRssi=%d, mChannel=%d, org=%s, mName=%s",
                mUTCTime, mType, mBssid, mRssi, mChannel, mOrganization, mName);
    }
}
