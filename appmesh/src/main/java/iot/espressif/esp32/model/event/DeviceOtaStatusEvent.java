package iot.espressif.esp32.model.event;

import java.net.InetAddress;

public class DeviceOtaStatusEvent {
    public final InetAddress address;
    public final String[] macs;

    public DeviceOtaStatusEvent(InetAddress address, String[] macs) {
        this.address = address;
        this.macs = macs;
    }
}
