package iot.espressif.esp32.action.device;

import java.util.UUID;

public interface IEspActionDeviceConfigure extends IEspActionDevice {
    UUID UUID_SERVICE = UUID.fromString("0000ffff-0000-1000-8000-00805f9b34fb");
    UUID UUID_WRITE_CHARACTERISTIC = UUID.fromString("0000ff01-0000-1000-8000-00805f9b34fb");
    UUID UUID_NOTIFICATION_CHARACTERISTIC = UUID.fromString("0000ff02-0000-1000-8000-00805f9b34fb");

    int DEFAULT_MTU_LENGTH = 128;

    String REQUEST_ADD_DEVICE = "add_device";
    String KEY_WHITELIST = "whitelist";
}
