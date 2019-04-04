package iot.espressif.esp32.db.box;

import java.util.List;

import io.objectbox.Box;
import io.objectbox.BoxStore;
import iot.espressif.esp32.db.model.SceneDB;

public class SceneBox {
    private Box<SceneDB> mBox;

    SceneBox(BoxStore boxStore) {
        mBox = boxStore.boxFor(SceneDB.class);
    }

    public long saveScene(String name, String icon, String background) {
        return saveScene(0, name, icon, background);
    }

    public long saveScene(long id, String name, String icon, String background) {
        SceneDB entity = new SceneDB();
        entity.id = id;
        entity.name = name;
        entity.icon = icon;
        entity.background = background;
        return mBox.put(entity);
    }

    public SceneDB loadScene(long id) {
        return mBox.get(id);
    }

    public List<SceneDB> loadAllScenes() {
        return mBox.getAll();
    }

    public void deleteScene(long id) {
        mBox.remove(id);
    }
}
