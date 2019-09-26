package aliyun.espressif.mesh.bean.ota;

import android.os.Parcel;
import android.os.Parcelable;


/**
 * Created by david on 2018/4/8.
 *
 * @author david
 * @date 2018/04/08
 */
public class OTADeviceSimpleInfo implements Parcelable {
    private static final String TAG = OTADeviceSimpleInfo.class.getSimpleName();
    /**
     * id
     */
    public String iotId;

    /**
     * 设备图标
     */
    public String image;

    /**
     * 设备名
     */
    public String deviceName;


    public OTADeviceSimpleInfo(){

    }


    protected OTADeviceSimpleInfo(Parcel in) {
        iotId = in.readString();
        image = in.readString();
        deviceName = in.readString();
    }

    public static final Creator<OTADeviceSimpleInfo> CREATOR = new Creator<OTADeviceSimpleInfo>() {
        @Override
        public OTADeviceSimpleInfo createFromParcel(Parcel in) {
            return new OTADeviceSimpleInfo(in);
        }

        @Override
        public OTADeviceSimpleInfo[] newArray(int size) {
            return new OTADeviceSimpleInfo[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(iotId);
        dest.writeString(image);
        dest.writeString(deviceName);
    }


    @Override
    public String toString() {
        return "OTADeviceSimpleInfo{" +
                "iotId='" + iotId + '\'' +
                ", image='" + image + '\'' +
                ", deviceName='" + deviceName + '\'' +
                '}';
    }
}
