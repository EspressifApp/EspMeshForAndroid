package iot.espressif.esp32.action.common;

import androidx.annotation.NonNull;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Collection;

import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;

public class EspActionDownload implements IEspActionDownload {
    private EspLog mLog = new EspLog(getClass());

    private volatile boolean mCanceled = false;
    private HttpURLConnection mDownloadConn;

    private DownloadCallback mDownloadCallback;

    @Override
    public void setDownloadCallback(DownloadCallback callback) {
        mDownloadCallback = callback;
    }

    @Override
    public boolean doActionHttpDownload(String url, @NonNull Collection<EspHttpHeader> headers, File saveFile) {
        if (mCanceled) {
            mLog.w("doActionHttpDownload canceled");
            return false;
        }
        FileOutputStream fileOS = null;
        try {
            String tempFileName = String.format("%s.temp", saveFile.getPath());
            File tempFile = new File(tempFileName);
            if (!tempFile.exists() && !tempFile.createNewFile()) {
                mLog.w("doActionHttpDownload file temp failed");
                return false;
            }

            fileOS = new FileOutputStream(tempFile);

            URL URL = new URL(url);
            mDownloadConn = (HttpURLConnection) URL.openConnection();
            mDownloadConn.setConnectTimeout(10000);
            mDownloadConn.setReadTimeout(30000);
            for (EspHttpHeader header : headers) {
                mDownloadConn.addRequestProperty(header.getName(), header.getValue());
            }

            if (mCanceled) {
                mLog.w("doActionHttpDownload canceled");
                return false;
            }
            mDownloadConn.connect();
            InputStream is = mDownloadConn.getInputStream();
            long totalSize = mDownloadConn.getContentLength();
            long downloadSize = 0;
            long downloadKB = 0;
            byte[] buf = new byte[102400];
            int offset = 0;
            for (int read = is.read(); read != -1; read = is.read()) {
                buf[offset++] = (byte) read;
                if (offset >= buf.length) {
                    fileOS.write(buf);
                    offset = 0;
                }

                downloadSize++;

                if (mDownloadCallback != null) {
                    if (downloadSize / 1024 > downloadKB) {
                        downloadKB = downloadSize / 1024;
                        mDownloadCallback.onDownloading(totalSize, downloadSize);
                    }
                }
            }
            if (offset > 0) {
                fileOS.write(buf, 0, offset);
            }

            mDownloadConn.disconnect();
            fileOS.close();

            if (saveFile.exists()) {
                saveFile.delete();
            }
            tempFile.renameTo(saveFile);

            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } finally {
            if (mDownloadConn != null) {
                mDownloadConn.disconnect();
            }
            if (fileOS != null) {
                try {
                    fileOS.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public void doActionCancelDownload() {
        mCanceled = true;
        if (mDownloadConn != null) {
            mDownloadConn.disconnect();
        }
    }
}
