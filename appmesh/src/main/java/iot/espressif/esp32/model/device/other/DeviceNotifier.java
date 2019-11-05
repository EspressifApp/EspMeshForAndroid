package iot.espressif.esp32.model.device.other;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.TextUtils;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;

import io.reactivex.Observable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.device.EspActionDeviceInfo;
import iot.espressif.esp32.action.device.EspActionDeviceSniffer;
import iot.espressif.esp32.action.device.EspActionDeviceTopology;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.device.EspDeviceFactory;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.event.DeviceSnifferEvent;
import iot.espressif.esp32.model.event.DeviceStatusEvent;
import iot.espressif.esp32.model.event.DeviceTopologyEvent;
import iot.espressif.esp32.model.net.MeshNode;
import iot.espressif.esp32.model.user.EspUser;
import iot.espressif.esp32.net.udp.EspDeviceNotifyHelper;
import libs.espressif.log.EspLog;

@SuppressLint("CheckResult")
public abstract class DeviceNotifier implements IDeviceNotifier, LifecycleObserver {
    private EspLog mLog = new EspLog(getClass());

    private final Map<InetAddress, Runnable> mTopoTaskMap;
    private final Map<InetAddress, StatusRunnable> mStatusTaskMap;
    private final Map<InetAddress, SnifferRunnable> mSnifferTaskMap;

    private Context mContext;

    private EspUser mUser;

    private Thread mTaskThread;
    private LinkedBlockingQueue<InetAddress> mTaskQueue;

    private EspDeviceNotifyHelper mDeviceNotifyHelper;

    private boolean listenSniffer = false;
    private boolean listenTopology = false;
    private boolean listenStatus = false;

    public DeviceNotifier(Context context) {
        mContext = context;
        mUser = EspUser.INSTANCE;

        mTopoTaskMap = new HashMap<>();
        mStatusTaskMap = new HashMap<>();
        mSnifferTaskMap = new HashMap<>();
    }

    public void setListenSniffer(boolean listen) {
        listenSniffer = listen;
    }

    public void setListenStatus(boolean listen) {
        listenStatus = listen;
    }

    public void setListenTopology(boolean listen) {
        listenTopology = listen;
    }

    public boolean isOTAing() {
        return false;
    }

    public void listenedDeviceLost(List<IEspDevice> devices) {
    }

    public void listenedDeviceFound(List<IEspDevice> devices) {
    }

    public void listenedDeviceStatusChanged(List<IEspDevice> devices) {
    }

    public void listenedSnifferDiscovered(List<Sniffer> sniffers) {
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void open() {
        EventBus.getDefault().register(this);
        initTaskThread();
        mDeviceNotifyHelper = new EspDeviceNotifyHelper();
        Observable.create(emitter -> {
            boolean suc = mDeviceNotifyHelper.open();
            emitter.onNext(suc);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .subscribe();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void close() {
        EventBus.getDefault().unregister(this);
        mDeviceNotifyHelper.close();
        mTaskThread.interrupt();
        mTopoTaskMap.clear();
        mStatusTaskMap.clear();
        mSnifferTaskMap.clear();
        mTaskQueue.clear();
        mContext = null;
    }

    private void initTaskThread() {
        mTaskQueue = new LinkedBlockingQueue<>();
        mTaskThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                InetAddress address;
                try {
                    address = mTaskQueue.take();
                } catch (InterruptedException e) {
                    mLog.w("DeviceNotifyHelper task queue interrupted");
                    Thread.currentThread().interrupt();
                    break;
                }

                Runnable topoRunnable;
                synchronized (mTopoTaskMap) {
                    topoRunnable = mTopoTaskMap.get(address);
                    if (topoRunnable != null) {
                        mTopoTaskMap.remove(address);
                    }
                }
                if (topoRunnable != null) {
                    topoRunnable.run();
                }

                if (Thread.currentThread().isInterrupted()) {
                    break;
                }

                StatusRunnable statusRunnable;
                synchronized (mStatusTaskMap) {
                    statusRunnable = mStatusTaskMap.get(address);
                    if (statusRunnable != null) {
                        mStatusTaskMap.remove(address);
                    }
                }
                if (statusRunnable != null) {
                    statusRunnable.run();
                }


                if (Thread.currentThread().isInterrupted()) {
                    break;
                }

                Runnable snifferRunnable;
                synchronized (mSnifferTaskMap) {
                    snifferRunnable = mSnifferTaskMap.get(address);
                    if (snifferRunnable != null) {
                        mSnifferTaskMap.remove(address);
                    }
                }
                if (snifferRunnable != null) {
                    snifferRunnable.run();
                }
            }
        });
        mTaskThread.start();
    }

    @Subscribe
    public void onTopologyChanged(DeviceTopologyEvent event) {
        if (!listenTopology) {
            return;
        }
        if (isOTAing()) {
            return;
        }
        mLog.d("onTopologyChanged " + event.address);
        if (!mUser.isLogged()) {
            mLog.d("User not logged");
            return;
        }

        synchronized (mTopoTaskMap) {
            if (mTopoTaskMap.get(event.address) != null) {
                return;
            }

            Runnable runnable = new TopoRunnable(event.type, event.address.getHostAddress(), event.port);
            mTopoTaskMap.put(event.address, runnable);
        }

        mTaskQueue.add(event.address);
    }

    @Subscribe
    public void onDeviceStatusChanged(DeviceStatusEvent event) {
        if (!listenStatus) {
            return;
        }
        mLog.d("onDeviceStatusChanged " + event.address);
        if (!mUser.isLogged()) {
            mLog.d("User not logged");
            return;
        }

        synchronized (mStatusTaskMap) {
            StatusRunnable runnable = mStatusTaskMap.get(event.address);
            if (runnable == null) {
                runnable = new StatusRunnable();
            }
            for (String mac : event.macs) {
                IEspDevice dev = mUser.getDeviceForMac(mac);
                if (dev != null && dev.getLanAddress() != null) {
                    runnable.devices.add(dev);
                }
            }

            mStatusTaskMap.put(event.address, runnable);
        }

        mTaskQueue.add(event.address);
    }

    @Subscribe
    public void onSnifferDiscovered(DeviceSnifferEvent event) {
        if (!listenSniffer) {
            return;
        }
        mLog.d("onSnifferDiscovered " + event.address);
        if (!mUser.isLogged()) {
            mLog.d("User not logged");
            return;
        }

        synchronized (mSnifferTaskMap) {
            SnifferRunnable runnable = mSnifferTaskMap.get(event.address);
            if (runnable == null) {
                runnable = new SnifferRunnable();
            }
            for (String mac : event.macs) {
                IEspDevice dev = mUser.getDeviceForMac(mac);
                if (dev != null && dev.getLanAddress() != null) {
                    runnable.devices.add(dev);
                }
            }

            mSnifferTaskMap.put(event.address, runnable);
            mLog.d("onSnifferDiscovered add queue map size = " + mSnifferTaskMap.size());
        }

        mTaskQueue.add(event.address);
    }

    private class StatusRunnable implements Runnable {
        final HashSet<IEspDevice> devices = new HashSet<>();

        @Override
        public void run() {
            HashSet<Integer> cidSet = new HashSet<>();
            Observable.fromIterable(devices)
                    .flatMapIterable(IEspDevice::getCharacteristics)
                    .doOnNext(characteristic -> cidSet.add(characteristic.getCid()))
                    .subscribe();
            int[] cids = new int[cidSet.size()];
            int i = 0;
            for (int cid : cidSet) {
                cids[i] = cid;
                ++i;
            }
            new EspActionDeviceInfo().doActionGetStatusLocal(devices, cids);
            List<IEspDevice> deviceList = new ArrayList<>(devices);
            listenedDeviceStatusChanged(deviceList);
        }
    }

    private class TopoRunnable implements Runnable {
        String protocol;
        String address;
        int port;

        TopoRunnable(String _protocol, String _address, int _port) {
            protocol = _protocol;
            address = _address;
            port = _port;
        }

        @Override
        public void run() {
            Thread thread = Thread.currentThread();

            List<MeshNode> nodes = new EspActionDeviceTopology().doActionGetMeshNodeLocal(protocol, address, port);

            if (thread.isInterrupted()) {
                mLog.w("Thread is interrupted");
                return;
            }

            DevicePropertiesCache devProCache = new DevicePropertiesCache();
            Set<IEspDevice> nodeDevices = new HashSet<>();
            for (MeshNode node : nodes) {
                IEspDevice device = EspDeviceFactory.parseMeshNode(node);
                if (device != null) {
                    devProCache.setPropertiesIfCache(device);
                    nodeDevices.add(device);
                }
            }

            Map<String, IEspDevice> hostDeviceMap = new HashMap<>();
            Set<IEspDevice> meshAddrDevices = new HashSet<>();
            Observable.fromIterable(mUser.getAllDeviceList())
                    .filter(device -> device.isState(EspDeviceState.State.LOCAL))
                    .doOnNext(device -> hostDeviceMap.put(device.getLanAddress().getHostAddress(), device))
                    .filter(device -> device.getLanAddress().getHostAddress().equals(address))
                    .doOnNext(meshAddrDevices::add)
                    .subscribe();

            Set<IEspDevice> delDevices = new HashSet<>();
            Observable.just(hostDeviceMap)
                    .filter(map -> !map.containsKey(address))
                    .flatMapIterable(Map::entrySet)
                    .filter(entry -> {
                        String host = entry.getKey();
                        IEspDevice device = entry.getValue();
                        String _procotol = device.getProtocol();
                        int _port = device.getProtocolPort();

                        EspActionDeviceTopology action = new EspActionDeviceTopology();
                        List<MeshNode> query = action.doActionGetMeshNodeLocal(_procotol, host, _port);
                        return query == null || query.isEmpty();
                    })
                    .doOnNext(entry -> {
                        String host = entry.getKey();
                        for (IEspDevice device : mUser.getAllDeviceList()) {
                            if (host.equals(device.getLanHostAddress())) {
                                delDevices.add(device);
                            }
                        }
                    })
                    .subscribe();
            Observable.fromIterable(meshAddrDevices)
                    .filter(device -> !nodeDevices.contains(device))
                    .doOnNext(delDevices::add)
                    .subscribe();

            // Delete devices
            Observable.fromIterable(delDevices)
                    .doOnNext(device -> mUser.removeDevice(device.getMac()))
                    .subscribe();

            Set<IEspDevice> newDevices = new HashSet<>();
            Observable.fromIterable(nodeDevices)
                    .filter(node -> mUser.getDeviceForMac(node.getMac()) == null)
                    .doOnNext(newDevices::add)
                    .doOnComplete(() -> {
                        mLog.d("New device size = " + newDevices.size());
                        new EspActionDeviceInfo().doActionGetDevicesInfoLocal(newDevices);
                    })
                    .subscribe();

            // Add new devices
            mUser.syncDevices(newDevices);

            if (thread.isInterrupted()) {
                return;
            }

            if (!delDevices.isEmpty()) {
                listenedDeviceLost(new ArrayList<>(delDevices));
            }
            if (!newDevices.isEmpty()) {
                listenedDeviceFound(new ArrayList<>(newDevices));
            }
        }
    }

    private class SnifferRunnable implements Runnable {
        final HashSet<IEspDevice> devices = new HashSet<>();

        @Override
        public void run() {
            Map<String, String> btOrgMap = getOrgBtMap();
            Map<String, String> macOrgMap = getOrgMacMap();
            List<Sniffer> querySnifferList = new EspActionDeviceSniffer().doActionGetSniffersLocal(devices);
            for (Sniffer sr : querySnifferList) {
                String org = null;
                if (!TextUtils.isEmpty(sr.getManufacturerId())) {
                    org = btOrgMap.get(sr.getManufacturerId());
                }
                if (TextUtils.isEmpty(org)) {
                    org = macOrgMap.get(sr.getBssid().substring(0, 6));
                }
                sr.setOrganization(org);
                MeshObjectBox.getInstance().sniffer().saveSniffer(sr);
            }

            listenedSnifferDiscovered(querySnifferList);
        }

        private Map<String, String> getOrgMacMap() {
            Map<String, String> result = new HashMap<>();
            try {
                InputStream is = mContext.getAssets().open("org/mac_list.txt");
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                for (String string = br.readLine(); string != null; string = br.readLine()) {
                    String[] values = string.split("\t");
                    if (values.length < 2) {
                        continue;
                    }
                    result.put(values[0], values[1]);
                }
                br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

            return result;
        }

        private Map<String, String> getOrgBtMap() {
            Map<String, String> result = new HashMap<>();
            try {
                InputStream is = mContext.getAssets().open("org/bt_list.txt");
                BufferedReader br = new BufferedReader(new InputStreamReader(is));
                for (String string = br.readLine(); string != null; string = br.readLine()) {
                    String[] values = string.split("\t");
                    if (values.length < 2) {
                        continue;
                    }
                    result.put(values[0], values[1]);
                }
                br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

            return result;
        }
    }
}
