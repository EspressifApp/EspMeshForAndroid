package aliyun.espressif.mesh.bean;

import android.util.Log;

public class RequestPropertiesBean {
    public RequestPropertiesBean() {
    }

    private String iotId;
    private Items items;

    public RequestPropertiesBean(String iotId, Items items) {
        this.iotId = iotId;
        this.items = items;
    }

    public void setIotId(String iotId) {
        this.iotId = iotId;
    }

    public void setItems(Items items) {
        this.items = items;
    }

    public String getIotId() {
        return iotId;
    }

    public Items getItems() {
        return items;
    }

    public static class Items {
        private int LightSwitch, NightLightSwitch;
        private Items.HSVColor HSVColor;

        public Items(Items.HSVColor HSVColor) {
            this.HSVColor = HSVColor;
        }

        public Items(int lightSwitch, int nightLightSwitch) {
            LightSwitch = lightSwitch;
            NightLightSwitch = nightLightSwitch;
        }

        public void setLightSwitch(int lightSwitch) {
            LightSwitch = lightSwitch;
        }

        public int getLightSwitch() {
            return LightSwitch;
        }

        public int getNightLightSwitch() {
            return NightLightSwitch;
        }

        public Items.HSVColor getHSVColor() {
            return HSVColor;
        }

        public void setNightLightSwitch(int nightLightSwitch) {
            NightLightSwitch = nightLightSwitch;
        }

        public void setHSVColor(Items.HSVColor HSVColor) {
            this.HSVColor = HSVColor;
        }

        public Items(int lightSwitch, int nightLightSwitch, Items.HSVColor HSVColor) {
            LightSwitch = lightSwitch;
            NightLightSwitch = nightLightSwitch;
            this.HSVColor = HSVColor;
        }

        public static class HSVColor {
            private int Hue, Saturation, Value;

            public HSVColor(double h, double s, double v) {
                Hue = (int) (h * 100);
                this.Saturation = (int) (s * 100);
                Value = (int) (v * 100);
            }

            public HSVColor(float[] hsv) {
                Hue = (int) (hsv[0] * 100);
                Saturation = (int) (hsv[1] * 100);
                Value = (int) (hsv[2] * 100);
                Log.d("HSVColor", "Hue:" + Hue);
                Log.d("HSVColor", "Saturation:" + Saturation);
                Log.d("HSVColor", "Value:" + Value);
            }
        }
    }


}
