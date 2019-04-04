package iot.espressif.esp32.model.group;

import android.support.annotation.NonNull;

import java.util.Collection;

import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.db.model.GroupDB;

public class EspGroupFactory {
    public static IEspGroup newGroup(long id, @NonNull String name, boolean isUser, boolean isMesh,
                                     Collection<String> deviceBssids) {
        EspGroup group = new EspGroup();
        group.setId(id);
        group.setName(name);
        group.setIsUser(isUser);
        group.setIsMesh(isMesh);
        if (deviceBssids != null) {
            group.addDeviceBssids(deviceBssids);
        }

        return group;
    }

    public static IEspGroup parseGroupDB(GroupDB groupDB) {
        EspGroup group = new EspGroup();
        group.setId(groupDB.id);
        group.setName(groupDB.name);
        group.setIsUser(groupDB.is_user);
        group.setIsMesh(groupDB.is_mesh);

        for (DeviceDB deviceDB : groupDB.devices) {
            group.addDeviceBssid(deviceDB.mac);
        }

        return group;
    }
}
