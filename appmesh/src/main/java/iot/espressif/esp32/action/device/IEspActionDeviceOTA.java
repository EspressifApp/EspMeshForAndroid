package iot.espressif.esp32.action.device;

import java.io.File;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.other.EspDownloadResult;

public interface IEspActionDeviceOTA extends IEspActionDevice {
    String KEY_BIN_VERSION = "ota_bin_version";
    String KEY_BIN_LENGTH = "ota_bin_len";
    String KEY_BIN_MD5 = "ota_bin_md5";
    String KEY_PACKAGE_LENGTH = "package_length";
    String KEY_PACKAGE_SEQUENCE = "package_sequence";

    String REQUEST_OTA_STATUS = "ota_status";
    String REQUEST_OTA_REBOOT = "ota_reboot";
    String REQUEST_OTA_PROGRESS = "get_ota_progress";

    String HEADER_OTA_ADDRESS = "Mesh-Ota-Address";
    String HEADER_OTA_LENGTH = "Mesh-Ota-Length";

    String SUFFIX_BIN_FILE = ".bin";

    int STATUS_CONTINUE = 1;

    String DEVICE_KEY = "11a7b2385567790ad8c60fe75557e15168abb7c5";

    File[] doActionFindUpgradeFiles();
    EspDownloadResult doActionDownloadLastestRomVersionCloud();
}
