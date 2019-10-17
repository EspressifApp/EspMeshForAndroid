package iot.espressif.esp32.action.device;

import iot.espressif.esp32.model.device.ble.MeshBlufiClient;

public interface IEspActionDeviceBatchBluFi {
    interface MeshBlufiClientListener {
        void onClientCreated(MeshBlufiClient client);
    }

    void setMeshBlufiClientListener(MeshBlufiClientListener listener);

    void execute();

    void close();
}
