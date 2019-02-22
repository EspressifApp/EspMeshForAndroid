package iot.espressif.esp32.utils;

import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Vector;
import java.util.concurrent.LinkedBlockingQueue;

import io.reactivex.Observable;
import io.reactivex.ObservableOnSubscribe;
import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.IEspAction;
import iot.espressif.esp32.action.device.IEspActionDevice;
import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.model.callback.DeviceRequestCallable;
import iot.espressif.esp32.model.device.IEspDevice;
import iot.espressif.esp32.model.user.EspUser;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;
import libs.espressif.utils.DataUtil;

public class DeviceUtil {
    public static final EspHttpHeader HEADER_ROOT_RESP = new EspHttpHeader("root-response", "true") {
        @Override
        public void setValue(String value) {
        }
    };

    public static final String CONTENT_TYPE_BIN = "application/bin";

    public static final String FILE_REQUEST = "/device_request";

    private static final String HEADER_MESH_MAC = IEspActionDevice.HEADER_NODE_MAC;
    private static final String HEADER_MESH_COUNT = IEspActionDevice.HEADER_NODE_COUNT;

    private static EspHttpResponse httpPost(String url, byte[] content, EspHttpParams params, EspHttpHeader... headers) {
        if (params == null) {
            params = new EspHttpParams();
        }
        params.setTrustAllCerts(true);
        return EspHttpUtils.Post(url, content, params, headers);
    }

    /**
     * protocol://host/file
     *
     * @param protocol url protocol
     * @param host url host
     * @param file url file
     * @param port url port
     * @return url string
     */
    public static String getLocalUrl(String protocol, String host, String file, int port) {
        try {
            URL url = new URL(protocol, host, port, file);
            return url.toString();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Post a local device request
     *
     * @param device  the device
     * @param content request content
     * @param params  http params
     * @param headers http headers
     * @return http response, null if failed.
     */
    public static EspHttpResponse httpLocalRequest(IEspDevice device, byte[] content,
                                                   EspHttpParams params, EspHttpHeader... headers) {
        return httpLocalRequest(device.getProtocol(), device.getLanHostAddress(), device.getProtocolPort(),
                device.getMac(), content, params, headers);
    }

    /**
     * Post a local device request
     *
     * @param host    the device host address
     * @param bssid   the device bssid
     * @param content request content
     * @param params  http params
     * @param headers http headers
     * @return http response, null if failed.
     */
    public static EspHttpResponse httpLocalRequest(
            String protocol, String host, int port, String bssid, byte[] content,
            EspHttpParams params, EspHttpHeader... headers) {
        String url = getLocalUrl(protocol, host, FILE_REQUEST, port);

        EspHttpHeader[] newHeaders;
        int offset;
        offset = 3;
        newHeaders = new EspHttpHeader[headers.length + offset];
        newHeaders[0] = new EspHttpHeader(HEADER_MESH_COUNT, "1");
        newHeaders[1] = new EspHttpHeader(HEADER_MESH_MAC, bssid);
        newHeaders[2] = EspHttpUtils.HEADER_CONTENT_JSON;
        System.arraycopy(headers, 0, newHeaders, offset, headers.length);

        return httpPost(url, content, params, newHeaders);
    }

    /**
     * Post a local device request mesh by mesh
     *
     * @param devices the devices
     * @param content request content
     * @param params  http params
     * @param headers http headers
     */
    public static List<EspHttpResponse> httpLocalMulticastRequest(
            Collection<IEspDevice> devices, byte[] content, EspHttpParams params, boolean multithread, EspHttpHeader... headers) {
        final List<EspHttpResponse> result = new LinkedList<>();

        HashMap<InetAddress, List<IEspDevice>> inetDevicesMap = new HashMap<>();
        final HashMap<String, IEspDevice> protocolMap = new HashMap<>();
        for (IEspDevice device : devices) {
            InetAddress address = device.getLanAddress();

            if (address != null) {
                protocolMap.put(address.getHostAddress(), device);
            }

            List<IEspDevice> inetDeviceList = inetDevicesMap.get(address);
            if (inetDeviceList == null) {
                inetDeviceList = new LinkedList<>();
                inetDevicesMap.put(address, inetDeviceList);
            }
            inetDeviceList.add(device);
        }
        int threadCount = 0;
        final LinkedBlockingQueue<Object> taskQueue = new LinkedBlockingQueue<>();
        for (Map.Entry<InetAddress, List<IEspDevice>> entry : inetDevicesMap.entrySet()) {
            InetAddress address = entry.getKey();
            if (address != null) {
                final String host = address.getHostAddress();
                final byte[] orgContent = content;
                final EspHttpParams orgParams = params;
                final EspHttpHeader[] orgHeaders = headers;
                List<IEspDevice> inetDevices = entry.getValue();
                Collections.sort(inetDevices, (dev1, dev2) -> {
                    Integer layer1 = dev1.getMeshLayerLevel();
                    Integer layer2 = dev2.getMeshLayerLevel();
                    return layer2.compareTo(layer1);
                });
                final List<String> bssids = new LinkedList<>();
                for (IEspDevice dev : inetDevices) {
                    bssids.add(dev.getMac());
                }

                Observable.create((ObservableOnSubscribe<List<EspHttpResponse>>) emitter -> {
                    if (!emitter.isDisposed()) {
                        try {
                            IEspDevice protocolDev = protocolMap.get(host);
                            List<EspHttpResponse> respList = httpLocalMulticastRequest(
                                    protocolDev.getProtocol(), host, protocolDev.getProtocolPort(),
                                    bssids, orgContent, orgParams, multithread, orgHeaders);
                            emitter.onNext(respList);
                            emitter.onComplete();
                        } catch (Exception e) {
                            emitter.onError(e);
                        }
                    }
                }).subscribeOn(Schedulers.io())
                        .subscribe(new Observer<List<EspHttpResponse>>() {
                            @Override
                            public void onSubscribe(Disposable d) {
                            }

                            @Override
                            public void onNext(List<EspHttpResponse> espHttpResponses) {
                                result.addAll(espHttpResponses);
                            }

                            @Override
                            public void onError(Throwable e) {
                                e.printStackTrace();
                                taskQueue.add(new Object());
                            }

                            @Override
                            public void onComplete() {
                                taskQueue.add(new Object());
                            }
                        });

                threadCount++;
            }
        }
        for (int i = 0; i < threadCount; i++) {
            try {
                taskQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                break;
            }
        }

        inetDevicesMap.clear();
        return result;
    }

    /**
     * Post a local devices request
     *
     * @param host    the mesh host address
     * @param bssids  the devices bssids
     * @param content request content
     * @param params  http params
     * @param headers http headers
     * @return http response, null if failed.
     */
    public static List<EspHttpResponse> httpLocalMulticastRequest(
            String protocol, String host, int port, Collection<String> bssids, byte[] content,
            EspHttpParams params, boolean multithread, EspHttpHeader... headers) {
        String url = getLocalUrl(protocol, host, FILE_REQUEST, port);

        final int bssidChunkLimit = Integer.MAX_VALUE;//multithread ? 30 : Integer.MAX_VALUE;
        final int threadLimit = 1;

        LinkedBlockingQueue<List<String>> chunkedBssidsList = new LinkedBlockingQueue<>();
        List<String> bssidList = null;
        for (String bssid : bssids) {
            if (bssidList == null) {
                bssidList = new LinkedList<>();
            }

            bssidList.add(bssid);
            if (bssidList.size() >= bssidChunkLimit) {
                chunkedBssidsList.add(bssidList);
                bssidList = null;
            }
        }
        if (bssidList != null) {
            chunkedBssidsList.add(bssidList);
        }

        if (chunkedBssidsList.size() == 1) {
            List<String> limitBssids = chunkedBssidsList.iterator().next();
            return multicast(url, limitBssids, content, params, headers);
        } else if (chunkedBssidsList.size() < 1) {
            return Collections.emptyList();
        } else {
            int threadCount = Math.min(threadLimit, chunkedBssidsList.size());
            LinkedBlockingQueue<Boolean> resultWaitor = new LinkedBlockingQueue<>();
            Vector<EspHttpResponse> result = new Vector<>();

            for (int i = 0; i < threadCount; i++) {
                Observable.create(emitter -> {
                    try {
                        while (!emitter.isDisposed()) {
                            System.out.println("Chunked bssid list = " + chunkedBssidsList.size());
                            List<String> limitBssids = chunkedBssidsList.poll();
                            if (limitBssids == null) {
                                break;
                            }

                            List<EspHttpResponse> responseList = multicast(url, limitBssids, content, params, headers);
                            result.addAll(responseList);
                        }

                        emitter.onNext(Boolean.TRUE);
                        emitter.onComplete();
                    } catch (Exception e) {
                        emitter.onError(e);
                    }
                }).subscribeOn(Schedulers.io())
                        .subscribe(new Observer<Object>() {
                            @Override
                            public void onSubscribe(Disposable d) {
                            }

                            @Override
                            public void onNext(Object o) {
                            }

                            @Override
                            public void onError(Throwable e) {
                                e.printStackTrace();
                                resultWaitor.add(Boolean.FALSE);
                            }

                            @Override
                            public void onComplete() {
                                resultWaitor.add(Boolean.TRUE);
                            }
                        });
            }

            for (int i = 0; i < threadCount; i++) {
                try {
                    resultWaitor.take();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    return Collections.emptyList();
                }
            }

            return result;
        }
    }

    private static List<EspHttpResponse> multicast(String url, Collection<String> bssids, byte[] content,EspHttpParams params,
                          EspHttpHeader... headers) {
        Collection<String> dstBssids;
        if (bssids.size() >= 200) {
            dstBssids = new ArrayList<>(1);
            dstBssids.add(DeviceConstants.MAC_BROADCAST);
        } else {
            dstBssids = bssids;
        }

        final int newHeaderCount = 3;
        EspHttpHeader[] newHeaders = new EspHttpHeader[headers.length + newHeaderCount];
        StringBuilder bssidsSB = new StringBuilder();
        for (String bssid : dstBssids) {
            bssidsSB.append(bssid).append(',');
        }
        bssidsSB.deleteCharAt(bssidsSB.length() - 1);
        newHeaders[1] = new EspHttpHeader(HEADER_MESH_MAC, bssidsSB.toString());
        newHeaders[0] = new EspHttpHeader(HEADER_MESH_COUNT, String.valueOf(dstBssids.size()));
        newHeaders[2] = EspHttpUtils.HEADER_CONTENT_JSON;
        System.arraycopy(headers, 0, newHeaders, newHeaderCount, headers.length);

        EspHttpResponse response = httpPost(url, content, params, newHeaders);
        if (response == null) {
            return Collections.emptyList();
        }

        List<EspHttpResponse> result = new LinkedList<>();
        boolean chunkedResp = response.findHeader(EspHttpUtils.CONTENT_LENGTH) == null;
        if (chunkedResp) {
            List<EspHttpResponse> chunkedRespList = getChunkedResponseList(response.getContent());
            result.addAll(chunkedRespList);
        } else {
            result.add(response);
        }
        return result;
    }

    private static List<EspHttpResponse> getChunkedResponseList(byte[] data) {
        if (data == null) {
            return Collections.emptyList();
        }

        List<EspHttpResponse> result = new LinkedList<>();

        LinkedList<Byte> dataList = new LinkedList<>();
        for (byte b : data) {
            dataList.add(b);
        }

        LinkedList<Byte> tempList = new LinkedList<>();
        while (!dataList.isEmpty()){
            Observable.just(dataList.poll())
                    .filter(aByte -> {
                        tempList.add(aByte);
                        return headEnd(tempList);
                    })
                    .map(aByte -> {
                        String headStr = new String(DataUtil.byteListToArray(tempList));
                        return headStr.split("\r\n");
                    })
                    .doOnNext(headArray -> {
                        Observable.fromArray(headArray)
                                .takeUntil(s -> {
                                    String[] kv = s.split(": ");
                                    boolean readContentLength = kv[0].equalsIgnoreCase(EspHttpUtils.CONTENT_LENGTH);
                                    if (!readContentLength) {
                                        return false;
                                    }

                                    int contentLength = Integer.parseInt(kv[1]);
                                    for (int pollcount = 0; pollcount < contentLength; pollcount++) {
                                        Byte contentByte = dataList.poll();
                                        if (contentByte == null) {
                                            Log.w("DeviceUtil", "getChunkedResponseList: read conent null");
                                            break;
                                        }

                                        tempList.add(contentByte);
                                    }

                                    return true;
                                })
                                .subscribe(new Observer<String>() {
                                    @Override
                                    public void onSubscribe(Disposable d) {
                                    }

                                    @Override
                                    public void onNext(String s) {
                                    }

                                    @Override
                                    public void onError(Throwable e) {
                                        tempList.clear();
                                    }

                                    @Override
                                    public void onComplete() {
                                        byte[] respData = DataUtil.byteListToArray(tempList);
                                        EspHttpResponse response = EspHttpUtils.getResponseWithFixedLengthData(respData);
                                        result.add(response);
                                        tempList.clear();
                                    }
                                });
                    })
                    .subscribe();
        }

        return result;
    }

    private static boolean headEnd(List<Byte> bytes) {
        int size = bytes.size();
        if (size < 4) {
            return false;
        }

        if (bytes.get(size - 1) != '\n') {
            return false;
        }
        if (bytes.get(size - 2) != '\r') {
            return false;
        }
        if (bytes.get(size - 3) != '\n') {
            return false;
        }
        if (bytes.get(size - 4) != '\r') {
            return false;
        }

        return true;
    }

    public static Map<String, EspHttpResponse> httpLocalUnicastRequest(
            Collection<IEspDevice> devices, byte[] content, EspHttpParams params, EspHttpHeader... headers) {
        return httpLocalUnicastRequest(devices, content, params, null, headers);
    }

    public static Map<String, EspHttpResponse> httpLocalUnicastRequest(
            Collection<IEspDevice> devices, byte[] content, EspHttpParams params, final DeviceRequestCallable callable,
            EspHttpHeader... headers) {
        final Map<String, EspHttpResponse> result = new Hashtable<>();

        final int threadCount = Math.min(10, devices.size());
        final LinkedBlockingQueue<Object> threadQueue = new LinkedBlockingQueue<>();
        final LinkedList<IEspDevice> deviceList = new LinkedList<>();
        deviceList.addAll(devices);
        final byte[] orgContent = content;
        final EspHttpParams orgParams = params;
        final EspHttpHeader[] orgHeaders = headers;
        final DeviceRequestCallable orgCallable = callable;
        final Thread mainTaskThread = Thread.currentThread();

        for (int i = 0; i < threadCount; i++) {
            new Thread(() -> {
                while (true) {
                    IEspDevice device;
                    synchronized (deviceList) {
                        device = deviceList.poll();
                    }
                    if (device == null) {
                        break;
                    }

                    String host = device.getLanHostAddress();
                    if (host == null) {
                        continue;
                    }

                    String protocol = device.getProtocol();
                    int port = device.getProtocolPort();
                    EspHttpResponse response = httpLocalRequest(protocol, host, port, device.getMac(),
                            orgContent, orgParams, orgHeaders);
                    if (callable != null) {
                        callable.onResponse(device, response);
                    }
                    if (response != null) {
                        result.put(device.getMac(), response);
                    }

                    if (mainTaskThread.isInterrupted()) {
                        break;
                    }
                }

                threadQueue.add(new Object());
            }).start();
        }

        for (int i = 0; i < threadCount; i++) {
            try {
                threadQueue.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                return null;
            }
        }

        return result;
    }

    /**
     * Get device name by bssid
     *
     * @param bssid the device bssid
     * @return device name
     */
    public static String getNameByBssid(String bssid) {
        return bssid.toUpperCase(Locale.ENGLISH);
    }

    /**
     * Check the two devices bssids is equal.
     *
     * @return equal or not
     */
    public static boolean equalMac(IEspDevice device1, IEspDevice device2) {
        return device1.getMac().equalsIgnoreCase(device2.getMac());
    }

    /**
     * Convert aabbccddeeff to aa:bb:cc:dd:ee:ff
     *
     * @param bssid like aabbccddeeff
     * @return like aa:bb:cc:dd:ee:ff
     */
    public static String convertColonBssid(String bssid) {
        StringBuilder sb = new StringBuilder(18);
        for (int i = 0; i < bssid.length(); i += 2) {
            sb.append(bssid.substring(i, i + 2)).append(":");
        }
        sb.deleteCharAt(sb.length() - 1);
        return sb.toString();
    }

    /**
     * Check the  collection contain the target bssid device
     *
     * @return true if collection contain the bssid device
     */
    public static boolean containBssid(Collection<IEspDevice> devices, String bssid) {
        boolean result = false;
        for (IEspDevice device : devices) {
            if (device.getMac().equals(bssid)) {
                result = true;
                break;
            }
        }

        return result;
    }

    /**
     * Parse http response
     *
     * @param response   http response
     * @param checkCodes position 1 is http code, position 2 is device status code.
     * @return http request complete or not
     */
    public static boolean checkHttpResponse(EspHttpResponse response, Integer... checkCodes) {
        if (response == null) {
            return false;
        }

        if (checkCodes.length > 0) {
            Integer httpCheckCode = checkCodes[0];
            if (httpCheckCode != null && response.getCode() != httpCheckCode) {
                return false;
            }
        }

        try {
            JSONObject respJSON = response.getContentJSON();
            if (respJSON == null) {
                return false;
            }

            if (checkCodes.length > 1) {
                Integer statudCheckCode = checkCodes[1];
                if (statudCheckCode != null) {
                    int statusCode = respJSON.getInt(IEspActionDevice.KEY_STATUS_CODE);
                    if (statusCode != statudCheckCode) {
                        return false;
                    }
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }

    public static EspHttpHeader getUserTokenHeader() {
        if (EspUser.INSTANCE.isLogged()) {
            return new EspHttpHeader(IEspAction.KEY_TOKEN, DataUtil.bytesToString(EspUser.INSTANCE.getToken()));
        } else {
            return null;
        }
    }

    public static Map<String, EspHttpResponse> getMapWithDeviceResponses(Collection<EspHttpResponse> responses) {
        Map<String, EspHttpResponse> map = new HashMap<>();
        for (EspHttpResponse resp : responses) {
            String mac = resp.findHeaderValue(IEspActionDevice.HEADER_NODE_MAC);
            if (mac != null) {
                map.put(mac, resp);
            }
        }
        return map;
    }

    public static void delayRequestRetry(Collection<IEspDevice> devices, String request, EspHttpParams params) {
        for (int i = 0; i < 5; i++) {
            int delay = 0;
            switch (i) {
                case 0:
                    delay = 30000;
                    break;
                case 1:
                    delay = 20000;
                    break;
                case 2:
                    delay = 10000;
                    break;
                case 3:
                    delay = 5000;
                    break;
                case 4:
                    delay = 3000;
                    break;
            }

            try {
                JSONObject json = new JSONObject()
                        .put(IEspActionDevice.KEY_REQUEST, request)
                        .put(IEspActionDevice.KEY_DELAY, delay);
                byte[] content = json.toString().getBytes();
                EspHttpHeader tokenH = DeviceUtil.getUserTokenHeader();
                DeviceUtil.httpLocalMulticastRequest(devices, content, params,
                        false, tokenH, DeviceUtil.HEADER_ROOT_RESP);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }
}
