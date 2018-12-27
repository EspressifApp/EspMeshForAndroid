package iot.espressif.esp32.action.group;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import iot.espressif.esp32.db.model.GroupDB;
import iot.espressif.esp32.db.model.GroupDeviceDB;
import iot.espressif.esp32.db.manager.EspDBManager;
import iot.espressif.esp32.model.group.EspGroupFactory;
import iot.espressif.esp32.model.group.IEspGroup;

public class EspActionGroup implements IEspActionGroup {
    private EspDBManager mDBManager = EspDBManager.getInstance();

    @Override
    public List<IEspGroup> doActionLoadGroups() {
        List<IEspGroup> result = new LinkedList<>();

        List<GroupDB> groupDBs = mDBManager.group().loadGroups();
        for (GroupDB groupDB : groupDBs) {
            List<GroupDeviceDB> groupDeviceDBs = mDBManager.group().loadDeviceBssids(groupDB.getId());
            List<String> bssids = new ArrayList<>(groupDeviceDBs.size());
            for (GroupDeviceDB groupDeviceDB : groupDeviceDBs) {
                bssids.add(groupDeviceDB.getDevice_bssid());
            }

            IEspGroup group = EspGroupFactory.newGroup(groupDB.getId(), groupDB.getName(), bssids);
            result.add(group);
        }


        return result;
    }

    @Override
    public long doActionAddGroup(String name, boolean isUser, boolean isMesh) {
        return mDBManager.group().saveGroup(name, isUser, isMesh);
    }

    @Override
    public boolean doActionEditGroup(long id, String name, boolean isUser, boolean isMesh) {
        return mDBManager.group().saveGroup(id, name, isUser, isMesh);
    }

    @Override
    public void doActionDeleteGroup(long id) {
        mDBManager.group().deleteGroup(id);
    }

    @Override
    public void doActionCopyDeviceMacs(Collection<String> bssids, IEspGroup dstGroup) {
        for (String bssid : bssids) {
            mDBManager.group().saveGroupDeviceBssid(bssid, dstGroup.getId());
        }
        dstGroup.addDeviceBssids(bssids);
    }

    @Override
    public void doActionCutDeviceMacs(Collection<String> bssids, IEspGroup srcGroup, IEspGroup dstGroup) {
        for (String bssid : bssids) {
            mDBManager.group().saveGroupDeviceBssid(bssid, dstGroup.getId());
            mDBManager.group().deleteGroupDeviceBssid(bssid, srcGroup.getId());
        }
        dstGroup.addDeviceBssids(bssids);
        srcGroup.removeBssids(bssids);
    }

    public void doActionDeleteDeviceMacs(Collection<String> bssids, IEspGroup group) {
        for (String bssid : bssids) {
            mDBManager.group().deleteGroupDeviceBssid(bssid, group.getId());
        }
        group.removeBssids(bssids);
    }
}
