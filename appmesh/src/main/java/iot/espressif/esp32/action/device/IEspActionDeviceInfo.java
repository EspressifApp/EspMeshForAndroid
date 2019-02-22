package iot.espressif.esp32.action.device;

import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import libs.espressif.net.EspHttpResponse;

public interface IEspActionDeviceInfo extends IEspActionDevice {
    String KEY_TID = "tid";
    String KEY_NAME = "name";
    String KEY_CHARACTERISTICS = "characteristics";
    String KEY_CID = "cid";
    String KEY_FORMAT = "format";
    String KEY_PERMS = "perms";
    String KEY_MIN = "min";
    String KEY_MAX = "max";
    String KEY_STEP = "step";
    String KEY_VALUE = "value";
    String KEY_CIDS = "cids";
    String KEY_VERSION = "version";
    String KEY_PROTOCOL = "protocol_version";
    String KEY_POSITION = "position";
    String KEY_MESH_ID = "mesh_id";
    String KEY_TRIGGER = "trigger";

    String REQUEST_GET_DEVICE_INFO = "get_device_info";
    String REQUEST_SET_STATUS = "set_status";
    String REQUEST_GET_STATUS = "get_status";

    String FORMAT_INT = EspDeviceCharacteristic.FORMAT_INT;
    String FORMAT_DOUBLE = EspDeviceCharacteristic.FORMAT_DOUBLE;
    String FORMAT_STRING = EspDeviceCharacteristic.FORMAT_STRING;
    String FORMAT_JSON = EspDeviceCharacteristic.FORMAT_JSON;

    boolean doActionGetDeviceInfoLocal(IEspDevice device);
    void doActionGetDevicesInfoLocal(Collection<IEspDevice> devices);
    boolean doActionSetStatusLocal(IEspDevice device, Collection<EspDeviceCharacteristic> characteristics);
    List<EspHttpResponse> doActionSetStatusLocal(Collection<IEspDevice> devices, Collection<EspDeviceCharacteristic> characteristics);
    boolean doActionGetStatusLocal(IEspDevice device, int... cids);
    void doActionGetStatusLocal(Collection<IEspDevice> devices, int... cids);


}
