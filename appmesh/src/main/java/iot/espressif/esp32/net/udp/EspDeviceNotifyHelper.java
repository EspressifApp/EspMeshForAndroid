package iot.espressif.esp32.net.udp;

import android.content.Context;
import android.net.wifi.WifiManager;

import org.greenrobot.eventbus.EventBus;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.model.event.DeviceOtaStatusEvent;
import iot.espressif.esp32.model.event.DeviceSnifferEvent;
import iot.espressif.esp32.model.event.DeviceStatusEvent;
import iot.espressif.esp32.model.event.DeviceTopologyEvent;
import libs.espressif.log.EspLog;

public class EspDeviceNotifyHelper implements EspUdpServer.DataReceivedListener {
    private static final int PORT = 3232;

    private static final String KEY_TYPE = "type";
    private static final String KEY_FLAG = "flag";
    private static final String KEY_MAC = "mac";

    private static final String TYPE_HTTP = "http";
    private static final String TYPE_HTTPS = "https";
    private static final String TYPE_STATUS = "status";
    private static final String TYPE_SNIFFER = "sniffer";
    private static final String TYPE_OTA = "ota_status";

    private final EspLog mLog = new EspLog(getClass());

    private final Object mTopoLock = new Object();
    private final Object mStatusLock = new Object();
    private final Object mSnifferLock = new Object();
    private final Object mOtaLock = new Object();

    private EspUdpServer mUdpServer;
    private WifiManager.MulticastLock mMulticastLock;

    private Map<String, String> mTopoFlagMap;
    private Map<String, String> mStatusFlagMap;
    private Map<String, String> mSnifferFlagMap;
    private Map<String, String> mOtaFlagMap;

    public EspDeviceNotifyHelper() {
        mUdpServer = new EspUdpServer();
        WifiManager wifiManager = (WifiManager) EspApplication.getEspApplication().getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);
        assert wifiManager != null;
        mMulticastLock = wifiManager.createMulticastLock(getClass().getSimpleName());
        mMulticastLock.setReferenceCounted(false);
        mTopoFlagMap = new HashMap<>();
        mStatusFlagMap = new HashMap<>();
        mSnifferFlagMap = new HashMap<>();
        mOtaFlagMap = new HashMap<>();
    }

    public boolean open() {
        mMulticastLock.acquire();
        mUdpServer.setDataReceivedListener(this);
        boolean open = mUdpServer.open(PORT);
        if (!open) {
            mMulticastLock.release();
        }
        return open;
    }

    public void close() {
        mMulticastLock.release();
        mUdpServer.close();
        mUdpServer.setDataReceivedListener(null);
        mTopoFlagMap.clear();
        mStatusFlagMap.clear();
        mSnifferFlagMap.clear();
        mOtaFlagMap.clear();
    }

    @Override
    public void onDataReceived(InetAddress address, byte[] data) {
        String string = new String(data);
        mLog.i("ParseData = " + string);
        String[] properties = string.split("\n");
        Map<String, String> propertiesMap = new HashMap<>();
        for (String property : properties) {
            try {
                String[] kv = property.split("=");
                String key = kv[0].trim();
                String value = kv[1].trim();

                propertiesMap.put(key, value);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        String mac = propertiesMap.get(KEY_MAC);
        String type = propertiesMap.get(KEY_TYPE);
        String flag = propertiesMap.get(KEY_FLAG);

        if (type == null || flag == null) {
            return;
        }
        String[] macs = mac == null ? null : mac.split(",");

        String host = address.getHostAddress();
        int port = -1;
        switch (type) {
            case TYPE_HTTP:
                port = DeviceConstants.PORT_HTTP_DEFAULT;
            case TYPE_HTTPS:
                if (port < 0) {
                    port = DeviceConstants.PORT_HTTPS_DEFAULT;
                }
                synchronized (mTopoLock) {
                    String topoFlag = mTopoFlagMap.get(host);
                    if (!flag.equals(topoFlag)) {
                        mTopoFlagMap.put(host, flag);
                        EventBus.getDefault().post(new DeviceTopologyEvent(address, type, port));
                    }
                }
                break;
            case TYPE_STATUS:
                if (macs == null) {
                    return;
                }
                synchronized (mStatusLock) {
                    String statusFlag = mStatusFlagMap.get(host);
                    if (!flag.equals(statusFlag)) {
                        mStatusFlagMap.put(host, flag);
                        EventBus.getDefault().post(new DeviceStatusEvent(address, macs));
                    }
                }
                break;
            case TYPE_SNIFFER:
                if (macs == null) {
                    return;
                }
                synchronized (mSnifferLock) {
                    String snifferFlag = mSnifferFlagMap.get(host);
                    if (!flag.equals(snifferFlag)) {
                        mSnifferFlagMap.put(host, flag);
                        EventBus.getDefault().post(new DeviceSnifferEvent(address, macs));
                    }
                }
                break;
            case TYPE_OTA:
                if (macs == null) {
                    return;
                }
                synchronized (mOtaLock) {
                    String otaFlag = mOtaFlagMap.get(host);
                    if (!flag.equals(otaFlag)) {
                        mSnifferFlagMap.put(host, flag);
                        EventBus.getDefault().post(new DeviceOtaStatusEvent(address, macs));
                    }
                }

                break;
            default:
                return;
        }
    }
}
