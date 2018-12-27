package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothGatt;

import java.util.UUID;

import blufi.espressif.BlufiCallback;
import blufi.espressif.BlufiClient;

public interface IEspActionDeviceConfigure extends IEspActionDevice {
    UUID UUID_SERVICE = UUID.fromString("0000ffff-0000-1000-8000-00805f9b34fb");
    UUID UUID_WRITE_CHARACTERISTIC = UUID.fromString("0000ff01-0000-1000-8000-00805f9b34fb");
    UUID UUID_NOTIFICATION_CHARACTERISTIC = UUID.fromString("0000ff02-0000-1000-8000-00805f9b34fb");

    int DEFAULT_MTU_LENGTH = 128;

    class EspBlufi {
        int meshVersion = -1;
        BlufiClient blufiClient;
        BluetoothGatt bluetoothGatt;

        public BlufiClient getBlufiClient() {
            return blufiClient;
        }

        public BluetoothGatt getBluetoothGatt() {
            return bluetoothGatt;
        }

        public synchronized void close() {
            if (bluetoothGatt != null) {
                bluetoothGatt.close();
            }
            if (blufiClient != null) {
                blufiClient.close();
            }
        }
    }

    abstract class EspBlufiCallback extends BlufiCallback {
        public void onGattConnectionChange(BluetoothGatt gatt, int status, boolean connected) {
        }

        public void onGattServiceDiscover(BluetoothGatt gatt, int status, UUID uuid) {
        }

        public void onGattCharacteristicDiscover(BluetoothGatt gatt, int status, UUID uuid) {
        }

        public void onMtuChanged(BluetoothGatt gatt, int status) {
        }
    }
}
