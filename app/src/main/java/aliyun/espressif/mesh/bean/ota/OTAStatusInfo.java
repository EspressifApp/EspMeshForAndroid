package aliyun.espressif.mesh.bean.ota;

/**
 * Created by david on 2018/4/13.
 *
 * @author david
 * @date 2018/04/13
 */
public class OTAStatusInfo {
    /**
     * id
     */
    public String iotId;

    /**
     * 步长
     */
    public String step;

    /**
     * 描述
     */
    public String desc;

    /**
     * needConfirm
     */
    public boolean needConfirm;

    /**
     * 升级状态 0：待升级/待确认， 1：升级中， 2：升级异常， 3：升级失败， 4：升级成功
     */
    public String upgradeStatus;
}
