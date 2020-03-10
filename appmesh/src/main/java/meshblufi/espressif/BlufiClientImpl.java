package meshblufi.espressif;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.NonNull;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigInteger;
import java.util.Collection;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import javax.crypto.interfaces.DHPublicKey;

import meshblufi.espressif.params.BlufiConfigureParams;
import meshblufi.espressif.params.BlufiParameter;
import meshblufi.espressif.response.BlufiStatusResponse;
import meshblufi.espressif.security.BlufiAES;
import meshblufi.espressif.security.BlufiCRC;
import meshblufi.espressif.security.BlufiDH;
import meshblufi.espressif.security.BlufiMD5;
import meshblufi.espressif.security.BlufiRSA;

class BlufiClientImpl implements BlufiParameter {
    private static final String TAG = BlufiClientImpl.class.getSimpleName();

    private static final int DEFAULT_PACKAGE_LENGTH = 80;
    private static final int PACKAGE_HEADER_LENGTH = 4;
    private static final int MIN_PACKAGE_LENGTH = 6;

    private static final int DIRECTION_OUTPUT = 0;
    private static final int DIRECTION_INPUT = 1;

    private static final String DH_P = "cf5cf5c38419a724957ff5dd323b9c45c3cdd261eb740f69aa94b8bb1a5c9640" +
            "9153bd76b24222d03274e4725a5406092e9e82e9135c643cae98132b0d95f7d6" +
            "5347c68afc1e677da90e51bbab5f5cf429c291b4ba39c6b2dc5e8c7231e46aa7" +
            "728e87664532cdf547be20c9a3fa8342be6e34371a27c06f7dc0edddd2f86373";
    private static final String DH_G = "2";
    private static final String AES_TRANSFORMATION = "AES/CFB/NoPadding";
    private static final byte[] AES_BASE_IV = {
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
    };

    private BlufiClient mClient;

    private BluetoothGatt mGatt;
    private BluetoothGattCharacteristic mWriteChar;
    private final Object mWriteLock;
    private BluetoothGattCharacteristic mNotifyChar;
    private BluetoothDevice mDevice;

    private volatile BlufiCallback mUserCallback;

    private int mPackageLengthLimit;

    private int mDeviceVersion = -1;

    private AtomicInteger mSendSequence;
    private AtomicInteger mReadSequence;
    private LinkedBlockingQueue<Integer> mAck;

    private volatile BlufiNotiyData mNotiyData;

    private byte[] mSecretKey;

    private boolean mEncrypted = false;
    private boolean mChecksum = false;

    private boolean mRequireAck = false;

    private SecurityCallback mSecurityCallback;
    private LinkedBlockingQueue<byte[]> mDevicePublicKeyQueue;

    private ExecutorService mThreadPool;
    private Handler mUIHandler;

    private final Object mCloseLock = new Object();

    BlufiClientImpl(BlufiClient client, BluetoothGatt gatt, BluetoothGattCharacteristic writeCharact,
                    BluetoothGattCharacteristic notiCharact, BlufiCallback callback) {
        mClient = client;
        mGatt = gatt;
        mDevice = gatt.getDevice();
        mWriteChar = writeCharact;
        mNotifyChar = notiCharact;
        mUserCallback = callback;

        mPackageLengthLimit = DEFAULT_PACKAGE_LENGTH;
        mSendSequence = new AtomicInteger(-1);
        mReadSequence = new AtomicInteger(-1);
        mAck = new LinkedBlockingQueue<>();

        mSecurityCallback = new SecurityCallback();
        mDevicePublicKeyQueue = new LinkedBlockingQueue<>();

        mThreadPool = Executors.newSingleThreadExecutor();
        mUIHandler = new Handler(Looper.getMainLooper());

        mWriteLock = new Object();
    }

    BluetoothDevice getDevice() {
        return mDevice;
    }

    void setPostPackageLengthLimit(int lengthLimit) {
        mPackageLengthLimit = lengthLimit;
        if (mPackageLengthLimit < MIN_PACKAGE_LENGTH) {
            mPackageLengthLimit = MIN_PACKAGE_LENGTH;
        }
    }

    void setDeviceVersion(int version) {
        mDeviceVersion = version;
    }

    void close() {
        synchronized (mCloseLock) {
            if (mThreadPool != null) {
                mThreadPool.shutdown();
                mThreadPool = null;
            }
            if (mGatt != null) {
                mGatt.close();
                mGatt = null;
            }
            mNotifyChar = null;
            mWriteChar = null;
            if (mAck != null) {
                mAck.clear();
                mAck = null;
            }
            mClient = null;
            mUserCallback = null;
            synchronized (mWriteLock) {
                mWriteLock.notifyAll();
            }
        }
    }

    private byte[] hexToBytes(String string) {
        if (string.length() % 2 != 0) {
            string = "0" + string;
        }
        byte[] result = new byte[string.length() / 2];
        for (int i = 0; i < string.length(); i += 2) {
            result[i / 2] = (byte) Integer.parseInt(string.substring(i, i + 2), 16);
        }
        return result;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            int number = b & 0xff;
            String str = Integer.toHexString(number);
            if (str.length() == 1) {
                sb.append("0");
            }
            sb.append(str);
        }
        return sb.toString();
    }

    void negotiateSecurity() {
        mThreadPool.submit(() -> {
            try {
                __negotiateSecurity();
            } catch (Exception e) {
                e.printStackTrace();
                onNegotiateSecurityResult(BlufiCallback.CODE_CATCH_EXCEPTION);
            }
        });
    }

    void configure(final BlufiConfigureParams params) {
        mThreadPool.submit(() -> {
            try {
                __configure(params);
            } catch (Exception e) {
                e.printStackTrace();
                onConfigureResult(BlufiCallback.CODE_CATCH_EXCEPTION);
            }
        });
    }

    void sendMDFCustomData(final byte[] data) {
        mThreadPool.submit(() -> {
            boolean send = __sendMDFCustomData(data);
            int status = send ? BlufiCallback.STATUS_SUCCESS : BlufiCallback.CODE_WRITE_DATA_FAILED;
            if (mUserCallback != null) {
                mUIHandler.post(() -> {
                    mUserCallback.onSendMDFCustomData(mClient, data, status);
                });
            }
        });
    }

    void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        if (characteristic != mNotifyChar) {
            return;
        }

        if (mNotiyData == null) {
            mNotiyData = new BlufiNotiyData();
        }

        byte[] data = characteristic.getValue();
        // lt 0 is error, eq 0 is complete, gt 0 is continue
        int parse = parseNotification(data, mNotiyData);
        if (parse < 0) {
            mUserCallback.onError(mClient, BlufiCallback.CODE_INVALID_NOTIFICATION);
        } else if (parse == 0) {
            parseBlufiNotiData(mNotiyData);
            mNotiyData = null;
        }
    }

    void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
        if (characteristic != mWriteChar) {
            return;
        }

        synchronized (mWriteLock) {
            mWriteLock.notifyAll();
        }
    }

    private int toInt(byte b) {
        return b & 0xff;
    }

    private int getTypeValue(int type, int subtype) {
        return (subtype << 2) | type;
    }

    private int getPackageType(int typeValue) {
        return typeValue & 0x3;
    }

    private int getSubType(int typeValue) {
        return ((typeValue & 0xfc) >> 2);
    }

    private int getFrameCTRLValue(boolean encrypted, boolean checksum, int direction, boolean requireAck, boolean frag) {
        int frame = 0;
        if (encrypted) {
            frame |= (1 << FRAME_CTRL_POSITION_ENCRYPTED);
        }
        if (checksum) {
            frame |= (1 << FRAME_CTRL_POSITION_CHECKSUM);
        }
        if (direction == DIRECTION_INPUT) {
            frame |= (1 << FRAME_CTRL_POSITION_DATA_DIRECTION);
        }
        if (requireAck) {
            frame |= (1 << FRAME_CTRL_POSITION_REQUIRE_ACK);
        }
        if (frag) {
            frame |= (1 << FRAME_CTRL_POSITION_FRAG);
        }

        return frame;
    }

    private int generateSendSequence() {
        return mSendSequence.incrementAndGet() & 0xff;
    }

    private byte[] generateAESIV(int sequence) {
        byte[] result = new byte[16];
        for (int i = 0; i < result.length; ++i) {
            if (i == 0) {
                result[0] = (byte) sequence;
            } else {
                result[i] = AES_BASE_IV[i];
            }
        }

        return result;
    }

    private synchronized void gattWrite(byte[] data) throws InterruptedException {
        if (mGatt == null) {
            return;
        }
        synchronized (mWriteLock) {
            mWriteChar.setValue(data);
            mGatt.writeCharacteristic(mWriteChar);

            mWriteLock.wait();
        }
    }

    private boolean receiveAck(int sequence) {
        try {
            int ack = mAck.take();
            return ack == sequence;
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private boolean post(boolean encrypt, boolean checksum, boolean requireAck, int type, byte[] data)
            throws InterruptedException {
        if (data == null || data.length == 0) {
            return postNonData(encrypt, checksum, requireAck, type);
        } else {
            return postContainData(encrypt, checksum, requireAck, type, data);
        }
    }

    private boolean postNonData(boolean encrypt, boolean checksum, boolean requireAck, int type)
            throws InterruptedException {
        int frameCtrl = getFrameCTRLValue(encrypt, checksum, DIRECTION_OUTPUT, requireAck, false);
        int sequence = generateSendSequence();
        int dataLen = 0;

        byte[] postBytes = getPostBytes(type, frameCtrl, sequence, dataLen, null);
        gattWrite(postBytes);

        return !requireAck || receiveAck(sequence);
    }

    private boolean postContainData(boolean encrypt, boolean checksum, boolean requireAck, int type, byte[] data)
            throws InterruptedException {
        ByteArrayInputStream dataIS = new ByteArrayInputStream(data);

        ByteArrayOutputStream postOS = new ByteArrayOutputStream();

        for (int b = dataIS.read(); b != -1; b = dataIS.read()) {
            postOS.write(b);
            int postDataLengthLimit = mPackageLengthLimit - PACKAGE_HEADER_LENGTH;
            if (checksum) {
                postDataLengthLimit -= 2;
            }
            if (postOS.size() >= postDataLengthLimit) {
                boolean frag = dataIS.available() > 0;
                if (frag) {
                    int frameCtrl = getFrameCTRLValue(encrypt, checksum, DIRECTION_OUTPUT, requireAck, true);
                    int sequence = generateSendSequence();
                    int totleLen = postOS.size() + dataIS.available();
                    byte totleLen1 = (byte) (totleLen & 0xff);
                    byte totleLen2 = (byte) ((totleLen >> 8) & 0xff);
                    byte[] tempData = postOS.toByteArray();
                    postOS.reset();
                    postOS.write(totleLen1);
                    postOS.write(totleLen2);
                    postOS.write(tempData, 0, tempData.length);
                    int posDatatLen = postOS.size();

                    byte[] postBytes = getPostBytes(type, frameCtrl, sequence, posDatatLen, postOS.toByteArray());
                    gattWrite(postBytes);
                    postOS.reset();
                    if (requireAck && !receiveAck(sequence)) {
                        return false;
                    }

                    sleep(10L);
                }
            }
        }

        if (postOS.size() > 0) {
            int frameCtrl = getFrameCTRLValue(encrypt, checksum, DIRECTION_OUTPUT, requireAck, false);
            int sequence = generateSendSequence();
            int postDataLen = postOS.size();

            byte[] postBytes = getPostBytes(type, frameCtrl, sequence, postDataLen, postOS.toByteArray());
            gattWrite(postBytes);
            postOS.reset();

            return !requireAck || receiveAck(sequence);
        }

        return true;
    }

    private byte[] getPostBytes(int type, int frameCtrl, int sequence, int dataLength, byte[] data) {
        ByteArrayOutputStream byteOS = new ByteArrayOutputStream();
        byteOS.write(type);
        byteOS.write(frameCtrl);
        byteOS.write(sequence);
        byteOS.write(dataLength);

        BlufiParameter.FrameCtrlData frameCtrlData = new BlufiParameter.FrameCtrlData(frameCtrl);
        byte[] checksumBytes = null;
        if (frameCtrlData.isChecksum()) {
            byte[] willCheckBytes = new byte[]{(byte) sequence, (byte) dataLength};
            if (data != null && data.length > 0) {
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                os.write(willCheckBytes, 0, willCheckBytes.length);
                os.write(data, 0, data.length);
                willCheckBytes = os.toByteArray();
            }
            int checksum = BlufiCRC.calcCRC16(0, willCheckBytes);
            byte checksumByte1 = (byte) (checksum & 0xff);
            byte checksumByte2 = (byte) ((checksum >> 8) & 0xff);
            checksumBytes = new byte[]{checksumByte1, checksumByte2};
        }

        if (frameCtrlData.isEncrypted() && data != null) {
            BlufiAES espAES = new BlufiAES(mSecretKey, AES_TRANSFORMATION, generateAESIV(sequence));
            data = espAES.encrypt(data);
        }
        if (data != null) {
            byteOS.write(data, 0, data.length);
        }

        if (checksumBytes != null) {
            byteOS.write(checksumBytes[0]);
            byteOS.write(checksumBytes[1]);
        }

        return byteOS.toByteArray();
    }

    private int parseNotification(byte[] response, BlufiNotiyData notification) {
        if (response == null) {
            Log.w(TAG, "parseNotification null data");
            return -1;
        }

        if (response.length < 4) {
            Log.w(TAG, "parseNotification data length less than 4");
            return -2;
        }

        int sequence = toInt(response[2]);
        int expectSeq = mReadSequence.incrementAndGet() & 0xff;
        if (sequence != expectSeq) {
            Log.w(TAG, "parseNotification read sequence wrong");
            return -3;
        }

        int type = toInt(response[0]);
        int pkgType = getPackageType(type);
        int subType = getSubType(type);
        notification.setType(type);
        notification.setPkgType(pkgType);
        notification.setSubType(subType);

        int frameCtrl = toInt(response[1]);
        notification.setFrameCtrl(frameCtrl);
        BlufiParameter.FrameCtrlData frameCtrlData = new BlufiParameter.FrameCtrlData(frameCtrl);

        int dataLen = toInt(response[3]);
        byte[] dataBytes = new byte[dataLen];
        int dataOffset = 4;
        try {
            System.arraycopy(response, dataOffset, dataBytes, 0, dataLen);
        } catch (Exception e) {
            e.printStackTrace();
            return -100;
        }

        if (frameCtrlData.isEncrypted()) {
            BlufiAES espAES = new BlufiAES(mSecretKey, AES_TRANSFORMATION, generateAESIV(sequence));
            dataBytes = espAES.decrypt(dataBytes);
        }

        if (frameCtrlData.isChecksum()) {
            int respChecksum1 = toInt(response[response.length - 1]);
            int respChecksum2 = toInt(response[response.length - 2]);

            ByteArrayOutputStream checkByteOS = new ByteArrayOutputStream();
            checkByteOS.write(sequence);
            checkByteOS.write(dataLen);
            for (byte b : dataBytes) {
                checkByteOS.write(b);
            }
            int checksum = BlufiCRC.calcCRC16(0, checkByteOS.toByteArray());

            int calcChecksum1 = (checksum >> 8) & 0xff;
            int calcChecksum2 = checksum & 0xff;
            if (respChecksum1 != calcChecksum1 || respChecksum2 != calcChecksum2) {
                return -4;
            }
        }

        if (frameCtrlData.hasFrag()) {
            int totleLen = dataBytes[0] | (dataBytes[1] << 8);
            dataOffset = 2;
        } else {
            dataOffset = 0;
        }
        for (int i = dataOffset; i < dataBytes.length; ++i) {
            notification.addData(dataBytes[i]);
        }

        return frameCtrlData.hasFrag() ? 1 : 0;
    }

    private void parseBlufiNotiData(BlufiNotiyData data) {
        int pkgType = data.getPkgType();
        int subType = data.getSubType();
        switch (pkgType) {
            case Type.Ctrl.PACKAGE_VALUE:
                parseCtrlData(subType, data.getDataArray());
                break;
            case Type.Data.PACKAGE_VALUE:
                parseDataData(subType, data.getDataArray());
                break;
            default:
                if (mUserCallback != null) {
                    mUserCallback.onNotification(mClient, pkgType, subType, data.getDataArray());
                }
                break;
        }
    }

    private void parseCtrlData(int subType, byte[] data) {
        switch (subType) {
            case Type.Ctrl.SUBTYPE_ACK:
                parseAck(data);
                break;
        }
    }

    private void parseDataData(int subType, byte[] data) {
        switch (subType) {
            case Type.Data.SUBTYPE_NEG:
                mSecurityCallback.onReceiveDevicePublicKey(data);
                break;
            case Type.Data.SUBTYPE_WIFI_CONNECTION_STATE:
                parseWifiState(data);
                break;
            case Type.Data.SUBTYPE_CUSTOM_DATA:
                onReceivedCustomData(data);
                break;
            case Type.Data.SUBTYPE_ERROR:
                int errCode = data.length > 0 ? (data[0] & 0xff) : 0xff;
                onError(errCode);
                break;
        }
    }

    private void parseAck(byte[] data) {
        int ack = -1;
        if (data.length > 0) {
            ack = data[0] & 0xff;
        }

        mAck.add(ack);
    }

    private void onError(final int errCode) {
        Log.w(TAG, "onError " + errCode);
        if (mUserCallback == null) {
            return;
        }
        mUIHandler.post(() -> {
            if (mUserCallback != null) {
                mUserCallback.onError(mClient, errCode);
            }
        });
    }

    private void parseWifiState(byte[] data) {
        if (data.length < 3) {
            return;
        }

        BlufiStatusResponse response = new BlufiStatusResponse();

        ByteArrayInputStream dataIS = new ByteArrayInputStream(data);

        int opMode = dataIS.read() & 0xff;
        response.setOpMode(opMode);
        switch (opMode) {
            case OP_MODE_NULL:
                break;
            case OP_MODE_STA:
                break;
            case OP_MODE_SOFTAP:
                break;
            case OP_MODE_STASOFTAP:
                break;
        }

        int staConn = dataIS.read() & 0xff;
        response.setStaConnectionStatus(staConn);

        int softAPConn = dataIS.read() & 0xff;
        response.setSoftAPConnectionCount(softAPConn);

        while (dataIS.available() > 0) {
            int infotype = dataIS.read() & 0xff;
            int len = dataIS.read() & 0xff;
            byte[] stateBytes = new byte[len];
            for (int i = 0; i < len; ++i) {
                stateBytes[i] = (byte) dataIS.read();
            }

            parseWifiStateData(response, infotype, stateBytes);
        }
        response.setResultCode(BlufiStatusResponse.RESULT_SUCCESS);

        onWifiStateResponse(response);
    }

    private void parseWifiStateData(BlufiStatusResponse response, int infoType, byte[] data) {
        switch (infoType) {
            case BlufiParameter.Type.Data.SUBTYPE_SOFTAP_AUTH_MODE:
                int authMode = toInt(data[0]);
                response.setSoftAPSecrity(authMode);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_SOFTAP_CHANNEL:
                int softAPChannel = toInt(data[0]);
                response.setSoftAPChannel(softAPChannel);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_SOFTAP_MAX_CONNECTION_COUNT:
                int softAPMaxConnCount = toInt(data[0]);
                response.setSoftAPMaxConnectionCount(softAPMaxConnCount);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_SOFTAP_WIFI_PASSWORD:
                String softapPassword = new String(data);
                response.setSoftAPPassword(softapPassword);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_SOFTAP_WIFI_SSID:
                String softapSSID = new String(data);
                response.setSoftAPSSID(softapSSID);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_STA_WIFI_BSSID:
                String staBssid = bytesToHex(data);
                response.setStaBSSID(staBssid);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_STA_WIFI_SSID:
                String staSsid = new String(data);
                response.setStaSSID(staSsid);
                break;
            case BlufiParameter.Type.Data.SUBTYPE_STA_WIFI_PASSWORD:
                String staPassword = new String(data);
                response.setStaPassword(staPassword);
                break;
        }
    }

    private void onWifiStateResponse(final BlufiStatusResponse response) {
        if (mUserCallback == null) {
            return;
        }
        mUIHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mUserCallback != null) {
                    mUserCallback.onWifiStateResponse(mClient, response);
                }
            }
        });
    }

    private void __negotiateSecurity() {
        if (mDeviceVersion < 0) {
            negotiateSecurityDefault();
        } else {
            negotiateSecurityRSA();
        }
    }

    private void onNegotiateSecurityResult(final int status) {
        if (mUserCallback == null) {
            return;
        }
        mUIHandler.post(() -> {
            if (mUserCallback != null) {
                mUserCallback.onNegotiateSecurityResult(mClient, status);
            }
        });
    }

    private void negotiateSecurityDefault() {
        BlufiDH espDH = negSecDefPostNegotiateSecurity();
        if (espDH == null) {
            Log.w(TAG, "negotiateSecurity negSecDefPostNegotiateSecurity failed");
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_POST_FAILED);
            return;
        }

        byte[] devicePublicKey;
        try {
            devicePublicKey = mDevicePublicKeyQueue.take();
            if (devicePublicKey.length == 0) {
                onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_DEV_KEY);
                return;
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return;
        }

        String devKeyStr = bytesToHex(devicePublicKey);
        BigInteger devPbKeyBI = new BigInteger(devKeyStr, 16);
        espDH.generateSecretKey(devPbKeyBI);
        if (espDH.getSecretKey() == null) {
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_SECURITY);
            return;
        }
        mSecretKey = BlufiMD5.getMD5Byte(espDH.getSecretKey());

        mEncrypted = true;
        mChecksum = true;
        boolean setSecurity = postSetSecurity(false, false, mEncrypted, mChecksum);
        if (setSecurity) {
            onNegotiateSecurityResult(BlufiCallback.STATUS_SUCCESS);
        } else {
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_SET_SECURITY);
        }
    }

    private BlufiDH negSecDefPostNegotiateSecurity() {
        int type = getTypeValue(BlufiParameter.Type.Data.PACKAGE_VALUE, BlufiParameter.Type.Data.SUBTYPE_NEG);

        final int radix = 16;
        final int dhLength = 1024;
        final BigInteger dhP = new BigInteger(DH_P, radix);
        final BigInteger dhG = new BigInteger(DH_G);
        BlufiDH espDH;
        String p;
        String g;
        String k;
        do {
            espDH = new BlufiDH(dhP, dhG, dhLength);
            p = espDH.getP().toString(radix);
            g = espDH.getG().toString(radix);
            k = negSecDefGetPublicValue(espDH);
        } while (k == null);

        byte[] pBytes = hexToBytes(p);
        byte[] gBytes = hexToBytes(g);
        byte[] kBytes = hexToBytes(k);

        ByteArrayOutputStream dataOS = new ByteArrayOutputStream();

        int pgkLength = pBytes.length + gBytes.length + kBytes.length + 6;
        int pgkLen1 = (pgkLength >> 8) & 0xff;
        int pgkLen2 = pgkLength & 0xff;
        dataOS.write(NEG_SET_SEC_TOTAL_LEN);
        dataOS.write((byte) pgkLen1);
        dataOS.write((byte) pgkLen2);
        try {
            boolean postLength = post(false, false, mRequireAck, type, dataOS.toByteArray());
            if (!postLength) {
                return null;
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return null;
        }

        sleep(10);

        dataOS.reset();
        dataOS.write(NEG_SET_SEC_ALL_DATA);

        int pLength = pBytes.length;
        int pLen1 = (pLength >> 8) & 0xff;
        int pLen2 = pLength & 0xff;
        dataOS.write(pLen1);
        dataOS.write(pLen2);
        dataOS.write(pBytes, 0, pLength);

        int gLength = gBytes.length;
        int gLen1 = (gLength >> 8) & 0xff;
        int gLen2 = gLength & 0xff;
        dataOS.write(gLen1);
        dataOS.write(gLen2);
        dataOS.write(gBytes, 0, gLength);

        int kLength = kBytes.length;
        int kLen1 = (kLength >> 8) & 0xff;
        int kLen2 = kLength & 0xff;
        dataOS.write(kLen1);
        dataOS.write(kLen2);
        dataOS.write(kBytes, 0, kLength);

        try {
            boolean postPGK = post(false, false, mRequireAck, type, dataOS.toByteArray());
            if (!postPGK) {
                return null;
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return null;
        }

        return espDH;
    }

    private String negSecDefGetPublicValue(BlufiDH espDH) {
        DHPublicKey publicKey = espDH.getPublicKey();
        if (publicKey != null) {
            BigInteger y = publicKey.getY();
            StringBuilder keySB = new StringBuilder(y.toString(16));
            while (keySB.length() < 256) {
                keySB.insert(0, "0");
            }
            return keySB.toString();
        }

        return null;
    }

    private void negotiateSecurityRSA() {
        boolean requestDevPB = negSecRsaRequestDevicePublicKey();
        if (!requestDevPB) {
            Log.w(TAG, "negSecRsaRequestDevicePublicKey failed");
            onNegotiateSecurityResult(BlufiCallback.CODE_WRITE_DATA_FAILED);
            return;
        }

        byte[] deviceFullPublicKey;
        try {
            deviceFullPublicKey = mDevicePublicKeyQueue.take();
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return;
        }
        Log.d(TAG, "Get RSA device public key length " + deviceFullPublicKey.length);
        if (deviceFullPublicKey.length == 0) {
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_DEV_KEY);
            return;
        }

        byte[] devicePublicKey = new byte[220];
        System.arraycopy(deviceFullPublicKey, 27, devicePublicKey, 0, 220);
        devicePublicKey = Base64.decode(devicePublicKey, Base64.DEFAULT);

        byte[] randomBytes = new byte[32];
        new Random().nextBytes(randomBytes);
        byte[] privateKey = BlufiMD5.getMD5Byte(randomBytes);
        byte[] enPrivateKey = BlufiRSA.encryptWithPublicKey(devicePublicKey, privateKey);
        if (enPrivateKey == null) {
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_SECURITY);
            return;
        }

        boolean postPrivateKey = negSecRsaPostAppPrivateKey(enPrivateKey);
        if (!postPrivateKey) {
            Log.w(TAG, "Post app private key failed");
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_POST_FAILED);
            return;
        }

        mSecretKey = privateKey;

        mEncrypted = true;
        mChecksum = true;
        boolean setSecurity = postSetSecurity(false, false, mEncrypted, mChecksum);
        if (setSecurity) {
            onNegotiateSecurityResult(BlufiCallback.STATUS_SUCCESS);
        } else {
            onNegotiateSecurityResult(BlufiCallback.CODE_NEG_ERR_SET_SECURITY);
        }
    }

    private boolean negSecRsaRequestDevicePublicKey() {
        int type = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_NEG);
        byte[] postData = {BlufiParameter.NEG_RQST_RSA_PUBLIC_KEY};
        try {
            return post(false, false, mRequireAck, type, postData);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private boolean negSecRsaPostAppPrivateKey(byte[] privateKey) {
        int type = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_NEG);
        ByteArrayOutputStream postDataOS = new ByteArrayOutputStream();
        postDataOS.write(BlufiParameter.NEG_SET_RSA_PRIVATE_KEY);
        postDataOS.write(privateKey, 0, privateKey.length);

        try {
            return post(false, false, mRequireAck, type, postDataOS.toByteArray());
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private boolean postSetSecurity(boolean ctrlEncrypted, boolean ctrlChecksum, boolean dataEncrypted, boolean dataChecksum) {
        int type = getTypeValue(Type.Ctrl.PACKAGE_VALUE, Type.Ctrl.SUBTYPE_SET_SEC_MODE);
        int data = 0;
        if (dataChecksum) {
            data = data | 1;
        }
        if (dataEncrypted) {
            data = data | (1 << 1);
        }
        if (ctrlChecksum) {
            data = data | (1 << 4);
        }
        if (ctrlEncrypted) {
            data = data | (1 << 5);
        }

        byte[] postData = {(byte) data};

        try {
            return post(false, false, mRequireAck, type, postData);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private class SecurityCallback {
        void onReceiveDevicePublicKey(byte[] keyData) {
            try {
                mDevicePublicKeyQueue.add(keyData);
            } catch (NumberFormatException e) {
                e.printStackTrace();
                mDevicePublicKeyQueue.add(new byte[0]);
            }
        }
    }

    private void __configure(BlufiConfigureParams params) {
        int opMode = params.getOpMode();
        if (opMode != OP_MODE_STA) {
            onConfigureResult(BlufiCallback.CODE_CONF_INVALID_OPMODE);
            return;
        }

        boolean setMode = postDeviceMode(opMode);
        if (!setMode) {
            onConfigureResult(BlufiCallback.CODE_CONF_ERR_SET_OPMODE);
            return;
        }

        boolean configureSta = mDeviceVersion < 0 ? postStaWifiInfoDef(params) : postStaWifiInfoRsa(params);
        if (!configureSta) {
            onConfigureResult(BlufiCallback.CODE_CONF_ERR_POST_STA);
        } else {
            onConfigureResult(BlufiCallback.STATUS_SUCCESS);
        }
    }

    private void onConfigureResult(final int status) {
        if (mUserCallback == null) {
            return;
        }
        mUIHandler.post(() -> {
            if (mUserCallback != null) {
                mUserCallback.onConfigureResult(mClient, status);
            }
        });
    }

    private boolean postDeviceMode(int deviceMode) {
        int type = getTypeValue(BlufiParameter.Type.Ctrl.PACKAGE_VALUE, BlufiParameter.Type.Ctrl.SUBTYPE_SET_OP_MODE);
        byte[] data = {(byte) deviceMode};

        try {
            return post(mEncrypted, mChecksum, true, type, data);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private byte[] getWhiteListData(@NonNull Collection<String> whiteList, int type) {
        ByteArrayOutputStream whiteListOS = new ByteArrayOutputStream();
        StringBuilder whiteSB = null;
        int index = 0;
        int count = 0;
        for (String addr : whiteList) {
            if (whiteSB == null) {
                whiteSB = new StringBuilder();
            }
            whiteSB.append(addr).append(':');

            if (index == whiteList.size() - 1 || count == 41) {
                if (whiteSB.charAt(whiteSB.length() - 1) == ':') {
                    whiteSB.deleteCharAt(whiteSB.length() - 1);
                }
                byte[] whiteValue = convertAddressStringToByteArray(whiteSB.toString());
                whiteListOS.write(type);
                whiteListOS.write(whiteValue.length);
                whiteListOS.write(whiteValue, 0, whiteValue.length);

                count = 0;
                whiteSB = null;
            } else {
                count++;
            }

            index++;
        }

        return whiteListOS.toByteArray();
    }

    private boolean postStaWifiInfoDef(BlufiConfigureParams params) {
        int typeValue = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_USERNAME);
        ByteArrayOutputStream postData = new ByteArrayOutputStream();

        byte[] ssidData = params.getStaSSID().getBytes();
        postData.write(1);
        postData.write(ssidData.length);
        postData.write(ssidData, 0, ssidData.length);

        if (!TextUtils.isEmpty(params.getStaPassword())) {
            byte[] pwdData = params.getStaPassword().getBytes();
            postData.write(2);
            postData.write(pwdData.length);
            postData.write(pwdData, 0, pwdData.length);
        }

        byte[] meshIdData = params.getMeshID();
        if (meshIdData != null) {
            postData.write(3);
            postData.write(meshIdData.length);
            postData.write(meshIdData, 0, meshIdData.length);
        }

        Collection<String> whiteList = params.getWhiteList();
        if (whiteList != null && !whiteList.isEmpty()) {
            byte[] whiteListData = getWhiteListData(whiteList, 5);
            postData.write(whiteListData, 0, whiteListData.length);
        }

        try {
            return post(mEncrypted, mChecksum, true, typeValue, postData.toByteArray());
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private boolean postStaWifiInfoRsa(BlufiConfigureParams params) {
        int typeValue = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_CUSTOM_DATA);

        ByteArrayOutputStream postData = new ByteArrayOutputStream();

        byte[] ssidData = params.getStaSSID().getBytes();
        postData.write(MeshData.BLUFI_DATA_ROUTER_SSID);
        postData.write(ssidData.length);
        postData.write(ssidData, 0, ssidData.length);

        if (!TextUtils.isEmpty(params.getStaPassword())) {
            byte[] pwdData = params.getStaPassword().getBytes();
            postData.write(MeshData.BLUFI_DATA_ROUTER_PASSWD);
            postData.write(pwdData.length);
            postData.write(pwdData, 0, pwdData.length);
        }

        if (!TextUtils.isEmpty(params.getStaBSSID())) {
            byte[] bssidData = convertAddressStringToByteArray(params.getStaBSSID());
            postData.write(MeshData.BLUFI_DATA_ROUTER_BSSID);
            postData.write(bssidData.length);
            postData.write(bssidData, 0, bssidData.length);
        }

        byte[] meshIdData = params.getMeshID();
        if (meshIdData != null) {
            postData.write(MeshData.BLUFI_DATA_MESH_ID);
            postData.write(meshIdData.length);
            postData.write(meshIdData, 0, meshIdData.length);
        }

        if (!TextUtils.isEmpty(params.getMeshPassword())) {
            byte[] meshPwdData = params.getMeshPassword().getBytes();
            postData.write(MeshData.BLUFI_DATA_MESH_PASSWORD);
            postData.write(meshPwdData.length);
            postData.write(meshPwdData, 0, meshPwdData.length);
        }

        if (params.getMeshType() >= 0) {
            postData.write(MeshData.BLUFI_DATA_MESH_TYPE);
            postData.write(1);
            postData.write(params.getMeshType());
        }

        Collection<String> whiteList = params.getWhiteList();
        if (whiteList != null && !whiteList.isEmpty()) {
            byte[] whiteListData = getWhiteListData(whiteList, MeshData.BLUFI_DATA_WHITELIST);
            postData.write(whiteListData, 0, whiteListData.length);
        }

        byte[] customData = params.getCustomData();
        if (customData != null && customData.length > 0) {
            postData.write(MeshData.BLUFI_DATA_CUSTOM);
            postData.write(customData.length);
            postData.write(customData, 0, customData.length);
        }

        if (params.getVotePercentage() >= 0) {
            postData.write(MeshData.BLUFI_DATA_VOTE_PERCENTAGE);
            postData.write(1);
            postData.write(params.getVotePercentage());
        }

        if (params.getVoteMaxCount() >= 0) {
            postData.write(MeshData.BLUFI_DATA_VOTE_MAX_COUNT);
            postData.write(1);
            postData.write(params.getVoteMaxCount());
        }

        if (params.getBackoffRssi() <= 0) {
            postData.write(MeshData.BLUFI_DATA_BACKOFF_RSSI);
            postData.write(1);
            postData.write(params.getBackoffRssi());
        }

        if (params.getScanMinCount() >= 0) {
            postData.write(MeshData.BLUFI_DATA_SCAN_MIN_COUNT);
            postData.write(1);
            postData.write(params.getScanMinCount());
        }

        if (params.getScanFailCount() >= 0) {
            postData.write(MeshData.BLUFI_DATA_SCAN_FAIL_COUNT);
            postData.write(1);
            postData.write(params.getScanFailCount());
        }

        if (params.getMonitorIeCount() >= 0) {
            postData.write(MeshData.BLUFI_DATA_MONITOR_IE_COUNT);
            postData.write(1);
            postData.write(params.getMonitorIeCount());
        }

        if (params.getRootHealingMS() >= 0) {
            int ms = params.getRootHealingMS();
            postData.write(MeshData.BLUFI_DATA_ROOT_HEALING_MS);
            postData.write(2);
            postData.write(ms & 0xff);
            postData.write((ms >> 8) & 0xff);
        }

        if (params.isRootConflictsEnable() != null) {
            postData.write(MeshData.BLUFI_DATA_ROOT_CONFLICTS_ENABLE);
            postData.write(1);
            postData.write(params.isRootConflictsEnable() ? 1 : 0);
        }

        if (params.isFixRootEnalble() != null) {
            postData.write(MeshData.BLUFI_DATA_FIX_ROOT_ENALBLE);
            postData.write(1);
            postData.write(params.isFixRootEnalble() ? 1 : 0);
        }

        if (params.getCapacityNum() >= 0) {
            int num = params.getCapacityNum();
            postData.write(MeshData.BLUFI_DATA_CAPACITY_NUM);
            postData.write(2);
            postData.write(num & 0xff);
            postData.write((num >> 8) & 0xff);
        }

        if (params.getMaxLayer() >= 0) {
            postData.write(MeshData.BLUFI_DATA_MAX_LAYER);
            postData.write(1);
            postData.write(params.getMaxLayer());
        }

        if (params.getMaxConnection() >= 0) {
            postData.write(MeshData.BLUFI_DATA_MAX_CONNECTION);
            postData.write(1);
            postData.write(params.getMaxConnection());
        }

        if (params.getAssocExpireMS() >= 0) {
            int ms = params.getAssocExpireMS();
            postData.write(MeshData.BLUFI_DATA_ASSOC_EXPIRE_MS);
            postData.write(2);
            postData.write(ms & 0xff);
            postData.write((ms >> 8) & 0xff);
        }

        if (params.getBeaconIntervalMS() >= 0) {
            int ms = params.getBeaconIntervalMS();
            postData.write(MeshData.BLUFI_DATA_BEACON_INTERVAL_MS);
            postData.write(2);
            postData.write(ms & 0xff);
            postData.write((ms >> 8) & 0xff);
        }

        if (params.getPassiveScanMS() >= 0) {
            int ms = params.getPassiveScanMS();
            postData.write(MeshData.BLUFI_DATA_PASSIVE_SCAN_MS);
            postData.write(2);
            postData.write(ms & 0xff);
            postData.write((ms >> 8) & 0xff);
        }

        if (params.getMonitorDurationMS() >= 0) {
            int ms = params.getMonitorDurationMS();
            postData.write(MeshData.BLUFI_DATA_MONITOR_DURATION_MS);
            postData.write(2);
            postData.write(ms & 0xff);
            postData.write((ms >> 8) & 0xff);
        }

        if (params.getCnxRssi() <= 0) {
            postData.write(MeshData.BLUFI_DATA_CNX_RSSI);
            postData.write(1);
            postData.write(params.getCnxRssi());
        }

        if (params.getSelectRssi() <= 0) {
            postData.write(MeshData.BLUFI_DATA_SELECT_RSSI);
            postData.write(1);
            postData.write(params.getSelectRssi());
        }

        if (params.getSwitchRssi() <= 0) {
            postData.write(MeshData.BLUFI_DATA_SWITCH_RSSI);
            postData.write(1);
            postData.write(params.getSwitchRssi());
        }

        if (params.getXonQsize() >= 0) {
            postData.write(MeshData.BLUFI_DATA_XON_QSIZE);
            postData.write(1);
            postData.write(params.getXonQsize());
        }

        if (params.isRetransmitEnable() != null) {
            postData.write(MeshData.BLUFI_DATA_RETRANSMIT_ENABLE);
            postData.write(1);
            postData.write(params.isRetransmitEnable() ? 1 : 0);
        }

        if (params.isDataDropEnable() != null) {
            postData.write(MeshData.BLUFI_DATA_DATA_DROP_ENABLE);
            postData.write(1);
            postData.write(params.isDataDropEnable() ? 1 : 0);
        }

        try {
            return post(mEncrypted, mChecksum, true, typeValue, postData.toByteArray());
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private byte[] convertAddressStringToByteArray(String address) {
        String[] splits = address.split(":");
        byte[] result = new byte[splits.length];
        for (int i = 0; i < result.length; ++i) {
            result[i] = (byte) Integer.parseInt(splits[i], 16);
        }

        return result;
    }

    private boolean __sendMDFCustomData(byte[] data) {
        int typeValue = getTypeValue(Type.Data.PACKAGE_VALUE, Type.Data.SUBTYPE_MDF_CUSTOM);
        try {
            return post(mEncrypted, mChecksum, mRequireAck, typeValue, data);
        } catch (InterruptedException e) {
            e.printStackTrace();
            return false;
        }
    }

    private void onReceivedCustomData(final byte[] data) {
        if (mUserCallback == null) {
            return;
        }
        mUIHandler.post(() -> {
            if (mUserCallback != null) {
                mUserCallback.onReceivedCustomData(mClient, data);
            }
        });
    }

    private void sleep(long timeout) {
        try {
            Thread.sleep(timeout);
        } catch (InterruptedException e) {
            e.printStackTrace();
            Thread.currentThread().interrupt();
        }
    }
}
