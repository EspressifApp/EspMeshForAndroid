package iot.espressif.esp32.model.device.ota;

import android.os.Handler;

import androidx.annotation.Nullable;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import io.reactivex.Completable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.device.IEspActionDeviceOTA;
import iot.espressif.esp32.model.device.IEspDevice;

public abstract class EspOTAClient {
    public static final int OTA_TYPE_PIECES = 1;
    public static final int OTA_TYPE_HTTP_POST = 2;
    public static final int OTA_TYPE_DOWNLOAD = 3;

    static final String SUFFIX_BIN_FILE = ".bin";

    static final String KEY_REQUEST = IEspActionDeviceOTA.KEY_REQUEST;
    static final String KEY_BIN_VERSION = IEspActionDeviceOTA.KEY_BIN_VERSION;
    static final String KEY_BIN_LENGTH = IEspActionDeviceOTA.KEY_BIN_LENGTH;
    static final String KEY_BIN_MD5 = IEspActionDeviceOTA.KEY_BIN_MD5;
    static final String KEY_PACKAGE_LENGTH = IEspActionDeviceOTA.KEY_PACKAGE_LENGTH;
    static final String KEY_STATUS_CODE = IEspActionDeviceOTA.KEY_STATUS_CODE;
    static final String KEY_PACKAGE_SEQUENCE = IEspActionDeviceOTA.KEY_PACKAGE_SEQUENCE;

    static final String REQUEST_OTA_STATUS = IEspActionDeviceOTA.REQUEST_OTA_STATUS;
    static final String REQUEST_OTA_REBOOT = IEspActionDeviceOTA.REQUEST_OTA_REBOOT;

    static final int STATUS_CODE_SUC = IEspActionDeviceOTA.STATUS_CODE_SUC;
    static final int STATUS_CONTINUE = IEspActionDeviceOTA.STATUS_CONTINUE;

    static final String HEADER_OTA_ADDRESS = IEspActionDeviceOTA.HEADER_OTA_ADDRESS;
    static final String HEADER_OTA_LENGTH = IEspActionDeviceOTA.HEADER_OTA_LENGTH;
    static final String HEADER_NODE_COUNT = IEspActionDeviceOTA.HEADER_NODE_COUNT;
    static final String HEADER_NODE_MAC = IEspActionDeviceOTA.HEADER_NODE_MAC;

    static final String REQUEST_OTA_PROGRESS = IEspActionDeviceOTA.REQUEST_OTA_PROGRESS;
    static final String KEY_TOTAL_SIZE = "total_size";
    static final String KEY_WRITTEN_SIZE = "written_size";

    private OTACallback mOTACallback;

    private boolean mWillReboot = false;

    public void setRebootAfterOTA(boolean willReboot) {
        mWillReboot = willReboot;
    }

    public boolean willRebootAfterOTA() {
        return mWillReboot;
    }

    public void setOTACallback(OTACallback OTACallback) {
        mOTACallback = OTACallback;
    }

    OTACallback getOTACallback() {
        return mOTACallback;
    }

    public interface OTACallback {
        @Nullable
        Handler getHandler();

        void onOTAPrepare(EspOTAClient client);

        void onOTAProgressUpdate(EspOTAClient client, List<OTAProgress> progressList);

        void onOTAResult(EspOTAClient client, List<String> sucMacList);
    }

    public interface OTAProgress {
        String getDeviceMac();

        String getMessage();

        int getProgress();
    }

    public abstract String getAddress();

    public abstract void start();

    public abstract void stop();

    public abstract void close();

    void runOtaCallback(Runnable runnable) {
        if (mOTACallback != null) {
            if (mOTACallback.getHandler() != null) {
                mOTACallback.getHandler().post(runnable);
            } else {
                Completable.fromRunnable(runnable)
                        .subscribeOn(Schedulers.io())
                        .subscribe();
            }
        }
    }

    public static class Builder {
        private int mOtaType;

        private Collection<IEspDevice> mDevices;

        private File mBin;
        private OTACallback mCallback;

        private String mProtocol;
        private String mHostAddress;
        private Collection<String> mDeviceMacs;

        private String mBinUrl;

        private boolean mReboot = false;

        public Builder(int otaType) {
            mOtaType = otaType;
        }

        public Builder setBin(File bin) {
            mBin = bin;
            return this;
        }

        public Builder setOTACallback(OTACallback callback) {
            mCallback = callback;
            return this;
        }

        public Builder setProtocol(String protocol) {
            mProtocol = protocol;
            return this;
        }

        public Builder setHostAddress(String hostAddress) {
            mHostAddress = hostAddress;
            return this;
        }

        public Builder setDeviceMacs(Collection<String> deviceMacs) {
            mDeviceMacs = deviceMacs;
            return this;
        }

        public Builder setDevices(Collection<IEspDevice> devices) {
            mDevices = devices;
            return this;
        }

        public Builder setBinUrl(String binUrl) {
            mBinUrl = binUrl;
            return this;
        }

        public Builder setRebootAfterOTA(boolean willReboot) {
            mReboot = willReboot;
            return this;
        }

        public EspOTAClient build() {
            EspOTAClient client;
            switch (mOtaType) {
                case OTA_TYPE_PIECES: {
                    if (mDevices == null || mDevices.isEmpty()) {
                        throw new IllegalArgumentException("Devices can't be null or empty");
                    }

                    client = new EspOTAClientImpl(mBin, mDevices, mCallback);
                    break;
                }
                case OTA_TYPE_HTTP_POST: {
                    if (mProtocol == null) {
                        throw new IllegalArgumentException("Protocol can't be null");
                    }
                    if (mHostAddress == null) {
                        throw new IllegalArgumentException("Host address can't be null");
                    }
                    Collection<String> macs = null;
                    if (mDeviceMacs != null && !mDeviceMacs.isEmpty()) {
                        macs = mDeviceMacs;
                    } else if (mDevices != null && !mDevices.isEmpty()) {
                        macs = new ArrayList<>(mDevices.size());
                        for (IEspDevice device : mDevices) {
                            macs.add(device.getMac());
                        }
                    }
                    if (macs == null) {
                        throw new IllegalArgumentException("Require to set devices or deviceMacs");
                    }

                    client = new EspOTAClientImpl2(mBin, mProtocol, mHostAddress, macs, mCallback);
                    break;
                }
                case OTA_TYPE_DOWNLOAD: {
                    if (mBinUrl == null) {
                        throw new IllegalArgumentException("Bin url can't be null");
                    }
                    try {
                        new URL(mBinUrl);
                    } catch (MalformedURLException e) {
                        throw new IllegalArgumentException("Bin url is invalid");
                    }
                    if (mProtocol == null) {
                        throw new IllegalArgumentException("Protocol can't be null");
                    }
                    if (mHostAddress == null) {
                        throw new IllegalArgumentException("Host address can't be null");
                    }

                    Collection<String> macs = null;
                    if (mDeviceMacs != null && !mDeviceMacs.isEmpty()) {
                        macs = mDeviceMacs;
                    } else if (mDevices != null && !mDevices.isEmpty()) {
                        macs = new ArrayList<>(mDevices.size());
                        for (IEspDevice device : mDevices) {
                            macs.add(device.getMac());
                        }
                    }
                    if (macs == null) {
                        throw new IllegalArgumentException("Require to set devices or deviceMacs");
                    }
                    client = new EspOTAClientImpl2(mBinUrl, mProtocol, mHostAddress, macs, mCallback);
                    break;
                }
                default:
                    throw new IllegalArgumentException("Unsupported ota type");
            }

            client.setRebootAfterOTA(mReboot);
            return client;
        }
    }
}
