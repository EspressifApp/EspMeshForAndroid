package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothDevice;

import androidx.annotation.NonNull;

import java.util.UUID;

import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;

public interface IEspActionDeviceBlufi extends IEspActionDevice {
    UUID UUID_SERVICE = UUID.fromString("0000ffff-0000-1000-8000-00805f9b34fb");
    UUID UUID_WRITE_CHARACTERISTIC = UUID.fromString("0000ff01-0000-1000-8000-00805f9b34fb");
    UUID UUID_NOTIFICATION_CHARACTERISTIC = UUID.fromString("0000ff02-0000-1000-8000-00805f9b34fb");

    int DEFAULT_MTU_LENGTH = 23;
    int DEFAULT_BLUFI_PACKET_LENGTH = 18;

    MeshBlufiClient doActionConnectMeshBLE(@NonNull BluetoothDevice device, int meshVersion,
                                           @NonNull MeshBlufiCallback userCallback);
}
