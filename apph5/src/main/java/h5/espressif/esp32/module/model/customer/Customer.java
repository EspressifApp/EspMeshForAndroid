package h5.espressif.esp32.module.model.customer;

import android.content.Context;

public enum Customer {
    INSTANCE;

    private static final String PKG_ESPRESSIF = "h5.espressif.esp32";
    private static final String PKG_WAC = "h5.wac.mesh";

    private String mIotKey;
    private String mHomeUrl;
    private int mManufacturerID;

    public void init(Context context) {
        switch (context.getPackageName()) {
            case PKG_ESPRESSIF: {
                init("39a073cf2be1672e272e57fff03ca744ad77abc8",
                        "www.espressif.com",
                        0x02E5);
                break;
            }
            case PKG_WAC: {
                init("c87e612245a90cde78b561276bdf0ee9e550f703",
                        "www.waclighting.com.cn",
                        0);
                break;
            }
        }

    }

    private void init(String iotKey, String homeUrl, int manufacturerID) {
        mIotKey = iotKey;
        mHomeUrl = homeUrl;
        mManufacturerID = manufacturerID;
    }

    public String getIotKey() {
        return mIotKey;
    }

    public String getHomeUrl() {
        return mHomeUrl;
    }

    public int getManufacturerID() {
        return mManufacturerID;
    }
}
