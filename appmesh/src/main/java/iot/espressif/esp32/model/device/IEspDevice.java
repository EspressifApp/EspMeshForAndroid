package iot.espressif.esp32.model.device;

import java.net.InetAddress;
import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;

public interface IEspDevice {
    int LAYER_ROOT = 1;
    int LAYER_UNKNOW = -1;

    int TID_UNKNOW = 0;

    String PROTOCOL_HTTP = "http";
    String PROTOCOL_HTTPS = "https";

    /**
     * The value means can't get rssi vale of the device
     */
    int RSSI_NULL = 1;

    /**
     * Get device id
     *
     * @return device id
     */
    long getId();

    /**
     * Set device id
     *
     * @param id device id
     */
    void setId(long id);

    /**
     * Get device key
     *
     * @return device key
     */
    String getKey();

    /**
     * Set device key
     *
     * @param key device key
     */
    void setKey(String key);

    /**
     * Get device mac
     *
     * @return device mac
     */
    String getMac();

    /**
     * Set device mac
     *
     * @param mac device mac
     */
    void setMac(String mac);

    /**
     * Get current device rom version
     *
     * @return current device rom version
     */
    String getRomVersion();

    /**
     * Set current device rom version
     *
     * @param version current device rom version
     */
    void setRomVersion(String version);

    /**
     * Get device name
     *
     * @return device name
     */
    String getName();

    /**
     * Set device name
     *
     * @param name device name
     */
    void setName(String name);

    /**
     * Get device type id
     *
     * @return device type id
     */
    int getDeviceTypeId();

    /**
     * Set device type id
     *
     * @param tid device type id
     */
    void setDeviceTypeId(int tid);

    /**
     * Get device type name
     *
     * @return device type name
     */
    String getDeviceTypeName();

    /**
     * Set device type name
     *
     * @param name device type name
     */
    void setDeviceTypeName(String name);

    /**
     * Get #InetAddress of the station device
     *
     * @return device InetAddress
     */
    InetAddress getLanAddress();

    /**
     * Set #InetAddress of the station device
     *
     * @param lanAddress device address
     */
    void setLanAddress(InetAddress lanAddress);

    /**
     * Get device host address
     *
     * @return device host address
     */
    String getLanHostAddress();

    /**
     * Set device current state
     *
     * @param state device state
     */
    void setDeviceState(EspDeviceState state);

    /**
     * Add device state
     *
     * @param state device state
     */
    void addState(EspDeviceState.State state);

    /**
     * Remove state from device
     *
     * @param state device state
     */
    void removeState(EspDeviceState.State state);

    /**
     * Clear device state
     */
    void clearState();

    /**
     * Whether device contain target state
     *
     * @param state device state
     * @return true if contain state
     */
    boolean isState(EspDeviceState.State state);

    /**
     * Get the parent device bssid in mesh device
     *
     * @return the parent device bssid in mesh device(root's parent bssid is null)
     */
    String getParentDeviceMac();

    /**
     * Set the parent device mac in mesh device
     *
     * @param parentMac the parent device mac(root's parent mac is null)
     */
    void setParentDeviceMac(String parentMac);

    /**
     * Get device's mesh group root device mac. If the device is root device, return mac of itself.
     *
     * @return root device's bssid
     */
    String getRootDeviceMac();

    /**
     * Set root device mac of device's mesh group
     *
     * @param rootMac
     */
    void setRootDeviceMac(String rootMac);

    /**
     * Set the device's group address
     *
     * @param groupMac
     */
    void setGroupMac(String groupMac);

    /**
     * Get the device's group address
     *
     * @return address of device's group
     */
    String getGroupMac();

    /**
     * Get mesh layer level
     *
     * @return mesh layer level
     */
    int getMeshLayerLevel();

    /**
     * Set mesh layer level
     *
     * @param level mesh layer level
     */
    void setMeshLayerLevel(int level);

    /**
     * Get mesh id
     *
     * @return mesh id string
     */
    String getMeshId();

    /**
     * Set mesh id
     *
     * @param meshId mesh id
     */
    void setMeshId(String meshId);

    /**
     * Get device protocol
     *
     * @return device protocol
     */
    String getProtocol();

    /**
     * Set device protocol
     *
     * @param protocol device protocol
     */
    void setProtocol(String protocol);

    /**
     * Get the port of the device protocol
     *
     * @return protocol port;
     */
    int getProtocolPort();

    /**
     * Set the port of the device protocol
     *
     * @param port protocol port
     */
    void setProtocolPort(int port);

    /**
     * Get characteristic by cid
     *
     * @param cid characteristic id
     * @return null if no such characteristic
     */
    EspDeviceCharacteristic getCharacteristic(int cid);

    /**
     * Get all characteristics of the devices
     *
     * @return characteristic list
     */
    List<EspDeviceCharacteristic> getCharacteristics();

    /**
     * Add or update a characteristic
     *
     * @param characteristic device characteristic
     */
    void addOrReplaceCharacteristic(EspDeviceCharacteristic characteristic);

    /**
     * Add or update characteristics
     *
     * @param characteristics device characteristics
     */
    void addOrReplaceCharacteristic(Collection<EspDeviceCharacteristic> characteristics);


    /**
     * Remove characteristic by cid
     *
     * @param cid characteristic id
     */
    void removeCharacteristic(int cid);

    /**
     * Remove all characteristics
     */
    void clearCharacteristics();

    /**
     * Put an object in map
     *
     * @param key   map key
     * @param value map value
     */
    void putCahce(String key, Object value);

    /**
     * Get the object saved
     *
     * @param key map key
     * @return null if no such value
     */
    Object getCache(String key);

    /**
     * Remove the object in map
     *
     * @param key map key
     */
    void removeCache(String key);

    /**
     * Release the device data
     */
    void release();

    /*
     * Interface definition for a callback to be invoked when invoke {@link #notifyStatusChanged()}
     */
    interface StatusChangedListener {
        void onStatusChanged(String bssid);
    }

    void setPosition(String position);

    String getPosition();

    void setIdfVersion(String version);

    String getIdfVersion();

    void setMdfVersion(String version);

    String getMdfVersion();

    void setMlinkVersion(int version);

    int getMlinkVersion();

    void setTrigger(int trigger);

    int getTrigger();
}
