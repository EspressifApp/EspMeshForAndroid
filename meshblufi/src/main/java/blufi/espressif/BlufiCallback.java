package blufi.espressif;

import android.bluetooth.BluetoothGatt;

import blufi.espressif.response.BlufiStatusResponse;

public abstract class BlufiCallback {
    public static final int STATUS_SUCCESS = 0;

    public static final int STATUS_ERR_WRITE = -10;
    public static final int STATUS_ERR_DEV_PBK = -11;
    public static final int STATUS_ERR_ENCRYPT = -12;

    public static final int STATUS_ERR_OP_CODE = -100;

    public void onGattClose(BlufiClient client) {
    }

    public void onNotification(BlufiClient client, int pkgType, int subType, byte[] data) {
    }

    public void onNegotiateSecurityResult(BlufiClient client, int status) {
    }

    public void onConfigureResult(BlufiClient client, int status) {
    }

    public void onWifiStateResponse(BlufiClient client, BlufiStatusResponse response) {
    }

    public void onError(BlufiClient client, int errCode) {
    }
}
