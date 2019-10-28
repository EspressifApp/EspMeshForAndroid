package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothDevice;

import androidx.annotation.NonNull;

import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import meshblufi.espressif.params.BlufiConfigureParams;

public interface IEspActionDeviceConfigure extends IEspActionDeviceBlufi {
    String REQUEST_ADD_DEVICE = "add_device";
    String KEY_WHITELIST = "whitelist";

    MeshBlufiClient doActionConfigureBlufi(@NonNull BluetoothDevice device,
                                           int meshVersion, BlufiConfigureParams params,
                                           @NonNull MeshBlufiCallback userCallback);
}
