package iot.espressif.esp32.action.device;

import android.content.Intent;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;

public class EspActionDeviceInfo implements IEspActionDeviceInfo {
    private final EspLog mLog = new EspLog(getClass());

    private boolean setDeviceInfoWithResponse(EspHttpResponse response, IEspDevice device) {
        JSONObject respJSON = getResponseJSON(response);
        if (respJSON == null) {
            return false;
        }

        EspHttpHeader parentHeader = response.findHeader(HEADER_PARENT_MAC);
        if (parentHeader != null) {
            device.setParentDeviceMac(parentHeader.getValue());
        }

        try {
            int statusCode = respJSON.getInt(KEY_STATUS_CODE);
            if (statusCode != STATUS_CODE_SUC) {
                return false;
            }

            if (!respJSON.isNull(KEY_GROUP)) {
                JSONArray groupArray = respJSON.getJSONArray(KEY_GROUP);
                List<String> groupList = new ArrayList<>(groupArray.length());
                for (int i = 0; i < groupArray.length(); i++) {
                    groupList.add(groupArray.getString(i));
                }
                device.setGroups(groupList);
            }

            int tid = respJSON.getInt(KEY_TID);
            device.setDeviceTypeId(tid);

            String name = respJSON.getString(KEY_NAME);
            device.setName(name);

            String version = respJSON.optString(KEY_VERSION);
            device.setRomVersion(version);

            String position = respJSON.optString(KEY_POSITION);
            device.setPosition(position);

            String meshId = respJSON.optString(KEY_MESH_ID);
            device.setMeshId(meshId);

            int trigger = respJSON.optInt(KEY_TRIGGER);
            device.setTrigger(trigger);

            int layer = IEspDevice.LAYER_UNKNOW;
            EspHttpHeader layerHeader = response.findHeader(HEADER_MESH_LAYER);
            if (layerHeader != null) {
                try {
                    layer = Integer.parseInt(layerHeader.getValue());
                    device.setMeshLayerLevel(layer);
                } catch (NumberFormatException nfe) {
                    nfe.printStackTrace();
                }
            } else {
                layer = respJSON.optInt(KEY_LAYER, IEspDevice.LAYER_UNKNOW);
            }
            device.setMeshLayerLevel(layer);

            int rssi = respJSON.optInt(KEY_RSSI, IEspDevice.RSSI_NULL);
            device.setRssi(rssi);

            String idfVersion = respJSON.optString(KEY_IDF_VERSION);
            device.setIdfVersion(idfVersion);

            String mdfVersion = respJSON.optString(KEY_MDF_VERSION);
            device.setMdfVersion(mdfVersion);

            int mlinkVersion = respJSON.optInt(KEY_MLINK_VERSION, -1);
            if (mlinkVersion == -1) {
                mlinkVersion = respJSON.optInt(KEY_PROTOCOL, 0);
            }
            device.setMlinkVersion(mlinkVersion);
            device.clearCharacteristics();
            JSONArray ctrtArray = respJSON.getJSONArray(KEY_CHARACTERISTICS);
            switch (mlinkVersion) {
                case 0:
                case 2:
                    setDeviceCharacteristicsProtocol0(device, ctrtArray);
                    break;
                case 1:
                    setDeviceCharacteristicsProtocol1(device, ctrtArray);
                    break;
            }

            long id = MeshObjectBox.getInstance().device().saveDevice(device);
            device.setId(id);
            return true;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    private void setDeviceCharacteristicsProtocol1(IEspDevice device, JSONArray ctrtArray) {
        final int indexCid = 0;
        final int indexCname = 1;
        final int indexFormat = 2;
        final int indexPerms = 3;
        final int indexValue = 4;
        final int indexMin = 5;
        final int indexMax = 6;
        final int indexStep = 7;
        for (int i = 0; i < ctrtArray.length(); i++) {
            try {
                JSONArray array = ctrtArray.getJSONArray(i);
                String format = array.getString(indexFormat);
                EspDeviceCharacteristic characteristic = EspDeviceCharacteristic.newInstance(format);
                if (characteristic == null) {
                    mLog.w("doActionGetDeviceInfoLocal unknow format " + format);
                    continue;
                }

                int cid = array.getInt(indexCid);
                characteristic.setCid(cid);
                String cname = array.getString(indexCname);
                characteristic.setName(cname);
                int perms = array.getInt(indexPerms);
                characteristic.setPerms(perms);
                switch (format) {
                    case FORMAT_INT: {
                        int min = array.getInt(indexMin);
                        int max = array.getInt(indexMax);
                        int step = array.getInt(indexStep);
                        characteristic.setMin(min);
                        characteristic.setMax(max);
                        characteristic.setStep(step);
                        if (characteristic.isReadable()) {
                            int value = array.getInt(indexValue);
                            characteristic.setValue(value);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                    }
                        break;
                    case FORMAT_DOUBLE: {
                        double min = array.getDouble(indexMin);
                        double max = array.getDouble(indexMax);
                        double step = array.getDouble(indexStep);
                        characteristic.setMin(min);
                        characteristic.setMax(max);
                        characteristic.setStep(step);
                        if (characteristic.isReadable()) {
                            double value = array.getDouble(indexValue);
                            characteristic.setValue(value);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                    }
                        break;
                    case FORMAT_STRING: {
                        int min = array.getInt(indexMin);
                        int max = array.getInt(indexMax);
                        characteristic.setMin(min);
                        characteristic.setMax(max);
                        if (characteristic.isReadable()) {
                            String value = array.getString(indexValue);
                            characteristic.setValue(value);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                    }
                        break;
                    case FORMAT_JSON: {
                        int min = array.getInt(indexMin);
                        int max = array.getInt(indexMax);
                        characteristic.setMin(min);
                        characteristic.setStep(max);
                        if (characteristic.isReadable()) {
                            JSONObject value = array.getJSONObject(indexValue);
                            characteristic.setValue(value);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                    }
                        break;
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    private void setDeviceCharacteristicsProtocol0(IEspDevice device, JSONArray ctrtArray) {
        for (int i = 0; i < ctrtArray.length(); i++) {
            try {
                JSONObject ctrtJSON = ctrtArray.getJSONObject(i);
                int cid = ctrtJSON.getInt(KEY_CID);
                String cname = ctrtJSON.getString(KEY_NAME);
                String format = ctrtJSON.getString(KEY_FORMAT);
                int perms = ctrtJSON.getInt(KEY_PERMS);
                EspDeviceCharacteristic characteristic = EspDeviceCharacteristic.newInstance(format);
                if (characteristic == null) {
                    mLog.w("doActionGetDeviceInfoLocal unknow format " + format);
                    continue;
                }
                characteristic.setCid(cid);
                characteristic.setName(cname);
                characteristic.setPerms(perms);
                switch (format) {
                    case FORMAT_INT:
                        int imin = ctrtJSON.getInt(KEY_MIN);
                        int imax = ctrtJSON.getInt(KEY_MAX);
                        int istep = ctrtJSON.getInt(KEY_STEP);
                        characteristic.setMin(imin);
                        characteristic.setMax(imax);
                        characteristic.setStep(istep);
                        if (characteristic.isReadable()) {
                            int ivalue = ctrtJSON.getInt(KEY_VALUE);
                            characteristic.setValue(ivalue);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                        break;
                    case FORMAT_DOUBLE:
                        double dmin = ctrtJSON.getDouble(KEY_MIN);
                        double dmax = ctrtJSON.getDouble(KEY_MAX);
                        double dstep = ctrtJSON.getDouble(KEY_STEP);
                        characteristic.setMin(dmin);
                        characteristic.setMax(dmax);
                        characteristic.setStep(dstep);
                        if (characteristic.isReadable()) {
                            double dvalue = ctrtJSON.getDouble(KEY_VALUE);
                            characteristic.setValue(dvalue);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                        break;
                    case FORMAT_STRING:
                        int smin = ctrtJSON.getInt(KEY_MIN);
                        int smax = ctrtJSON.getInt(KEY_MAX);
                        characteristic.setMin(smin);
                        characteristic.setMax(smax);
                        if (characteristic.isReadable()) {
                            String svalue = ctrtJSON.optString(KEY_VALUE, "");
                            characteristic.setValue(svalue);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                        break;
                    case FORMAT_JSON:
                        int jmin = ctrtJSON.getInt(KEY_MIN);
                        int jmax = ctrtJSON.getInt(KEY_MAX);
                        characteristic.setMin(jmin);
                        characteristic.setMax(jmax);
                        if (characteristic.isReadable()) {
                            JSONObject jvalue = ctrtJSON.getJSONObject(KEY_VALUE);
                            characteristic.setValue(jvalue);
                        }
                        device.addOrReplaceCharacteristic(characteristic);
                        break;
                }
            } catch (JSONException je) {
                je.printStackTrace();
            }
        }
    }

    @Override
    public void doActionGetDevicesInfoLocal(Collection<IEspDevice> devices) {
        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_GET_DEVICE_INFO);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        int timeout = 30_000;
        int tryCount = 3;

        EspHttpParams params = new EspHttpParams();
        params.setSOTimeout(timeout);

        HashSet<IEspDevice> allDeviceSet = new HashSet<>();
        for (IEspDevice device : devices) {
            if (device.isState(EspDeviceState.State.LOCAL)) {
                allDeviceSet.add(device);
            }
        }

        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        for (int i = 0; i < tryCount && !allDeviceSet.isEmpty(); i++) {
            byte[] content = json.toString().getBytes();

            Map<String, String> headers = new HashMap<>();
            if (tokenH != null) {
                headers.put(tokenH.getName(), tokenH.getValue());
            }
            List<EspHttpResponse> respList = DeviceUtil.httpLocalMulticastRequest(
                    allDeviceSet, content, params, headers);
            Map<String, EspHttpResponse> map = DeviceUtil.getMapWithDeviceResponses(respList);
            mLog.i("Get device info map size = " + map.size());

            List<String> sucDevMacs = new LinkedList<>();
            for (IEspDevice device : devices) {
                EspHttpResponse response = map.get(device.getMac());
                boolean suc = setDeviceInfoWithResponse(response, device);
                if (suc) {
                    sucDevMacs.add(device.getMac());

                    allDeviceSet.remove(device);
                }
            }

            if (!sucDevMacs.isEmpty()) {
                Intent intent = new Intent(DeviceConstants.ACTION_DEVICE_STATUS_CHANGED);
                String[] macArray = new String[sucDevMacs.size()];
                sucDevMacs.toArray(macArray);
                intent.putExtra(DeviceConstants.KEY_DEVICE_MACS, macArray);
                EspApplication.getEspApplication().sendLocalBroadcast(intent);
            }

        }
    }

    @Override
    public boolean doActionGetDeviceInfoLocal(IEspDevice device) {
        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_GET_DEVICE_INFO);
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

        EspHttpParams params = new EspHttpParams();
        params.setSOTimeout(2000);
        params.setTryCount(3);
        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        Map<String, String> headers = new HashMap<>();
        if (tokenH != null) {
            headers.put(tokenH.getName(), tokenH.getValue());
        }
        EspHttpResponse response = DeviceUtil.httpLocalRequest(device, json.toString().getBytes(), params, headers);
        return setDeviceInfoWithResponse(response, device);
    }

    private JSONObject getLocalPostJSON(Collection<EspDeviceCharacteristic> characteristics) throws JSONException {
        JSONObject json = new JSONObject();
        json.put(KEY_REQUEST, REQUEST_SET_STATUS);
        JSONArray ctrtArray = new JSONArray();
        for (EspDeviceCharacteristic characteristic : characteristics) {
            JSONObject ctrtJSON = new JSONObject();
            ctrtJSON.put(KEY_CID, characteristic.getCid());
            ctrtJSON.put(KEY_VALUE, characteristic.getValue());
            ctrtArray.put(ctrtJSON);
        }
        json.put(KEY_CHARACTERISTICS, ctrtArray);
        return json;
    }

    @Override
    public List<EspHttpResponse> doActionSetStatusLocal(Collection<IEspDevice> devices, Collection<EspDeviceCharacteristic> characteristics) {
        JSONObject json;
        try {
            json = getLocalPostJSON(characteristics);
        } catch (JSONException e) {
            e.printStackTrace();
            return Collections.emptyList();
        }

        EspHttpParams params = new EspHttpParams();
        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        Map<String, String> headers = new HashMap<>();
        if (tokenH != null) {
            headers.put(tokenH.getName(), tokenH.getValue());
            headers.put(DeviceUtil.HEADER_ROOT_RESP, String.valueOf(true));
        }

        return DeviceUtil.httpLocalMulticastRequest(devices, json.toString().getBytes(), params, headers);
    }

    @Override
    public boolean doActionSetStatusLocal(IEspDevice device, Collection<EspDeviceCharacteristic> characteristics) {
        JSONObject json;
        try {
            json = getLocalPostJSON(characteristics);
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        Map<String, String> headers = new HashMap<>();
        if (tokenH != null) {
            headers.put(tokenH.getName(), tokenH.getValue());
        }
        EspHttpResponse response = DeviceUtil.httpLocalRequest(device, json.toString().getBytes(), null, headers);
        JSONObject respJSON = getResponseJSON(response);
        if (respJSON == null) {
            return false;
        }

        try {
            int statusCode = respJSON.getInt(KEY_STATUS_CODE);
            boolean suc = statusCode == STATUS_CODE_SUC;
            if (suc) {
                for (EspDeviceCharacteristic c : characteristics) {
                    EspDeviceCharacteristic devC = device.getCharacteristic(c.getCid());
                    if (devC != null) {
                        devC.setValue(c.getValue());
                    }
                }
            }
            return suc;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean doActionGetStatusLocal(IEspDevice device, int... cids) {
        if (cids.length == 0) {
            return false;
        }

        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_GET_STATUS);
            JSONArray cidArray = new JSONArray();
            for (int cid : cids) {
                cidArray.put(cid);
            }
            json.put(KEY_CIDS, cidArray);
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        Map<String, String> headers = new HashMap<>();
        if (tokenH != null) {
            headers.put(tokenH.getName(), tokenH.getValue());
        }
        EspHttpResponse response = DeviceUtil.httpLocalRequest(device, json.toString().getBytes(), null, headers);
        return setDeviceStatusWithResponse(response, device);
    }

    @Override
    public void doActionGetStatusLocal(Collection<IEspDevice> devices, int... cids) {
        if (cids.length == 0) {
            return;
        }

        JSONObject json = new JSONObject();
        try {
            json.put(KEY_REQUEST, REQUEST_GET_STATUS);
            JSONArray cidArray = new JSONArray();
            for (int cid : cids) {
                cidArray.put(cid);
            }
            json.put(KEY_CIDS, cidArray);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
        Map<String, String> headers = new HashMap<>();
        if (tokenH != null) {
            headers.put(tokenH.getName(), tokenH.getValue());
        }
        List<EspHttpResponse> responseList = DeviceUtil.httpLocalMulticastRequest(devices,
                json.toString().getBytes(), null, headers);
        Map<String, EspHttpResponse> responseMap = DeviceUtil.getMapWithDeviceResponses(responseList);
        for (IEspDevice device : devices) {
            EspHttpResponse response = responseMap.get(device.getMac());
            setDeviceStatusWithResponse(response, device);
        }
    }

    private boolean setDeviceStatusWithResponse(EspHttpResponse response, IEspDevice device) {
        JSONObject respJSON = getResponseJSON(response);
        if (respJSON == null) {
            return false;
        }
        EspHttpHeader parentHeader = response.findHeader(HEADER_PARENT_MAC);
        if (parentHeader != null) {
            device.setParentDeviceMac(parentHeader.getValue());
        }
        try {
            if (respJSON.getInt(KEY_STATUS_CODE) != STATUS_CODE_SUC) {
                return false;
            }

            JSONArray cArray = respJSON.getJSONArray(KEY_CHARACTERISTICS);
            int cLen = cArray.length();
            for (int i = 0; i < cLen; i++) {
                JSONObject cJSON = cArray.getJSONObject(i);
                int cid = cJSON.getInt(KEY_CID);
                EspDeviceCharacteristic c = device.getCharacteristic(cid);
                if (c != null) {
                    switch (c.getFormat()) {
                        case FORMAT_INT:
                            c.setValue(cJSON.getInt(KEY_VALUE));
                            break;
                        case FORMAT_DOUBLE:
                            c.setValue(cJSON.getDouble(KEY_VALUE));
                            break;
                        case FORMAT_STRING:
                            c.setValue(cJSON.getString(KEY_VALUE));
                            break;
                        case FORMAT_JSON:
                            c.setValue(cJSON.getJSONObject(KEY_VALUE));
                            break;
                        default:
                            break;
                    }
                }
            }

            return true;
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return false;
    }

    private JSONObject getResponseJSON(EspHttpResponse response) {
        if (response == null) {
            return null;
        }
        if (response.getCode() != HttpURLConnection.HTTP_OK) {
            return null;
        }

        try {
            return response.getContentJSON();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }
}
