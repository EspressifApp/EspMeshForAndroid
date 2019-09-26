package h5.espressif.esp32.module.main;

import android.annotation.SuppressLint;
import android.text.TextUtils;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;

import h5.espressif.esp32.module.action.EspActionJSON;
import h5.espressif.esp32.module.model.event.SnifferDiscoveredEvent;
import h5.espressif.esp32.module.model.other.EspDeviceComparator;
import h5.espressif.esp32.module.model.web.JSCallbacks;
import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.device.EspActionDeviceInfo;
import iot.espressif.esp32.action.device.EspActionDeviceSniffer;
import iot.espressif.esp32.action.device.EspActionDeviceTopology;
import iot.espressif.esp32.db.box.MeshObjectBox;
import iot.espressif.esp32.model.device.EspDeviceFactory;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.DevicePropertiesCache;
import iot.espressif.esp32.model.device.other.Sniffer;
import iot.espressif.esp32.model.device.properties.EspDeviceState;
import iot.espressif.esp32.model.event.DeviceSnifferEvent;
import iot.espressif.esp32.model.event.DeviceStatusEvent;
import iot.espressif.esp32.model.event.DeviceTopologyEvent;
import iot.espressif.esp32.model.net.MeshNode;
import iot.espressif.esp32.model.user.EspUser;
import iot.espressif.esp32.net.udp.EspDeviceNotifyHelper;
import libs.espressif.log.EspLog;

@SuppressLint("CheckResult")
public class MainDeviceNotifyHelper {
    private EspLog mLog = new EspLog(getClass());

    private final Map<InetAddress, Runnable> mTopoTaskMap;
    private final Map<InetAddress, StatusRunnable> mStatusTaskMap;
    private final Map<InetAddress, SnifferRunnable> mSnifferTaskMap;

    private volatile EspWebActivity mActivity;
    private EspUser mUser;

    private Disposable mTaskDisposable;
    private LinkedBlockingQueue<InetAddress> mTaskQueue;

    private EspDeviceNotifyHelper mDeviceNotifyHelper;

    public MainDeviceNotifyHelper(EspWebActivity activity) {
        mActivity = activity;
        mUser = EspUser.INSTANCE;

        mTopoTaskMap = new HashMap<>();
        mStatusTaskMap = new HashMap<>();
        mSnifferTaskMap = new HashMap<>();
        initTaskDisposable();

        mDeviceNotifyHelper = new EspDeviceNotifyHelper();
        EventBus.getDefault().register(this);
        Observable.create(emitter -> {
            boolean suc = mDeviceNotifyHelper.open();
            emitter.onNext(suc);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .subscribe();
    }

    public void close() {
        EventBus.getDefault().unregister(this);
        mDeviceNotifyHelper.close();
        mTaskDisposable.dispose();
        mTopoTaskMap.clear();
        mStatusTaskMap.clear();
        mSnifferTaskMap.clear();
        mTaskQueue.clear();
        mActivity = null;
    }

    private void initTaskDisposable() {
        mTaskQueue = new LinkedBlockingQueue<>();

        mTaskDisposable = Observable.create(emitter -> {
            while (!emitter.isDisposed()) {
                InetAddress address;
                try {
                    address = mTaskQueue.take();
                } catch (InterruptedException e) {
                    mLog.w("DeviceNotifyHelper task queue interrupted");
                    Thread.currentThread().interrupt();
                    break;
                }

                Runnable topoRunable;
                synchronized (mTopoTaskMap) {
                    topoRunable = mTopoTaskMap.get(address);
                    if (topoRunable != null) {
                        mTopoTaskMap.remove(address);
                    }
                }
                if (topoRunable != null) {
                    topoRunable.run();
                }

                if (emitter.isDisposed()) {
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


                if (emitter.isDisposed()) {
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

            emitter.onNext(Boolean.TRUE);
            emitter.onComplete();
        }).subscribeOn(Schedulers.io())
                .subscribe();
    }

    @Subscribe
    public void onTopologyChanged(DeviceTopologyEvent event) {
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
                i++;
            }
            new EspActionDeviceInfo().doActionGetStatusLocal(devices, cids);
            Observable.fromIterable(devices)
                    .subscribeOn(AndroidSchedulers.mainThread())
                    .forEach(device -> {
                        JSONObject json = new EspActionJSON().doActionParseDeviceStatus(device);
                        if (mActivity != null) {
                            mActivity.evaluateJavascript(JSCallbacks.onDeviceStatusChanged(json.toString()));
                        }
                    });
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
            if (mActivity.isOTAing()) {
                mLog.d("OTA ING");
                return;
            }

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
                    .forEach(device -> mUser.removeDevice(device.getMac()));

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

            Observable.fromIterable(delDevices)
                    .subscribeOn(AndroidSchedulers.mainThread())
                    .forEach(device -> {
                        if (mActivity != null) {
                            mActivity.evaluateJavascript(JSCallbacks.onDeviceLost(device.getMac()));
                        }
                    });

            List<IEspDevice> newDeviceList = new LinkedList<>(newDevices);
            Collections.sort(newDeviceList, new EspDeviceComparator<>());
            Observable.fromIterable(newDeviceList)
                    .subscribeOn(AndroidSchedulers.mainThread())
                    .forEach(device -> {
                        JSONObject json = new EspActionJSON().doActionParseDevice(device);
                        if (json != null && mActivity != null) {
                            mActivity.evaluateJavascript(JSCallbacks.onDeviceFound(json.toString()));
                        }
                    });
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

            EventBus.getDefault().post(new SnifferDiscoveredEvent(querySnifferList));
        }

        private Map<String, String> getOrgMacMap() {
            Map<String, String> result = new HashMap<>();
            try {
                InputStream is = mActivity.getAssets().open("mac_org_list.txt");
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
                InputStream is = mActivity.getAssets().open("bt_org_list.txt");
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
