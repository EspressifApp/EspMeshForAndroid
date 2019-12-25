define(["vue", "MINT", "Util", "txt!../../pages/resetDevice.html", "./addDevice",
    "./blueFail"],
    function(v, MINT, Util, resetDevice, addDevice, blueFail) {

    var ResetDevice = v.extend({

        template: resetDevice,

        data: function(){
            return {
                addFlag: false,
                showDesc: false,
                showBlue: false,
                blueEnable: false,
                flagUl: false,
                scanDeviceList: [],
                scanOldList: [],
                scanMacs: [],
                resetId: "resetDevice-id",
                importId: "reset-import-id",
                selectAllId: "resetDevice-select-id",
                count: 0,
                selected: 0,
                searchReset: "",
                resetPairList: [],
                rssiMin: -120,
                rssiMax: -40,
                rssiValue: -80,
                showFilter: false,
                showHeight: false,
                isSelectedMacs: [],
                showFooterInfo: true,
                systemInfo: true,
            }
        },
        computed: {
            list: function () {
                var self = this, list = [], deviceList = [];
                if (self.addFlag) {
                    self.scanDeviceList = self.$store.state.scanDeviceList;
                    $.each(self.scanDeviceList, function(i, item) {
                        if (item.beacon == BEACON_MAY) {
                            deviceList.push(item);
                        }
                    })
                    if (Util._isEmpty(self.searchReset)) {
                        $.each(deviceList, function(i, item) {
                            if (item.rssi >= self.rssiValue) {
                                list.push(item);
                            }
                        });
                    } else {
                        $.each(deviceList, function(i, item) {
                            if ((item.name.indexOf(self.searchReset) != -1 || item.position.indexOf(self.searchReset) != -1 )
                                && item.rssi >= self.rssiValue) {
                                list.push(item);
                            }
                        })
                    }

                    if (self.showFilter) {
                        var macList = [];
                        $.each(list, function(i, item) {
                            if (self.scanMacs.indexOf(item.mac) > -1) {
                                macList.push(item);
                            }
                        })
                        list = macList;
                    }
                    if ($("#" + self.selectAllId).hasClass("active")) {
                        var allMacs = [];
                        $.each(list, function(i, item) {
                            allMacs.push(item.mac);
                        })
                        self.isSelectedMacs = allMacs;
                    }
                    self.count = list.length;
                    setTimeout(function() {
                        var docs = $("#" + self.resetId + " span.span-radio.active");
                        self.selected = docs.length;
                    });
                }
                return list;
            }

        },
        methods:{
            show: function() {
                var self = this;
                window.onLoadMacs = self.onLoadMacs;
                if (self.$store.state.systemInfo != "Android") {
                    self.systemInfo = false;
                }
                self.getLoadMacs();
                self.getPair();
                self.scanDeviceList = [];
                self.isSelectedMacs = [];
                self.$store.commit("setScanDeviceList", self.scanDeviceList);
                self.setScanList(self.scanDeviceList);
                self.selected = self.count = self.scanDeviceList.length;
                self.rssiValue = self.$store.state.rssiInfo;
                self.searchReset =  "";
                self.showFilter = false;
                self.showHeight = false;
                self.flagUl = false;
                self.showFooterInfo = true;
                self.blueEnable = self.$store.state.blueInfo;
                self.showBlue = false;
                self.initResetSlider();
                setTimeout(function() {
                    self.onBackReset();
                    window.onBluetoothStateChanged = self.onBluetoothStateChanged;
                    $("#" + self.selectAllId).addClass("active");
                });
                self.addFlag = true;
                var oHeight = $(document).height();     //获取当前窗口的高度
                $(window).resize(function () {
                    if ($(document).height() >= oHeight) {
                        self.showFooterInfo = true;
                    } else {
                        self.showFooterInfo = false;
                    }
                })
            },
            showBlueFail: function() {
                var self = this;
                setTimeout(function() {
                    self.showBlue = true;
                    self.$refs.blueFail.show();
                })

            },
            setBluetooth: function() {
                espmesh.gotoSystemSettings("bluetooth");
            },
            setLocation: function() {
                 espmesh.gotoSystemSettings("location");
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getRssiIcon: function(rssi) {
                return Util.getRssiIcon(rssi);
            },
            getPair: function() {
                this.resetPairList = this.$store.state.siteList;
            },
            getPairInfo: function(mac) {
                var self = this, position = "";
                var staMac = Util.staMacForBleMacs([mac]);
                if (staMac.length > 0) {
                    $.each(self.resetPairList, function(i, item) {
                        if (item.mac == staMac[0]) {
                            position = item.floor + "-" + item.area + "-" + item.code;
                            return false;
                        }
                    });
                }
                return position;
            },
            hide: function () {
                this.$store.commit("setShowScanBle", true);
                this.$emit("resetShow");
                espmesh.stopBleScan();
                this.addFlag = false;
            },
            hideParent: function () {
                this.addFlag = false;
                this.$parent.conReload();
            },
            getLoadMacs: function() {
                espmesh.loadMacs();
            },
            onLoadMacs: function(res) {
                this.scanMacs = JSON.parse(res);
            },
            importDevice: function() {
                this.flagUl = false;
                this.$refs.import.show();
            },
            initResetSlider: function() {
                var self = this;
                setTimeout(function() {
                    $("#resetSlider").slider({
                        range: "min",
                        step: 1,
                        min: self.rssiMin,
                        max: self.rssiMax,
                        value: self.rssiValue,
                        slide: function(event, ui) {
                            self.rssiValue = ui.value;
                            self.$store.commit("setRssi", self.rssiValue);
                        },
                        stop: function(event, ui) {
                            self.rssiValue = ui.value;
                            self.$store.commit("setRssi", self.rssiValue);
                        }
                    })
                })
            },
            showHeightFun: function() {
                this.showHeight = !this.showHeight;
            },
            showFilterFun: function() {
                this.showFilter = !this.showFilter;
            },
            saveScanMac: function(mac) {
                var self = this,
                    index = self.scanMacs.indexOf(mac);
                if (index > -1) {
                    espmesh.deleteMac(mac);
                    self.scanMacs.splice(index, 1);
                } else {
                    espmesh.saveMac(mac);
                    self.scanMacs.push(mac);
                }
                self.getLoadMacs();
            },
            showMark: function(mac) {
                var flag = false;
                if (this.scanMacs.indexOf(mac) > -1) {
                    flag = true;
                }
                return flag;
            },
            onBackReset: function () {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                espmesh.stopBleScan();
                setTimeout(function() {
                    self.startBleScan();
                    window.onScanBLE = self.onConScanBLE;
                })
                self.showBlue = false;
                window.onBackPressed = self.hide;
            },
            addDevice: function () {
                var self = this, flag = false;
                if (self.selected > 0) {
                    espmesh.stopBleScan();
                    var docs = $("#" + self.resetId + " span.span-radio.active"),
                        macs = [], list = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    $.each(self.scanDeviceList, function(i, item) {
                        if (macs.indexOf(item.mac) != -1) {
                            list.push(item);
                            if (!item.only_beacon) {
                                flag = true;
                            }
                        }
                    });
                    if (flag) {
                        self.$store.commit("setScanDeviceList", list);
                        self.$refs.device.show();
                    } else {
                        MINT.Toast({
                            message: self.$t('noConfigDesc'),
                            position: 'bottom',
                        });
                    }

                }
            },
            getPosition: function(position) {
                var str = Util.getPosition(position);
                if (!Util._isEmpty(str)) {
                    return str;
                } else {
                    return "N/A";
                }
            },
            showDescInfo: function () {
                this.showDesc = true;
                window.onBackPressed = this.hideDescInfo;
            },
            hideDescInfo: function () {
                this.showDesc = false;
                window.onBackPressed = this.hide;
            },
            selectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num == -1) {
                    this.isSelectedMacs.push(mac);
                } else {
                    this.isSelectedMacs.splice(num, 1);
                }
                this.selected = this.isSelectedMacs.length;
            },
            isSelected: function(mac) {
                var self = this,
                    flag = false;
                if (self.isSelectedMacs.indexOf(mac) != -1) {
                    flag = true;
                }
                return flag;
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget).find("span.span-radio")[0];
                if ($(doc).hasClass("active")) {
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    this.selected = this.count;
                    var allMacs = [];
                    $.each(this.scanDeviceList, function(i, item) {
                        allMacs.push(item.mac);
                    })
                    this.isSelectedMacs = allMacs;
                }
            },
            distance: function(rssi) {
                return Util.distance(rssi);
            },
            startBleScan: function() {
                var self = this;
                if (self.$store.state.blueInfo) {
                    espmesh.startBleScan(JSON.stringify({"settings":{"scan_mode":2}}));
                } else {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
            setScanList: function(devices) {
                var self = this;
                $.each(devices, function(i, item) {
                    var name = item.name;
                    if(Util.isCloud(name, item.version, item.beacon)) {
                        var flag = true,
                            obj = Util.assemblyObject(item, self);
                        $.each(self.scanDeviceList, function(j, itemSub) {
                            if (item.mac == itemSub.mac) {
                                if (item.rssi >= self.rssiValue) {
                                    self.scanDeviceList.splice(j, 1, obj);
                                }
                                flag = false;
                                return false;
                            }
                        })
                        if (flag && !Util._isEmpty(obj)) {
                            self.scanDeviceList.push(obj);
                        }
                    }

                })
                self.$store.commit("setScanDeviceList", self.scanDeviceList);
            },
            onConScanBLE: function (devices) {
                var self = this;
                devices = JSON.parse(devices);
                devices = Util.blueNameDecode(self, devices);
                self.setScanList(devices);
                if (self.showDesc) {
                    window.onBackPressed = self.hideDescInfo;
                } else if (self.showBlue) {
                     window.onBackPressed = self.$refs.blueFail.hide;
                } else {
                    window.onBackPressed = self.hide;
                }
            },
            onBluetoothStateChanged: function(blue) {
                blue = JSON.parse(blue);
                if (blue.enable || blue.enable == "true") {
                    blue.enable = true;
                } else {
                    blue.enable = false;
                }
                if (blue.enable && this.addFlag && !this.$refs.device.addFlag) {
                    espmesh.startBleScan(JSON.stringify({"settings":{"scan_mode":2}}));
                }
                this.$store.commit("setBlueInfo", blue.enable);
                this.blueEnable = blue.enable;
            }
        },
        components: {
            "v-addDevice": addDevice,
            "v-blueFail": blueFail
        }


    });

    return ResetDevice;
});