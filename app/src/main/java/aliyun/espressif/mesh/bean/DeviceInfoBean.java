package aliyun.espressif.mesh.bean;

public class DeviceInfoBean {


    /**
     * gmtModified : 1531360639000
     * categoryImage : http://iotx-paas-admin.oss-cn-shanghai.aliyuncs.com/publish/image/1526474704326.png
     * netType : NET_WIFI
     * nodeType : DEVICE
     * productKey : a1XoFUJWkPr
     * deviceName : VD_l2c4LuifwY
     * productName : 风扇-Demo
     * identityAlias : 15700192592
     * iotId : g1VQsQvQvHdkuGjI5unE0010eedc00
     * owned : 0
     * identityId : 5072op548214e63f60e5c5bb17631d9201ea1295
     * thingType : VIRTUAL
     * status : 1
     */

    private long gmtModified;
    private String categoryImage;
    private String netType;
    private String nodeType;
    private String productKey;
    private String deviceName;
    private String productName;
    private String identityAlias;
    private String iotId;
    private int owned;
    private String identityId;
    private String thingType;
    private int status;

    public long getGmtModified() {
        return gmtModified;
    }

    public void setGmtModified(long gmtModified) {
        this.gmtModified = gmtModified;
    }

    public String getCategoryImage() {
        return categoryImage;
    }

    public void setCategoryImage(String categoryImage) {
        this.categoryImage = categoryImage;
    }

    public String getNetType() {
        return netType;
    }

    public void setNetType(String netType) {
        this.netType = netType;
    }

    public String getNodeType() {
        return nodeType;
    }

    public void setNodeType(String nodeType) {
        this.nodeType = nodeType;
    }

    public String getProductKey() {
        return productKey;
    }

    public void setProductKey(String productKey) {
        this.productKey = productKey;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getIdentityAlias() {
        return identityAlias;
    }

    public void setIdentityAlias(String identityAlias) {
        this.identityAlias = identityAlias;
    }

    public String getIotId() {
        return iotId;
    }

    public void setIotId(String iotId) {
        this.iotId = iotId;
    }

    public int getOwned() {
        return owned;
    }

    public void setOwned(int owned) {
        this.owned = owned;
    }

    public String getIdentityId() {
        return identityId;
    }

    public void setIdentityId(String identityId) {
        this.identityId = identityId;
    }

    public String getThingType() {
        return thingType;
    }

    public void setThingType(String thingType) {
        this.thingType = thingType;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }


    @Override
    public String toString() {
        return "DeviceInfoBean{" +
                "gmtModified=" + gmtModified +
                ", categoryImage='" + categoryImage + '\'' +
                ", netType='" + netType + '\'' +
                ", nodeType='" + nodeType + '\'' +
                ", productKey='" + productKey + '\'' +
                ", deviceName='" + deviceName + '\'' +
                ", productName='" + productName + '\'' +
                ", identityAlias='" + identityAlias + '\'' +
                ", iotId='" + iotId + '\'' +
                ", owned=" + owned +
                ", identityId='" + identityId + '\'' +
                ", thingType='" + thingType + '\'' +
                ", status=" + status +
                '}';
    }
}
