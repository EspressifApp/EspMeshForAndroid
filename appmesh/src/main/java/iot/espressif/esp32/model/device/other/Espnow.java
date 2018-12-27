package iot.espressif.esp32.model.device.other;

public class Espnow {
    private int mType;
    private int mOprt;
    private int mParams;
    private String mRecvMac;

    public int getType() {
        return mType;
    }

    public void setType(int type) {
        mType = type;
    }

    public int getOprt() {
        return mOprt;
    }

    public void setOprt(int oprt) {
        mOprt = oprt;
    }

    public int getParams() {
        return mParams;
    }

    public void setParams(int params) {
        mParams = params;
    }

    public String getRecvMac() {
        return mRecvMac;
    }

    public void setRecvMac(String recvMac) {
        mRecvMac = recvMac;
    }
}
