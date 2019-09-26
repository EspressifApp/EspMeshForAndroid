package h5.espressif.esp32.module.model.event;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.List;

import iot.espressif.esp32.model.device.other.Sniffer;

public class SnifferDiscoveredEvent {
    private List<Sniffer> mSniffers;

    public SnifferDiscoveredEvent(@NonNull List<Sniffer> sniffers) {
        mSniffers = sniffers;
    }

    @NonNull
    public List<Sniffer> getSniffers() {
        return new ArrayList<>(mSniffers);
    }
}
