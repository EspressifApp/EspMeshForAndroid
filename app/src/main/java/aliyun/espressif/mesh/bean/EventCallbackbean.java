package aliyun.espressif.mesh.bean;

import java.util.List;

public class EventCallbackbean {

    /**
     * iotId : aLhmAKRJKh93PkyvVuwW0010956000
     * groupIdList : ["DEFAULT_FOR_VIRTUAL"]
     * groupId : DEFAULT_FOR_VIRTUAL
     * tenantId : 3BB89AD985E84DC483BF64F2027EC76C
     * thingType : VIRTUAL
     * batchId : f3ced9b601a74af9875179756123a67d
     * gmtCreate : 1529571741439
     * productKey : a1AzoSi5TMc
     * items : {"LightSwitch":{"time":1529571741436,"value":1},"NightLightSwitch":{"time":1529571741436,"value":1},"HSVColor":{"time":1529571741436,"value":{"Saturation":100,"Value":100,"Hue":14}}}
     */

    private String iotId;
    private String groupId;
    private String tenantId;
    private String thingType;
    private String batchId;
    private long gmtCreate;
    private String productKey;
    private ItemsBean items;
    private List<String> groupIdList;

    public String getIotId() {
        return iotId;
    }

    public void setIotId(String iotId) {
        this.iotId = iotId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getThingType() {
        return thingType;
    }

    public void setThingType(String thingType) {
        this.thingType = thingType;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public long getGmtCreate() {
        return gmtCreate;
    }

    public void setGmtCreate(long gmtCreate) {
        this.gmtCreate = gmtCreate;
    }

    public String getProductKey() {
        return productKey;
    }

    public void setProductKey(String productKey) {
        this.productKey = productKey;
    }

    public ItemsBean getItems() {
        return items;
    }

    public void setItems(ItemsBean items) {
        this.items = items;
    }

    public List<String> getGroupIdList() {
        return groupIdList;
    }

    public void setGroupIdList(List<String> groupIdList) {
        this.groupIdList = groupIdList;
    }

    public static class ItemsBean {
        /**
         * LightSwitch : {"time":1529571741436,"value":1}
         * NightLightSwitch : {"time":1529571741436,"value":1}
         * HSVColor : {"time":1529571741436,"value":{"Saturation":100,"Value":100,"Hue":14}}
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
             * time : 1529571741436
             * value : 1
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

        public static class NightLightSwitchBean {
            /**
             * time : 1529571741436
             * value : 1
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
             * time : 1529571741436
             * value : {"Saturation":100,"Value":100,"Hue":14}
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
                 * Saturation : 100
                 * Value : 100
                 * Hue : 14
                 */

                private int Saturation=999;
                private int Value=999;
                private int Hue=999;

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
