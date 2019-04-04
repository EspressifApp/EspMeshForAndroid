package iot.espressif.esp32.db.box;

import java.util.ArrayList;
import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.db.model.GroupDB;
import iot.espressif.esp32.db.model.GroupDB_;
import iot.espressif.esp32.model.group.IEspGroup;

public class GroupBox {
    private Box<GroupDB> mGroupBox;
    private Box<DeviceDB> mDeviceBox;

    GroupBox(BoxStore boxStore) {
        mGroupBox = boxStore.boxFor(GroupDB.class);
        mDeviceBox = boxStore.boxFor(DeviceDB.class);
    }

    public long saveGroup(IEspGroup group, long[] deviceIds) {
        GroupDB entity = null;
        if (group.getId() != 0) {
            entity = mGroupBox.get(group.getId());
        }
        if (entity == null) {
            entity = new GroupDB();
            entity.id = group.getId();
            entity.name = group.getName();
            entity.is_user = group.isUser();
            entity.is_mesh = group.isMesh();
            if (deviceIds != null && deviceIds.length > 0) {
                mGroupBox.attach(entity);
                entity.devices.addAll(mDeviceBox.get(deviceIds));
            }
        } else {
            entity.name = group.getName();
            entity.is_user = group.isUser();
            entity.is_mesh = group.isMesh();
            if (deviceIds != null) {
                mGroupBox.attach(entity);
                entity.devices.clear();
                entity.devices.addAll(mDeviceBox.get(deviceIds));
            }
        }

        return mGroupBox.put(entity);
    }

    public GroupDB loadGroup(long id) {
        return mGroupBox.get(id);
    }

    public GroupDB loadGroup(String name) {
        return mGroupBox.query().equal(GroupDB_.name, name).build().findUnique();
    }

    public List<GroupDB> loadAllGroups() {
        return mGroupBox.getAll();
    }

    public void deleteGroup(long id) {
        mGroupBox.remove(id);
    }
}
