package meshblufi.espressif;

import meshblufi.espressif.response.BlufiStatusResponse;

public abstract class BlufiCallback {
    public static final int STATUS_SUCCESS = 0;

    public static final int CODE_INVALID_NOTIFICATION = -1000;
    public static final int CODE_CATCH_EXCEPTION = -1001;
    public static final int CODE_WRITE_DATA_FAILED = -1002;
    public static final int CODE_INVALID_DATA = -1003;

    public static final int CODE_NEG_POST_FAILED = -2000;
    public static final int CODE_NEG_ERR_DEV_KEY = -2001;
    public static final int CODE_NEG_ERR_SECURITY = -2002;
    public static final int CODE_NEG_ERR_SET_SECURITY = -2003;

    public static final int CODE_CONF_INVALID_OPMODE = -3000;
    public static final int CODE_CONF_ERR_SET_OPMODE = -3001;
    public static final int CODE_CONF_ERR_POST_STA = -3002;
    public static final int CODE_CONF_ERR_POST_SOFTAP = -3003;

    /**
     * Callback the client close gatt.
     *
     * @param client blufi client
     */
    public void onGattClose(BlufiClient client) {
    }

    /**
     * Callback the client received notification from device
     * @param client blufi client
     * @param pkgType data package type
     * @param subType data subtype
     * @param data notification data
     */
    public void onNotification(BlufiClient client, int pkgType, int subType, byte[] data) {
    }

    /**
     * Callback the client negotiate security with devices
     *
     * @param client blufi client
     * @param status {@link #STATUS_SUCCESS} is successful.
     */
    public void onNegotiateSecurityResult(BlufiClient client, int status) {
    }

    /**
     * Callback the client post configure data result
     *
     * @param client blufi client
     * @param status {@link #STATUS_SUCCESS} means post data successfully.
     */
    public void onConfigureResult(BlufiClient client, int status) {
    }

    /**
     * Callback the device connect the AP
     *
     * @param client blufi client
     * @param response call {@link BlufiStatusResponse#isStaConnected()} to check result
     */
    public void onWifiStateResponse(BlufiClient client, BlufiStatusResponse response) {
    }

    public void onSendMDFCustomData(BlufiClient client, byte[] data, int status) {
    }

    /**
     * Callback the device send custom data to APP
     *
     * @param client blufi client
     * @param data custom data
     */
    public void onReceivedCustomData(BlufiClient client, byte[] data) {
    }

    /**
     * Callback the error occur
     *
     * @param client blufi client
     * @param errCode error code
     */
    public void onError(BlufiClient client, int errCode) {
    }
}
