package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;

@Entity
public class UserDB {
    @Id(assignable = true)
    public long id;

    public String key;

    public String name;

    public String email;

    public String password;
}
