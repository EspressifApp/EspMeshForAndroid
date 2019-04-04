package iot.espressif.esp32.db.box;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import io.objectbox.query.QueryBuilder;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.db.model.SnifferDB_;
import iot.espressif.esp32.model.device.other.Sniffer;

public class SnifferBox {
    private Box<SnifferDB> mBox;

    SnifferBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(SnifferDB.class);
    }

    public List<SnifferDB> loadAllSniffers() {
        return mBox.query().orderDesc(SnifferDB_.utc_time).build().find();
    }

    public List<SnifferDB> loadSniffers(long minTime, long maxTime, boolean delDuplicate) {
        QueryBuilder<SnifferDB> builder = mBox.query();
        if (minTime >= 0) {
            builder.greater(SnifferDB_.utc_time, minTime);
        }
        if (maxTime >= 0) {
            if (minTime >= 0) {
                builder.and();
            }
            builder.less(SnifferDB_.utc_time, maxTime);
        }

        List<SnifferDB> cacheList = builder.orderDesc(SnifferDB_.utc_time).build().find();
        if (delDuplicate) {
            // Delete duplicate bssid
            Set<String> bssidSet = new HashSet<>();
            for (int i = 0; i < cacheList.size(); i++) {
                SnifferDB snifferDB = cacheList.get(i);
                if (bssidSet.contains(snifferDB.bssid)) {
                    cacheList.remove(i--);
                } else {
                    bssidSet.add(snifferDB.bssid);
                }
            }
        }

        return cacheList;
    }

    public long saveSniffer(Sniffer sniffer) {
        SnifferDB entity = new SnifferDB();
        entity.id = sniffer.getId();
        entity.type = sniffer.getType();
        entity.bssid = sniffer.getBssid();
        entity.utc_time = sniffer.getUTCTime();
        entity.rssi = sniffer.getRssi();
        entity.channel = sniffer.getChannel();
        entity.device_mac = sniffer.getDeviceMac();
        entity.organization = sniffer.getOrganization();
        entity.name = sniffer.getName();
        return mBox.put(entity);
    }
}
