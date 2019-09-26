package iot.espressif.esp32.net.udp;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;

import io.reactivex.Observable;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;

public class EspUdpServer {
    private DatagramSocket mSocket;
    private Disposable mRecvTask;

    private DataReceivedListener mReceivedListener;

    public synchronized boolean open(int port) {
        if (mSocket != null) {
            throw new IllegalStateException("The UDP socket has opened");
        }

        try {
            mSocket = new DatagramSocket(port);
            mRecvTask = receive();
            return true;
        } catch (SocketException e) {
            e.printStackTrace();
            return false;
        }
    }

    public synchronized void close() {
        if (mRecvTask != null) {
            mRecvTask.dispose();
            mRecvTask = null;
        }
        if (mSocket != null) {
            mSocket.close();
            mSocket = null;
        }
    }

    private Disposable receive() {
        return Observable.create(emitter -> {
            while (!emitter.isDisposed()) {
                if (mSocket.isClosed()) {
                    break;
                }

                DatagramPacket packet = new DatagramPacket(new byte[1500], 1500);
                try {
                    mSocket.receive(packet);
                } catch (IOException e) {
                    System.out.println("UDP server ioe");
                    break;
                } catch (NullPointerException e) {
                    e.printStackTrace();
                    break;
                }

                byte[] data = new byte[packet.getLength()];
                System.arraycopy(packet.getData(), packet.getOffset(), data, 0, data.length);
                InetAddress address = packet.getAddress();
                if (mReceivedListener != null) {
                    Observable.just(mReceivedListener)
                            .subscribeOn(Schedulers.io())
                            .doOnNext(listener -> listener.onDataReceived(address, data))
                            .subscribe();
                }
            }

            emitter.onNext(Boolean.TRUE);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .subscribe();
    }

    public void setDataReceivedListener(DataReceivedListener listener) {
        mReceivedListener = listener;
    }

    public interface DataReceivedListener {
        void onDataReceived(InetAddress address, byte[] data);
    }
}
