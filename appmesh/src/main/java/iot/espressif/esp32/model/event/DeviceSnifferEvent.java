package iot.espressif.esp32.model.event;

import java.net.InetAddress;

public class DeviceSnifferEvent {
    public final InetAddress address;
    public final String[] macs;

    public DeviceSnifferEvent(InetAddress address, String[] macs) {
        this.address = address;
        this.macs = macs;
    }
}
