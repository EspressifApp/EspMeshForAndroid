package iot.espressif.esp32.action.device;

import android.text.TextUtils;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.Espnow;
import iot.espressif.esp32.utils.DeviceUtil;

public class EspActionDeviceEspnow implements IEspActionDeviceEspnow {
    @Override
    public void doActionPostLocal(Collection<IEspDevice> devices, Espnow espnow) {
        JSONObject postJSON = new JSONObject();
        try {
            postJSON.put(KEY_REQUEST, "config_debug");
            postJSON.put(KEY_TYPE, espnow.getType());
            postJSON.put(KEY_OPRT, espnow.getOprt());
            postJSON.put(KEY_PARAMS, espnow.getParams());
            if (!TextUtils.isEmpty(espnow.getRecvMac())) {
                postJSON.put(KEY_RECV_MAC, espnow.getRecvMac());
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        byte[] postBytes = postJSON.toString().getBytes();
        DeviceUtil.httpLocalMulticastRequest(devices, postBytes, null, false, DeviceUtil.HEADER_ROOT_RESP);
    }
}
