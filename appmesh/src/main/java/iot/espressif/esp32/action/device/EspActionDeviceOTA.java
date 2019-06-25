package iot.espressif.esp32.action.device;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Locale;

import iot.espressif.esp32.action.common.EspActionDownloadFromIotEsp;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.model.other.EspDownloadResult;
import iot.espressif.esp32.model.other.EspRomQueryResult;
import libs.espressif.log.EspLog;

public class EspActionDeviceOTA implements IEspActionDeviceOTA {
    private final EspLog mLog = new EspLog(getClass());

    public static String getBinDirPath() {
        String espDirPath = EspApplication.getEspApplication().getEspRootSDPath();
        if (espDirPath == null) {
            return null;
        }

        return espDirPath + "/upgrade/";
    }

    @Override
    public File[] doActionFindUpgradeFiles() {
        String dirPath = getBinDirPath();
        if (dirPath == null) {
            return null;
        }
        File dir = new File(dirPath);
        if (!dir.exists()) {
            return null;
        }

        FilenameFilter filter = (dir1, name) -> name.toLowerCase(Locale.ENGLISH).endsWith(SUFFIX_BIN_FILE);
        return dir.listFiles(filter);
    }

    @Override
    public EspDownloadResult doActionDownloadLastestRomVersionCloud() {
        EspActionDownloadFromIotEsp dlAction = new EspActionDownloadFromIotEsp();
        EspRomQueryResult queryResult = dlAction.doActionQueryLatestVersion(DEVICE_KEY);
        if (queryResult == null) {
            mLog.w("download query null");
            return null;
        }

        if (queryResult.getFileNames().isEmpty()) {
            mLog.w("download no files");
            return null;
        }

        String version = queryResult.getVersion();
        String name = queryResult.getFileNames().get(0);

        EspDownloadResult result = new EspDownloadResult();
        result.setVersion(version);
        result.setFileName(name);

        String binDirPath = getBinDirPath();
        if (binDirPath == null) {
            mLog.w("download get bin dir path null");
            return null;
        }
        File binDir = new File(binDirPath);
        if (!binDir.exists()) {
            if (!binDir.mkdirs()) {
                mLog.w("download create dir failed");
                return null;
            }
        }

        // check version
        File[] storeBinFiles = doActionFindUpgradeFiles();
        for (File file : storeBinFiles) {
            String fileName = file.getName();
            if (name.equals(fileName)) {
                mLog.d("download bin exist in storage");
                result.setFile(file);
                return result;
            }
        }

        File saveFile = new File(binDir + name);
        boolean download = dlAction.doActionDownloadFromIotEsp(DEVICE_KEY, version, name, saveFile);
        if (download) {
            result.setFile(new File(saveFile.getPath()));
        }
        return result;
    }
}
