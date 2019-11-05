package h5.espressif.esp32.module.main;

import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.LocationManager;
import android.net.wifi.WifiManager;
import android.os.Build;

import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import org.greenrobot.eventbus.EventBus;

import h5.espressif.esp32.module.model.event.BluetoothChangedEvent;
import h5.espressif.esp32.module.model.event.WifiChangedEvent;

public class MainBroadcastReceiver extends BroadcastReceiver implements LifecycleObserver {
    private volatile EspWebActivity mActivity;

    public MainBroadcastReceiver(EspWebActivity activity) {
        mActivity = activity;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void register() {
        IntentFilter filter = new IntentFilter(WifiManager.NETWORK_STATE_CHANGED_ACTION);
        filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            filter.addAction(LocationManager.PROVIDERS_CHANGED_ACTION);
        }
        mActivity.registerReceiver(this, filter);
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void unregister() {
        mActivity.unregisterReceiver(this);
        mActivity = null;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (mActivity == null) {
            return;
        }
        String action = intent.getAction();
        if (action == null) {
            return;
        }

        switch (action) {
            case WifiManager.NETWORK_STATE_CHANGED_ACTION:
            case LocationManager.PROVIDERS_CHANGED_ACTION:
                EventBus.getDefault().post(new WifiChangedEvent());
                break;
            case BluetoothAdapter.ACTION_STATE_CHANGED:
                EventBus.getDefault().post(new BluetoothChangedEvent());
                break;
        }
    }
}
