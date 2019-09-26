define(["vue", "MINT", "Util", "txt!../../pages/conDevice.html"], function(v, MINT, Util, conDevice) {

    var ConDevice = v.extend({

        template: conDevice,
        props: {
            meshId: {
                type: String
            },
            wifiName: {
                type: String
            },
            password: {
                type: String
            },
            moreObj: {
                type: Object
            }
        },
        data: function(){
            return {
                addFlag: false,
                value: 0,
                title: this.$t('connetDeviceTitle'),
                desc: this.$t('connetDeviceDesc'),
                textList: [],
                rssiList: [],
                wifiInfo: {},
                count: 0,
                success: true,
                timerId: "",
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                window.onConfigureProgress = this.onConfigureProgress;
                window.onScanBLE = this.onConScanBLE;
                espmesh.stopBleScan();
                this.wifiInfo = this.$store.state.wifiInfo;
                console.log(JSON.stringify(this.wifiInfo));
                this.addFlag = true;
                this.value = 0;
                this.count = 0;
                this.textList = [];
                this.rssiList = [];
                this.conWifi();
            },
            hide: function () {
                this.addFlag = false;
                espmesh.stopBleScan();
                espmesh.stopConfigureBlufi();
                this.$emit("conShow");
            },
            conWifi: function () {
                var self = this,
                    scanDeviceList = self.$store.state.scanDeviceList,
                    scanMacs = [], rssi = -1000, rssiMac = "", version = -1;
                espmesh.startBleScan();
                self.setStartTimer();
                self.success = true;
                self.title = self.$t('connetDeviceTitle');
                self.desc = self.$t('connetDeviceDesc');
                setTimeout(function () {
                    espmesh.stopBleScan();
                    if (self.rssiList.length != 0) {
                        $.each(scanDeviceList, function(i, item) {
                            scanMacs.push(item.bssid);
                        });
                        $.each(self.rssiList, function(i, item) {
                            var itemRssi = item.rssi;
                            if (itemRssi != 0 && itemRssi > rssi && scanMacs.indexOf(item.bssid) != -1 &&
                                !item.only_beacon) {
                                rssi = itemRssi;
                                rssiMac = item.mac;
                                version = item.version
                            }
                        })
                        if (Util._isEmpty(rssiMac)) {
                            self.setFail(self.$t('farDeviceDesc'));
                            return false;
                        }
                        var data = {"ble_addr": rssiMac, "ssid": self.wifiName,"password": self.password,
                            "white_list": scanMacs, "bssid": self.wifiInfo.bssid, "mesh_id": self.convert(self.meshId),
                            "version": version};
                        data = Object.assign(data, self.moreObj)
                        espmesh.saveMeshId(self.meshId);
                        espmesh.startConfigureBlufi(JSON.stringify(data));
                    } else {
                        self.setFail(self.$t('farDeviceDesc'));
                    }
                }, 5000);

            },
            setStartTimer: function() {
                var self = this;
                self.timerId = setInterval(function() {
                    if (!self.addFlag) {
                        clearInterval(self.timerId);
                        self.timerId = '';
                    }
                    if (self.value < 5) {
                        self.value += 1;
                    } else {
                        clearInterval(self.timerId);
                        self.timerId = '';
                    }
                }, 1000)
            },
            convert: function(bssid) {
                var strs = bssid.split(":"), meshIds = [];
                for (var i = 0; i < strs.length; i++ ) {
                    meshIds.push(parseInt(strs[i], 16));
                }
                return meshIds;
            },
            onConScanBLE: function (devices) {
                var self = this, list = [];
                devices = JSON.parse(devices);
                $.each(devices, function(i, item) {
                    if (Util.isMesh(item.name, item.version, item.beacon)) {
                        list.push(item);
                    }
                })
                self.rssiList = list;
            },
            onConfigureProgress: function(config) {
                var self = this;
                console.log(config);
                config = JSON.parse(config);
                if (config.code < 400 && config.code > 300) {
                    if (config.progress >= self.value) {
                        self.value = config.progress;
                    }
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    window.onConfigureProgress = self.onConfigureProgress;
                } else if (config.code == 300) {
                    self.value = config.progress;
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    self.desc = self.$t('connetSuccessDesc');
                    espmesh.stopBleScan();
                    espmesh.clearBleCache();
                    self.$store.commit("setScanDeviceList", []);
                    self.count = 0;
                    MINT.Toast({
                        message: self.$t('connetSuccessDesc'),
                        position: 'bottom',
                    });
                    setTimeout(function() {
                        self.hide();
                        self.$parent.hideParent();
                        console.log("成功");
                    }, 3000);
                } else {
                    if (config.code == -20) {
                        self.setFail(config.message);
                    } else if (config.code == 1) {
                        self.setFail(self.$t('conRouteFailDesc'));
                    } else if (config.code == 16) {
                        self.setFail(self.$t('pwdFailDesc'));
                    } else if (config.code == 17) {
                        self.setFail("AP not found");
                    } else if (config.code == 18) {
                        self.setFail("AP forbid");
                    } else if (config.code == 19) {
                        self.setFail("Configure data error");
                    } else if (self.count < 3) {
                        self.count++;
                        setTimeout(function() {
                            self.conWifi();
                        }, 2000);
                    } else {
                        self.setFail(config.message);
                    }

                }
            },
            setFail: function(msg) {
                var self = this;
                espmesh.stopBleScan();
                espmesh.stopConfigureBlufi();
                self.success = false;
                self.title = self.$t('connetFailDesc');
                self.desc = msg;
                self.value = 0;
                self.count = 0;
                self.textList = [];
                window.onConfigureProgress = self.onConfigureProgress;
            }
        }
    });

    return ConDevice;
});
