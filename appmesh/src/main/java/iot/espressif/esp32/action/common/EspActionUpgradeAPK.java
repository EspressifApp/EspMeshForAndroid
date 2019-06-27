package iot.espressif.esp32.action.common;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;

public class EspActionUpgradeAPK extends EspActionDownload implements IEspActionUpgradeApk {

    public ReleaseInfo doActionGetLatestRelease() {
        try {
            URL url = new URL(LATEST_RELEASE_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            int code = connection.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) {
                return null;
            }

            InputStream is = connection.getInputStream();
            ByteArrayOutputStream contentArray = new ByteArrayOutputStream();
            for (int read = is.read(); read != -1; read = is.read()) {
                contentArray.write(read);
            }

            connection.disconnect();

            JSONObject releaseJSON = new JSONObject(new String(contentArray.toByteArray()));
            return parseRelease(releaseJSON);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return null;
    }

    private ReleaseInfo parseRelease(JSONObject releaseJSON) {
        try {
            String notes = releaseJSON.getString(KEY_BODY);
            JSONArray assetArray = releaseJSON.getJSONArray(KEY_ASSETS);
            for (int i = 0; i < assetArray.length(); i++) {
                JSONObject assetJSON = assetArray.getJSONObject(i);
                String assetName = assetJSON.getString(KEY_ASSET_NAME);
                if (assetName.endsWith(APK_SUFFIX)) {
                    String apkName = assetName.substring(0, assetName.length() - APK_SUFFIX.length());
                    String[] apkNameSplits = apkName.split("-");
                    String versionName = apkNameSplits[1];
                    int versionCode = Integer.parseInt(apkNameSplits[2]);

                    long apkSize = assetJSON.getLong(KEY_SIZE);
                    String downloadUrl = assetJSON.getString(KEY_DOWNLOAD_URL);

                    ReleaseInfo result = new ReleaseInfo();
                    result.versionCode = versionCode;
                    result.versionName = versionName;
                    result.apkSize = apkSize;
                    result.downloadUrl = downloadUrl;
                    result.notes = notes;
                    return result;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public boolean doActionDownloadAPK(String url, File saveFile) {
        return doActionHttpDownload(url, Collections.emptyList(), saveFile);
    }
}
