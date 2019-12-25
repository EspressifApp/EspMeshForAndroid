define(["vue", "MINT", "Common", "Util", "txt!../../pages/deviceIbeacon.html", "../js/ibeacon"],
    function(v, MINT, Common, Util, deviceTypeInfo, ibeacon) {

        var DeviceTypeInfo = v.extend({
            template: deviceTypeInfo,
            data: function(){
                return {
                    flag: false,
                    ibeaconList: this.$store.state.ibeaconList,
                    infoShow: false,
                    deviceInfo: ""
                }
            },
            computed: {
                list: function () {
                    var self = this, list = [], macs = [];
                    if (self.flag) {
                        self.ibeaconList = this.$store.state.ibeaconList;
                        $.each(self.ibeaconList, function(i, item) {
                            if (macs.indexOf(item.bssid) == -1) {
                                macs.push(item.bssid)
                            }
                        })
                        var deviceList = this.$store.state.deviceList;
                        $.each(deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) != -1) {
                                list.push(item);
                            }
                        })
                    }
                    return list;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.ibeaconList = self.$store.state.ibeaconList;
                    self.deviceInfo = "";
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                        window.onScanBLE = self.onConScanBLE;
                        Common.startBleScan(self);
                    });
                    self.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("deviceIbeaconShow");
                    Common.stopBleScan();
                },
                getBxColor: function(layer) {
                    return Util.getBxColor(layer);
                },
                showIbeacon: function(item) {
                    var self = this;
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
                },
                onConScanBLE: function(devices) {
                    var self = this;
                    devices = JSON.parse(devices);
                    $.each(devices, function(i, item) {
                        var name = item.name;
                        if(Util.isBeacon(name, item.version, item.beacon)) {
                            var flag = true;
                            $.each(self.ibeaconList, function(j, itemSub) {
                                if (item.mac == itemSub.mac) {
                                    self.ibeaconList.splice(j, 1, item);
                                    flag = false;
                                    return false;
                                }
                            })
                            if (flag) {
                                self.ibeaconList.push(item);
                            }
                        }
                    })
                    self.$store.commit("setIbeaconList", self.ibeaconList);
                }
            },
            components: {
                "v-ibeacon": ibeacon
            }

        });
        return DeviceTypeInfo;
    });