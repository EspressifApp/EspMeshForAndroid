package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;
import io.objectbox.annotation.Index;
import io.objectbox.annotation.Unique;

@Entity
public class DeviceDB {
    @Id
    public long id;

    @Unique
    @Index
    public String mac;

    public String name;

    public int tid;

    public String protocol;

    public int protocol_port;

    public String rom_version;

    public String idf_version;

    public int mlink_version;

    public int trigger;

    public String events;

    public String position;
}
