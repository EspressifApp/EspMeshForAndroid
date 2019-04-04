package iot.espressif.esp32.action.group;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.db.model.GroupDB;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.group.EspGroupFactory;
import iot.espressif.esp32.model.group.IEspGroup;
import iot.espressif.esp32.model.user.EspUser;

public class EspActionGroup implements IEspActionGroup {
    private MeshObjectBox mObjectBox = MeshObjectBox.getInstance();

    @Override
    public List<IEspGroup> doActionLoadGroups() {
        List<GroupDB> groupDBs = mObjectBox.group().loadAllGroups();

        List<IEspGroup> result = new ArrayList<>(groupDBs.size());
        for (GroupDB groupDB : groupDBs) {
            IEspGroup group = EspGroupFactory.parseGroupDB(groupDB);
            result.add(group);
        }

        return result;
    }

    @Override
    public long doActionSaveGroup(long id, String name, boolean isUser, boolean isMesh,
                                  Collection<String> deviceMacs) {
        EspUser user = EspUser.INSTANCE;
        IEspGroup group = user.getGroupById(id);
        boolean newGroup = false;
        if (group == null) {
            newGroup = true;
            group = EspGroupFactory.newGroup(id, name, isUser, isMesh, deviceMacs);
        } else {
            group.setName(name);
            group.setIsUser(isUser);
            group.setIsMesh(isMesh);
        }

        long[] deviceIds = null;
        if (deviceMacs != null) {
            List<Long> deviceIdList = new ArrayList<>(deviceMacs.size());
            group.clearBssids();
            for (String mac : deviceMacs) {
                IEspDevice device = user.getDeviceForMac(mac);
                if (device != null) {
                    deviceIdList.add(device.getId());
                    group.addDeviceBssid(mac);
                }
            }
            deviceIds = new long[deviceIdList.size()];
            for (int i = 0; i < deviceIds.length; i++) {
                deviceIds[i] = deviceIdList.get(i);
            }
        }

        long groupId = mObjectBox.group().saveGroup(group, deviceIds);
        if (newGroup) {
            group.setId(groupId);
            user.addGroup(group);
        }

        return groupId;
    }

    @Override
    public void doActionDeleteGroup(long id) {
        mObjectBox.group().deleteGroup(id);
        EspUser.INSTANCE.deleteGroup(id);
    }
}
