package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;

@Entity
public class UserLastLoginDB {
    @Id(assignable = true)
    public long id;

    public long user_id;
}
