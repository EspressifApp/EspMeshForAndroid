package h5.espressif.esp32.module.main;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.text.TextUtils;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.location.LocationManagerCompat;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import aliyun.espressif.mesh.web.AliApiForJS;
import h5.espressif.esp32.R;
import h5.espressif.esp32.module.model.customer.Customer;
import h5.espressif.esp32.module.model.event.BluetoothChangedEvent;
import h5.espressif.esp32.module.model.event.WifiChangedEvent;
import h5.espressif.esp32.module.model.web.AppApiForJS;
import h5.espressif.esp32.module.model.web.JSCallbacks;
import io.reactivex.Observable;
import iot.espressif.esp32.action.device.EspActionDeviceOTA;
import iot.espressif.esp32.model.device.ble.MeshBleDevice;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.app.AppUtil;
import libs.espressif.ble.EspBleUtils;
import libs.espressif.ble.ScanListener;
import libs.espressif.log.EspLog;
import libs.espressif.net.NetUtil;

@SuppressLint("SetJavaScriptEnabled")
public class EspWebActivity extends AppCompatActivity {
    private static final String FILE_PHONE = "app";
    private static final String FILE_PAD = "ipad";

    private static final String NAME_WEB_PREF = "web";
    private static final String KEY_WEB_FILE = "load_file";

    private static final int REQUEST_PERMISSION_DEFAULT = 0x01;
    private static final int REQUEST_PERMISSION_CAMERA = 0x02;
    private static final int REQUEST_QRCODE = IntentIntegrator.REQUEST_CODE;

    public static final int REQUEST_WIFI = 0x03;
    public static final int REQUEST_BLUETOOTH = 0x04;
    public static final int REQUEST_LOCATION = 0x05;

    private static final int BLE_NOTIFY_INTERVAL = 1500;

    private final EspLog mLog = new EspLog(getClass());

    private ViewGroup mWebForm;
    private WebView mWebView;

    private ImageView mCoverIV;

    private AppApiForJS mMeshApiForJS;
    private AliApiForJS mAliApiForJS;

    private EspUser mUser;

    private MainDeviceNotifyHelper mDeviceNotifyHelper;

    private BroadcastReceiver mReceiver = new MainReceiver();

    private ScanListener mBleCallback = new BleCallback();
    private final Map<BluetoothDevice, BleInfo> mBleInfoMap = new HashMap<>();
    private final Thread mBleNotifyThread = new BleNotifyThread();
    private volatile boolean mBleScanning;
    private volatile long mBleLastClearTime;

    private SharedPreferences mSharedPref;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Customer.INSTANCE.init(getApplicationContext());

        setContentView(R.layout.esp_web_activity);

        mUser = EspUser.INSTANCE;
        mUser.setKey("123456789012345678901234567890123456789");
        mUser.setEmail("guest@guest.com");
        mUser.setName("Guest");

        mSharedPref = getSharedPreferences(NAME_WEB_PREF, MODE_PRIVATE);

        mCoverIV = findViewById(R.id.web_cover);
        initWebView();

        ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.ACCESS_FINE_LOCATION
        }, REQUEST_PERMISSION_DEFAULT);

        mDeviceNotifyHelper = new MainDeviceNotifyHelper(this);

        mBleNotifyThread.start();

        IntentFilter filter = new IntentFilter(WifiManager.NETWORK_STATE_CHANGED_ACTION);
        filter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            filter.addAction(LocationManager.PROVIDERS_CHANGED_ACTION);
        }
        registerReceiver(mReceiver, filter);
    }

    @Override
    protected void onResume() {
        super.onResume();

        // For some Phones:(such as REALME X)
        notifyWifiChanged();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        unregisterReceiver(mReceiver);
        EventBus.getDefault().unregister(this);

        mDeviceNotifyHelper.close();
        mBleNotifyThread.interrupt();

        mWebForm.removeAllViews();
        mWebView.removeJavascriptInterface(AppApiForJS.NAME);
        mWebView.removeJavascriptInterface(AliApiForJS.NAME);
        mWebView.destroy();
        mMeshApiForJS.release();
        mAliApiForJS.release();

        mUser.clear();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case REQUEST_PERMISSION_DEFAULT:
                Observable.range(0, permissions.length)
                        .filter(i -> grantResults[i] == PackageManager.PERMISSION_GRANTED)
                        .map(i -> permissions[i])
                        .doOnNext(permission -> {
                            switch (permission) {
                                case Manifest.permission.WRITE_EXTERNAL_STORAGE:
                                    mkdirs();
                                    break;
                                case Manifest.permission.ACCESS_FINE_LOCATION:
                                    notifyWifiChanged();
                                    break;
                            }
                        })
                        .subscribe();
                break;
            case REQUEST_PERMISSION_CAMERA:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    scanQRCode();
                }
                break;
            default:
                super.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case REQUEST_QRCODE: {
                IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
                if (result.getContents() != null) {
                    mLog.d("QR code = " + result.getContents());
                    evaluateJavascript(JSCallbacks.onQRCodeScanned(result.getContents()));
                }
                return;
            }
            case REQUEST_WIFI:
            case REQUEST_LOCATION: {
                notifyWifiChanged();
                return;
            }
            case REQUEST_BLUETOOTH: {
                notifyBluetoothChanged();
                return;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        evaluateJavascript(JSCallbacks.onBackPressed());
    }

    private void mkdirs() {
        String otaBinPath = EspActionDeviceOTA.getBinDirPath();
        if (otaBinPath != null) {
            File otaBinDir = new File(otaBinPath);
            if (!otaBinDir.exists()) {
                boolean result = otaBinDir.mkdirs();
                mLog.d("mkdirs otaBinPath " + result);
            }
        }
    }

    private void initWebView() {
        mWebForm = findViewById(R.id.web_form);
        mWebView = new WebView(getApplicationContext());
        int width = ViewGroup.LayoutParams.MATCH_PARENT;
        int height = ViewGroup.LayoutParams.MATCH_PARENT;
        ViewGroup.MarginLayoutParams mlp = new ViewGroup.MarginLayoutParams(width, height);
        mWebForm.addView(mWebView, mlp);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                if (Objects.equals(uri.getHost(), Customer.INSTANCE.getHomeUrl())) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                } else {
                    view.loadUrl(url);
                }

                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setTextZoom(100);

        if (AppUtil.isPad(this)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            mWebView.loadUrl(getUrl(FILE_PAD));
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            String file = mSharedPref.getString(KEY_WEB_FILE, FILE_PHONE);
            mWebView.loadUrl(getUrl(file));
        }
        mMeshApiForJS = new AppApiForJS(this);
        mWebView.addJavascriptInterface(mMeshApiForJS, AppApiForJS.NAME);

        mAliApiForJS = new AliApiForJS(getApplicationContext(), this::evaluateJavascript);
        mWebView.addJavascriptInterface(mAliApiForJS, AliApiForJS.NAME);
    }

    @Subscribe
    public void onWifiChanged(WifiChangedEvent event) {
        notifyWifiChanged();
    }

    @Subscribe
    public void onBluetoothChanged(BluetoothChangedEvent event) {
        notifyBluetoothChanged();
    }

    public void registerPhoneStateChange() {
        EventBus eventBus = EventBus.getDefault();
        if (!eventBus.isRegistered(this)) {
            EventBus.getDefault().register(this);
        }

        notifyWifiChanged();
        notifyBluetoothChanged();
    }

    public void hideCoverImage() {
        runOnUiThread(() -> mCoverIV.setVisibility(View.GONE));
    }

    public boolean isOTAing() {
        return mMeshApiForJS != null && mMeshApiForJS.isOTAing();
    }

    public boolean isLocationEnable() {
        LocationManager manager = (LocationManager) getSystemService(LOCATION_SERVICE);
        return manager != null && LocationManagerCompat.isLocationEnabled(manager);
    }

    public void evaluateJavascript(String script) {
        runOnUiThread(() -> mWebView.evaluateJavascript(script, null));
    }

    private String getUrl(String file) {
        return String.format("file:///android_asset/web/%s.html", file);
    }

    public void loadFile(String file) {
        mSharedPref.edit().putString(KEY_WEB_FILE, file).apply();
        runOnUiThread(() -> mWebView.loadUrl(getUrl(file)));
    }

    private void notifyWifiChanged() {
        JSONObject json = new JSONObject();
        final String keyConnected = "connected";
        final String keySSID = "ssid";
        final String keyEncode = "encode";
        final String keyBSSID = "bssid";
        final String keyFreq = "frequency";
        try {
            String[] infos = NetUtil.getCurrentConnectionInfo(this);
            if (infos == null) {
                json.put(keyConnected, false);
            } else {
                String ssid = Base64.encodeToString(infos[0].getBytes(), Base64.NO_WRAP);
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

        evaluateJavascript(JSCallbacks.onWifiStateChanged(json.toString()));
    }

    private void notifyBluetoothChanged() {
        int state = BluetoothAdapter.getDefaultAdapter().getState();
        boolean enable = state == BluetoothAdapter.STATE_ON;
        try {
            JSONObject json = new JSONObject()
                    .put("enable", enable);
            evaluateJavascript(JSCallbacks.onBluetoothChanged(json.toString()));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public void startBleScan(List<ScanFilter> filters, ScanSettings settings) {
        synchronized (mBleNotifyThread) {
            if (mBleScanning) {
                EspBleUtils.stopScanBle(mBleCallback);
            }
            mBleLastClearTime = SystemClock.elapsedRealtime();

            mBleScanning = EspBleUtils.startScanBle(mBleCallback, settings, filters);
            if (mBleScanning) {
                mBleNotifyThread.notify();
            } else {
                mLog.w("Require to scan BLE failed");
            }
        }
    }

    public void stopBleScan() {
        synchronized (mBleNotifyThread) {
            mBleScanning = false;
            EspBleUtils.stopScanBle(mBleCallback);
            clearBle();
        }
    }

    public void clearBle() {
        synchronized (mBleInfoMap) {
            mBleInfoMap.clear();
        }
    }

    public void requestCameraPermission() {
        ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA},
                REQUEST_PERMISSION_CAMERA);
    }

    private void scanQRCode() {
        new IntentIntegrator(this)
                .setDesiredBarcodeFormats(IntentIntegrator.QR_CODE)
                .setBarcodeImageEnabled(false)
                .setBeepEnabled(false)
                .setRequestCode(REQUEST_QRCODE)
                .setOrientationLocked(false)
                .setPrompt("")
                .initiateScan();
    }

    public void newWebView(String url) {
        runOnUiThread(() -> {
            Intent intent = new Intent(EspWebActivity.this, EspExtendWebActivity.class);
            intent.putExtra("url", url);
            startActivity(intent);
        });
    }

    private class MainReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
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

    private class BleCallback implements ScanListener {

        @Override
        public void onLeScan(ScanResult scanResult) {
            if (scanResult.getScanRecord() == null) {
                return;
            }

            String name = scanResult.getDevice().getName();
            if (TextUtils.isEmpty(name)) {
                return;
            }

            synchronized (mBleInfoMap) {
                BleInfo info = new BleInfo();
                info.rssi = scanResult.getRssi();
                info.scanRecord = scanResult.getScanRecord().getBytes();
                mBleInfoMap.put(scanResult.getDevice(), info);
            }
        }
    }

    private class BleInfo {
        int rssi;
        byte[] scanRecord;
    }

    private class BleNotifyThread extends Thread {

        @Override
        public void run() {
            while (!isInterrupted()) {
                synchronized (mBleNotifyThread) {
                    if (!mBleScanning) {
                        try {
                            mLog.d("BleNotifyThread wait()");
                            mBleNotifyThread.wait();
                            mLog.d("BleNotifyThread notified");
                        } catch (InterruptedException e) {
                            mLog.w("BleNotifyThread wait interrupted");
                            break;
                        }
                    }
                }

                try {
                    Thread.sleep(BLE_NOTIFY_INTERVAL);
                } catch (InterruptedException e) {
                    mLog.w("BleNotifyThread sleep interrupted");
                    break;
                }

                Map<BluetoothDevice, BleInfo> tempMap = Collections.emptyMap();
                synchronized (mBleInfoMap) {
                    if (!mBleInfoMap.isEmpty()) {
                        tempMap = new HashMap<>(mBleInfoMap);
                    }
                }

                JSONArray array = new JSONArray();
                for (Map.Entry<BluetoothDevice, BleInfo> entry : tempMap.entrySet()) {
                    try {
                        BluetoothDevice ble = entry.getKey();
                        BleInfo info = entry.getValue();
                        String[] addrs = ble.getAddress().split(":");
                        StringBuilder address = new StringBuilder();
                        for (String str : addrs) {
                            address.append(str.toLowerCase());
                        }
                        MeshBleDevice meshBle = new MeshBleDevice(ble, info.rssi, info.scanRecord);
                        String mac = address.toString();
                        JSONObject bleJSON = new JSONObject()
                                .put("mac", mac)
                                .put("name", ble.getName() == null ? JSONObject.NULL : ble.getName())
                                .put("beacon", meshBle.getOUI() == null ? JSONObject.NULL : meshBle.getOUI())
                                .put("rssi", meshBle.getRssi())
                                .put("version", meshBle.getMeshVersion())
                                .put("bssid", meshBle.getStaBssid() == null ? mac : meshBle.getStaBssid())
                                .put("tid", meshBle.getTid())
                                .put("only_beacon", meshBle.isOnlyBeacon());
                        array.put(bleJSON);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
                if (array.length() > 0) {
                    evaluateJavascript(JSCallbacks.onScanBLE(array.toString()));
                }

                // Keep cache ble 3 minutes
                if (SystemClock.elapsedRealtime() - mBleLastClearTime > 180_000L) {
                    clearBle();
                    mBleLastClearTime = SystemClock.elapsedRealtime();
                }
            }
        }
    }

}
