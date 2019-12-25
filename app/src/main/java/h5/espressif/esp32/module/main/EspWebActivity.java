package h5.espressif.esp32.module.main;

import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.zxing.integration.android.IntentIntegrator;

import java.util.List;

import h5.espressif.esp32.R;
import h5.espressif.esp32.module.web.JSCallbacks;

public class EspWebActivity extends AppCompatActivity {
    static final int REQUEST_PERMISSION_DEFAULT = 0x01;
    static final int REQUEST_PERMISSION_CAMERA = 0x02;
    static final int REQUEST_QRCODE = IntentIntegrator.REQUEST_CODE;

    public static final int REQUEST_WIFI = 0x03;
    public static final int REQUEST_BLUETOOTH = 0x04;
    public static final int REQUEST_LOCATION = 0x05;

    private MainHelper mMainHelper;
    private MainWebHelper mWebHelper;
    private MainBleNotifyThread mBleNotifyThread;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.esp_web_activity);

        mMainHelper = new MainHelper(this);
        getLifecycle().addObserver(mMainHelper);

        mWebHelper = new MainWebHelper(this);
        getLifecycle().addObserver(mWebHelper);

        getLifecycle().addObserver(new MainBroadcastReceiver(this));

        MainDeviceNotifier deviceNotifier = new MainDeviceNotifier(this);
        deviceNotifier.setListenSniffer(true);
        deviceNotifier.setListenStatus(true);
        deviceNotifier.setListenTopology(true);
        getLifecycle().addObserver(deviceNotifier);

        mBleNotifyThread = new MainBleNotifyThread();
        mBleNotifyThread.observeBleInfo(this, bleArray -> evaluateJavascript(JSCallbacks.onScanBLE(bleArray)));
        getLifecycle().addObserver(mBleNotifyThread);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        switch (requestCode) {
            case REQUEST_PERMISSION_DEFAULT:
            case REQUEST_PERMISSION_CAMERA:
                mMainHelper.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
            default:
                super.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case REQUEST_QRCODE:
            case REQUEST_WIFI:
            case REQUEST_LOCATION:
            case REQUEST_BLUETOOTH:
                mMainHelper.onActivityResult(requestCode, resultCode, data);
                return;
            default: {
                mWebHelper.onActivityResult(requestCode, resultCode, data);
                break;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        evaluateJavascript(JSCallbacks.onBackPressed());
    }

    public void evaluateJavascript(String script) {
        runOnUiThread(() -> mWebHelper.evaluateJavascript(script));
    }

    public void startBleScan(List<ScanFilter> filters, ScanSettings settings) {
        mBleNotifyThread.startBleScan(filters, settings);
    }

    public void stopBleScan() {
        mBleNotifyThread.stopBleScan();
    }

    public void loadFile(String file) {
        mWebHelper.loadFile(file);
    }

    public void newWebView(String url) {
        mWebHelper.newWebView(url);
    }

    public void requestCameraPermission() {
        mMainHelper.requestCameraPermission();
    }

    public boolean isLocationEnable() {
        return mMainHelper.isLocationEnable();
    }

    public boolean isOTAing() {
        return mWebHelper.isOTAing();
    }

    public void clearBle() {
        mBleNotifyThread.clearBle();
    }

    public void hideCoverImage() {
        mWebHelper.hideCoverImage();
    }

    public void registerPhoneStateChange() {
        mMainHelper.registerPhoneStateChange();
    }
}
