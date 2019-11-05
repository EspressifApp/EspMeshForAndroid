package iot.espressif.esp32.utils;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
import java.util.Map;
import java.util.Vector;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;

import io.reactivex.Observable;
import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import io.reactivex.schedulers.Schedulers;
import iot.espressif.esp32.action.device.IEspActionDevice;
import iot.espressif.esp32.constants.DeviceConstants;
import iot.espressif.esp32.model.callback.DeviceRequestCallable;
import iot.espressif.esp32.model.device.IEspDevice;
import libs.espressif.collection.EspCollections;
import libs.espressif.function.EspFunction;
import libs.espressif.net.EspHttpParams;
import libs.espressif.net.EspHttpResponse;
import libs.espressif.net.EspHttpUtils;
import libs.espressif.utils.DataUtil;

public class DeviceUtil {
    /**
     * Value of the header is String "true" or "false"
     */
    public static final String HEADER_ROOT_RESP = "root-response";

    public static final String CONTENT_TYPE_BIN = "application/bin";

    public static final String FILE_REQUEST = "/device_request";

    private static final String TAG = DeviceUtil.class.getSimpleName();

    private static final String HEADER_MESH_MAC = IEspActionDevice.HEADER_NODE_MAC;
    private static final String HEADER_GROUP = IEspActionDevice.HEADER_NODE_GROUP;
    private static final String HEADER_MESH_COUNT = IEspActionDevice.HEADER_NODE_COUNT;

    private static EspHttpResponse httpPost(String url, byte[] content, EspHttpParams params, Map<String, String> headers) {
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
     * @param host     url host
     * @param file     url file
     * @param port     url port
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

    private static void addMeshHeaders(@NonNull Map<String, String> headers, int bssidSize, String bssid) {
        boolean hasGroup = false;
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            if (HEADER_GROUP.equals(entry.getKey())) {
                hasGroup = true;
                break;
            }
        }
        if (hasGroup) {
            headers.put(EspHttpUtils.CONTENT_TYPE, EspHttpUtils.APPLICATION_JSON);
            // TODO Mesh Node Header will deprecate in next 2 or 3 version.
            headers.put(HEADER_MESH_COUNT, String.valueOf(bssidSize));
            headers.put(HEADER_MESH_MAC, bssid);
        } else {
            headers.put(EspHttpUtils.CONTENT_TYPE, EspHttpUtils.APPLICATION_JSON);
            headers.put(HEADER_MESH_COUNT, String.valueOf(bssidSize));
            headers.put(HEADER_MESH_MAC, bssid);
        }
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
    public static EspHttpResponse httpLocalRequest(@NonNull IEspDevice device, @NonNull byte[] content,
                                                   @Nullable EspHttpParams params, @Nullable Map<String, String> headers) {
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
    public static EspHttpResponse httpLocalRequest(@NonNull String protocol, @NonNull String host, int port,
                                                   @NonNull String bssid, @NonNull byte[] content,
                                                   EspHttpParams params, Map<String, String> headers) {
        String url = getLocalUrl(protocol, host, FILE_REQUEST, port);
        Map<String, String> newHeaders = new HashMap<>();
        if (headers != null) {
            newHeaders.putAll(headers);
        }
        addMeshHeaders(newHeaders, 1, bssid);
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
    public static List<EspHttpResponse> httpLocalMulticastRequest(@NonNull Collection<IEspDevice> devices,
                                                                  @NonNull byte[] content, @Nullable EspHttpParams params, @Nullable Map<String, String> headers) {
        final List<EspHttpResponse> result = new LinkedList<>();

        Map<InetAddress, List<IEspDevice>> deviceGroups = EspCollections.groupBy(devices,
                IEspDevice::getLanAddress);
        final List<Future<List<EspHttpResponse>>> futures = new ArrayList<>();
        ExecutorService executor = Executors.newCachedThreadPool();
        for (Map.Entry<InetAddress, List<IEspDevice>> entry : deviceGroups.entrySet()) {
            InetAddress address = entry.getKey();
            if (address == null) {
                continue;
            }

            List<IEspDevice> devicesInGroup = entry.getValue();
            final String host = address.getHostAddress();
            final IEspDevice protocolDev = devicesInGroup.get(0);
            final List<String> bssids = new LinkedList<>();
            for (IEspDevice dev : devicesInGroup) {
                bssids.add(dev.getMac());
            }
            Callable<List<EspHttpResponse>> callable = () -> httpLocalMulticastRequest(
                    protocolDev.getProtocol(), host, protocolDev.getProtocolPort(),
                    bssids, content, params, headers);

            Future<List<EspHttpResponse>> future = executor.submit(callable);
            futures.add(future);
        }

        for (Future<List<EspHttpResponse>> future : futures) {
            try {
                List<EspHttpResponse> responses = future.get();
                result.addAll(responses);
            } catch (ExecutionException e) {
                e.printStackTrace();
            } catch (InterruptedException e) {
                Log.w(TAG, "httpLocalMulticastRequest future get() interrupted");
                break;
            }
        }
        executor.shutdownNow();

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
            EspHttpParams params, Map<String, String> headers) {
        Map<String, String> newHeaders = new HashMap<>();
        if (headers != null) {
            newHeaders.putAll(headers);
        }

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

        if (chunkedBssidsList.isEmpty()) {
            return Collections.emptyList();
        }

        // Only 1 group bssids
        if (chunkedBssidsList.size() == 1) {
            List<String> limitBssids = chunkedBssidsList.iterator().next();
            return multicast(url, limitBssids, content, params, newHeaders);
        }

        // There are more than 1 group bssids
        int threadCount = Math.min(threadLimit, chunkedBssidsList.size());
        LinkedBlockingQueue<Boolean> resultWaitor = new LinkedBlockingQueue<>();
        resultWaitor.iterator().hasNext();
        Vector<EspHttpResponse> result = new Vector<>();

        for (int i = 0; i < threadCount; ++i) {
            final Map<String, String> taskHeader = newHeaders;
            Observable.create(emitter -> {
                try {
                    while (!emitter.isDisposed()) {
                        List<String> limitBssids = chunkedBssidsList.poll();
                        if (limitBssids == null) {
                            break;
                        }

                        List<EspHttpResponse> responseList = multicast(url, limitBssids, content, params, taskHeader);
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

        for (int i = 0; i < threadCount; ++i) {
            try {
                resultWaitor.take();
            } catch (InterruptedException e) {
                e.printStackTrace();
                return Collections.emptyList();
            }
        }

        return result;
    }

    private static List<EspHttpResponse> multicast(String url, Collection<String> bssids, byte[] content, EspHttpParams params,
                                                   Map<String, String> headers) {
        if (headers == null) {
            headers = new HashMap<>();
        }
        Collection<String> dstBssids;
        if (bssids.size() >= 200) {
            dstBssids = new ArrayList<>(1);
            dstBssids.add(DeviceConstants.MAC_BROADCAST);
        } else {
            dstBssids = bssids;
        }

        StringBuilder bssidsSB = new StringBuilder();
        for (String bssid : dstBssids) {
            bssidsSB.append(bssid).append(',');
        }
        bssidsSB.deleteCharAt(bssidsSB.length() - 1);
        addMeshHeaders(headers, dstBssids.size(), bssidsSB.toString());

        EspHttpResponse response = httpPost(url, content, params, headers);
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
        while (!dataList.isEmpty()) {
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
            Collection<IEspDevice> devices, byte[] content, EspHttpParams params, Map<String, String> headers) {
        return httpLocalUnicastRequest(devices, content, params, null, headers);
    }

    public static Map<String, EspHttpResponse> httpLocalUnicastRequest(
            Collection<IEspDevice> devices, byte[] content, EspHttpParams params, final DeviceRequestCallable callable,
            Map<String, String> headers) {
        final Map<String, EspHttpResponse> result = new Hashtable<>();

        final int threadCount = Math.min(10, devices.size());
        final LinkedBlockingQueue<Object> threadQueue = new LinkedBlockingQueue<>();
        threadQueue.iterator().hasNext();
        final LinkedList<IEspDevice> deviceList = new LinkedList<>(devices);
        final byte[] orgContent = content;
        final EspHttpParams orgParams = params;
        final Map<String, String> orgHeaders = headers;
        final DeviceRequestCallable orgCallable = callable;
        final Thread mainTaskThread = Thread.currentThread();

        for (int i = 0; i < threadCount; ++i) {
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
                    if (orgCallable != null) {
                        orgCallable.onResponse(device, response);
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

        for (int i = 0; i < threadCount; ++i) {
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
    public static String convertToColonBssid(String bssid) {
        StringBuilder sb = new StringBuilder(18);
        for (int i = 0; i < bssid.length(); i += 2) {
            sb.append(bssid.substring(i, i + 2)).append(":");
        }
        sb.deleteCharAt(sb.length() - 1);
        return sb.toString();
    }

    /**
     * Convert aa:bb:cc:dd:ee:ff to aabbccddeeff
     *
     * @param bssid like aa:bb:cc:dd:ee:ff
     * @return like aabbccddeeff
     */
    public static String convertToNoColonBssid(String bssid) {
        String[] splits = bssid.split(":");
        StringBuilder sb = new StringBuilder();
        for (String s : splits) {
            sb.append(s);
        }
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

    public static Map<String, EspHttpResponse> getMapWithDeviceResponses(Collection<EspHttpResponse> responses) {
        Map<String, EspHttpResponse> map = new HashMap<>();
        for (EspHttpResponse resp : responses) {
            if (resp == null) {
                continue;
            }
            String mac = resp.findHeaderValue(IEspActionDevice.HEADER_NODE_MAC);
            if (mac != null) {
                map.put(mac, resp);
            }
        }
        return map;
    }

    public static void delayRequestRetry(Collection<IEspDevice> devices, String request, EspHttpParams params) {
        for (int i = 0; i < 5; ++i) {
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
                Map<String, String> headers = new HashMap<>();
                headers.put(HEADER_ROOT_RESP, String.valueOf(true));
                DeviceUtil.httpLocalMulticastRequest(devices, content, params, headers);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    public static String getBleMacForStaMac(String staMac) {
        long staMacValue = Long.parseLong(staMac, 16);
        long bleMacValue = staMacValue + 2;
        StringBuilder bleMac = new StringBuilder(Long.toHexString(bleMacValue).toLowerCase());
        while (bleMac.length() < 12) {
            bleMac.insert(0, "0");
        }
        return bleMac.toString();
    }

    public static String getStaMacForBleMac(String bleMac) {
        long bleMacValue = Long.parseLong(bleMac, 16);
        long staMacValue = bleMacValue - 2;
        StringBuilder staMac = new StringBuilder(Long.toHexString(staMacValue).toLowerCase());
        while (staMac.length() < 12) {
            staMac.insert(0, "0");
        }
        return staMac.toString();
    }
}
