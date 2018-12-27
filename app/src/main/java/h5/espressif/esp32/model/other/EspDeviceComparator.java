package h5.espressif.esp32.model.other;

import android.text.TextUtils;

import java.util.Comparator;

import iot.espressif.esp32.model.device.IEspDevice;

public class EspDeviceComparator<T extends IEspDevice> implements Comparator<T> {
    @Override
    public int compare(IEspDevice o1, IEspDevice o2) {
        // Compare position
        String position1 = o1.getPosition() == null ? "" : o1.getPosition();
        String position2 = o2.getPosition() == null ? "" : o2.getPosition();
        int result = position1.compareTo(position2);

        // Compare tid
        if (result == 0) {
            Integer tid1 = o1.getDeviceTypeId();
            Integer tid2 = o2.getDeviceTypeId();
            result =  tid1.compareTo(tid2);
        }

        if (result == 0) {
            // Compare name
            String name1 = o1.getName();
            String name2 = o2.getName();
            if (name1 != null && name2 != null) {
                result = name1.compareTo(name2);
            }
        }

        if (result == 0) {
            // Compare mac
            String mac1 = o1.getMac();
            String mac2 = o2.getMac();
            if (mac1 != null && mac2 != null) {
                result = mac1.compareTo(mac2);
            }
        }

        return result;
    }
}