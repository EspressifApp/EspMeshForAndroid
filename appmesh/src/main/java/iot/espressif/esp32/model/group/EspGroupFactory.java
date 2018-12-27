package iot.espressif.esp32.model.group;

import android.support.annotation.NonNull;

import java.util.Collection;

public class EspGroupFactory {
    public static IEspGroup newGroup(long id, @NonNull String name, Collection<String> deviceBssids) {
        EspGroup group = new EspGroup();
        group.setId(id);
        group.setName(name);
        if (deviceBssids != null) {
            group.addDeviceBssids(deviceBssids);
        }

        return group;
    }
}
