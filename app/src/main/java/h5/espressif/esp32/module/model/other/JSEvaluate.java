package h5.espressif.esp32.module.model.other;

import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface JSEvaluate {
    void evaluateJavascript(String script);

    void startActivity(@NonNull Class cls, @Nullable Intent extras,
                       @Nullable ActivityResultCallback callback);
}
