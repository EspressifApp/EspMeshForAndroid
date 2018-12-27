package iot.espressif.esp32.action.common;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.HashSet;
import java.util.concurrent.atomic.AtomicReference;

import javax.net.ssl.HttpsURLConnection;

import io.reactivex.Observable;
import iot.espressif.esp32.model.other.EspRomQueryResult;
import iot.espressif.esp32.model.other.EspRxObserver;
import libs.espressif.log.EspLog;
import libs.espressif.net.EspHttpHeader;
import libs.espressif.net.EspHttpUtils;

public class EspActionDownloadFromIotEsp extends EspActionDownload implements IEspActionDownloadFromIotEsp {
    private EspLog mLog = new EspLog(getClass());

    @Override
    public EspRomQueryResult doActionQueryLatestVersion(String deviceKey) {
        EspHttpHeader header = new EspHttpHeader(KEY_AUTH, String.format("%s %s", KEY_TOKEN, deviceKey));

        JSONObject romJSON;
        try {
            romJSON = EspHttpUtils.Get(URL_QUERY, null, header).getContentJSON();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        if (romJSON == null) {
            mLog.w("doActionQueryLatestVersion get apk info null");
            return null;
        }

        try {
            int status = romJSON.getInt(KEY_STATUS);
            if (status != HttpsURLConnection.HTTP_OK) {
                return null;
            }

            String latestVersion = romJSON.getString(KEY_LATEST_VERSION);

            EspRomQueryResult result = new EspRomQueryResult();
            AtomicReference<EspRomQueryResult> resultRef = new AtomicReference<>();
            AtomicReference<JSONArray> fileArrayRef = new AtomicReference<>();

            JSONArray romsArray = romJSON.getJSONArray(KEY_ROMS);
            Observable.range(0, romsArray.length())
                    .map(romsArray::getJSONObject)
                    .filter(verJSON -> verJSON.getString(KEY_VERSION).equals(latestVersion))
                    .doOnNext(verJSON -> result.setVersion(latestVersion))
                    .takeUntil(verJSON -> true)
                    .map(verJSON -> verJSON.getJSONArray(KEY_FILES))
                    .doOnNext(fileArrayRef::set)
                    .flatMap(fileArray -> Observable.range(0, fileArray.length()))
                    .map(index -> fileArrayRef.get().getJSONObject(index))
                    .map(fileJSON -> fileJSON.getString(KEY_NAME))
                    .doOnNext(result::addFileName)
                    .doOnNext(fileName -> resultRef.set(result))
                    .subscribe(new EspRxObserver<String>() {
                        @Override
                        public void onError(Throwable e) {
                            e.printStackTrace();
                        }
                    });

            return resultRef.get();
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public boolean doActionDownloadFromIotEsp(String deviceKey, String version, String fileName, File saveFile) {
        String url = String.format(URL_DOWNLOAD_FORMAT, version, fileName);
        HashSet<EspHttpHeader> headers = new HashSet<>();
        headers.add(new EspHttpHeader(KEY_AUTH, String.format("%s %s", KEY_TOKEN, deviceKey)));
        return doActionHttpDownload(url, headers, saveFile);
    }
}
