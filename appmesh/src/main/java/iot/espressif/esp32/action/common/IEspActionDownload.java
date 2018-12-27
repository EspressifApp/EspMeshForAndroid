package iot.espressif.esp32.action.common;

import java.io.File;
import java.util.Collection;

import iot.espressif.esp32.action.IEspAction;
import libs.espressif.net.EspHttpHeader;

public interface IEspActionDownload extends IEspAction {
    boolean doActionHttpDownload(String url, Collection<EspHttpHeader> headers, File saveFile);

    void doActionCancelDownload();

    void setDownloadCallback(DownloadCallback callback);

    interface DownloadCallback {
        void onDownloading(long totalSize, long downloadSize);
    }
}
