package libs.espressif.net;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.net.ssl.HttpsURLConnection;

import libs.espressif.collection.EspCollections;
import libs.espressif.log.EspLog;

public class EspHttpUtils {
    public static final String CONNECTION = "Connection";
    public static final String CONTENT_TYPE = "Content-Type";
    public static final String CONTENT_LENGTH = "Content-Length";
    public static final String TRANSFER_ENCODING = "Transfer-Encoding";

    public static final String KEEP_ALIVE = "Keep-Alive";
    public static final String CLOSE = "close";
    public static final String APPLICATION_JSON = "application/json";
    public static final String CHUNKED = "chunked";

    public static final String HTTP = "http";
    public static final String HTTPS = "https";

    private static final EspLog log = new EspLog(EspHttpUtils.class);

    public static final String METHOD_GET = "GET";
    public static final String METHOD_POST = "POST";
    public static final String METHOD_HEAD = "HEAD";
    public static final String METHOD_OPTIONS = "OPTIONS";
    public static final String METHOD_PUT = "PUT";
    public static final String METHOD_DELETE = "DELETE";
    public static final String METHOD_TRACE = "TRACE";

    private static final int TIMEOUT_CONNECT = 4000;
    private static final int TIMEOUT_SO_GET = 5000;
    private static final int TIMEOUT_SO_POST = 5000;
    private static final int TIMEOUT_NO_RESPONSE = 1;

    private static final char[] SPEC_CHARS = {'+', '*', ':'};

    /**
     * Execute Http Get request.
     *
     * @param url     target url
     * @param headers http headers
     * @return response. null is failed.
     */
    public static EspHttpResponse Get(String url, EspHttpParams params, Map<String, String> headers) {
        return execute(url, METHOD_GET, null, params, headers);
    }

    /**
     * Execute Http Post request.
     *
     * @param url     target url
     * @param content content bytes
     * @param headers http headers
     * @return response. null is failed.
     */
    public static EspHttpResponse Post(String url, byte[] content, EspHttpParams params, Map<String, String> headers) {
        return execute(url, METHOD_POST, content, params, headers);
    }

    /**
     * Execute Http Put request.
     *
     * @param url     target url
     * @param content content bytes
     * @param headers http headers
     * @return response. null is failed.
     */
    public static EspHttpResponse Put(String url, byte[] content, EspHttpParams params, Map<String, String> headers) {
        return execute(url, METHOD_PUT, content, params, headers);
    }

    /**
     * Execute Http Delete request.
     *
     * @param url     target url
     * @param content content bytes
     * @param headers http headers
     * @return response. null is failed.
     */
    public static EspHttpResponse Delete(String url, byte[] content, EspHttpParams params, Map<String, String> headers) {
        return execute(url, METHOD_DELETE, content, params, headers);
    }

    private static EspHttpResponse execute(String url, String method, byte[] content,
                                           EspHttpParams params, Map<String, String> headers) {
        EspHttpResponse response = null;

        if (headers == null) {
            headers = Collections.emptyMap();
        }

        int tryCount = 1;
        boolean requireResp = true;
        if (params != null) {
            tryCount = Math.max(tryCount, params.getTryCount());
            requireResp = params.isRequireResponse();
        }

        for (int i = 0; i < tryCount; ++i) {
            if (Thread.currentThread().isInterrupted()) {
                return null;
            }
            HttpURLConnection connection = createURLConnection(url, method, params, headers);
            response = executeHttpRequest(connection, content, requireResp);
            if (connection != null) {
                connection.disconnect();
            }
            if (response != null) {
                break;
            }
        }
        return response;
    }

    private static HttpURLConnection createURLConnection(String url, String method, EspHttpParams params, Map<String, String> headers) {
        try {
            URL targetURL = new URL(url);
            String file = targetURL.getFile();
            if (file != null) {
                for (char c : SPEC_CHARS) {
                    String asciiStr = String.format("%%%02X", (int) c);
                    file = file.replace(String.valueOf(c), asciiStr);
                }
                targetURL = new URL(targetURL.getProtocol(), targetURL.getHost(), targetURL.getPort(), file);
            }
            HttpURLConnection connection = (HttpURLConnection) targetURL.openConnection();
            connection.setRequestMethod(method);
            EspCollections.forEach(headers, (name, value) -> {
                if (name == null || value == null) {
                    return;
                }
                connection.addRequestProperty(name, value);
            });

            int timeoutConn = (params != null && params.getConnectTimeout() > 0) ? params.getConnectTimeout()
                    : TIMEOUT_CONNECT;
            int timeoutSO = (params != null && params.getSOTimeout() >= 0) ? params.getSOTimeout()
                    : (method.equals(METHOD_GET) ? TIMEOUT_SO_GET : TIMEOUT_SO_POST);
            connection.setConnectTimeout(timeoutConn);
            connection.setReadTimeout(timeoutSO);

            if (params != null && params.isTrustAllCerts() && targetURL.getProtocol().equalsIgnoreCase(HTTPS)) {
                HttpsURLConnection httpsConn = (HttpsURLConnection) connection;
                SSLUtils.trustAllHosts(httpsConn);
                httpsConn.setHostnameVerifier(SSLUtils.DO_NOT_VERIFY);
            }

            return connection;
        } catch (IOException e) {
            e.printStackTrace();

            return null;
        }
    }

    private static EspHttpResponse executeHttpRequest(HttpURLConnection connection, byte[] content, boolean requireResponse) {
        if (connection == null) {
            return null;
        }

        if (!requireResponse) {
            connection.setReadTimeout(TIMEOUT_NO_RESPONSE);
        }

        try {
            log.d("executeHttpRequest url = " + connection.getURL().toString());
            Map<String, List<String>> requestProperties = connection.getRequestProperties();
            for (Map.Entry<String, List<String>> entry : requestProperties.entrySet()) {
                String key = entry.getKey();
                for (String value : entry.getValue()) {
                    log.d(key + ": " + value);
                }
            }
            if (!isEmpty(content)) {
                connection.setDoOutput(true);
                log.d("executeHttpRequest execute write " + new String(content));
                connection.setFixedLengthStreamingMode(content.length);
                connection.getOutputStream().write(content);
            } else {
                log.d("executeHttpRequest execute connect");
                connection.setFixedLengthStreamingMode(0);
            }
        } catch (IOException e) {
            connection.disconnect();
            log.w("executeHttpRequest Connect failed");
            return null;
        }

        EspHttpResponse response;
        try {
            response = readResponse(connection);
        } catch (IOException e) {
            log.w("executeHttpRequest read response IOException " + e.getMessage());
            if (requireResponse) {
                response = null;
            } else {
                response = new EspHttpResponse();
            }
        } finally {
            connection.disconnect();
        }

        return response;
    }

    private static EspHttpResponse readResponse(HttpURLConnection connection) throws IOException {
        EspHttpResponse response = new EspHttpResponse();

        // Get http code and message
        int code = connection.getResponseCode();
        String msg = connection.getResponseMessage();
        response.setCode(code);
        response.setMessage(msg);

        // Get http headers
        Map<String, List<String>> respHeaders = connection.getHeaderFields();
        for (Map.Entry<String, List<String>> entry : respHeaders.entrySet()) {
            String key = entry.getKey();
            if (key == null) {
                String statusHeader = entry.getValue().get(0);
                log.i(statusHeader);
                continue;
            }
            List<String> values = entry.getValue();
            if (values == null || values.isEmpty()) {
                continue;
            }

            EspHttpHeader respHeader = new EspHttpHeader(key, values);
            response.setHeader(respHeader);
            log.i(respHeader.toString());
        }

        // Get http content
        ByteArrayOutputStream contentOS = new ByteArrayOutputStream();
        InputStream is = connection.getErrorStream() == null ?
                connection.getInputStream() : connection.getErrorStream();
        try {
            for (int data = is.read(); data != -1; data = is.read()) {
                contentOS.write(data);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        if (contentOS.size() > 0) {
            response.setContent(contentOS.toByteArray());
            log.i(response.getContentString());
        }
        contentOS.close();

        return response;
    }

    public static EspHttpResponse getResponseWithFixedLengthData(byte[] data) {
        if (isEmpty(data)) {
            log.w("null data");
            return null;
        }

        EspHttpResponse result = new EspHttpResponse();

        ByteArrayInputStream dataIS = new ByteArrayInputStream(data);
        ByteArrayOutputStream headerOS = new ByteArrayOutputStream();
        ByteArrayOutputStream contentOS = new ByteArrayOutputStream();
        boolean readContent = false;
        int last1, last2, last3, last4;
        last1 = last2 = last3 = last4 = -1;
        for (int read = dataIS.read(); read != -1; read = dataIS.read()) {
            if (!readContent) {
                headerOS.write(read);

                last1 = last2;
                last2 = last3;
                last3 = last4;
                last4 = read;
                if (last1 == '\r' && last2 == '\n' && last3 == '\r' && last4 == '\n') {
                    // Header End
                    readContent = true;
                }
            } else {
                contentOS.write(read);
            }
        }

        String headersStr = new String(headerOS.toByteArray());
        String[] headers = headersStr.split("\r\n");
        if (headers.length <= 0) {
            log.w("no status header");
            return null;
        }
        String statusHeader = headers[0];
        String[] statusValues = statusHeader.split(" ");
        if (statusValues.length < 3) {
            log.w("invalid status header " + statusHeader);
            return null;
        } else if (!statusValues[0].toUpperCase().startsWith("HTTP")) {
            log.w("invalid status protocol " + statusHeader);
            return null;
        } else {
            try {
                int statusCode = Integer.parseInt(statusValues[1]);
                result.setCode(statusCode);
            } catch (NumberFormatException nfe) {
                log.w("invalid status code " + statusHeader);
                return null;
            }

            StringBuilder statusMessage = new StringBuilder();
            for (int statusIndex = 2; statusIndex < statusValues.length; ++statusIndex) {
                statusMessage.append(statusValues[statusIndex]);
                if (statusIndex < statusValues.length - 1) {
                    statusMessage.append(" ");
                }
            }
            result.setMessage(statusMessage.toString());
        }

        Map<String, List<String>> headerMap = new HashMap<>();
        for (int i = 1; i < headers.length; ++i) {
            String headerStr = headers[i];
            int index = headerStr.indexOf(": ");
            if (index == -1) {
                log.w("invalid header : " + headerStr);
                return null;
            }
            String name = headerStr.substring(0, index).toLowerCase();
            String value = headerStr.substring(index + 2);
            List<String> values = headerMap.get(name);
            if (values == null) {
                values = new ArrayList<>();
                headerMap.put(name, values);
            }
            values.add(value);
        }
        for (Map.Entry<String, List<String>> entry : headerMap.entrySet()) {
            EspHttpHeader header = new EspHttpHeader(entry.getKey(), entry.getValue());
            result.setHeader(header);
        }

        if (contentOS.size() > 0) {
            result.setContent(contentOS.toByteArray());
        }

        return result;
    }

    private static boolean isEmpty(byte[] data) {
        return data == null || data.length == 0;
    }

    public static Map<String, String> getQueryMap(String url)
            throws URISyntaxException, UnsupportedEncodingException {
        URI uri = new URI(url);
        String query = uri.getQuery();
        final String[] pairs = query.split("&");
        TreeMap<String, String> queryMap = new TreeMap<>();
        for (String pair : pairs) {
            final int idx = pair.indexOf("=");
            final String key = idx > 0 ? pair.substring(0, idx) : pair;
            if (!queryMap.containsKey(key)) {
                queryMap.put(key, URLDecoder.decode(pair.substring(idx + 1), Charset.defaultCharset().name()));
            }
        }
        return queryMap;
    }

    public static String composeUrl(String protocol, String endPoint, Map<String, String> queries)
            throws UnsupportedEncodingException {
        Map<String, String> mapQueries = queries;
        StringBuilder urlBuilder = new StringBuilder("");
        urlBuilder.append(protocol);
        urlBuilder.append("://").append(endPoint);
        if (-1 == urlBuilder.indexOf("?")) {
            urlBuilder.append("/?");
        }
        urlBuilder.append(concatQueryString(mapQueries));
        return urlBuilder.toString();
    }

    public static String concatQueryString(Map<String, String> parameters)
            throws UnsupportedEncodingException {
        if (null == parameters) {
            return null;
        }
        StringBuilder urlBuilder = new StringBuilder("");
        for (Map.Entry<String, String> entry : parameters.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            urlBuilder.append(encode(key));
            if (val != null) {
                urlBuilder.append("=").append(encode(val));
            }
            urlBuilder.append("&");
        }
        int strIndex = urlBuilder.length();
        if (parameters.size() > 0) {
            urlBuilder.deleteCharAt(strIndex - 1);
        }
        return urlBuilder.toString();
    }

    public static String encode(String value)
            throws UnsupportedEncodingException {
        return URLEncoder.encode(value, "UTF-8");
    }
}
