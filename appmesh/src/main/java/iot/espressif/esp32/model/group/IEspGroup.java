package iot.espressif.esp32.model.group;

import java.util.Collection;
import java.util.List;

public interface IEspGroup {
    /**
     * Get group id
     *
     * @return group id
     */
    long getId();

    /**
     * Set group id
     *
     * @param id group id
     */
    void setId(long id);

    /**
     * Get group name
     *
     * @return group name
     */
    String getName();

    /**
     * Set group name
     *
     * @param name group name
     */
    void setName(String name);

    /**
     * Add device bssid in this group
     *
     * @param bssid device bssid
     */
    void addDeviceBssid(String bssid);

    /**
     * Add device bssids in this group
     *
     * @param bssids device bssids
     */
    void addDeviceBssids(Collection<String> bssids);

    /**
     * Remove device bssid from this group
     *
     * @param bssid device bssid
     */
    void removeBssid(String bssid);

    /**
     * Remove device bssids from this group
     *
     * @param bssids device bssids
     */
    void removeBssids(Collection<String> bssids);

    /**
     * Get all device bssids of the group
     *
     * @return device bssid list
     */
    List<String> getDeviceBssids();

    /**
     * Return true if group contain the specified device bssid
     *
     * @param bssid device bssid
     * @return true if the group contain device bssid
     */
    boolean containBssid(String bssid);
}
