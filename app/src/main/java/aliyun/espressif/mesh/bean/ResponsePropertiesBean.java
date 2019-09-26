package aliyun.espressif.mesh.bean;

public class ResponsePropertiesBean {


    /**
     * code : 200
     * data : {"LightSwitch":{"time":1529397167898,"value":0},"NightLightSwitch":{"time":1529397167898,"value":0},"HSVColor":{"time":1529397167898,"value":{"Saturation":0,"Value":0,"Hue":0}}}
     * id : af1aab6a-4742-445c-9991-1ad47426c72d
     */

    private int code;
    private DataBean data;
    private String id;

    public ResponsePropertiesBean(int code, DataBean data, String id) {
        this.code = code;
        this.data = data;
        this.id = id;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public DataBean getData() {
        return data;
    }

    public void setData(DataBean data) {
        this.data = data;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public static class DataBean {
        /**
         * LightSwitch : {"time":1529397167898,"value":0}
         * NightLightSwitch : {"time":1529397167898,"value":0}
         * HSVColor : {"time":1529397167898,"value":{"Saturation":0,"Value":0,"Hue":0}}
         */

        private LightSwitchBean LightSwitch;
        private NightLightSwitchBean NightLightSwitch;
        private HSVColorBean HSVColor;

        public LightSwitchBean getLightSwitch() {
            return LightSwitch;
        }

        public void setLightSwitch(LightSwitchBean LightSwitch) {
            this.LightSwitch = LightSwitch;
        }

        public NightLightSwitchBean getNightLightSwitch() {
            return NightLightSwitch;
        }

        public void setNightLightSwitch(NightLightSwitchBean NightLightSwitch) {
            this.NightLightSwitch = NightLightSwitch;
        }

        public HSVColorBean getHSVColor() {
            return HSVColor;
        }

        public void setHSVColor(HSVColorBean HSVColor) {
            this.HSVColor = HSVColor;
        }

        public static class LightSwitchBean {
            /**
             * time : 1529397167898
             * value : 0
             */
            private long time;
            private int value;

            public LightSwitchBean( int value) {
                this.value = value;
            }

            public long getTime() {
                return time;
            }

            public void setTime(long time) {
                this.time = time;
            }

            public int getValue() {
                return value;
            }

            public void setValue(int value) {
                this.value = value;
            }
        }

        public static class NightLightSwitchBean {
            /**
             * time : 1529397167898
             * value : 0
             */

            private long time;
            private int value;

            public long getTime() {
                return time;
            }

            public void setTime(long time) {
                this.time = time;
            }

            public int getValue() {
                return value;
            }

            public void setValue(int value) {
                this.value = value;
            }
        }

        public static class HSVColorBean {
            /**
             * time : 1529397167898
             * value : {"Saturation":0,"Value":0,"Hue":0}
             */

            private long time;
            private ValueBean value;

            public long getTime() {
                return time;
            }

            public void setTime(long time) {
                this.time = time;
            }

            public ValueBean getValue() {
                return value;
            }

            public void setValue(ValueBean value) {
                this.value = value;
            }

            public static class ValueBean {
                /**
                 * Saturation : 0
                 * Value : 0
                 * Hue : 0
                 */

                private int Saturation;
                private int Value;
                private int Hue;

                public int getSaturation() {
                    return Saturation;
                }

                public void setSaturation(int Saturation) {
                    this.Saturation = Saturation;
                }

                public int getValue() {
                    return Value;
                }

                public void setValue(int Value) {
                    this.Value = Value;
                }

                public int getHue() {
                    return Hue;
                }

                public void setHue(int Hue) {
                    this.Hue = Hue;
                }
            }
        }
    }
}
