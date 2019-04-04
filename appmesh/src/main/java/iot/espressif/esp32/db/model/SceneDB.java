package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;

@Entity
public class SceneDB {
    @Id
    public long id;

    public String name;

    public String icon;

    public String background;
}
