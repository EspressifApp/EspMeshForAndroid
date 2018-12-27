define(["vue", "MINT", "txt!../../pages/deviceType.html", "../js/deviceTypeInfo"],
    function(v, MINT, deviceType, deviceTypeInfo) {

        var DeviceType = v.extend({
            template: deviceType,

            data: function(){
                return {
                    flag: false,
                    deviceList: this.$store.state.deviceList,
                    switchNum: 0,
                    sensorNum: 0,
                    lightNum: 0,
                    otherNum: 0,
                    typeTile: "",
                    showCount: false,
                    minTid: 0,
                    maxTid: 0,
                }
            },
            computed: {
                count: function () {
                    var self = this;
                    self.deviceList = self.$store.state.deviceList;
                    self.switchNum = 0;
                    self.sensorNum = 0;
                    self.lightNum = 0;
                    self.otherNum = 0;
                    $.each(self.deviceList, function(i, item) {
                        var tid = item.tid;
                        if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                            self.switchNum++;
                        } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                            self.sensorNum++;
                        } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                            self.lightNum++;
                        } else {
                            self.otherNum++;
                        }
                    });
                    return self.deviceList.length;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.deviceList = self.$store.state.deviceList;
                    window.onBackPressed = self.hide;
                    this.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("deviceTypeShow");
                },
                hideParent: function () {
                    setTimeout(function() {
                        clearTimeout(SCAN_DEVICE);
                    });
                    espmesh.stopBleScan();
                    window.onBackPressed = this.hide;
                },
                switchType: function() {
                    var self = this;
                    if (self.switchNum > 0) {
                        self.typeTile = self.$t('switch');
                        self.minTid = MIN_SWITCH;
                        self.maxTid = MAX_SWITCH;
                        setTimeout(function() {
                            self.showTypeInfo();
                        });
                    }
                },
                sensorType: function() {
                    var self = this;
                    if (self.sensorNum > 0) {
                        self.typeTile = self.$t('sensor');
                        self.minTid = MIN_SENSOR;
                        self.maxTid = MAX_SENSOR;
                        setTimeout(function() {
                            self.showTypeInfo();
                        });
                    }

                },
                lightType: function() {
                    var self = this;
                    if (self.lightNum > 0) {
                        self.typeTile = self.$t('light');
                        self.minTid = MIN_LIGHT;
                        self.maxTid = MAX_LIGHT;
                        setTimeout(function() {
                            self.showTypeInfo();
                        });
                    }

                },
                otherType: function() {
                    var self = this;
                    if (self.otherNum > 0) {
                        self.typeTile = self.$t('other');
                        self.minTid = MIN_OTHER;
                        self.maxTid = MAX_OTHER;
                        setTimeout(function() {
                            self.showTypeInfo();
                        });
                    }

                },
                showTypeInfo: function() {
                    this.$refs.typeInfo.show();
                },


            },
            components: {
                "v-deviceTypeInfo": deviceTypeInfo
            }

        });

        return DeviceType;
    });