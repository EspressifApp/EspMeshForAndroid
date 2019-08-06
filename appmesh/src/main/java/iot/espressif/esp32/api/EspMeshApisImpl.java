package iot.espressif.esp32.api;

import android.bluetooth.BluetoothDevice;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.io.File;
import java.util.Collection;
import java.util.List;

import blufi.espressif.params.BlufiConfigureParams;
import blufi.espressif.params.BlufiParameter;
import iot.espressif.esp32.action.device.EspActionDeviceConfigure;
import iot.espressif.esp32.action.device.EspActionDeviceInfo;
import iot.espressif.esp32.action.device.EspActionDeviceReboot;
import iot.espressif.esp32.action.device.EspActionDeviceStation;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.model.device.ble.MeshConfigureParams;
import iot.espressif.esp32.model.device.ble.MeshScanListener;
import iot.espressif.esp32.model.device.ota.EspOTAClient;
import iot.espressif.esp32.model.device.properties.EspDeviceCharacteristic;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.utils.TextUtils;

class EspMeshApisImpl extends EspMeshApis {
    @Override
    public void startScanMeshBleDevice(@NonNull MeshScanListener listener) {
        EspBleUtils.startScanBle(listener);
    }

    @Override
    public void stopScanMeshBleDevice(@NonNull MeshScanListener listener) {
        EspBleUtils.stopScanBle(listener);
    }

    @Override
    public MeshBlufiClient startConfigureNetwork(@NonNull BluetoothDevice device, int meshVersion,
                                            @NonNull MeshConfigureParams params,
                                            @Nullable MeshBlufiCallback blufiCallback) {
        if (TextUtils.isEmpty(params.getAPSsid())) {
            throw new NullPointerException("AP SSID can't be empty");
        }

        BlufiConfigureParams bParams = new BlufiConfigureParams();
        bParams.setOpMode(BlufiParameter.OP_MODE_STA);
        bParams.setStaSSID(params.getAPSsid());
        bParams.setStaBSSID(params.getAPBssid());
        bParams.setStaPassword(params.getAPPassword());
        bParams.setMeshID(params.getMeshID());
        bParams.setMeshPassword(params.getMeshPassword());
        for (String staBssid : params.getWhiteList()) {
            bParams.addWhiteAddress(staBssid);
        }
        bParams.setCustomData(params.getCustomData());
        return new EspActionDeviceConfigure().doActionConfigureBlufi(device, meshVersion, bParams, blufiCallback);
    }

    @Override
    public void stopConfigureNetwork(@NonNull MeshBlufiClient client) {
        client.close();
    }

    @Override
    public List<IEspDevice> scanStations() {
        return scanStations(null);
    }

    @Override
    public List<IEspDevice> scanStations(@Nullable DeviceScanCallback callback) {
        return new EspActionDeviceStation().doActionScanStationsLocal(callback);
    }

    @Override
    public EspOTAClient startOTA(@NonNull File bin, @NonNull Collection<IEspDevice> devices,
                                 @Nullable EspOTAClient.OTACallback callback) {
        IEspDevice firstDev = devices.iterator().next();
        EspOTAClient client =  new EspOTAClient.Builder(EspOTAClient.OTA_TYPE_HTTP_POST)
                .setBin(bin)
                .setDevices(devices)
                .setProtocol(firstDev.getProtocol())
                .setHostAddress(firstDev.getLanHostAddress())
                .setOTACallback(callback)
                .build();
        client.start();
        return client;
    }

    @Override
    public EspOTAClient startOTA(@NonNull String url, @NonNull Collection<IEspDevice> devices,
                                 @Nullable EspOTAClient.OTACallback callback) {
        IEspDevice firstDev = devices.iterator().next();
        EspOTAClient client =  new EspOTAClient.Builder(EspOTAClient.OTA_TYPE_DOWNLOAD)
                .setBinUrl(url)
                .setDevices(devices)
                .setProtocol(firstDev.getProtocol())
                .setHostAddress(firstDev.getLanHostAddress())
                .setOTACallback(callback)
                .build();
        client.start();
        return client;
    }

    @Override
    public void stopOTA(@NonNull EspOTAClient client) {
        client.stop();
    }

    @Override
    public boolean getDeviceInfo(@NonNull IEspDevice device) {
        return new EspActionDeviceInfo().doActionGetDeviceInfoLocal(device);
    }

    @Override
    public void getDevicesInfo(@NonNull Collection<IEspDevice> devices) {
        new EspActionDeviceInfo().doActionGetDevicesInfoLocal(devices);
    }

    @Override
    public boolean setDeviceStatus(@NonNull IEspDevice device,
                                   @NonNull Collection<EspDeviceCharacteristic> characteristics) {
        return new EspActionDeviceInfo().doActionSetStatusLocal(device, characteristics);
    }

    @Override
    public void setDevicesStatus(@NonNull Collection<IEspDevice> devices,
                                 @NonNull Collection<EspDeviceCharacteristic> characteristics) {
        new EspActionDeviceInfo().doActionSetStatusLocal(devices, characteristics);
    }

    @Override
    public boolean getDeviceStatus(@NonNull IEspDevice device, int... cids) {
        return new EspActionDeviceInfo().doActionGetStatusLocal(device, cids);
    }

    public void getDevicesStatus(@NonNull Collection<IEspDevice> devices, int... cids) {
        new EspActionDeviceInfo().doActionGetStatusLocal(devices, cids);
    }

    public boolean reboot(@NonNull IEspDevice device) {
        return new EspActionDeviceReboot().doActionRebootLocal(device);
    }

    public void reboot(@NonNull Collection<IEspDevice> devices) {
        new EspActionDeviceReboot().doActionRebootLocal(devices);
    }
}
