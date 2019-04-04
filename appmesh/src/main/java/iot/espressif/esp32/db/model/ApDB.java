package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;
import io.objectbox.annotation.Index;
import io.objectbox.annotation.Unique;

@Entity
public class ApDB {
    @Id
    public long id;

    @Unique
    @Index
    public String ssid;

    public String password;
}
