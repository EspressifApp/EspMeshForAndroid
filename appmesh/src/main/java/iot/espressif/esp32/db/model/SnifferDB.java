package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;

@Entity
public class SnifferDB {
    @Id
    public Long id;

    public int type;

    public String bssid;

    public long utc_time;

    public int rssi;

    public int channel;

    public String device_mac;

    public String organization;

    public String name;
}
