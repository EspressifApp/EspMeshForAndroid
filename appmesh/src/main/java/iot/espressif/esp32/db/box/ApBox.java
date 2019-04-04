package iot.espressif.esp32.db.box;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.ApDB;
import iot.espressif.esp32.db.model.ApDB_;

public class ApBox {
    private Box<ApDB> mBox;

    ApBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(ApDB.class);
    }

    public ApDB loadAp(String ssid) {
        return mBox.query().equal(ApDB_.ssid, ssid).build().findUnique();
    }

    public List<ApDB> loadAllAps() {
        return mBox.getAll();
    }

    public long saveAp(String ssid, String password) {
        ApDB entity = loadAp(ssid);
        if (entity == null) {
            entity = new ApDB();
        }
        entity.ssid = ssid;
        entity.password = password;
        return mBox.put(entity);
    }
}
