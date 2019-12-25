define(["vue", "MINT", "Util", "txt!../../pages/selectDevice.html", "../js/ota"],
    function(v, MINT, Util, selectDevice, ota) {

    var SelectDevice = v.extend({

        template: selectDevice,
        data: function(){
            return {
                flag: false,
                iotId: '',
                otaList: [],
                deviceName: '',
                searchName: "",
                selected: 0,
                topStatus: "",
                pullLoad: false,
                loadShow: false,
                count: 0,
                deviceInfo: "",
                isSelectedMacs: []
            }
        },
        computed: {
            list: function() {
                var self = this;
                if (Util._isEmpty(self.searchName)) {
                    return self.otaList;
                }
                var list = [];
                self.otaList.forEach(function(item) {
                    if (item.deviceName.indexOf(self.searchName) != -1) {
                        list.push(item);
                    }
                })
                console.log(JSON.stringify(list));
                return list;
            }
        },
        methods:{
            show: function() {
                this.onBackSelectDevice();
                this.getAliOTAUpgradeDeviceList(true);
                this.flag = true;
            },
            handleTopChange: function (status) {
                this.topStatus = status;
                if (this.pullLoad) {
                    $(".mint-loadmore-content").addClass("pullLoad");
                    this.topStatus = "loading";
                    this.$refs.loadmore.topStatus = "loading";
                } else {
                    $(".mint-loadmore-content").removeClass("pullLoad");
                }

            },
            getAliOTAUpgradeDeviceList: function(flag) {
                window.onGetAliOTAUpgradeDeviceList = this.onGetAliOTAUpgradeDeviceList;
                if (flag) {
                    MINT.Indicator.open();
                }
                setTimeout(function() {
                    aliyun.getAliOTAUpgradeDeviceList();
                }, 500)
            },
            loadTop: function() {
                var self = this;
                self.pullLoad = true;
                self.otaList = [];
                setTimeout(function() {
                    self.getAliOTAUpgradeDeviceList(false);
                }, 50);
            },
            hide: function () {
                this.flag = false;
                this.$emit("selectDeviceShow");
                MINT.Indicator.close();
                this.$parent.getAliOTAUpgradeDeviceList();
            },
            onBackSelectDevice: function () {
                window.onBackPressed = this.hide;
            },
            showOta: function(iotId, name) {
                var self = this;
                if (!self.pullLoad) {
                    self.iotId = iotId;
                    self.deviceName = name;
                    setTimeout(function() {
                        self.$refs.ota.show();
                    }, 100)
                }
            },
            startUpgrate: function() {
                var self = this;
                MINT.Indicator.open();
                window.onAliUpgradeWifiDevice = self.onAliUpgradeWifiDevice;
                setTimeout(function() {
                    console.log(JSON.stringify(self.isSelectedMacs));
                    aliyun.aliUpgradeWifiDevice(JSON.stringify(self.isSelectedMacs))
                }, 1000)
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
                if (this.isSelectedMacs.length === this.count) {
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    this.selected = this.count;
                    var allMacs = [];
                    $.each(this.otaList, function(i, item) {
                        allMacs.push(item.iotId);
                    })
                    this.isSelectedMacs = allMacs;
                }
            },
            getAliStatus: function(status) {
                return Util.getAliStatus(status);
            },
            onAliUpgradeWifiDevice: function (res) {
                console.log(res);
                MINT.Indicator.close();
                var flag = true;
                if (!Util._isEmpty(res) && res !== "{}") {
                    res = JSON.parse(res)
                    if (res.code == 200) {
                        MINT.Toast({
                            message: "请点击的单个设备查看升级详情",
                            position: 'bottom',
                        });
                        flag = false;
                    }
                }
                if (flag) {
                    MINT.Toast({
                        message: "升级失败",
                        position: 'bottom',
                    });
                }
            },
            onGetAliOTAUpgradeDeviceList: function(res) {
                console.log(res);
                var self = this;
                self.otaList = [];
                var iotIds = [];
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.data.length > 0) {
                        res.data.forEach(function(item) {
                            if (item.status == 1 && iotIds.indexOf(item.iotId) == -1) {
                                iotIds.push(item.iotId);
                                self.otaList.push(item);
                            }
                        })
                    }
                }
                self.pullLoad = false;
                MINT.Indicator.close();
                self.$refs.loadmore.onTopLoaded();
            },
            onGetAliOTAIsUpgradingDeviceList: function(res) {
                console.log(res);
            }
        },
        components: {
            "v-ota": ota
        }

    });

    return SelectDevice;
});