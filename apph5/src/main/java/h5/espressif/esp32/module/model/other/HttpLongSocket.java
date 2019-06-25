package h5.espressif.esp32.module.model.other;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.Map;

import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpUtils;

public class HttpLongSocket {
    private EspLog mLog = new EspLog(getClass());

    private String mHost;
    private Socket mSocket;

    private volatile boolean mClosed = false;

    public HttpLongSocket(String host) {
        mHost = host;
    }

    public String getHost() {
        return mHost;
    }

    public boolean isClosed() {
        return mClosed;
    }

    public void close() {
        mLog.e("close");
        mClosed = true;
        if (mSocket != null) {
            try {
                mSocket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
            mSocket = null;
        }
    }

    public synchronized void connect() throws IOException {
        if (mClosed) {
            throw new IllegalStateException("Socket has closed");
        }

        mSocket = new Socket(mHost, 80);
//        mSocket.setSendBufferSize(5);
        mLog.e("Connect Success");
    }

    public void httpPost(String file, Map<String, String> headers, byte[] content) throws IOException {
        mLog.e("httpPost");
        if (mClosed) {
            throw new IllegalStateException("Socket has closed");
        }

        if (mSocket == null) {
            connect();
        }

        OutputStream os = mSocket.getOutputStream();

        os.write(EspHttpUtils.METHOD_POST.getBytes());
        os.write(' ');
        os.write(file.getBytes());
        os.write(' ');
        os.write("HTTP/1.1\r\n".getBytes());

        int contentLength = content != null ? content.length : 0;
        headers.put(EspHttpUtils.CONTENT_LENGTH, String.valueOf(contentLength));
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            os.write(entry.getKey().getBytes());
            os.write(": ".getBytes());
            os.write(entry.getValue().getBytes());
            os.write("\r\n".getBytes());
        }

        os.write("\r\n".getBytes());

        if (content != null) {
            os.write(content);
        }
    }

    public int read() throws IOException {
        if (mClosed) {
            throw new IllegalStateException("Socket has closed");
        }

        if (mSocket == null) {
            connect();
        }

        InputStream is = mSocket.getInputStream();
        return is.read();
    }
}
