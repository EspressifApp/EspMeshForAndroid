package iot.espressif.esp32.model.other;

import java.util.LinkedList;
import java.util.List;

public class EspRomQueryResult {
    private String mVersion;
    private List<String> mFileNames = new LinkedList<>();

    public void setVersion(String version) {
        mVersion = version;;
    }

    public String getVersion() {
        return mVersion;
    }

    public List<String> getFileNames() {
        return mFileNames;
    }

    public void addFileName(String name) {
        mFileNames.add(name);
    }

    public void removeFileName(String name) {
        mFileNames.remove(name);
    }
}
