package iot.espressif.esp32.model.other;

import java.io.File;

public class EspDownloadResult {
    private String mVersion;
    private String mFileName;

    private File mFile;

    public String getVersion() {
        return mVersion;
    }

    public void setVersion(String version) {
        mVersion = version;
    }

    public String getFileName() {
        return mFileName;
    }

    public void setFileName(String fileName) {
        mFileName = fileName;
    }

    public File getFile() {
        return mFile;
    }

    public void setFile(File bin) {
        mFile = bin;
    }
}
