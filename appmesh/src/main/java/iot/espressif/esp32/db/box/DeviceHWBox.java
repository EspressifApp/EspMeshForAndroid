package iot.espressif.esp32.db.box;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.DeviceHWDB;
import iot.espressif.esp32.db.model.DeviceHWDB_;

public class DeviceHWBox {
    private Box<DeviceHWDB> mBox;

    DeviceHWBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(DeviceHWDB.class);
    }

    public List<DeviceHWDB> loadAllDeviceHWs() {
        return mBox.getAll();
    }

    public DeviceHWDB loadDeviceHW(String mac) {
        return mBox.query().equal(DeviceHWDB_.mac, mac).build().findUnique();
    }

    public long saveDeviceHW(String mac, String code, String floor, String area, long time) {
        DeviceHWDB cache = loadDeviceHW(mac);
        DeviceHWDB entity = cache == null ? new DeviceHWDB() : cache;
        entity.mac = mac;
        entity.code = code;
        entity.floor = floor;
        entity.area = area;
        entity.time = time;
        return mBox.put(entity);
    }

    public void deleteDeviceHW(String mac) {
        DeviceHWDB cache = loadDeviceHW(mac);
        if (cache != null) {
            mBox.remove(cache);
        }
    }
}
