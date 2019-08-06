package iot.espressif.esp32.model.device.ble;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.content.Context;

import java.util.UUID;
import java.util.concurrent.LinkedBlockingQueue;

import io.reactivex.Observable;
import io.reactivex.schedulers.Schedulers;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.log.EspLog;

public class MeshBLEClient {
    private static final UUID UUID_SERVICE = EspBleUtils.newUUID("abf0");
    private static final UUID UUID_CHAR_WRITE = EspBleUtils.newUUID("abf1");

    private final EspLog mLog = new EspLog(getClass());

    private Context mContext;
    private BluetoothGatt mGatt;
    private BluetoothGattCallback mGattCallback;

    private final LinkedBlockingQueue<byte[]> mWriteDataQueue = new LinkedBlockingQueue<>();
    private final Object mWriteLock = new Object();
    private BluetoothGattCharacteristic mWriteChar;
    private Thread mWriteThread;

    public MeshBLEClient(Context context) {
        mContext = context;
    }

    public void setGattCallback(BluetoothGattCallback callback) {
        mGattCallback = callback;
    }

    public synchronized void connect(String deviceAddress) {
        close();

        BluetoothDevice device = BluetoothAdapter.getDefaultAdapter().getRemoteDevice(deviceAddress);
        mGatt = EspBleUtils.connectGatt(device, mContext, new GattCallback());
    }

    public synchronized void close() {
        if (mWriteThread != null) {
            mWriteThread.interrupt();
            try {
                mWriteThread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            mWriteThread = null;
        }

        if (mGatt != null) {
            mGatt.disconnect();
            mGatt.close();
            mGatt = null;
            mWriteChar = null;
        }
    }

    private class GattCallback extends BluetoothGattCallback {
        private void closeTask() {
            Observable.create(emitter -> {
                close();
                emitter.onComplete();
            }).subscribeOn(Schedulers.io())
                    .subscribe();
        }

        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                if (newState == BluetoothGatt.STATE_CONNECTED) {
                    gatt.discoverServices();
                } else if (newState == BluetoothGatt.STATE_DISCONNECTED) {
                    closeTask();
                }
            } else {
                closeTask();
            }

            if (mGattCallback != null) {
                mGattCallback.onConnectionStateChange(gatt, status, newState);
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            mLog.d("onServicesDiscovered status = " + status);
            if (status != BluetoothGatt.GATT_SUCCESS) {
                gatt.disconnect();
                return;
            }

            BluetoothGattService service = gatt.getService(UUID_SERVICE);
            if (service == null) {
                mLog.w("Get service failed");
                gatt.disconnect();
                return;
            }

            BluetoothGattCharacteristic writeChar = service.getCharacteristic(UUID_CHAR_WRITE);
            if (writeChar == null) {
                mLog.w("Get write char failed");
                gatt.disconnect();
                return;
            }

//            BluetoothGattDescriptor notifyDesc = writeChar.getDescriptor(EspBleUtils.getIndicationDescriptorUUID());
//            if (notifyDesc == null) {
//                gatt.disconnect();
//                return;
//            }
//            notifyDesc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
//            gatt.writeDescriptor(notifyDesc);

            mWriteChar = writeChar;

            mWriteThread = new WriteThread();
            mWriteThread.start();
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            super.onDescriptorWrite(gatt, descriptor, status);
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            super.onCharacteristicChanged(gatt, characteristic);
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            mLog.d("onCharacteristicWrite status=" + status);
            if (status != BluetoothGatt.GATT_SUCCESS) {
                gatt.disconnect();
                return;
            }

            synchronized (mWriteLock) {
                mWriteLock.notify();
            }
        }
    }

    public void write(byte[] data) {
        mWriteDataQueue.add(data);
    }

    private class WriteThread extends Thread {
        @Override
        public void run() {
            mLog.d("WriteThread start");
            byte[] data;
            while (!isInterrupted()) {
                try {
                    data = mWriteDataQueue.take();

                    synchronized (mWriteLock) {
                        mWriteChar.setValue(data);
                        mGatt.writeCharacteristic(mWriteChar);

                        mWriteLock.wait();
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    break;
                }
            }
            mLog.d("WriteThread end");
        }
    }
}
