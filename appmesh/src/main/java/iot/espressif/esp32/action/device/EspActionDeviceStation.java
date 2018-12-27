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
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Vector;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;

import io.reactivex.Observable;
import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.app.EspApplication;
import iot.espressif.esp32.db.manager.EspDBManager;
import iot.espressif.esp32.db.model.DeviceDB;
import iot.espressif.esp32.model.callback.DeviceScanCallback;
import iot.espressif.esp32.model.device.EspDeviceFactory;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.DevicePropertiesCache;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.net.MeshNode;
import iot.espressif.esp32.model.other.EspRxObserver;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.log.EspLog;
import libs.espressif.net.NetUtil;

public class EspActionDeviceStation implements IEspActionDeviceStation {
    private final EspLog mLog = new EspLog(getClass());

    @Override
    public List<IEspDevice> doActionLoadStationsDB() {
        List<DeviceDB> devDBs = EspDBManager.getInstance().device().loadDeviceList();

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
        List<IEspDevice> result = new Vector<>();

        DevicePropertiesCache devProCache = new DevicePropertiesCache();

        LinkedBlockingQueue<Object> topoTaskQueue = new LinkedBlockingQueue<>();
        AtomicInteger topoCounter = new AtomicInteger(0);
        HashSet<String> addrSet = new HashSet<>();
        HashSet<String> rootMacSet = new HashSet<>();
        ScanListener listener = (mac, addr, protocol, port) -> {
            rootMacSet.add(mac);
            synchronized (addrSet) {
                if (!addrSet.contains(addr)) {
                    addrSet.add(addr);
                    topoCounter.incrementAndGet();

                    Observable.just(new EspActionDeviceTopology())
                            .subscribeOn(Schedulers.io())
                            .map(action -> {
                                // Get mesh info
                                return action.doActionGetMeshNodeLocal(protocol, addr, port);
                            })
                            .map(nodes -> {
                                // Parse device
                                List<IEspDevice> nodeDevices = new ArrayList<>(nodes.size());
                                for (MeshNode node : nodes) {
                                    IEspDevice nodeDev = EspDeviceFactory.parseMeshNode(node);
                                    devProCache.setPropertiesIfCache(nodeDev);
                                    nodeDevices.add(nodeDev);
                                }
                                return nodeDevices;
                            })
                            .doOnNext(nodeDevices -> {
                                // Invoke callback
                                if (callback != null) {
                                    Observable.just(nodeDevices)
                                            .subscribeOn(Schedulers.io())
                                            .doOnNext(callback::onMeshDiscover)
                                            .subscribe();
                                }
                            })
                            .doOnNext(result::addAll)
                            .subscribe(new EspRxObserver<List<IEspDevice>>(){
                                @Override
                                public void onError(Throwable e) {
                                    e.printStackTrace();
                                    topoTaskQueue.add(Boolean.FALSE);
                                }

                                @Override
                                public void onComplete() {
                                    topoTaskQueue.add(Boolean.TRUE);
                                }
                            });
                }
            }
        };

        LinkedBlockingQueue<Object> scanTaskQueue = new LinkedBlockingQueue<>();
        int mdnsCount = 1;
        int udpCount = 3;
        Observable.just(listener)
                .subscribeOn(Schedulers.io())
                .doOnNext(this::scanMDNS)
                .doOnComplete(() -> scanTaskQueue.add(Boolean.TRUE))
                .subscribe();
        for (int i = 0; i < 3; i++) {
            Observable.just(listener)
                    .subscribeOn(Schedulers.io())
                    .doOnNext(this::scanUDP)
                    .doOnComplete(() -> scanTaskQueue.add(Boolean.TRUE))
                    .subscribe();

            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        int scanCount = mdnsCount + udpCount;
        for (int i = 0; i < scanCount; i++) {
            try {
                scanTaskQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                return result;
            }
        }

        int topoTaskCount = topoCounter.get();
        for (int i = 0; i < topoTaskCount; i++) {
            try {
                topoTaskQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                return result;
            }
        }

        Observable.fromIterable(result)
                .filter(device -> rootMacSet.contains(device.getMac()))
                .doOnNext(device -> device.setParentDeviceMac(null))
                .subscribe();

        // TCP check
        final List<IEspDevice> tcpCheckDevices = tcpCheckStations(result);
        if (!tcpCheckDevices.isEmpty() && callback != null) {
            synchronized (tcpCheckDevices) {
                Observable.just(tcpCheckDevices)
                        .subscribeOn(Schedulers.io())
                        .doOnNext(callback::onMeshDiscover)
                        .subscribe(new EspRxObserver<List<IEspDevice>>() {
                            @Override
                            public void onError(Throwable e) {
                                e.printStackTrace();
                                synchronized (tcpCheckDevices) {
                                    tcpCheckDevices.notify();
                                }
                            }

                            @Override
                            public void onComplete() {
                                synchronized (tcpCheckDevices) {
                                    tcpCheckDevices.notify();
                                }
                            }
                        });

                try {
                    tcpCheckDevices.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    return Collections.emptyList();
                }
            }
        }
        result.addAll(tcpCheckDevices);

        return result;
    }

    private void scanMDNS(ScanListener scanListener) {
        mLog.d("mDNS scan start");
        EspApplication app = EspApplication.getInstance();
        WifiManager wm = (WifiManager) app.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (wm == null) {
            mLog.w("mDNS WifiManager is null");
            return;
        }
        WifiManager.MulticastLock lock = wm.createMulticastLock(getClass().getSimpleName());
        lock.setReferenceCounted(false);
        lock.acquire();

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
                e.printStackTrace();
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

            lock.release();
            mLog.d("mDNS lock release");
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
                        InetAddress address = NetUtil.getBroadcastAddress(EspApplication.getInstance());
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

    private List<IEspDevice> tcpCheckStations(Collection<IEspDevice> scanStations) {
        List<IEspDevice> result = new LinkedList<>();

        List<IEspDevice> tcpCheckDevices = new LinkedList<>();
        List<IEspDevice> rootUserDevices = new ArrayList<>();
        for (IEspDevice device : EspUser.INSTANCE.getAllDeviceList()) {
            if (!device.isState(EspDeviceState.State.LOCAL)) {
                continue;
            }
            if (device.getMeshLayerLevel() == IEspDevice.LAYER_ROOT) {
                rootUserDevices.add(device);
            }
        }

        HashSet<String> staAddrSet = new HashSet<>();
        HashSet<String> staMacSet = new HashSet<>();
        LinkedList<IEspDevice> stations = new LinkedList<>(scanStations);
        for (IEspDevice device : stations) {
            staAddrSet.add(device.getHostAddress());
            staMacSet.add(device.getMac());
        }

        for (IEspDevice rootUserDev : rootUserDevices) {
            if (staAddrSet.contains(rootUserDev.getHostAddress())) {
                continue;
            }
            if (staMacSet.contains(rootUserDev.getMac())) {
                continue;
            }

            tcpCheckDevices.add(rootUserDev);
        }
        mLog.d("TCP check device size = " + tcpCheckDevices.size());
        for (IEspDevice tcpDevice : tcpCheckDevices) {
            List<MeshNode> nodes = new EspActionDeviceTopology().doActionGetMeshNodeLocal(
                    tcpDevice.getProtocol(), tcpDevice.getHostAddress(), tcpDevice.getProtocolPort());
            for (MeshNode node : nodes) {
                IEspDevice nodeDev = EspDeviceFactory.parseMeshNode(node);
                if (nodeDev != null) {
                    result.add(nodeDev);
                }
            }
        }

        return result;
    }

    private interface ScanListener {
        void onScanResult(String mac, String addr, String protocol, int port);
    }
}
