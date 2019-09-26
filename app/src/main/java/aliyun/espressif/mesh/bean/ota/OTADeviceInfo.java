package aliyun.espressif.mesh.bean.ota;

import java.io.Serializable;

/**
 * Created by david on 2018/4/25.
 *
 * @author david
 * @date 2018/04/25
 */
public class OTADeviceInfo implements Serializable {
    public OTADeviceDetailInfo otaFirmwareDTO;
    public OTAStatusInfo otaUpgradeDTO;
}
