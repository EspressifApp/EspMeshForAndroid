package iot.espressif.esp32.db.box;

import androidx.annotation.NonNull;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.CustomDB;
import iot.espressif.esp32.db.model.CustomDB_;

public class CustomBox {
    private static final String TAG_HW = "hw";
    private static final String TAG_EVENTS = "events";

    private Box<CustomDB> mBox;

    CustomBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(CustomDB.class);
    }

    public List<CustomDB> loadAllDeviceHWs() {
        return mBox.query()
                .equal(CustomDB_.tag, TAG_HW)
                .build()
                .find();
    }

    public CustomDB loadDeviceHW(@NonNull String mac) {
        return mBox.query()
                .equal(CustomDB_.tag, TAG_HW)
                .and()
                .equal(CustomDB_.key, mac)
                .build()
                .findUnique();
    }

    public long saveDeviceHW(@NonNull String mac, String code, String floor, String area, long time) {
        CustomDB cache = loadDeviceHW(mac);
        CustomDB entity = cache == null ? new CustomDB() : cache;
        entity.tag = TAG_HW;
        entity.key = mac;
        entity.value1 = code;
        entity.value2 = floor;
        entity.value3 = area;
        entity.value4 = String.valueOf(time);
        return mBox.put(entity);
    }

    public void deleteDeviceHW(@NonNull String mac) {
        CustomDB cache = loadDeviceHW(mac);
        if (cache != null) {
            mBox.remove(cache);
        }
    }

    public List<CustomDB> loadAllDeviceEvents() {
        return mBox.query()
                .equal(CustomDB_.tag, TAG_EVENTS)
                .build()
                .find();
    }

    public CustomDB loadDeviceEvents(@NonNull String mac) {
        return mBox.query()
                .equal(CustomDB_.tag, TAG_EVENTS)
                .and()
                .equal(CustomDB_.key, mac)
                .build()
                .findUnique();
    }

    public long saveDeviceEvents(@NonNull String mac, String events, String coordinate) {
        CustomDB cache = loadDeviceEvents(mac);
        CustomDB entity = cache == null ? new CustomDB() : cache;
        entity.tag = TAG_EVENTS;
        entity.key = mac;
        entity.value1 = events;
        entity.value2 = coordinate;
        return mBox.put(entity);
    }

    public void deleteDeviceEvents(@NonNull String mac) {
        CustomDB db = loadDeviceEvents(mac);
        if (db != null) {
            mBox.remove(db);
        }
    }

    public void deleteAllDeviceEvents() {
        List<CustomDB> list = loadAllDeviceEvents();
        mBox.remove(list);
    }
}
