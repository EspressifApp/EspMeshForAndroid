package aliyun.espressif.mesh.task;

import android.bluetooth.BluetoothGatt;
import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.aliyun.alink.business.devicecenter.api.add.DeviceInfo;

import java.util.HashSet;
import java.util.Set;

import aliyun.espressif.mesh.IAliHelper;
import aliyun.espressif.mesh.callback.AliConfigureCallback;
import io.reactivex.Observable;
import iot.espressif.esp32.action.device.EspActionDeviceBlufi;
import iot.espressif.esp32.model.device.ble.IMeshBleDevice;
import iot.espressif.esp32.model.device.ble.MeshBlufiClient;
import iot.espressif.esp32.model.device.ble.MeshConfigureParams;
import iot.espressif.esp32.utils.DeviceUtil;
import libs.espressif.ble.EspBleUtils;
import meshblufi.espressif.response.BlufiStatusResponse;

public class AliDeviceConfigureTask extends EspActionDeviceBlufi implements IAliDeviceConfigureTask {
    private final IMeshBleDevice mMeshBleDevice;
    private final MeshConfigureParams mParams;

    private Context mContext;
    private final IAliHelper mAliHelper;

    private volatile MeshBlufiClient mMeshBlufiClient;

    private Set<String> mAllConfAddrs;

    public AliDeviceConfigureTask(Context context, @NonNull IAliHelper helper, @NonNull IMeshBleDevice meshDevice,
                                  @NonNull MeshConfigureParams params) {
        mMeshBleDevice = meshDevice;
        mParams = params;

        mContext = context.getApplicationContext();
        mAliHelper = helper;

        mAllConfAddrs = new HashSet<>();
        String staBssid = DeviceUtil.convertToColonBssid(meshDevice.getStaBssid()).toUpperCase();
        mAllConfAddrs.add(staBssid);
        mAllConfAddrs.addAll(params.getWhiteList());
    }

    @Override
    public synchronized void execute(AliConfigureCallback aliCB) {
        cancel();

        mMeshBlufiClient = new MeshBlufiClient();
        mMeshBlufiClient.setMeshVersion(mMeshBleDevice.getMeshVersion());

        BleCallback bleCallback = new BleCallback(mMeshBlufiClient, aliCB) {
            @Override
            protected void onBlufiClientSetComplete() {
                boolean setMtu = mMeshBlufiClient.getBluetoothGatt().requestMtu(DEFAULT_MTU_LENGTH);
                if (!setMtu) {
                    mMeshBlufiClient.getBlufiClient().negotiateSecurity();
                }
            }

            @Override
            public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
                super.onMtuChanged(gatt, mtu, status);
                mMeshBlufiClient.getBlufiClient().negotiateSecurity();
            }

            @Override
            protected void onNegotiateSecurityComplete() {
                mMeshBlufiClient.getBlufiClient().configure(mParams.convertToBlufiConfigureParams());
            }

            @Override
            protected void onReceiveWifiState(BlufiStatusResponse response) {
                if (response.isStaConnected()) {
                    mMeshBlufiClient.close();

                    discover(aliCB);
                }
            }
        };
        BluetoothGatt gatt = EspBleUtils.connectGatt(mMeshBleDevice.getDevice(), mContext, bleCallback);
        mMeshBlufiClient.setBluetoothGatt(gatt);
    }

    @Override
    public synchronized void cancel() {
        if (mMeshBlufiClient != null) {
            mMeshBlufiClient.close();
            mMeshBlufiClient = null;
        }
        mAliHelper.stopDiscovery();
    }

    private void discover(AliConfigureCallback aliCB) {
        Set<String> discoveredSet = new HashSet<>();
        mAliHelper.startDiscovery((discoveryType, list) -> {
            Log.d("AliConfTask", "Discovery");
            Observable.fromIterable(list)
                    .filter(deviceInfo -> {
                        if (deviceInfo.mac == null) {
                            return false;
                        }

                        String mac = deviceInfo.mac.toUpperCase();
                        if (!mAllConfAddrs.contains(mac)) {
                            return false;
                        }

                        discoveredSet.add(mac);
                        return true;
                    })
                    .doOnNext(deviceInfo -> {
                        boolean willBind = false;
                        if (deviceInfo.token != null && deviceInfo.token.length() > 2) {
                            char c0 = deviceInfo.token.charAt(0);
                            char c1 = deviceInfo.token.charAt(1);
                            if ((c0 == 'f' || c0 == 'F') && (c1 == 'f' || c1 == 'F')) {
                                willBind = true;
                            }
                        }
                        if (aliCB != null) {
                            aliCB.onDiscoveryDevice(deviceInfo, willBind);
                        }
                        if (willBind) {
                            bind(deviceInfo, aliCB);
                        }
                    })
                    .doOnNext(deviceInfo -> {
                        if (discoveredSet.size() == mAllConfAddrs.size()) {
                            mAliHelper.stopDiscovery();
                            if (aliCB != null) {
                                aliCB.onDiscoveryComplete();
                            }
                        }
                    })
                    .subscribe();
        });
    }

    private void bind(DeviceInfo deviceInfo, AliConfigureCallback aliCB) {
        mAliHelper.bindDevice(deviceInfo.productKey, deviceInfo.deviceName, deviceInfo.token,
                (code, iotId, exception) -> {
                    if (aliCB != null) {
                        aliCB.onBindDevice(deviceInfo, code == 200);
                    }
                });
    }
}
