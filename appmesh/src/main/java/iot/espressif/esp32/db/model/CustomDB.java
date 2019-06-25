package iot.espressif.esp32.db.model;

import io.objectbox.annotation.Entity;
import io.objectbox.annotation.Id;
import io.objectbox.annotation.Index;

@Entity
public class CustomDB {
    @Id
    public long id;

    @Index
    public String tag;

    public String key;

    public String value1;

    public String value2;

    public String value3;

    public String value4;

    public String value5;

    public String value6;
}
