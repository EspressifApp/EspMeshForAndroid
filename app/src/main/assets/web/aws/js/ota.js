define(["vue","MINT", "Util", "txt!../../pages/ota.html" ],
    function(v, MINT, Util, ota) {

        var Ota = v.extend({

            template: ota,
            props: {
                iotId: {
                    type: String
                },
                deviceName: {
                    type: String
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    showBtn: false,
                    showNew: '',
                    showCurrent: "",
                    versionName: "",
                    upgradeStatus: -1,
                    isFail: false,
                    showUpgradeBtn: false,
                    failDesc: "",
                    failBtn: ""
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    window.onAliQueryDeviceUpgradeStatus = this.onAliQueryDeviceUpgradeStatus;
                    this.emptyData();
                    this.getUpgradeInfo();
                    this.addFlag = true;
                },
                startUpgrate: function() {
                    var self = this;
                    MINT.Indicator.open();
                    window.onAliUpgradeWifiDevice = self.onAliUpgradeWifiDevice;
                    setTimeout(function() {
                        aliyun.aliUpgradeWifiDevice(JSON.stringify([self.iotId]))
                    }, 1000)
                },
                emptyData: function() {
                    this.showNew = "";
                    this.showCurrent = "";
                    this.showBtn = false;
                    this.upgradeStatus = -1;
                    this.isFail = false;
                    this.showUpgradeBtn = false;
                    this.failDesc = "";
                    this.failBtn = "";
                },
                retry: function() {
                    this.emptyData();
                    if (this.upgradeStatus == 2 || this.upgradeStatus == 3) {
                        this.startUpgrate();
                    } else {
                        this.getUpgradeInfo();
                    }
                },
                getUpgradeInfo: function () {
                    var self = this;
                    MINT.Indicator.open();
                    setTimeout(function() {
                        aliyun.aliQueryDeviceUpgradeStatus(self.iotId);
                    }, 1000)

                },
                hide: function () {
                    this.$emit("otaShow");
                    this.addFlag = false;
                },
                getDate: function(time) {
                    if (!Util._isEmpty(time)) {
                        var date = new Date(time);
                        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                    }
                    return "";
                },
                onAliUpgradeWifiDevice: function (res) {
                    console.log(res);
                    var flag = true;
                    if (!Util._isEmpty(res) && res !== "{}") {
                        res = JSON.parse(res)
                        if (res.code == 200) {
                            this.getUpgradeInfo()
                        }
                    }
                    if (flag) {
                        MINT.Indicator.close();
                        MINT.Toast({
                            message: "升级失败",
                            position: 'bottom',
                        });
                    }
                },
                onAliQueryDeviceUpgradeStatus: function(res) {
                    setTimeout(function() {
                        MINT.Indicator.close();
                    }, 200)
                    console.log(res);
                    this.showBtn = true;
                    this.isFail = false;
                    this.upgradeStatus = -1;
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.code == 200) {
                            var otaFirmwareDTO = res.data.otaFirmwareDTO;
                            var otaUpgradeDTO = res.data.otaUpgradeDTO;
                            this.showNew = otaFirmwareDTO.version + " " + this.getDate(otaFirmwareDTO.timestamp);
                            this.showCurrent = otaFirmwareDTO.currentVersion + " " + this.getDate(otaFirmwareDTO.currentTimestamp);
                            this.upgradeStatus = otaUpgradeDTO.upgradeStatus;
                            if (this.upgradeStatus == 2) {
                                this.isFail = true;
                                this.failDesc = "设备升级异常，请重试";
                                this.failBtn = "重试";
                            } else if (this.upgradeStatus == 3) {
                                this.isFail = true;
                                this.failDesc = "设备升级失败，请重试";
                                this.failBtn = "重试";
                            } else {
                                this.isFail = false;
                            }
                        } else if (res.code == 8014) {
                            this.isFail = true;
                            this.failDesc = "获取固件信息失败，请重试";
                            this.failBtn = "重试";
                        }
                        this.showUpgradeBtn = true;
                    }
                }

            }

        });

        return Ota;
    });