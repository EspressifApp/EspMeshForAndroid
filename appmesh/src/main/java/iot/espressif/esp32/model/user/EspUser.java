package iot.espressif.esp32.model.user;

import android.text.TextUtils;

import java.util.Collection;
import java.util.List;

import iot.espressif.esp32.action.user.EspActionUserLogin;
import iot.espressif.esp32.action.user.EspActionUserLogout;
import iot.espressif.esp32.action.user.EspActionUserRegister;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.group.IEspGroup;

public enum EspUser {
    INSTANCE;

    private final EspUserImpl mUser = new EspUserImpl();

    public void clear() {
        mUser.clear();
    }

    public boolean isLogged() {
        return !TextUtils.isEmpty(getKey());
    }

    public long getId() {
        return mUser.getId();
    }

    public void setId(long id) {
        mUser.setId(id);
    }

    public String getKey() {
        return mUser.getKey();
    }

    public void setKey(String key) {
        mUser.setKey(key);
    }

    public String getEmail() {
        return mUser.getEmail();
    }

    public void setEmail(String email) {
        mUser.setEmail(email);
    }

    public String getName() {
        return mUser.getName();
    }

    public void setName(String name) {
        mUser.setName(name);
    }

    public EspLoginResult login(String email, String password, boolean savePwd) {
        return new EspActionUserLogin().doActionLogin(email, password, savePwd);
    }

    public void logout() {
        new EspActionUserLogout().doActionLogout();
        clear();
    }

    public EspRegisterResult register(String username, String email, String password) {
        return new EspActionUserRegister().doActionRegister(username, email, password);
    }

    public void scanStations() {
        scanStations(null);
    }

    public void scanStations(DeviceScanCallback callback) {
        mUser.scanStations(callback);
    }

    public IEspDevice getDeviceForMac(String mac) {
        return mUser.getDeviceForMac(mac);
    }

    public List<IEspDevice> getAllDeviceList() {
        return mUser.getAllDeviceList();
    }

    public List<IEspGroup> getAllGroupList() {
        return mUser.getAllGroupList();
    }

    public IEspGroup getGroupById(long id) {
        return mUser.getGroupById(id);
    }

    public void loadGroups() {
        if (!isLogged()) {
            return;
        }
        mUser.loadGroups();
    }

    public void addGroup(IEspGroup group) {
        if (!isLogged()) {
            return;
        }
        mUser.addGroup(group);
    }

    public void deleteGroup(long id) {
        if (!isLogged()) {
            return;
        }
        mUser.deleteGroup(id);
    }

    public void syncDevice(IEspDevice device) {
        if (!isLogged()) {
            return;
        }
        mUser.syncDevice(device);
    }

    public void syncDevices(Collection<IEspDevice> devices) {
        if (!isLogged()) {
            return;
        }
        mUser.syncDevices(devices);
    }

    public void updateDevices(Collection<IEspDevice> devices) {
        if (!isLogged()) {
            return;
        }
        mUser.updateDevices(devices);
    }

    public IEspDevice removeDevice(String mac) {
        return mUser.removeDevice(mac);
    }
}
