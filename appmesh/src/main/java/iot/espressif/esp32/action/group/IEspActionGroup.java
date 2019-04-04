package iot.espressif.esp32.action.group;

import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.action.IEspAction;
import iot.espressif.esp32.model.group.IEspGroup;

public interface IEspActionGroup extends IEspAction {
    List<IEspGroup> doActionLoadGroups();

    long doActionSaveGroup(long id, String name, boolean isUser, boolean isMesh, Collection<String> deviceMacs);

    void doActionDeleteGroup(long id);
}
