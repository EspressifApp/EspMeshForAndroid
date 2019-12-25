package iot.espressif.esp32.action.device;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.text.TextUtils;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Vector;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;

import io.reactivex.Observable;
import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.db.box.DeviceBox;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.EspDeviceFactory;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.DevicePropertiesCache;
import iot.espressif.esp32.model.net.MeshNode;
import libs.espressif.log.EspLog;
import libs.espressif.net.NetUtil;

public class EspActionDeviceStation implements IEspActionDeviceStation {
    private final EspLog mLog = new EspLog(getClass());

    @Override
    public List<IEspDevice> doActionLoadStationsDB() {
        List<DeviceDB> devDBs = MeshObjectBox.getInstance().device().loadAllDevices();

        List<IEspDevice> result = new ArrayList<>();
        for (DeviceDB db : devDBs) {
            try {
                IEspDevice device = EspDeviceFactory.parseDeviceDB(db);
                if (device != null) {
                    result.add(device);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    @Override
    public List<IEspDevice> doActionScanStationsLocal(DeviceScanCallback callback) {
        EspApplication app = EspApplication.getEspApplication();
        WifiManager wm = (WifiManager) app.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        assert wm != null;
        WifiManager.MulticastLock multicastLock = wm.createMulticastLock(getClass().getSimpleName());
        multicastLock.setReferenceCounted(false);
        multicastLock.acquire();

        List<IEspDevice> result = scanStations(callback);

        multicastLock.release();

        return result;
    }

    private class ScanListener {
        private final DeviceScanCallback callback;
        private final ExecutorService executor;

        final HashSet<String> addrSet = new HashSet<>();
        final HashSet<String> rootMacSet = new HashSet<>();
        final List<Future<List<IEspDevice>>> topoFuture = new Vector<>();

        DevicePropertiesCache devProCache = new DevicePropertiesCache();

        ScanListener(DeviceScanCallback callback, ExecutorService executor) {
            this.callback = callback;
            this.executor = executor;
        }

        void onScanResult(String mac, String addr, String protocol, int port) {
            synchronized (addrSet) {
                if (addrSet.contains(addr)) {
                    return;
                }

                addrSet.add(addr);
            }

            rootMacSet.add(mac);

            Future<List<IEspDevice>> future = executor.submit(() -> {
                EspActionDeviceTopology topoAction = new EspActionDeviceTopology();
                List<MeshNode> meshNodes = topoAction.doActionGetMeshNodeLocal(protocol, addr, port);
                List<IEspDevice> nodeDevices = new ArrayList<>(meshNodes.size());
                for (MeshNode node : meshNodes) {
                    IEspDevice nodeDev = EspDeviceFactory.parseMeshNode(node);
                    assert nodeDev != null;
                    devProCache.setPropertiesIfCache(nodeDev);
                    nodeDevices.add(nodeDev);
                }

                if (callback != null) {
                    Observable.just(new ArrayList<>(nodeDevices))
                            .subscribeOn(Schedulers.io())
                            .doOnNext(callback::onMeshDiscover)
                            .subscribe();
                }
                return nodeDevices;
            });
            topoFuture.add(future);
        }
    }

    private List<IEspDevice> scanStations(DeviceScanCallback callback) {
        List<IEspDevice> result = new ArrayList<>();

        ExecutorService executor = Executors.newCachedThreadPool();
        ScanListener listener = new ScanListener(callback, executor);

        List<Future> scanFutures = new ArrayList<>();
        int mdnsCount = 1;
        int udpCount = 3;
        // Scan mDNS
        for (int i = 0; i < mdnsCount; ++i) {
            Future future = executor.submit(() -> scanMDNS(listener));
            scanFutures.add(future);
        }

        // Scan UDP
        for (int i = 0; i < udpCount; ++i) {
            Future future = executor.submit(() -> scanUDP(listener));
            scanFutures.add(future);

            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                mLog.w("Interrupted when scan station UDP");
                Thread.currentThread().interrupt();
                break;
            }
        }

        for (Future future : scanFutures) {
            try {
                future.get();
            } catch (ExecutionException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                mLog.w("Interrupted when ScanFuture get result");
                Thread.currentThread().interrupt();
                break;
            }
        }
        for (Future<List<IEspDevice>> future : listener.topoFuture) {
            try {
                List<IEspDevice> devices = future.get();
                result.addAll(devices);
            } catch (ExecutionException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                mLog.w("Interrupted when TopoFuture get result");
                Thread.currentThread().interrupt();
                break;
            }
        }

        // Close ThreadPool
        executor.shutdown();
        mLog.d("ExecutorService shutdown");

        for (IEspDevice device : result) {
            if (listener.rootMacSet.contains(device.getMac())) {
                device.setParentDeviceMac(null);
            }
        }

        DeviceBox deviceBox = MeshObjectBox.getInstance().device();
        for (IEspDevice device : result) {
            DeviceDB deviceDB = deviceBox.loadDevice(device.getMac());
            if (deviceDB != null) {
                device.setId(deviceDB.id);
            }
        }
        return result;
    }

    private void scanMDNS(ScanListener scanListener) {
        mLog.d("mDNS scan start");
        EspApplication app = EspApplication.getEspApplication();
        WifiManager wm = (WifiManager) app.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        assert wm != null;

        JmDNS jmDNS = null;
        try {
            jmDNS = JmDNS.create(NetUtil.getWifiIpAddress(wm), "app32_scan_host");
            ServiceListener listener = new ServiceListener() {
                @Override
                public void serviceAdded(ServiceEvent event) {
                }

                @Override
                public void serviceRemoved(ServiceEvent event) {
                }

                @Override
                public void serviceResolved(ServiceEvent event) {
                    ServiceInfo info = event.getInfo();
                    String addr = info.getHostAddresses()[0];
                    String mac = info.getPropertyString(MDNS_KEY_MAC);
                    mLog.i(String.format(Locale.ENGLISH, "mDNS serviceResolved name=%s," +
                                    " type=%s, port=%d, mac=%s, address=%s",
                            info.getName(), info.getType(), info.getPort(), mac, addr));

                    if (TextUtils.isEmpty(mac)) {
                        return;
                    }

                    String protocol = null;
                    switch (info.getType()) {
                        case MDNS_TYPE_HTTP:
                            protocol = IEspDevice.PROTOCOL_HTTP;
                            break;
                        case MDNS_TYPE_HTTPS:
                            protocol = IEspDevice.PROTOCOL_HTTPS;
                            break;
                        default:
                            break;
                    }

                    scanListener.onScanResult(mac, addr, protocol, info.getPort());
                }
            };
            jmDNS.addServiceListener(MDNS_TYPE_HTTP, listener);
            jmDNS.addServiceListener(MDNS_TYPE_HTTPS, listener);

            try {
                Thread.sleep(MDNS_TIMEOUT);
            } catch (InterruptedException e) {
                mLog.w("Scan mDNS interrupted");
                return;
            } finally {
                jmDNS.removeServiceListener(MDNS_TYPE_HTTP, listener);
                jmDNS.removeServiceListener(MDNS_TYPE_HTTPS, listener);
                mLog.d("mDNS remove service listener");
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (jmDNS != null) {
                try {
                    jmDNS.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                mLog.d("mDNS close");
            }
        }

        mLog.d("mDNS scan end");
    }

    private void scanUDP(ScanListener scanListener) {
        mLog.d("UDP scan start");
        // Create udp socket
        DatagramSocket socket;
        Random random = new Random();
        while (true) {
            int port = random.nextInt(10000) + 20000;
            try {
                socket = new DatagramSocket(port);
                socket.setSoTimeout(UDP_TIMEOUT);
                break;
            } catch (SocketException e) {
                e.printStackTrace();
            }
        }

        // Send udp data
        Observable.just(socket)
                .subscribeOn(Schedulers.io())
                .doOnNext(datagramSocket -> {
                    try {
                        Thread.sleep(50);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    try {
                        byte[] sendData = UDP_SEND_DATA.getBytes();
                        InetAddress address = NetUtil.getBroadcastAddress(EspApplication.getEspApplication());
                        DatagramPacket sendPk = new DatagramPacket(sendData, sendData.length, address, UDP_DEVICE_PORT);
                        datagramSocket.send(sendPk);
                        mLog.d("UDP send " + UDP_SEND_DATA);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                })
                .subscribe();

        // Receive udp response
        while (true) {
            DatagramPacket recvPk = new DatagramPacket(new byte[512], 512);
            try {
                socket.receive(recvPk);
            } catch (IOException e) {
                mLog.w("UDP receive e: " + e.getMessage());
                break;
            }

            // Parse udp message
            // ESP32 Mesh aabbccddeeff protocol port
            Observable.just(recvPk)
                    .subscribeOn(Schedulers.io())
                    .doOnNext(packet -> {
                        String receiveStr = new String(packet.getData(), packet.getOffset(), packet.getLength());
                        String addr = packet.getAddress().getHostAddress();
                        mLog.i(String.format("UDP receive=%s, address=%s", receiveStr, addr));

                        String[] splits = receiveStr.split(" ");
                        if (splits.length < 5) {
                            return;
                        }
                        if (!splits[0].equals("ESP32")) {
                            return;
                        }

                        String mac = splits[2];
                        String protocol = splits[3];
                        int port = Integer.parseInt(splits[4]);

                        scanListener.onScanResult(mac, addr, protocol, port);
                    })
                    .subscribe(new Observer<DatagramPacket>() {
                        @Override
                        public void onSubscribe(Disposable d) {
                        }

                        @Override
                        public void onNext(DatagramPacket datagramPacket) {
                        }

                        @Override
                        public void onError(Throwable e) {
                            e.printStackTrace();
                        }

                        @Override
                        public void onComplete() {
                        }
                    });
        }

        socket.close();
        mLog.d("UDP scan end");
    }
}
