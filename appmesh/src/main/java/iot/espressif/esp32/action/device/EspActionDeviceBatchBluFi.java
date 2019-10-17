package iot.espressif.esp32.action.device;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.content.Context;

import androidx.annotation.NonNull;

import java.util.Collection;
import java.util.Hashtable;
import java.util.Map;
import java.util.concurrent.LinkedBlockingQueue;

import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.model.device.ble.MeshBlufiCallback;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.log.EspLog;

public class EspActionDeviceBatchBluFi extends EspActionDeviceBlufi implements IEspActionDeviceBatchBluFi {
    private final EspLog mLog = new EspLog(getClass());

    private Collection<BluetoothDevice> mDevices;
    private int mMeshVersion;
    private MeshBlufiCallback mUserCallback;

    private volatile boolean mClosed = false;

    private final LinkedBlockingQueue<Boolean> mQueue = new LinkedBlockingQueue<>();
    private Map<BluetoothDevice, MeshBlufiClient> mMeshBlufiClients;
    private Thread mThread;

    private MeshBlufiClientListener mListener;

    public EspActionDeviceBatchBluFi(@NonNull Collection<BluetoothDevice> devices, int meshVersion,
                                     @NonNull MeshBlufiCallback userCallback) {
        mDevices = devices;
        mMeshVersion = meshVersion;
        mUserCallback = userCallback;

        mMeshBlufiClients = new Hashtable<>();
    }

    @Override
    public void setMeshBlufiClientListener(MeshBlufiClientListener listener) {
        mListener = listener;
    }

    @Override
    public void close() {
        mClosed = true;

        if (mThread != null) {
            mThread.interrupt();
            mThread = null;
        }

        for (MeshBlufiClient client : mMeshBlufiClients.values()) {
            client.close();
        }
        mMeshBlufiClients.clear();
    }

    public MeshBlufiClient doActionConnectMeshBLE(@NonNull BluetoothDevice device, int meshVersion,
                                                  @NonNull MeshBlufiCallback userCallback) {
        throw new IllegalStateException("Forbid this function, call execute()");
    }

    private BleCallback getBleCallback(MeshBlufiClient blufi, MeshBlufiCallback userCallback) {
        return new BleCallback(blufi, userCallback) {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                super.onConnectionStateChange(gatt, status, newState);

                if (status != BluetoothGatt.GATT_SUCCESS) {
                    mQueue.add(false);
                } else {
                    if (newState == BluetoothGatt.STATE_CONNECTED) {
                        mQueue.add(true);
                    } else if (newState == BluetoothGatt.STATE_DISCONNECTED) {
                        mQueue.add(false);
                    }
                }
            }
        };
    }

    private void connect(MeshBlufiClient blufi, BluetoothDevice device) {
        blufi.setMeshVersion(mMeshVersion);
        Context context = EspApplication.getEspApplication().getApplicationContext();
        BleCallback bleCallback = getBleCallback(blufi, mUserCallback);
        BluetoothGatt gatt = EspBleUtils.connectGatt(device, context, bleCallback);
        blufi.setBluetoothGatt(gatt);
    }

    @Override
    public void execute() {
        if (mClosed) {
            throw new IllegalStateException("The action has closed");
        }

        mLog.d("Execute Batch BluFi");
        mThread = new Thread(() -> {
            for (BluetoothDevice device : mDevices) {
                if (mClosed) {
                    break;
                }

                MeshBlufiClient blufi = new MeshBlufiClient();
                mMeshBlufiClients.put(device, blufi);
                if (mListener != null) {
                    mListener.onClientCreated(blufi);
                }
                for (int i = 0; i < 5; ++i) {
                    connect(blufi, device);
                    try {
                        boolean connected = mQueue.take();
                        if (connected) {
                            break;
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                        break;
                    }

                    try {
                        Thread.sleep(300);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                        break;
                    }
                }
            }

            mLog.d("Batch BluFi Over");
        });
        mThread.start();
    }
}
