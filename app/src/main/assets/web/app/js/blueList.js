define(["vue", "MINT", "Util", "txt!../../pages/blueList.html", "../js/blueConnect"],
    function(v, MINT, Util, blueList, blueConnect) {

        var BlueList = v.extend({
            template: blueList,
            data: function(){
                return {
                    flag: false,
                    blueList: [],
                    blueInfo: ""
                }
            },
            computed: {
                list: function() {
                    if (this.blueList.length > 0) {
                        MINT.Indicator.close();
                    }
                    return this.blueList;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.blueList = [];
                    window.onScanBLE = self.onConScanBLE;
                    window.onMeshBLEDeviceConnectionChanged = self.onMeshBLEDeviceConnectionChanged;
                    setTimeout(function() {
                        MINT.Indicator.open(self.$t("scanning"));
                        window.onBackPressed = self.hide;
                        self.startBleScan();
                    });
                    self.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    espmesh.stopBleScan();
                    MINT.Indicator.close();
                    this.$emit("blueListShow");
                },
                showBlue: function(item) {
                    var self = this;
                    self.blueInfo = item;
                    MINT.Indicator.open(self.$t("connetDeviceDesc"));
                    setTimeout(function() {
                        self.connectBlue(item);
                    }, 100)
                },
                connectBlue: function(item) {
                    espmesh.connectMeshBLEDevice(JSON.stringify({"address": item.mac}))
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
                hideParent: function() {
                    window.onBackPressed = this.hide;
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                getRssiIcon: function(rssi) {
                    return Util.getWIFIRssiIcon(rssi);
                },
                onConScanBLE: function(devices) {
                    var self = this;
                    devices = JSON.parse(devices);
                    devices = Util.blueNameDecode(self, devices);
                    $.each(devices, function(i, item) {
                        var name = item.name;
                        if(Util.isBeacon(name, item.version, item.beacon)) {
                            var flag = true,
                                obj = {mac: item.mac, name: Util.setName(name, item.bssid), rssi: item.rssi,
                                    bssid: item.bssid, tid: item.tid, only_beacon: item.only_beacon};
                            $.each(self.blueList, function(j, itemSub) {
                                if (item.mac == itemSub.mac) {
                                    if (item.rssi >= self.rssiValue) {
                                        self.blueList.splice(j, 1, obj);
                                    }
                                    flag = false;
                                    return false;
                                }
                            })
                            if (flag && !Util._isEmpty(obj)) {
                                self.blueList.push(obj);
                            }
                        }
                    })
                    window.onBackPressed = self.hide;
                },
                onMeshBLEDeviceConnectionChanged: function(res) {
                    var self = this;
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.connected) {
                            Util.toast(MINT, self.$t("connetSuccessDesc"))
                            setTimeout(function() {
                                self.$refs.blueConnect.show();
                            }, 100)
                        } else {
                           Util.toast(MINT, self.$t("connetFailDesc"))
                        }
                    } else {
                        Util.toast(MINT, self.$t("connetFailDesc"))
                    }

                }
            },
            components: {
                "v-blueConnect": blueConnect
            }

        });
        return BlueList;
    });