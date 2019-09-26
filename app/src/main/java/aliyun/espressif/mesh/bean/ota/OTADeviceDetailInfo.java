package aliyun.espressif.mesh.bean.ota;

import java.io.Serializable;

/**
 * Created by david on 2018/4/8.
 *
 * @author david
 * @date 2018/04/08
 */
public class OTADeviceDetailInfo implements Serializable {
    /**
     * iotId 本地加入
     */
    public String iotId;

    /**
     * 设备当前版本号
     */
    public String currentVersion;

    /**
     * 当前版本时间戳
     */
    public String currentTimestamp;

    /**
     * 最新固件时间戳
     */
    public String timestamp;

    /**
     * 版本固件版本号，有新版本时以下信息提供，无新版本时提供当前版本对应信息
     */
    public String version;

    /**
     * 文件包大小
     */
    public String size;

    /**
     * 版本固件文件md5
     */
    public String md5;

    /**
     * 版本固件名称
     */
    public String name;

    /**
     * 版本固件地址，sts加密
     */
    public String url;

    /**
     * 版本详情描述
     */
    public String desc;

    /**
     * 设备入网type
     * Wifi:NET_WIFI
     * BlueTooth:NET_BT
     */
    public String netType;


    @Override
    public String toString() {
        return "OTADeviceDetailInfo{" +
                "iotId='" + iotId + '\'' +
                ", currentVersion='" + currentVersion + '\'' +
                ", currentTimestamp='" + currentTimestamp + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", version='" + version + '\'' +
                ", size='" + size + '\'' +
                ", md5='" + md5 + '\'' +
                ", name='" + name + '\'' +
                ", url='" + url + '\'' +
                ", desc='" + desc + '\'' +
                ", netType='" + netType + '\'' +
                '}';
    }
}
