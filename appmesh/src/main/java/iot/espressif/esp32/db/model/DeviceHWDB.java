package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;
import io.objectbox.annotation.Index;
import io.objectbox.annotation.Unique;

@Entity
public class DeviceHWDB {
    @Id
    public long id;

    @Unique
    @Index
    public String mac;

    public String code;

    public String floor;

    public String area;

    public long time;
}
