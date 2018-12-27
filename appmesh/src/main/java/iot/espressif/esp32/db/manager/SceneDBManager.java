package iot.espressif.esp32.db.manager;

import java.util.List;

import iot.espressif.esp32.db.dao.DaoSession;
import iot.espressif.esp32.db.model.SceneDB;
import iot.espressif.esp32.db.dao.SceneDBDao;

public final class SceneDBManager {
    private DaoSession mDaoSession;

    SceneDBManager(DaoSession session) {
        mDaoSession = session;
    }

    public long saveScene(String name, String icon, String background) {
        SceneDB sceneDB = new SceneDB(null, name, icon, background);
        return mDaoSession.getSceneDBDao().insert(sceneDB);
    }

    public long saveScene(Long id, String name, String icon, String background) {
        SceneDB sceneDB = new SceneDB(id, name, icon, background);
        return mDaoSession.getSceneDBDao().insertOrReplace(sceneDB);
    }

    public SceneDB loadScene(Long id) {
        SceneDB sceneDB = mDaoSession.getSceneDBDao()
                .queryBuilder()
                .where(SceneDBDao.Properties.Id.eq(id))
                .unique();
        return sceneDB;
    }

    public List<SceneDB> loadScenes() {
        List<SceneDB> sceneDBList = mDaoSession.getSceneDBDao().loadAll();
        return sceneDBList;
    }

    public void deleteScene(Long id) {
        mDaoSession.getSceneDBDao().deleteByKey(id);
    }
}
