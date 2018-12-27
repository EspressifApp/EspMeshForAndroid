package iot.espressif.esp32.action.device;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.util.Collection;

import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;

public class EspActionDeviceReboot implements IEspActionDeviceReboot {
    private JSONObject getRequestJSON(int delay) {
        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_REBOOT);
            json.put(KEY_DELAY, delay);
            return json;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean doActionRebootLocal(IEspDevice device) {
        EspHttpParams params = new EspHttpParams();
        params.setTryCount(1);
        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        byte[] content = getRequestJSON( 0).toString().getBytes();
        EspHttpResponse response = DeviceUtil.httpLocalRequest(device, content, params, tokenH);
        if (response == null) {
            return false;
        }
        if (response.getCode() != HttpURLConnection.HTTP_OK) {
            return false;
        }
        JSONObject respJSON;
        try {
            respJSON = response.getContentJSON();
            int statusCode = respJSON.getInt(KEY_STATUS_CODE);
            boolean result = statusCode == STATUS_CODE_SUC;
            if (result) {
                device.clearState();
            }
            return result;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void doActionRebootLocal(Collection<IEspDevice> devices) {
        DeviceUtil.delayRequestRetry(devices, REQUEST_REBOOT, null);
    }
}
