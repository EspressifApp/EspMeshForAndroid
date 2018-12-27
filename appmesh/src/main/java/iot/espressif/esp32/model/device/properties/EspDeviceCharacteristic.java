package iot.espressif.esp32.model.device.properties;

public class EspDeviceCharacteristic {
    public static final String FORMAT_INT = "int";
    public static final String FORMAT_DOUBLE = "double";
    public static final String FORMAT_STRING = "string";
    public static final String FORMAT_JSON = "json";

    private int mCid;
    private String mName;
    private String mFormat;
    private int mPerms;
    private Number mMax;
    private Number mMin;
    private Number mStep;
    private Object mValue;

    public int getCid() {
        return mCid;
    }

    public void setCid(int cid) {
        mCid = cid;
    }

    public String getName() {
        return mName;
    }

    public void setName(String name) {
        mName = name;
    }

    public String getFormat() {
        return mFormat;
    }

    public void setFormat(String format) {
        mFormat = format;
    }

    public int getPerms() {
        return mPerms;
    }

    public void setPerms(int perms) {
        mPerms = perms;
    }

    public boolean isReadable() {
        return (mPerms & 1) == 1;
    }

    public boolean isWritable() {
        return ((mPerms >> 1) & 1) == 1;
    }

    public boolean isEventAvailable() {
        return ((mPerms >> 2) & 1) == 1;
    }

    public Object getValue() {
        return mValue;
    }

    public void setValue(Object value) {
        mValue = value;
    }

    public Number getMin() {
        return mMin;
    }

    public void setMin(Number min) {
        mMin = min;
    }

    public Number getMax() {
        return mMax;
    }

    public void setMax(Number max) {
        mMax = max;
    }

    public Number getStep() {
        return mStep;
    }

    public void setStep(Number step) {
        mStep = step;
    }

    public EspDeviceCharacteristic cloneInstance() {
        EspDeviceCharacteristic clone = newInstance(getFormat());
        if (clone != null) {
            clone.setCid(getCid());
            clone.setName(getName());
            clone.setPerms(getPerms());
            clone.setMin(getMin());
            clone.setMax(getMax());
            clone.setStep(getStep());
            clone.setValue(getValue());
        }

        return clone;
    }

    public static EspDeviceCharacteristic newInstance(String format) {
        EspDeviceCharacteristic result = new EspDeviceCharacteristic();
        switch (format) {
            case FORMAT_INT:
            case FORMAT_DOUBLE:
            case FORMAT_STRING:
            case FORMAT_JSON:
                break;
            default:
                return null;
        }

        result.setFormat(format);
        return result;
    }
}
