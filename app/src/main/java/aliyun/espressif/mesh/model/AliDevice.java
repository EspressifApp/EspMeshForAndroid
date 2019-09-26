package aliyun.espressif.mesh.model;

import com.aliyun.alink.linksdk.tmp.device.panel.PanelDevice;

import aliyun.espressif.mesh.bean.DeviceInfoBean;

public class AliDevice {
    private DeviceInfoBean mDeviceInfoBean;
    private PanelDevice mPanelDevice;

    private String mProductKey;
    private String mDeviceName;

    public AliDevice(String deviceName, String productKey) {
        mProductKey = productKey;
        mDeviceName = deviceName;
    }

    public DeviceInfoBean getDeviceInfoBean() {
        return mDeviceInfoBean;
    }

    public void setDeviceInfoBean(DeviceInfoBean deviceInfoBean) {
        mDeviceInfoBean = deviceInfoBean;
    }

    public PanelDevice getPanelDevice() {
        return mPanelDevice;
    }

    public void setPanelDevice(PanelDevice panelDevice) {
        mPanelDevice = panelDevice;
    }

    public String getDeviceName() {
        return mDeviceInfoBean == null ? mDeviceName : mDeviceInfoBean.getDeviceName();
    }

    public String getProductKey() {
        return mDeviceInfoBean == null ? mProductKey : mDeviceInfoBean.getProductKey();
    }
}
