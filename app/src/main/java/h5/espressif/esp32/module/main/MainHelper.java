package h5.espressif.esp32.module.main;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.location.LocationManagerCompat;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;

import h5.espressif.esp32.module.Utils;
import h5.espressif.esp32.module.model.customer.Customer;
import h5.espressif.esp32.module.model.event.BluetoothChangedEvent;
import h5.espressif.esp32.module.model.event.WifiChangedEvent;
import h5.espressif.esp32.module.web.JSCallbacks;
import io.reactivex.rxjava3.core.Observable;
import iot.espressif.esp32.action.device.EspActionDeviceOTA;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.log.EspLog;
import libs.espressif.net.NetUtil;

public class MainHelper implements LifecycleObserver {
    private final EspLog mLog = new EspLog(getClass());

    private volatile EspWebActivity mActivity;

    private EspUser mUser;

    MainHelper(EspWebActivity activity) {
        mActivity = activity;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void onCreate() {
        Customer.INSTANCE.init(mActivity.getApplicationContext());

        mUser = EspUser.INSTANCE;
        mUser.setKey("123456789012345678901234567890123456789");
        mUser.setEmail("guest@guest.com");
        mUser.setName("Guest");

        mkdirs();
        ActivityCompat.requestPermissions(mActivity, new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                EspWebActivity.REQUEST_PERMISSION_DEFAULT);
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    public void onResume() {
        // For some Phones:(such as REALME X)
        notifyWifiChanged();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void onDestroy() {
        EventBus.getDefault().unregister(this);
        mUser.clear();
        mActivity = null;
    }

    private void mkdirs() {
        String otaBinPath = EspActionDeviceOTA.getBinDirPath();
        if (otaBinPath == null) {
            return;
        }

        Observable.just(new File(otaBinPath))
                .filter(dir -> !dir.exists())
                .filter(File::mkdirs)
                .doOnNext(dir -> mLog.d("mkdirs() otaBinPath"))
                .subscribe();
    }

    private void scanQRCode() {
        new IntentIntegrator(mActivity)
                .setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
                .setBarcodeImageEnabled(false)
                .setBeepEnabled(false)
                .setRequestCode(EspWebActivity.REQUEST_QRCODE)
                .setOrientationLocked(false)
                .setPrompt("")
                .initiateScan();
    }

    void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (mActivity == null) {
            return;
        }
        switch (requestCode) {
            case EspWebActivity.REQUEST_PERMISSION_DEFAULT:
                Observable.range(0, permissions.length)
                        .filter(i -> grantResults[i] == PackageManager.PERMISSION_GRANTED)
                        .map(i -> permissions[i])
                        .doOnNext(permission -> {
                            switch (permission) {
                                case Manifest.permission.ACCESS_FINE_LOCATION:
                                    EventBus.getDefault().post(new WifiChangedEvent());
                                    break;
                            }
                        })
                        .subscribe();
                break;
            case EspWebActivity.REQUEST_PERMISSION_CAMERA:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    scanQRCode();
                }
                break;
        }
    }

    void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (mActivity == null) {
            return;
        }
        switch (requestCode) {
            case EspWebActivity.REQUEST_QRCODE: {
                IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
                if (result.getContents() != null) {
                    mLog.d("QR code = " + result.getContents());
                    mActivity.evaluateJavascript(JSCallbacks.onQRCodeScanned(result.getContents()));
                }
                break;
            }
            case EspWebActivity.REQUEST_WIFI:
            case EspWebActivity.REQUEST_LOCATION: {
                notifyWifiChanged();
                break;
            }
            case EspWebActivity.REQUEST_BLUETOOTH: {
                notifyBluetoothChanged();
                break;
            }
        }
    }

    @Subscribe
    public void onWifiChanged(WifiChangedEvent event) {
        notifyWifiChanged();
    }

    @Subscribe
    public void onBluetoothChanged(BluetoothChangedEvent event) {
        notifyBluetoothChanged();
    }

    private void notifyWifiChanged() {
        JSONObject json = new JSONObject();
        final String keyConnected = "connected";
        final String keySSID = "ssid";
        final String keyEncode = "encode";
        final String keyBSSID = "bssid";
        final String keyFreq = "frequency";
        try {
            String[] infos = NetUtil.getCurrentConnectionInfo(mActivity);
            if (infos == null) {
                json.put(keyConnected, false);
            } else {
                String ssid = Utils.base64(infos[0]);
                json.put(keyConnected, true)
                        .put(keyEncode, true)
                        .put(keySSID, ssid)
                        .put(keyBSSID, infos[1])
                        .put(keyFreq, infos[3]);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        mActivity.evaluateJavascript(JSCallbacks.onWifiStateChanged(json.toString()));
    }

    private void notifyBluetoothChanged() {
        int state = BluetoothAdapter.getDefaultAdapter().getState();
        boolean enable = state == BluetoothAdapter.STATE_ON;
        try {
            JSONObject json = new JSONObject()
                    .put("enable", enable);
            mActivity.evaluateJavascript(JSCallbacks.onBluetoothChanged(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    void registerPhoneStateChange() {
        EventBus eventBus = EventBus.getDefault();
        if (!eventBus.isRegistered(this)) {
            EventBus.getDefault().register(this);
        }

        notifyWifiChanged();
        notifyBluetoothChanged();
    }

    void requestCameraPermission() {
        ActivityCompat.requestPermissions(mActivity, new String[]{Manifest.permission.CAMERA},
                EspWebActivity.REQUEST_PERMISSION_CAMERA);
    }

    boolean isLocationEnable() {
        LocationManager manager = (LocationManager) mActivity.getApplicationContext()
                .getSystemService(Context.LOCATION_SERVICE);
        return manager != null && LocationManagerCompat.isLocationEnabled(manager);
    }
}
