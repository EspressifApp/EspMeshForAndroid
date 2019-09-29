package aliyun.espressif.mesh;

import android.app.Application;
import android.content.Context;
import android.util.Log;

import androidx.core.os.LocaleListCompat;

import com.alibaba.wireless.security.jaq.SecurityInit;
import com.aliyun.alink.alirn.RNGlobalConfig;
import com.aliyun.alink.business.devicecenter.extbone.BoneAddDeviceBiz;
import com.aliyun.alink.business.devicecenter.extbone.BoneHotspotHelper;
import com.aliyun.alink.business.devicecenter.extbone.BoneLocalDeviceMgr;
import com.aliyun.alink.linksdk.channel.mobile.api.MobileChannel;
import com.aliyun.alink.linksdk.channel.mobile.api.MobileConnectConfig;
import com.aliyun.alink.linksdk.tmp.TmpSdk;
import com.aliyun.alink.linksdk.tmp.api.OutputParams;
import com.aliyun.alink.linksdk.tmp.api.TmpInitConfig;
import com.aliyun.alink.linksdk.tmp.listener.IDevListener;
import com.aliyun.alink.linksdk.tmp.utils.ErrorInfo;
import com.aliyun.alink.page.rn.InitializationHelper;
import com.aliyun.alink.sdk.jsbridge.BonePluginRegistry;
import com.aliyun.iot.aep.sdk.apiclient.IoTAPIClientImpl;
import com.aliyun.iot.aep.sdk.apiclient.emuns.Env;
import com.aliyun.iot.aep.sdk.apiclient.hook.IoTAuthProvider;
import com.aliyun.iot.aep.sdk.credential.IoTCredentialProviderImpl;
import com.aliyun.iot.aep.sdk.credential.IotCredentialManager.IoTCredentialManageImpl;
import com.aliyun.iot.aep.sdk.log.ALog;
import com.aliyun.iot.aep.sdk.login.LoginBusiness;
import com.aliyun.iot.aep.sdk.login.oa.OALoginAdapter;
import com.aliyun.iot.breeze.api.Config;
import com.aliyun.iot.breeze.api.Factory;
import com.aliyun.iot.breeze.api.IBreeze;
import com.facebook.react.FrescoPackage;

import java.util.Locale;

import h5.espressif.esp32.BuildConfig;

public final class AliInitialize {
    private final static String TAG = "AliInitialize";

    public static final String APP_KEY = "26063463";

    public static void initAliyun(Application application) {
        initAPi(application);
        initLongConn(application);
        initLogin(application);
        initAuth(application);
        initBreeze(application);
        initDeviceModel(application);
        initBoneMobile(application);
    }

    private static void initAPi(Context context) {
        try {
            SecurityInit.Initialize(context.getApplicationContext());
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, "security-sdk-initialize-failed");
        }

        // 初始化 IoTAPIClient
        IoTAPIClientImpl.InitializeConfig config = new IoTAPIClientImpl.InitializeConfig();
        // 国内环境
        config.host = "api.link.aliyun.com";
        // 海外环境，请参考如下设置
        //config.host = “api-iot.ap-southeast-1.aliyuncs.com”;
        config.apiEnv = Env.RELEASE; //只支持RELEASE
        //设置请求超时（可选）默认超时时间10s
        config.connectTimeout = 10_000L;
        config.readTimeout = 10_000L;
        config.writeTimeout = 10_000L;

        IoTAPIClientImpl impl = IoTAPIClientImpl.getInstance();
        impl.init(context.getApplicationContext(), config);
    }

    private static void initLogin(Context context) {
        OALoginAdapter adapter = new OALoginAdapter(context.getApplicationContext());
        adapter.init("online", "114d");
        LoginBusiness.init(context.getApplicationContext(), adapter, "online");
    }

    private static void initAuth(Application application) {
        IoTCredentialManageImpl.init(APP_KEY);
        IoTCredentialManageImpl ioTCredentialManage = IoTCredentialManageImpl.getInstance(application);
        IoTAuthProvider provider = new IoTCredentialProviderImpl(ioTCredentialManage);
        IoTAPIClientImpl.getInstance().registerIoTAuthProvider("iotAuth", provider);
    }

    private static void initLongConn(Context context) {
        ALog.setLevel(ALog.LEVEL_DEBUG);

        MobileConnectConfig config = new MobileConnectConfig();
        // 设置 appKey 和 authCode(必填)
        config.appkey = APP_KEY;
        config.securityGuardAuthcode = "114d";


        // 设置验证服务器（默认不填，SDK会自动使用“API通道SDK“的Host设定）
//        config.authServer = "";

        // 指定长连接服务器地址。 （默认不填，SDK会使用默认的地址及端口。默认为国内华东节点。）
//        config.channelHost = "{长连接服务器域名}";

        // 开启动态选择Host功能。 (默认false，海外环境建议设置为true。此功能前提为ChannelHost 不特殊指定。）
        config.autoSelectChannelHost = false;

        MobileChannel.getInstance().startConnect(context.getApplicationContext(), config, state -> {
            ALog.d(TAG, "onConnectStateChange(), state = " + state.toString());
            switch (state) {
                case CONNECTING:
                    break;
                case CONNECTED:
                    break;
                case CONNECTFAIL:
                    break;
                case DISCONNECTED:
                    break;
            }
        });
    }

    private static void initBreeze(Context context) {
        IBreeze breeze = Factory.createBreeze(context.getApplicationContext());
        Config config = new Config.Builder()
                .debug(BuildConfig.DEBUG)
                .log(BuildConfig.DEBUG)
                .logLevel(BuildConfig.DEBUG ? Log.VERBOSE : Log.WARN)
                .build();
        breeze.configure(config);
    }

    private static void initDeviceModel(Application application) {
        TmpSdk.init(application.getBaseContext(), new TmpInitConfig(TmpInitConfig.ONLINE));
        TmpSdk.getDeviceManager().discoverDevices(null, 5000, new IDevListener() {
            @Override
            public void onSuccess(Object o, OutputParams outputParams) {
                Log.d(TAG, "discoverDevices success " + o + " , param= " + outputParams);
            }

            @Override
            public void onFail(Object o, ErrorInfo errorInfo) {
                Log.d(TAG, "discoverDevices fail " + o + " , error= " + errorInfo.toString());
            }
        });
    }

    private static void initBoneMobile(Application application) {
        //语言环境，目前支持中文“zh-CN”, 英文"en-US"，法文"fr-FR",德文"de-DE",日文"ja-JP",韩文"ko-KR"
        // ,西班牙文"es-ES",俄文"ru-RU"，八种语言
        String language = null;

        LocaleListCompat localeList = LocaleListCompat.getDefault();
        for (int i = 0; i < localeList.size(); i++) {
            Locale locale = LocaleListCompat.getDefault().get(i);
            String localeLanguage = locale.getLanguage();
            if ("zh".equalsIgnoreCase(localeLanguage)) {
                language = "zh-CN";
            } else if ("en".equalsIgnoreCase(localeLanguage)) {
                language = "en-US";
            } else if ("fr".equalsIgnoreCase(localeLanguage)) {
                language = "fr-FR";
            } else if ("de".equalsIgnoreCase(localeLanguage)) {
                language = "de-DE";
            } else if ("ja".equalsIgnoreCase(localeLanguage)) {
                language = "ja-JP";
            } else if ("ko".equalsIgnoreCase(localeLanguage)) {
                language = "ko-KR";
            } else if ("es".equalsIgnoreCase(localeLanguage)) {
                language = "es-ES";
            } else if ("ru".equalsIgnoreCase(localeLanguage)) {
                language = "ru-RU";
            }

            if (language != null) {
                break;
            }
        }
        if (language == null) {
            language = "en-US";
        }

        String serverEnv = "production";//仅支持"production",即生产环境
        String pluginEnv = "release";//仅支持“release”

        // 初始化 BoneMobile RN 容器
        InitializationHelper.initialize(application, pluginEnv, serverEnv, language);
        // 添加基于 Fresco 的图片组件支持
        RNGlobalConfig.addBizPackage(new FrescoPackage());

        BonePluginRegistry.register("BoneAddDeviceBiz", BoneAddDeviceBiz.class);
        BonePluginRegistry.register("BoneLocalDeviceMgr", BoneLocalDeviceMgr.class);
        BonePluginRegistry.register("BoneHotspotHelper", BoneHotspotHelper.class);
    }
}
