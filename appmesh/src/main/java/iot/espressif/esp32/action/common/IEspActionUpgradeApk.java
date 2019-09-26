package iot.espressif.esp32.action.common;

import androidx.annotation.NonNull;

import java.io.File;
import java.util.Locale;

public interface IEspActionUpgradeApk extends IEspActionDownload {
    String LATEST_RELEASE_URL = "https://api.github.com/repos/EspressifApp/EspMeshForAndroid/releases/latest";

    String APK_SUFFIX = ".apk";

    String KEY_VERSION_NAME = "name";
    String KEY_ASSETS = "assets";
    String KEY_ASSET_NAME = "name";
    String KEY_SIZE = "size";
    String KEY_DOWNLOAD_URL = "browser_download_url";
    String KEY_BODY = "body";

    class ReleaseInfo {
        String versionName;
        int versionCode;
        String downloadUrl;
        long apkSize;
        String notes;

        public int getVersionCode() {
            return versionCode;
        }

        public String getVersionName() {
            return versionName;
        }

        public String getDownloadUrl() {
            return downloadUrl;
        }

        public long getApkSize() {
            return apkSize;
        }

        public String getNotes() {
            return notes;
        }

        @NonNull
        @Override
        public String toString() {
            return String.format(Locale.ENGLISH,
                    "VersionName=%s, VersionCode=%d, DownloadUrl=%s, APKSize=%d, notes=%s",
                    versionName, versionCode, downloadUrl, apkSize, notes);
        }
    }

    ReleaseInfo doActionGetLatestRelease();

    boolean doActionDownloadAPK(String url, File saveFile);
}
