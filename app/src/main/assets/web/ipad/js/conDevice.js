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
            }
        },
        data: function(){
            return {
                addFlag: false,
                value: 0,
                title: this.$t('connetDeviceTitle'),
                desc: this.$t('connetDeviceDesc'),
                textList: [],
                wifiInfo: {},
                count: 0,
                success: true
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                window.onConfigureProgress = this.onConfigureProgress;
                window.onScanBLE = this.onConScanBLE;
                window.espmesh.stopBleScan();
                this.wifiInfo = this.$store.state.wifiInfo;
                this.addFlag = true;
                this.value = 0;
                this.count = 0;
                this.textList = [];
                this.conWifi();
            },
            hide: function () {
                this.addFlag = false;
                window.espmesh.stopConfigureBlufi();
                this.$emit("conShow");
            },
            conWifi: function () {
                var self = this,
                    scanDeviceList = self.$store.state.scanDeviceList,
                    scanMacs = [], rssi = -1000, rssiMac = "", version = -1;
                window.espmesh.startBleScan();
                self.success = true;
                self.title = self.$t('connetDeviceTitle');
                self.desc = self.$t('connetDeviceDesc');
                setTimeout(function () {
                    window.espmesh.stopBleScan();
                    if (self.rssiList.length != 0) {
                        $.each(scanDeviceList, function(i, item) {
                            scanMacs.push(item.bssid);
                        });
                        $.each(self.rssiList, function(i, item) {
                            var itemRssi = item.rssi;
                            if (itemRssi != 0 && itemRssi > rssi && scanMacs.indexOf(item.bssid) > -1) {
                                rssi = itemRssi;
                                rssiMac = item.mac;
                                version = item.version;
                            }
                        })
                        var data = {"ble_addr": rssiMac,"ssid": self.wifiName,"password": self.password,
                           "white_list": scanMacs, "mesh_id": self.convert(self.meshId),"version": version};
                        console.log(JSON.stringify(data));
                        console.log(JSON.stringify(scanMacs));
                        console.log(scanMacs.length);
                        window.espmesh.saveMeshId(self.meshId);
                        window.espmesh.startConfigureBlufi(JSON.stringify(data));
                    } else {
                        self.setFail(self.$t('farDeviceDesc'));
                    }

                }, 4000);

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
                    if (Util.isMesh(item.name, item.version)) {
                        list.push(item);
                    }
                })
                self.rssiList = list;
            },
            onConfigureProgress: function(config) {
                var self = this;
                config = JSON.parse(config);
                if (config.code >= 100 && config.code != 200) {
                    if (config.progress >= self.value) {
                        self.value = config.progress;
                    }
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    window.onConfigureProgress = self.onConfigureProgress;
                } else if (config.code == 200) {
                    self.value = config.progress;
                    if (self.textList.indexOf(config.message) < 0) {
                        self.textList.push(config.message);
                    }
                    self.desc = self.$t('connetSuccessDesc');
                    window.espmesh.stopBleScan();
                    window.espmesh.clearBleCache();
                    self.$store.commit("setScanDeviceList", []);
                    self.count = 0;
                    setTimeout(function() {
                        self.hide();
                        self.$parent.hideParent();
                    }, 1000);
                } else {
                    if (config.code == -20) {
                        self.setFail(config.message)
                    } else {
                        if (self.count < 3) {
                            self.count++;
                            setTimeout(function() {
                                self.conWifi();
                            }, 2000);
                        } else {
                             if (config.code == 1) {
                                 self.setFail(self.$t('conRouteFailDesc'))
                             } else if (config.code == 2) {
                                 self.setFail(self.$t('pwdFailDesc'))
                             } else {
                                 self.setFail(config.message)
                             }
                        }
                    }

                }
            },
            setFail: function(msg) {
                var self = this;
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