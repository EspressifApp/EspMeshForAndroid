package h5.espressif.esp32.module.main;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.OnLifecycleEvent;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONObject;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import h5.espressif.esp32.module.action.EspActionJSON;
import h5.espressif.esp32.module.model.event.SnifferDiscoveredEvent;
import h5.espressif.esp32.module.model.other.EspDeviceComparator;
import h5.espressif.esp32.module.web.JSCallbacks;
import io.reactivex.Observable;
import io.reactivex.android.schedulers.AndroidSchedulers;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.device.other.DeviceNotifier;
import iot.espressif.esp32.model.device.other.Sniffer;

public class MainDeviceNotifier extends DeviceNotifier {
    private volatile EspWebActivity mActivity;

    public MainDeviceNotifier(EspWebActivity activity) {
        super(activity.getApplicationContext());

        mActivity = activity;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void open() {
        super.open();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void close() {
        super.close();
        mActivity = null;
    }

    @Override
    public boolean isOTAing() {
        return mActivity != null && mActivity.isOTAing();
    }

    @Override
    public void listenedDeviceStatusChanged(List<IEspDevice> devices) {
        Observable.fromIterable(devices)
                .subscribeOn(AndroidSchedulers.mainThread())
                .doOnNext(device -> {
                    JSONObject json = new EspActionJSON().doActionParseDeviceStatus(device);
                    if (mActivity != null) {
                        mActivity.evaluateJavascript(JSCallbacks.onDeviceStatusChanged(json.toString()));
                    }
                })
                .subscribe();
    }

    @Override
    public void listenedDeviceFound(List<IEspDevice> devices) {
        List<IEspDevice> newDeviceList = new LinkedList<>(devices);
        Collections.sort(newDeviceList, new EspDeviceComparator<>());
        Observable.fromIterable(newDeviceList)
                .subscribeOn(AndroidSchedulers.mainThread())
                .doOnNext(device -> {
                    JSONObject json = new EspActionJSON().doActionParseDevice(device);
                    if (json != null && mActivity != null) {
                        mActivity.evaluateJavascript(JSCallbacks.onDeviceFound(json.toString()));
                    }
                })
                .subscribe();
    }

    @Override
    public void listenedDeviceLost(List<IEspDevice> devices) {
        Observable.fromIterable(devices)
                .subscribeOn(AndroidSchedulers.mainThread())
                .doOnNext(device -> {
                    if (mActivity != null) {
                        mActivity.evaluateJavascript(JSCallbacks.onDeviceLost(device.getMac()));
                    }
                })
                .subscribe();
    }

    @Override
    public void listenedSnifferDiscovered(List<Sniffer> sniffers) {
        EventBus.getDefault().post(new SnifferDiscoveredEvent(sniffers));
    }
}
