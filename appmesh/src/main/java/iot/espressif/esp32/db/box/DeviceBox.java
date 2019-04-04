package iot.espressif.esp32.db.box;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.db.model.DeviceDB_;
import iot.espressif.esp32.model.device.IEspDevice;

public class DeviceBox {
    private Box<DeviceDB> mBox;

    DeviceBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(DeviceDB.class);
    }

    public DeviceDB loadDevice(String mac) {
        return mBox.query().equal(DeviceDB_.mac, mac).build().findUnique();
    }

    public List<DeviceDB> loadAllDevices() {
        return mBox.getAll();
    }

    public long saveDevice(IEspDevice device) {
        DeviceDB cache = loadDevice(device.getMac());
        DeviceDB entity = cache == null ? new DeviceDB() : cache;
//        entity.id = device.getId();
        entity.mac = device.getMac();
        entity.name = device.getName();
        entity.tid = device.getDeviceTypeId();
        entity.protocol = device.getProtocol();
        entity.protocol_port = device.getProtocolPort();
        entity.rom_version = device.getRomVersion();
        entity.idf_version = device.getIdfVersion();
        entity.mlink_version = device.getMlinkVersion();
        entity.trigger = device.getTrigger();
        entity.events = device.getEvents();
        entity.position = device.getPosition();

        return mBox.put(entity);
    }

    public void deleteDevice(long id) {
        mBox.remove(id);
    }
}
