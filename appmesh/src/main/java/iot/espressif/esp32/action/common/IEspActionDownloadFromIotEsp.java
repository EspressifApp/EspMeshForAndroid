package iot.espressif.esp32.action.common;

import java.io.File;

import iot.espressif.esp32.model.other.EspRomQueryResult;

public interface IEspActionDownloadFromIotEsp extends IEspActionDownload {
    String URL_QUERY = "https://iot.espressif.cn/v1/device/rom/";
    String URL_DOWNLOAD_FORMAT = "https://iot.espressif.cn/v1/device/rom/?action=download_rom&version=%s&filename=%s";

    String KEY_ROMS = "productRoms";
    String KEY_LATEST_VERSION = "recommended_rom_version";
    String KEY_FILES = "files";
    String KEY_NAME = "name";

    EspRomQueryResult doActionQueryLatestVersion(String deviceKey);

    boolean doActionDownloadFromIotEsp(String deviceKey, String version, String fileName, File saveFile);
}
