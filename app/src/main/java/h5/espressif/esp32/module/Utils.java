package h5.espressif.esp32.module;

import android.util.Base64;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public final class Utils {
    public static String base64(@NonNull String string) {
        return base64(string.getBytes());
    }

    public static String base64(@NonNull byte[] data) {
        return Base64.encodeToString(data, Base64.NO_WRAP);
    }

    public static Map<String, Object> toMap(@NonNull JSONObject jsonObject) throws JSONException {
        Map<String, Object> result = new HashMap<>();
        Iterator<String> iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            if (jsonObject.isNull(key)) {
                continue;
            }

            Object value = jsonObject.get(key);
            if (value instanceof JSONObject) {
                result.put(key, toMap((JSONObject) value));
            } else if (value instanceof JSONArray) {
                result.put(key, toList((JSONArray) value));
            } else {
                result.put(key, value);
            }
        }

        return result;
    }

    public static List<Object> toList(@NonNull JSONArray jsonArray) throws JSONException {
        List<Object> result = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); ++i) {
            Object value = jsonArray.get(i);
            if (Objects.equals(value, JSONObject.NULL)) {
                result.add(null);
            } else if (value instanceof JSONObject) {
                result.add(toMap((JSONObject) value));
            } else if (value instanceof JSONArray) {
                result.add(toList((JSONArray) value));
            } else {
                result.add(value);
            }
        }

        return result;
    }
}
