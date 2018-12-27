package iot.espressif.esp32.model.net;

import java.net.InetAddress;

public class IOTStation {
    private boolean mMesh;
    private String mMac;
    private InetAddress mAddress;

    public boolean isMesh() {
        return mMesh;
    }

    public void setMesh(boolean mesh) {
        mMesh = mesh;
    }

    public String getMac() {
        return mMac;
    }

    public void setMac(String mac) {
        mMac = mac;
    }

    public InetAddress getAddress() {
        return mAddress;
    }

    public void setAddress(InetAddress address) {
        mAddress = address;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }

        if (!(obj instanceof  IOTStation)) {
            return false;
        }

        IOTStation objSta = (IOTStation) obj;
        if (mMac == null || objSta.getMac() == null) {
            return false;
        }

        return mMac.equals(objSta.getMac());
    }

    @Override
    public int hashCode() {
        return mMac.hashCode();
    }
}
