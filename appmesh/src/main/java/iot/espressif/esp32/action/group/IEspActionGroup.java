package iot.espressif.esp32.action.group;

import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.action.IEspAction;
import iot.espressif.esp32.model.group.IEspGroup;

public interface IEspActionGroup extends IEspAction {
    List<IEspGroup> doActionLoadGroups();
    long doActionAddGroup(String name, boolean isUser, boolean isMesh);
    boolean doActionEditGroup(long id, String name, boolean isUser, boolean isMesh);
    void doActionDeleteGroup(long id);
    void doActionCopyDeviceMacs(Collection<String> macs, IEspGroup dstGroup);
    void doActionCutDeviceMacs(Collection<String> macs, IEspGroup srcGroup, IEspGroup dstGroup);
    void doActionDeleteDeviceMacs(Collection<String> macs, IEspGroup group);
}
