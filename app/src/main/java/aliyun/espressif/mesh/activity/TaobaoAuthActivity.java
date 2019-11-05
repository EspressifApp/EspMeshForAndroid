package aliyun.espressif.mesh.activity;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import aliyun.espressif.mesh.AliInitialize;
import aliyun.espressif.mesh.constants.AliConstants;
import h5.espressif.esp32.R;
import libs.espressif.app.AppUtil;

public class TaobaoAuthActivity extends AppCompatActivity {
    private ViewGroup mWebForm;
    private WebView mWebView;

    private String mAuthCode;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (AppUtil.isPad(this)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
        setContentView(R.layout.taobao_auth_activity);

        mWebForm = findViewById(R.id.web_form);
        mWebView = new WebView(getApplicationContext());
        int width = ViewGroup.LayoutParams.MATCH_PARENT;
        int height = ViewGroup.LayoutParams.MATCH_PARENT;
        ViewGroup.MarginLayoutParams mlp = new ViewGroup.MarginLayoutParams(width, height);
        mWebForm.addView(mWebView, mlp);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                setTitle(view.getTitle());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                setTitle(view.getTitle());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (isTokenUrl(url)) {
                    onAuthCodeGot();
                    return true;
                }
                view.loadUrl(url, request.getRequestHeaders());
                return false;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (isTokenUrl(url)) {
                    onAuthCodeGot();
                    return true;
                }
                view.loadUrl(url);
                return false;
            }
        });

        String redirectUri = getIntent().getStringExtra(AliConstants.KEY_REDIRECT_URI);
        try {
            redirectUri = URLEncoder.encode(redirectUri, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        String url = "https://oauth.taobao.com/authorize?response_type=code&client_id=" + AliInitialize.APP_KEY
                + "&redirect_uri=" + redirectUri + "&view=wap";
        mWebView.loadUrl(url);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        mWebForm.removeView(mWebView);
        mWebView.destroy();
    }

    private boolean isTokenUrl(String url) {
        if (!TextUtils.isEmpty(url)) {
            if ( url.contains("code=")) {
                String[] urlArray = url.split("code=");
                if (urlArray.length > 1) {
                    String[] paramArray = urlArray[1].split("&");
                    if (paramArray.length > 1) {
                        mAuthCode = paramArray[0];
                        Log.i("TaobaoAuth", "AuthCode= " + mAuthCode);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private void onAuthCodeGot() {
        Intent intent = new Intent();
        intent.putExtra(AliConstants.KEY_AUTH_CODE, mAuthCode);
        setResult(RESULT_OK, intent);
        finish();
    }

}
