package h5.espressif.esp32.module;

import android.util.Base64;

public final class Utils {
    public static String base64(String string) {
        return base64(string.getBytes());
    }

    public static String base64(byte[] data) {
        return Base64.encodeToString(data, Base64.NO_WRAP);
    }
}
