define(["vue", "MINT", "Util", "txt!../../pages/deviceIbeacon.html", "../js/ibeacon"],
    function(v, MINT, Util, deviceTypeInfo, ibeacon) {

        var DeviceTypeInfo = v.extend({
            template: deviceTypeInfo,
            data: function(){
                return {
                    flag: false,
                    deviceList: this.$store.state.deviceList,
                    infoShow: false,
                    deviceInfo: "",
                    searchName: '',
                    selectId: ''
                }
            },
            computed: {
                list: function () {
                    var self = this, list = [];
                    self.deviceList = this.$store.state.deviceList;
                    return self.deviceList;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.deviceList = self.$store.state.deviceList;
                    self.deviceInfo = "";
                    if (self.deviceList.length > 0) {
                        self.showIbeacon(self.deviceList[0])
                    }
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                    });
                    setTimeout(function() {
                        Util.setStatusBarWhite();
                    }, 200)
                    self.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    Util.setStatusBarBlue();
                    this.$emit("deviceIbeaconShow");
                },
                getBxColor: function(layer) {
                    return Util.getBxColor(layer);
                },
                showIbeacon: function(item) {
                    var self = this;
                    self.selectId = item.mac;
                    self.deviceInfo = item;
                    setTimeout(function() {
                        self.$refs.ibeacon.show();
                    }, 100)
                },
                hideParent: function() {
                    window.onBackPressed = this.hide;
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                getColor: function (characteristics, tid) {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
                    $.each(characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    })
                    if (status == STATUS_ON) {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }
                    if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                        rgb = "#3ec2fc";
                    }
                    return rgb;
                },
                getRssiIcon: function(rssi) {
                    return Util.getWIFIRssiIcon(rssi);
                }
            },
            components: {
                "v-ibeacon": ibeacon
            }

        });
        return DeviceTypeInfo;
    });