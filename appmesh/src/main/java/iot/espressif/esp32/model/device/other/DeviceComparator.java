package iot.espressif.esp32.model.device.other;

import java.text.Collator;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import libs.espressif.log.EspLog;

public class DeviceComparator {
    private final EspLog log = new EspLog(getClass());

    private Comparator<IEspDevice> mDeviceNameComparator = new Comparator<IEspDevice>() {
        @Override
        public int compare(IEspDevice lDevice, IEspDevice rDevice) {
            int result;
            // Sort by state
            result = compareState(lDevice, rDevice);

            if (result == 0) {
                // Same state, sort by device name
                result = compareName(lDevice, rDevice);
            }

            if (result == 0) {
                // Same device name, sort by bssid
                result = compareBssid(lDevice, rDevice);
            }

            return result;
        }
    };
    private Comparator<IEspDevice> mActivateTimeComparator = new Comparator<IEspDevice>() {
        @Override
        public int compare(IEspDevice lDevice, IEspDevice rDevice) {
            int result;
            // Sort by state
            result = compareState(lDevice, rDevice);

            if (result == 0) {
                // Same activated time, sort by bssid
                result = compareBssid(lDevice, rDevice);
            }

            return result;
        }
    };

    public void sort(List<IEspDevice> deviceList, DeviceSortType sortType) {
        Comparator<IEspDevice> comparator = null;
        switch (sortType) {
            case DEVICE_NAME:
                comparator = mDeviceNameComparator;
                Collections.sort(deviceList, comparator);
                break;
            case ACTIVATED_TIME:
                comparator = mActivateTimeComparator;
                Collections.sort(deviceList, comparator);
                break;
            case MESH_TOPO:
                sortByTopo(deviceList);
                break;
        }
    }

    private int getStateCompareValue(IEspDevice device) {
        if (device.isState(EspDeviceState.State.CLOUD)
                || device.isState(EspDeviceState.State.LOCAL)) {
            return 1;
        } else if (device.isState(EspDeviceState.State.OFFLINE)) {
            return 5;
        } else {
            return 10;
        }
    }

    public int compareState(IEspDevice lDevice, IEspDevice rDevice) {
        Integer lState = getStateCompareValue(lDevice);
        Integer rState = getStateCompareValue(rDevice);

        return lState.compareTo(rState);
    }

    public int compareBssid(IEspDevice lDevice, IEspDevice rDevice) {
        String lBssid = lDevice.getMac();
        String rBssid = rDevice.getMac();

        return lBssid.compareTo(rBssid);
    }

    public int compareName(IEspDevice lDevice, IEspDevice rDevice) {
        int result;

        String lName = lDevice.getName().toUpperCase(Locale.getDefault());
        String rName = rDevice.getName().toUpperCase(Locale.getDefault());
        if (lName.equals(rName)) {
            result = 0;
        } else {
            // order device by its name
            List<String> lrNameList = new ArrayList<>();
            lrNameList.add(lName);
            lrNameList.add(rName);
            // for Chinese can't be compared by its name directly,
            // but Chinese can be sorted by its name directly
            Collections.sort(lrNameList, Collator.getInstance(Locale.getDefault()));
            if (lrNameList.get(0).equals(lName)) {
                result = -1;
            } else {
                result = 1;
            }
        }
        return result;
    }

    private void sortByTopo(List<IEspDevice> deviceList) {
        if (deviceList.isEmpty()) {
            return;
        }

        final int rootLayer = IEspDevice.LAYER_ROOT;

        LinkedList<IEspDevice> srcDevices = new LinkedList<>();
        srcDevices.addAll(deviceList);
        Collections.sort(srcDevices, mDeviceNameComparator);

        int minLayer = Integer.MAX_VALUE;
        int maxLayer = IEspDevice.LAYER_ROOT;
        LinkedList<IEspDevice> willDevices = new LinkedList<>();
        LinkedList<IEspDevice> offlineDevices = new LinkedList<>();
        for (IEspDevice dev : srcDevices) {
            if (dev.isState(EspDeviceState.State.OFFLINE)) {
                offlineDevices.add(dev);
            } else {
                willDevices.add(dev);

                minLayer = Math.min(minLayer, dev.getMeshLayerLevel());
                maxLayer = Math.max(maxLayer, dev.getMeshLayerLevel());
            }
        }
        log.d("toposort minlayer = " + minLayer + " maxlayer = " + maxLayer);

        LinkedList<IEspDevice> doneDevices = new LinkedList<>();

        for (int layer = minLayer; layer <= maxLayer; layer++) {
            for (int willIndex = willDevices.size() - 1; willIndex >= 0; willIndex--) {
                IEspDevice willDev = willDevices.get(willIndex);
                if (willDev.getMeshLayerLevel() != layer) {
                    continue;
                }

                int insertIndex = 0;
                for (int doneIndex = 0; doneIndex < doneDevices.size(); doneIndex++) {
                    IEspDevice doneDev = doneDevices.get(doneIndex);
                    if (doneDev.getMac().equals(willDev.getParentDeviceMac())) {
                        insertIndex = doneIndex + 1;
                        break;
                    }
                }

                doneDevices.add(insertIndex, willDev);
                willDevices.remove(willIndex);
            }
        }
        log.d("topo sort find parent size = " + doneDevices.size());

        for (int willIndex = willDevices.size() - 1; willIndex >= 0; willIndex--) {
            IEspDevice willDev = willDevices.get(willIndex);
            int insertIndex = 0;
            for (int doneIndex = 0; doneIndex < doneDevices.size(); doneIndex++) {
                IEspDevice doneDev = doneDevices.get(doneIndex);
                if (doneDev.getMac().equals(willDev.getRootDeviceMac())) {
                    insertIndex = doneIndex + 1;
                    break;
                }
            }

            doneDevices.add(insertIndex, willDev);
            willDevices.remove(willIndex);
        }
        log.d("topo sort find root size = " + doneDevices.size());

        if (!willDevices.isEmpty()) {
            log.w("topo some device can't sort");
            doneDevices.addAll(willDevices);
        }

        deviceList.clear();
        deviceList.addAll(doneDevices);
        deviceList.addAll(offlineDevices);
        log.d("topo sort over");
    }

    public enum DeviceSortType {
        DEVICE_NAME, ACTIVATED_TIME, MESH_TOPO
    }
}
