define(["vue", "MINT", "Common", "Util", "txt!../../pages/resetDevice.html", "./addDevice", "./importDevice",
    "./blueFail"],
    function(v, MINT, Common, Util, resetDevice, addDevice, importDevice, blueFail) {

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
                sliderId: "reset-slider-id",
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
                var self = this, list = [];
                if (self.addFlag) {
                    self.scanDeviceList = self.$store.state.scanDeviceList;
                    if (Util._isEmpty(self.searchReset)) {
                        $.each(self.scanDeviceList, function(i, item) {
                            if (item.rssi >= self.rssiValue) {
                                list.push(item);
                            }
                        });
                    } else {
                        $.each(self.scanDeviceList, function(i, item) {
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
                Common.initBlueShow(this);
            },
            showFlag: function() {
                this.flagUl = !this.flagUl;
                if (this.flagUl) {
                    window.onBackPressed = this.hideFlag;
                } else {
                    this.onBackReset();
                }
            },
            showBlueFail: function() {
                var self = this;
                setTimeout(function() {
                    self.showBlue = true;
                    self.$refs.blueFail.show();
                })

            },
            setBluetooth: function() {
                Util.gotoSystemSettings("bluetooth")
            },
            setLocation: function() {
                Util.gotoSystemSettings("location")
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getRssiIcon: function(rssi) {
                return Util.getRssiIcon(rssi);
            },
            hideFlag: function() {
                if (this.flagUl) {
                    this.flagUl = false;
                    this.showBlue = false;
                    this.onBackReset();
                }
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
                Common.stopBleScan();
                this.addFlag = false;
            },
            hideParent: function () {
                this.addFlag = false;
                this.$parent.conReload();
            },
            getLoadMacs: function() {
                Common.getLoadMacs()
            },
            onLoadMacs: function(res) {
                this.scanMacs = JSON.parse(res);
            },
            importDevice: function() {
                this.flagUl = false;
                this.$refs.import.show();
            },
            initResetSlider: function() {
               Common.initResetSlider(this);
            },
            showHeightFun: function() {
                this.showHeight = !this.showHeight;
            },
            showFilterFun: function() {
                this.showFilter = !this.showFilter;
            },
            saveScanMac: function(mac) {
                Common.saveScanMac(this, mac)
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
                Common.stopBleScan();
                setTimeout(function() {
                    Common.startBleScan(self, 2)
                    window.onScanBLE = self.onConScanBLE;
                })
                self.showBlue = false;
                window.onBackPressed = self.hide;
            },
            addDevice: function () {
                if (this.selected > 0) {
                    Common.jumpNetwork(this)
                }
            },
            getPosition: function(position) {
                return Util.getPositionOrNA(position);
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
                Common.selectMac(this, mac);
            },
            isSelected: function(mac) {
                return Common.isSelected(this.isSelectedMacs, mac);
            },
            selectAllDevice: function (e) {
                Common.selectAllDevice(this, this.scanDeviceList, e);
            },
            distance: function(rssi) {
                return Util.distance(rssi);
            },
            setScanList: function(devices) {
               Common.setScanList(this, devices);
            },
            onConScanBLE: function (devices) {
                Common.onConScanBLE(this, devices);
            },
            onBluetoothStateChanged: function(blue) {
                Common.onBluetoothStateChanged(this, blue);
                if (this.blueEnable && this.addFlag && !this.$refs.device.addFlag) {
                    Common.startBleScan(this, 2)
                }
            }
        },
        components: {
            "v-addDevice": addDevice,
            "v-importDevice": importDevice,
            "v-blueFail": blueFail
        }
    });

    return ResetDevice;
});