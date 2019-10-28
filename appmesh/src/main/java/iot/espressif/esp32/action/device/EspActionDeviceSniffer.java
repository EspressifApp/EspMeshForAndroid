package iot.espressif.esp32.action.device;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.db.model.SnifferDB;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;
import libs.espressif.utils.DataUtil;
import libs.espressif.utils.TimeUtil;

public class EspActionDeviceSniffer implements IEspActionDeviceSniffer {
    private final EspLog mLog = new EspLog(getClass());

    @Override
    public List<Sniffer> doActionLoadSnifferDB() {
        List<SnifferDB> snifferDBs = MeshObjectBox.getInstance().sniffer().loadAllSniffers();
        List<Sniffer> result = new ArrayList<>(snifferDBs.size());
        for (SnifferDB db : snifferDBs) {
            Sniffer sniffer = new Sniffer();
            sniffer.setId(db.id);
            sniffer.setType(db.type);
            sniffer.setBssid(db.bssid);
            sniffer.setUTCTime(db.utc_time);
            sniffer.setRssi(db.rssi);
            sniffer.setChannel(db.channel);
            sniffer.setDeviceMac(db.device_mac);
            sniffer.setOrganization(db.organization);
            sniffer.setName(db.name);

            result.add(sniffer);
        }

        return result;
    }

    @Override
    public List<Sniffer> doActionGetSniffersLocal(Collection<IEspDevice> devices) {
        JSONObject postJSON = new JSONObject();
        try {
            postJSON.put(KEY_REQUEST, REQUEST_GET_SNIFFER);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(devices, postJSON.toString().getBytes(),
                null, null);
        Map<String, EspHttpResponse> responseMap = DeviceUtil.getMapWithDeviceResponses(responseList);

        List<Sniffer> result = new ArrayList<>(responseList.size());

        final long sysTime = System.currentTimeMillis();
        for (Map.Entry<String, EspHttpResponse> entry : responseMap.entrySet()) {
            String deviceMac = entry.getKey();
            EspHttpResponse response = entry.getValue();
            EspHttpHeader contentTypeHeader = response.findHeader(EspHttpUtils.CONTENT_TYPE);
            if (contentTypeHeader == null || !CONTENT_TYPE_BIN.equals(contentTypeHeader.getValue())) {
                continue;
            }

            byte[] bytes = response.getContent();
            DataUtil.printBytes(bytes);
            // [LTV][LTV]
            // L: 1 byte, the length of T + V
            // T: 1 byte, sniffer type, wifi or ble
            // V: [ltv][ltv][ltv], rssi, bssid, time, name, etc.
            boolean readSnifferLen = true;
            int snifferLen = -1;
            boolean readSnifferType = false;
            int snifferType = -1;
            byte[] snifferBytes = null;
            int snifferBytesIndex = -1;
            for (byte b : bytes) {
                if (readSnifferLen) {
                    // Read length
                    snifferLen = b & 0xff;
                    readSnifferLen = false;
                    readSnifferType = true;
                    continue;
                }

                if (readSnifferType) {
                    // Read sniffer type
                    snifferType = b & 0xff;
                    readSnifferType = false;
                    continue;
                }

                // Read sniffer data
                if (snifferBytes == null) {
                    snifferBytes = new byte[snifferLen - 1];
                    snifferBytesIndex = 0;
                }

                snifferBytes[snifferBytesIndex] = b;
                snifferBytesIndex++;
                if (snifferBytesIndex < snifferBytes.length) {
                    continue;
                }

                // Parse sniffer data
                Sniffer sniffer = getSnifferWithData(snifferBytes);
                if (sniffer != null) {
                    sniffer.setType(snifferType);
                    long pkgTime = sysTime - sniffer.getUTCTime();
                    sniffer.setUTCTime(TimeUtil.getUTCTime(pkgTime));
                    sniffer.setDeviceMac(deviceMac);
                    mLog.i("Sniffer: " + sniffer.toString());
                    result.add(sniffer);
                }

                snifferBytesIndex = 0;
                snifferBytes = null;
                readSnifferLen = true;
            }
        }

        return result;
    }

    private Sniffer getSnifferWithData(byte[] data) {
        try {
            Sniffer sniffer = new Sniffer();

            int length = -1;
            int type = -1;
            byte[] value = null;
            int valueIndex = 0;
            for (byte b : data) {
                if (length < 0) {
                    length = b & 0xff;
                    continue;
                }

                if (type < 0) {
                    type = b & 0xff;
                    continue;
                }

                if (value == null) {
                    value = new byte[length - 1];
                }
                value[valueIndex] = b;
                valueIndex++;
                if (valueIndex < value.length) {
                    continue;
                }

                switch (type) {
                    case TYPE_RSSI:
                        int rssi = value[0];
                        sniffer.setRssi(rssi);
                        break;
                    case TYPE_BSSID:
                        String bssid = String.format("%02x%02x%02x%02x%02x%02x", value[0], value[1], value[2], value[3], value[4], value[5]);
                        sniffer.setBssid(bssid);
                        break;
                    case TYPE_TIME:
                        String timeStr = String.format("%02X%02X%02X%02X", value[3], value[2], value[1], value[0]);
                        long time = Long.parseLong(timeStr, 16);
                        // set before time for the moment, and set real utc time after return
                        sniffer.setUTCTime(time);
                        break;
                    case TYPE_NAME:
                        ByteArrayOutputStream nameOS = new ByteArrayOutputStream();
                        for (int i = 0; i < value.length; ++i) {
                            if (value[i] != 0) {
                                nameOS.write(value[i]);
                            }
                        }
                        sniffer.setName(nameOS.toString());
                        break;
                    case TYPE_CHANNEL:
                        int channel = value[0] & 0xff;
                        sniffer.setChannel(channel);
                        break;
                    case TYPE_MANUFACTURER:
                        String manufacturerId = String.format("%02X%02X", value[1], value[0]);
                        sniffer.setManufacturerId(manufacturerId);
                        break;
                }

                length = -1;
                type = -1;
                value = null;
                valueIndex = 0;
            }

            return sniffer;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
