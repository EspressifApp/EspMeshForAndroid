package h5.espressif.esp32.module.action;

import iot.espressif.esp32.action.device.IEspActionDevice;
import iot.espressif.esp32.action.device.IEspActionDeviceInfo;

public interface IEspActionJSON extends IEspActionDevice {
    String KEY_TID = IEspActionDeviceInfo.KEY_TID;
    String KEY_NAME = IEspActionDeviceInfo.KEY_NAME;
    String KEY_CHARACTERISTICS = IEspActionDeviceInfo.KEY_CHARACTERISTICS;
    String KEY_CID = IEspActionDeviceInfo.KEY_CID;
    String KEY_FORMAT = IEspActionDeviceInfo.KEY_FORMAT;
    String KEY_PERMS = IEspActionDeviceInfo.KEY_PERMS;
    String KEY_MIN = IEspActionDeviceInfo.KEY_MIN;
    String KEY_MAX = IEspActionDeviceInfo.KEY_MAX;
    String KEY_STEP = IEspActionDeviceInfo.KEY_STEP;
    String KEY_VALUE = IEspActionDeviceInfo.KEY_VALUE;
    String KEY_VERSION = IEspActionDeviceInfo.KEY_VERSION;
    String KEY_POSITION = IEspActionDeviceInfo.KEY_POSITION;
    String KEY_MESH_ID = IEspActionDeviceInfo.KEY_MESH_ID;
    String KEY_IDF_VERSION = IEspActionDeviceInfo.KEY_IDF_VERSION;
    String KEY_MDF_VERSION = IEspActionDeviceInfo.KEY_MDF_VERSION;
    String KEY_MLINK_VERSION = IEspActionDeviceInfo.KEY_MLINK_VERSION;
    String KEY_TRIGGER = IEspActionDeviceInfo.KEY_TRIGGER;
    String KEY_RSSI = IEspActionDeviceInfo.KEY_RSSI;
    String KEY_TSF_TIME = IEspActionDeviceInfo.KEY_TSF_TIME;
}
