package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;
import io.objectbox.annotation.Index;
import io.objectbox.annotation.Unique;
import io.objectbox.relation.ToMany;

@Entity
public class GroupDB {
    @Id(assignable = true)
    public long id;

    @Unique
    @Index
    public String name;

    public boolean is_user;

    public boolean is_mesh;

    public ToMany<DeviceDB> devices;
}
