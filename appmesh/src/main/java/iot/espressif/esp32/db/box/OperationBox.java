package iot.espressif.esp32.db.box;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.OperationDB;
import iot.espressif.esp32.db.model.OperationDB_;

public class OperationBox {
    private Box<OperationDB> mBox;

    OperationBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(OperationDB.class);
    }

    public long saveOperation(String type, String identity) {
        OperationDB cache = mBox.query().equal(OperationDB_.identity, identity).build().findUnique();
        OperationDB entity = cache == null ? new OperationDB() : cache;
        entity.type = type;
        entity.identity = identity;
        entity.time = System.currentTimeMillis();
        return mBox.put(entity);
    }

    public List<OperationDB> loadLastOperations(int count) {
        return mBox.query().orderDesc(OperationDB_.time)
                .build()
                .find(0, count);
    }

    public void deleteUntilLeftOperations(int leftCount) {
        List<OperationDB> cacheList = mBox.query().orderDesc(OperationDB_.time).build().find();
        for (int i = leftCount; i < cacheList.size(); i++) {
            OperationDB cache = cacheList.get(i);
            mBox.remove(cache);
        }
    }
}
