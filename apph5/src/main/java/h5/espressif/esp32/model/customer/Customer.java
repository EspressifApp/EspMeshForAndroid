package h5.espressif.esp32.model.customer;

import android.content.Context;

public enum Customer {
    INSTANCE;

    private String mIotKey;
    private String mHomeUrl;
    private int mManufacturerID;

    public void init(Context context) {
        switch (context.getPackageName()) {
            case "h5.espressif.esp32": {
                mIotKey = "39a073cf2be1672e272e57fff03ca744ad77abc8";
                mHomeUrl = "www.espressif.com";
                mManufacturerID = 0x02E5;
                break;
            }
            case "h5.wac.mesh": {
                mIotKey = "c87e612245a90cde78b561276bdf0ee9e550f703";
                mHomeUrl = "";
                mManufacturerID = 0;
                break;
            }
        }

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
