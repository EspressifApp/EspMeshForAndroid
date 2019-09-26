package iot.espressif.esp32.model.event;

import java.net.InetAddress;

public class DeviceTopologyEvent {
    public final InetAddress address;
    public final String type;
    public final int port;

    public DeviceTopologyEvent(InetAddress address, String type, int port) {
        this.address = address;
        this.type = type;
        this.port = port;
    }
}
