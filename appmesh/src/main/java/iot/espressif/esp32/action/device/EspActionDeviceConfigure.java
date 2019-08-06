package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.content.Context;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import blufi.espressif.params.BlufiConfigureParams;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpResponse;

public class EspActionDeviceConfigure extends EspActionDeviceBlufi implements IEspActionDeviceConfigure {
    private final EspLog mLog = new EspLog(getClass());

    public MeshBlufiClient doActionConfigureBlufi(@NonNull BluetoothDevice device, BlufiConfigureParams params,
                                                  @NonNull MeshBlufiCallback userCallback) {
        return doActionConfigureBlufi(device, -1, params, userCallback);
    }

    public MeshBlufiClient doActionConfigureBlufi(@NonNull BluetoothDevice device, int meshVersion, BlufiConfigureParams params,
                                                  @NonNull MeshBlufiCallback userCallback) {
        MeshBlufiClient blufi = new MeshBlufiClient();
        blufi.setMeshVersion(meshVersion);

        Context context = EspApplication.getEspApplication().getApplicationContext();
        BleCallback bleCallback = new BleCallback(blufi, userCallback) {
            @Override
            protected void onNegotiateSecurityComplete() {
                blufi.getBlufiClient().configure(params);
                mLog.d("Send configure data");
            }
        };
        BluetoothGatt gatt = EspBleUtils.connectGatt(device, context, bleCallback);
        blufi.setBluetoothGatt(gatt);

        return blufi;
    }

    public boolean doActionAddWhiteList(Collection<IEspDevice> devices, Collection<String> whiteList) {
        if (whiteList.isEmpty()) {
            return false;
        }

        String host = null;
        for (IEspDevice device : devices) {
            if (host == null) {
                host = device.getLanHostAddress();
                if (host == null) {
                    throw new IllegalArgumentException("Device address is null");
                }
            } else {
                if (!host.equals(device.getLanHostAddress())) {
                    throw new IllegalArgumentException("All devices require same address");
                }
            }
        }

        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_ADD_DEVICE);
            JSONArray whiteArray = new JSONArray();
            for (String newMac : whiteList) {
                whiteArray.put(newMac);
            }
            json.put(KEY_WHITELIST, whiteArray);
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
        Map<String, String> headers = new HashMap<>();
        headers.put(DeviceUtil.HEADER_ROOT_RESP, String.valueOf(true));
        List<EspHttpResponse> results = DeviceUtil.httpLocalMulticastRequest(devices, json.toString().getBytes(),
                null, headers);
        return !results.isEmpty() && results.get(0).getCode() == HttpURLConnection.HTTP_OK;
    }
}
