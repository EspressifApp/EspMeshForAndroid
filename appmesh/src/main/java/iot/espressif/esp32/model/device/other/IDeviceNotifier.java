package iot.espressif.esp32.model.device.other;

import java.util.List;

import iot.espressif.esp32.model.device.IEspDevice;

public interface IDeviceNotifier {
    void setListenSniffer(boolean listen);

    void setListenStatus(boolean listen);

    void setListenTopology(boolean listen);

    boolean isOTAing();

    void listenedDeviceLost(List<IEspDevice> devices);

    void listenedDeviceFound(List<IEspDevice> devices);

    void listenedDeviceStatusChanged(List<IEspDevice> devices);

    void listenedSnifferDiscovered(List<Sniffer> sniffers);
}
