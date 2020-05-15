package h5.espressif.esp32.module.main;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.SystemClock;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Objects;

import h5.espressif.esp32.R;
import h5.espressif.esp32.module.model.customer.Customer;
import h5.espressif.esp32.module.model.other.ActivityResultCallback;
import h5.espressif.esp32.module.model.other.JSEvaluate;
import h5.espressif.esp32.module.web.AppApiForJS;
import libs.espressif.app.AppUtil;
import libs.espressif.log.EspLog;

@SuppressLint("SetJavaScriptEnabled")
public class MainWebHelper implements LifecycleObserver {
    private static final String ALIYUN_API_NAME = "aliyun";
    private static final String MESH_API_NAME = "espmesh";

    private static final String FILE_PHONE = "app";
    private static final String FILE_PAD = "ipad";

    private static final String NAME_WEB_PREF = "web";
    private static final String KEY_WEB_FILE = "load_file";

    private final EspLog mLog = new EspLog(getClass());

    private ViewGroup mWebForm;
    private WebView mWebView;

    private ImageView mCoverIV;

    private AppApiForJS mMeshApiForJS;
    private Object mAliApiForJS;
    private SparseArray<ActivityResultCallback> mAliRequests;

    private SharedPreferences mSharedPref;

    private volatile EspWebActivity mActivity;

    MainWebHelper(EspWebActivity activity) {
        mActivity = activity;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void onCreate() {
        mSharedPref = mActivity.getSharedPreferences(NAME_WEB_PREF, Context.MODE_PRIVATE);

        mCoverIV = mActivity.findViewById(R.id.web_cover);

        mWebForm = mActivity.findViewById(R.id.web_form);
        mWebView = new WebView(mActivity.getApplicationContext());
        int width = ViewGroup.LayoutParams.MATCH_PARENT;
        int height = ViewGroup.LayoutParams.MATCH_PARENT;
        ViewGroup.MarginLayoutParams mlp = new ViewGroup.MarginLayoutParams(width, height);
        mWebForm.addView(mWebView, mlp);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                if (Objects.equals(uri.getHost(), Customer.INSTANCE.getHomeUrl())) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    mActivity.startActivity(intent);
                } else {
                    view.loadUrl(url);
                }

                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
            }
        });
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setTextZoom(100);

        if (AppUtil.isPad(mActivity)) {
            mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            mWebView.loadUrl(getUrl(FILE_PAD));
        } else {
            mActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            String file = mSharedPref.getString(KEY_WEB_FILE, FILE_PHONE);
            mWebView.loadUrl(getUrl(file));
        }
        mMeshApiForJS = new AppApiForJS(mActivity);
        mWebView.addJavascriptInterface(mMeshApiForJS, MESH_API_NAME);

        mAliRequests = new SparseArray<>();
        initAliApi();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void onDestroy() {
        mWebForm.removeAllViews();
        mWebView.removeJavascriptInterface(MESH_API_NAME);
        mWebView.removeJavascriptInterface(ALIYUN_API_NAME);
        mWebView.destroy();
        mMeshApiForJS.release();
        releaseAliApi();

        mActivity = null;
    }

    @SuppressLint("JavascriptInterface")
    private void initAliApi() {
        try {
            Class<?> aliApiCls = Class.forName("aliyun.espressif.mesh.web.AliApiForJS");
            Constructor constructor = aliApiCls.getConstructor(Context.class, JSEvaluate.class);
            mAliApiForJS = constructor.newInstance(mActivity.getApplicationContext(), new JSEvaluate() {
                @Override
                public void evaluateJavascript(String script) {
                    mActivity.evaluateJavascript(script);
                }

                @Override
                public void startActivity(@NonNull Class cls, @Nullable Intent extras,
                                          @Nullable ActivityResultCallback callback) {
                    Intent intent = new Intent(mActivity, cls);
                    if (extras != null) {
                        intent.putExtras(extras);
                    }
                    Runnable runnable;
                    if (callback == null) {
                        runnable = () -> mActivity.startActivity(intent);
                    } else {
                        int code;
                        while (true) {
                            code = (int) SystemClock.currentThreadTimeMillis();
                            if (mAliRequests.indexOfKey(code) < 0) {
                                mAliRequests.put(code, callback);
                                break;
                            }
                        }
                        int requestCode = code;
                        runnable = () -> mActivity.startActivityForResult(intent, requestCode);
                    }
                    mActivity.runOnUiThread(runnable);
                }
            });

            mWebView.addJavascriptInterface(mAliApiForJS, ALIYUN_API_NAME);
            mLog.d("Add AliApiForJS success");
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException
                | InstantiationException | InvocationTargetException e) {
            mLog.w("Create AliApiForJS instance failed");
        }
    }

    private void releaseAliApi() {
        if (mAliApiForJS == null) {
            return;
        }

        try {
            Class<?> aliApiCls = Class.forName("aliyun.espressif.mesh.web.AliApiForJS");
            Method mothod = aliApiCls.getMethod("release");
            mothod.invoke(mAliApiForJS);
            mLog.d("Release AliApiForJS success");
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException
                | InvocationTargetException e) {
            mLog.w("Release AliApiForJS failed");
        }
    }

    void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (mActivity == null) {
            return;
        }

        ActivityResultCallback callback = mAliRequests.get(requestCode);
        if (callback != null) {
            mAliRequests.remove(requestCode);
            callback.onActivityResult(requestCode, resultCode, data);
        }
    }

    private String getUrl(String file) {
        return String.format("file:///android_asset/web/%s.html", file);
    }

    void evaluateJavascript(String script) {
        if (mActivity != null) {
            mWebView.evaluateJavascript(script, null);
        }
    }

    void hideCoverImage() {
        mActivity.runOnUiThread(() -> mCoverIV.setVisibility(View.GONE));
    }

    boolean isOTAing() {
        return mMeshApiForJS != null && mMeshApiForJS.isOTAing();
    }

    void loadFile(String file) {
        mSharedPref.edit().putString(KEY_WEB_FILE, file).apply();
        mActivity.runOnUiThread(() -> mWebView.loadUrl(getUrl(file)));
    }

    void newWebView(String url) {
        mActivity.runOnUiThread(() -> {
            Intent intent = new Intent(mActivity, EspExtendWebActivity.class);
            intent.putExtra("url", url);
            mActivity.startActivity(intent);
        });
    }
}
