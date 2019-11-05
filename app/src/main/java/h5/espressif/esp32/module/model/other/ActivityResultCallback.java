package h5.espressif.esp32.module.model.other;

import android.content.Intent;

public interface ActivityResultCallback {
    void onActivityResult(int requestCode, int resultCode, Intent data);
}
