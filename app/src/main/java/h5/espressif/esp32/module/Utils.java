package h5.espressif.esp32.module;

import android.util.Base64;

public final class Utils {
    public static String base64(String string) {
        return Base64.encodeToString(string.getBytes(), Base64.NO_WRAP);
    }
}
