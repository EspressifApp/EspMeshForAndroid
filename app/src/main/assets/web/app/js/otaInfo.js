define(["vue", "MINT", "Util", "txt!../../pages/otaInfo.html" ], function(v, MINT, Util, otaInfo) {

    var OtaInfo = v.extend({
        template: otaInfo,
        props: {
            macs: {
                type: Array
            },
            otaId: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                upgrade: false,
                httpUrl: false,
                downloadShow: false,
                upgradeSuccess: false,
                upgradeFailure: false,
                upgradeValue: 0,
                otaType: 1,
                otaDeviceList: [],
                otaList: [],
                scheduleList: [],
                successMacs: [],
                failMacs: [],
                binUrl: "",
                bin: "",
                timeCost: "00:00:00",
                timeCostId: "",
                scheduleId: "",
                showPart: false,
                showDetails: false,
                showFooterInfo: true,
            }
        },
        computed: {
            progressList: function () {
                var self = this;
                if (this.addFlag) {
                    var list = this.scheduleList,
                        deviceList = this.$store.state.deviceList;
                    if (deviceList.length == 0) {
                        self.stopUpgrade();
                    }
                    return list;
                }
            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                window.onGetUpgradeFiles = self.onGetUpgradeFiles;
                window.onDownloadLatestRom = self.onDownloadLatestRom;
                self.otaList = [];
                self.successMacs = [];
                self.upgradeSuccess = false;
                self.upgrade = false;
                self.upgradeFailure = false;
                self.showPart = false;
                self.showDetails = false;

                self.downloadShow = false;
                self.timeCost = "00:00:00";
                self.timeCostId = "";
                self.scheduleId = "";
                self.failMacs = [];
                self.otaType = 1;
                self.upgradeValue = 0;
                self.scheduleList = [];
                self.bin = "";
                self.binUrl = BIN_URL;
                $("span.upgrade-progress-value").text(self.upgradeValue+"%");
                $("div.upgradeProgress").css("width", self.upgradeValue+"%");
                $("#"+ self.otaId+ " span.span-radio").removeClass("active");
                self.getFiles();
                setTimeout(function() {
                    self.getList();
                }, 500);
                self.initType();
                window.onOTAProgressChanged = this.onOTAProgressChanged;
                window.onOTAResult = this.onOTAResult;
                self.addFlag = true;
                self.showFooterInfo = true;

                var oHeight = $(document).height();     //获取当前窗口的高度
                $(window).resize(function () {
                    if ($(document).height() >= oHeight) {
                        self.showFooterInfo = true;
                    } else {
                        self.showFooterInfo = false;
                    }
                })
            },
            initType: function() {
                var self = this,
                    deviceList = this.$store.state.deviceList;
                self.otaType = 1;
                $.each(deviceList, function(i, item) {
                    if (self.macs.indexOf(item.mac) != -1) {
                        if (item.mlink_version > 1) {
                            self.otaType = 2;
                            return false;
                        }
                    }
                })
            },
            hide: function () {
                this.addFlag = false;
                this.hideSuccess();
                this.stopTime();
                this.stopOTA();
                console.log("stopOTA");
                this.$store.commit("setShowScanBle", true);
                this.$emit("otaShow");
            },
            otaReboot: function() {
                var self = this;
                self.stopTime();
                var data = JSON.stringify({"host": self.$store.state.deviceIp, "macs": self.successMacs});
                if (self.otaType == 1) {
                    espmesh.otaReboot(data);
                } else {
                    espmesh.reboot(data)
                }
                self.hide();
            },
            stopUpgrade: function() {
                this.stopTime();
                this.hideSuccess();
                this.stopOTA();
            },
            stopOTA: function() {
                espmesh.stopOTA(JSON.stringify({"host": [this.$store.state.deviceIp]}));
            },
            getList: function() {
                var self = this,
                    list = self.$store.state.deviceList;
                self.otaDeviceList = [];
                $.each(list, function(i, item) {
                    if (self.macs.indexOf(item.mac) > -1) {
                        self.otaDeviceList.push(item);
                    }
                });
            },
            getName: function(mac) {
                var self = this, name = "";
                $.each(self.otaDeviceList, function(i, item) {
                    if (item.mac == mac) {
                        name = item.name;
                        return false;
                    }
                })
                return name;
            },
            getFiles: function() {
                espmesh.getUpgradeFiles();
            },
            onGetUpgradeFiles: function(res) {
                var self = this;
                self.otaList = [];
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    $.each(res, function (i, item) {
                        self.otaList.push({id: item, name: self.getBin(item)});
                    });
                };
            },
            getBin: function(item) {
                var num = item.lastIndexOf("/")+1,
                    str = item.slice(num);
                return str;
            },
            hideSuccess: function () {
                var self = this;
                self.upgradeSuccess = false;
                self.showPart = false;
                self.upgrade = false;
                self.upgradeFailure = false;
                self.showDetails = false;
                $("span.upgrade-progress-value").text("0%");
                $("div.upgradeProgress").css("width", "0%");
                self.stopOTA();
                window.onBackPressed = self.hide;
            },
            downloadBin: function () {
                var self= this;
                MINT.Indicator.open();
                setTimeout(function() {
                    espmesh.downloadLatestRom();
                }, 1000);

            },
            onDownloadLatestRom: function(res) {
                var self = this;
                console.log(res);
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    MINT.Indicator.close();
                    if (res.download) {
                        self.getFiles();
                        self.upgradeValue = 0;
                        window.onBackPressed = self.hide;
                        MINT.MessageBox.confirm(self.$t('downloadSuccessDesc')+ res.name, "",
                            {confirmButtonText: self.$t('upgradeBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            self.upgrade = true;
                            self.httpUrl = false;
                            self.bin = res.file;
                            self.initType();
                            setTimeout(function() {
                                espmesh.startOTA(JSON.stringify({"bin": self.bin, "host": self.$store.state.deviceIp,
                                    "macs": self.macs, "type": self.otaType}));
                                self.getTime();
                            }, 100);
                        });
                    } else {
                        MINT.MessageBox.confirm(self.$t('downloadFailDesc'), "",
                            {confirmButtonText: self.$t('tryAgainBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            setTimeout(function(){
                                self.downloadBin();
                            }, 10);
                        });
                    }
                }

            },
            enterBinUrl: function() {
                var self = this;
                self.httpUrl = true;
                self.upgradeValue = 0;
                self.upgrade = false;
                window.onBackPressed = self.hideUrl;
            },
            sendUrl: function() {
                var self = this;
                self.httpUrl = false;
                self.upgrade = true;
                self.bin = self.binUrl;
                setTimeout(function() {
                    self.otaType = 3;
                    console.log(JSON.stringify({"bin": self.binUrl, "macs": self.macs, "type": self.otaType}));
                    espmesh.startOTA(JSON.stringify({"bin": self.binUrl, "host": self.$store.state.deviceIp,
                        "macs": self.macs, "type": self.otaType}));
                    self.getTime();
                    console.log(self.upgradeValue);
                    self.setSchedule();
                }, 1000);
            },
            getTime: function() {
                var self = this;
                self.timeCost = "00:00:00";
                var time = 0;
                self.timeCostId = setInterval(function() {
                    time ++;
                    if (time < 60 ) {
                        self.timeCost = "00:00:" + self.getSecond(time);
                    } else if (time < 3600 ) {
                        var m = (time / 60).toFixed(0);
                        var s = time % 60;
                        self.timeCost = "00:" + self.getMinute(m) + ":" + self.getSecond(s);
                    } else {
                        var h = (time / 3600).toFixed(0);
                        var m = (time % 3600 / 60).toFixed(0);
                        var s = (time % 60);
                        self.timeCost = self.getHour(h) + ":" + self.getMinute(m) + ":" + self.getSecond(s);
                    }
                }, 1000)
            },
            getSecond: function(time) {
                var second = 0;
                if (time < 10) {
                    second= "0" + time;
                } else if (time < 60 ) {
                    second = time;
                }
                return second;
            },
            getMinute: function(time) {
                var minute = 0;
                if (time < 10) {
                    minute= "0" + time;
                } else if (time < 60 ) {
                    minute = time;
                }
                return minute;
            },
            getHour: function(time) {
                var hour = 0;
                if (time < 10) {
                    hour= "0" + time;
                } else {
                    hour = time;
                }
                return hour;
            },
            showDetailsFun: function() {
                this.showDetails = !this.showDetails;
            },
            stopTime: function() {
                var self = this;
                clearInterval(self.timeCostId);
            },
            save: function () {
                var self = this,
                    deviceList = self.$store.state.deviceList;
                self.upgradeSuccess = false;
                self.upgradeFailure = false;
                self.showPart = false;
                self.upgradeValue = 0;
                self.successMacs = [];
                self.failMacs = [];
                window.onBackPressed = "";
                var existMacs = [];
                self.initType();
                var bin = self.bin;
                $.each(deviceList, function(i, item) {
                    if (self.macs.indexOf(item.mac) != -1) {
                        existMacs.push(item.mac);
                    }
                })
                if (existMacs.length == 0) {
                    Util.toast(MINT, self.$t('deviceNoExistDesc'));
                    self.hideSuccess();
                    return false;
                }
                if (!Util._isEmpty(bin)) {
                    self.upgrade = true;
                    self.initType();
                    setTimeout(function() {
                        console.log(JSON.stringify({"bin": bin, "macs": self.macs, "type": self.otaType}));
                        espmesh.startOTA(JSON.stringify({"bin": bin, "host": self.$store.state.deviceIp,
                            "macs": self.macs, "type": self.otaType}));
                        self.getTime();
                    }, 100);
                }
            },
            retrySave: function () {
                var self = this,
                    deviceList = self.$store.state.deviceList;
                $("span.upgrade-progress-value").text("0%");
                $("div.upgradeProgress").css("width", "0%");
                self.upgradeValue = 0;
                self.upgradeFailure = false;
                self.upgradeSuccess = false;
                self.upgradeFailure = false;
                self.showPart = false;
                if (!Util._isEmpty(self.bin)) {
                    var existMacs = [];
                    $.each(deviceList, function(i, item) {
                        if (self.failMacs.indexOf(item.mac) != -1) {
                            existMacs.push(item.mac);
                        }
                    })
                    if (existMacs.length == 0) {
                        Util.toast(MINT, self.$t('deviceNoExistDesc'));
                        self.hideSuccess();
                        return false;
                    }
                    self.stopTime();
                    self.getTime();
                    self.upgrade = true;
                    if (self.otaType == 3) {
                        self.setSchedule();
                    }
                    setTimeout(function() {
                        console.log(JSON.stringify({"bin": self.bin, "macs": self.failMacs, "type": self.otaType}));
                        espmesh.startOTA(JSON.stringify({"bin": self.bin, "host": self.$store.state.deviceIp,
                            "macs": self.failMacs, "type": self.otaType}));
                    }, 100);
                }
            },
            hideUpgrade: function () {
                if (this.upgradeFailure) {
                    this.upgrade = false;
                    this.upgradeFailure = false;
                    this.showPart = false;
                    $("span.upgrade-progress-value").text("0%");
                    $("div.upgradeProgress").css("width", "0%");
                }
            },
            hideUrl: function() {
                this.httpUrl = false;
                window.onBackPressed = this.hide;
            },
            setSchedule: function() {
                var self = this;
                self.scheduleId = setInterval(function() {
                    console.log(self.upgradeValue);
                    if (self.upgradeValue >= 49 || self.upgradeFailure) {
                        clearInterval(self.scheduleId);
                    } else {
                        self.upgradeValue += 2;
                        $("span.upgrade-progress-value").text(self.upgradeValue+"%");
                        $("div.upgradeProgress").css("width", self.upgradeValue+"%");
                        self.setProgress(self.upgradeValue);
                    }
                }, 2000)
            },
            setProgress: function(progress) {
                var self = this;
                self.scheduleList = [];
                $.each(self.macs, function(i, item) {
                    self.scheduleList.push({mac: item, progress: progress});
                })
            },
            onOTAProgressChanged: function (schedule) {
                var self = this;
                var count = 0;
                console.log(schedule);
                if (!Util._isEmpty(schedule)) {
                    console.log(schedule);
                    schedule = JSON.parse(schedule);
                    self.scheduleList = schedule;
                    $.each(schedule, function(i, item) {
                        count += parseInt(item.progress);
                    });
                    var num = parseInt(count / schedule.length);
                    if (self.upgradeValue >= 0 && self.upgradeValue <= num) {
                        if (num >= 99) {
                            self.upgradeValue = 99;
                        } else {
                            self.upgradeValue = num;
                        }
                    }
                    console.log(self.upgradeValue);
                    $("span.upgrade-progress-value").text(self.upgradeValue+"%");
                    $("div.upgradeProgress").css("width", self.upgradeValue+"%");

                }
            },
            onOTAResult: function(result) {
                var self = this;
                console.log(result);
                self.stopTime();
                if (!Util._isEmpty(result)) {
                    result = JSON.parse(result);
                    $.each(result, function(i, item) {
                        if (self.successMacs.indexOf(item) < 0) {
                            self.successMacs.push(item);
                        }
                    })
                    if (result.length > 0) {
                        self.upgradeValue = 100;
                        $("span.progress-value").text("100%");
                        $("div.ota-progress-progress").css("width", "100%");
                        if (self.macs.length == 1 && self.otaType != 1) {
                            self.setProgress(100);
                        }
                        $.each(self.scheduleList, function(i, item) {
                            if (self.successMacs.indexOf(item.mac) != -1) {
                                item.progress = 100;
                                self.scheduleList.splice(i, 1, item);
                            } else {
                                item.progress = 0;
                                self.scheduleList.splice(i, 1, item);
                            }
                        });
                        if (self.successMacs.length >= self.otaDeviceList.length) {
                            self.upgradeFailure = false;
                            self.upgradeSuccess = true;
                            self.showPart = false;
                        } else {
                            self.upgradeFailure = false;
                            self.upgradeSuccess = false;
                            self.showPart = true;
                            self.getFailDevices(result);
                        }

                    } else {
                        self.showPart = false;
                        self.upgradeSuccess = false;
                        self.upgradeFailure = true;
                        self.getFailDevices(result);
                    }
                } else {
                    self.upgradeFailure = true;
                    clearInterval(self.scheduleId);
                }
            },
            getFailDevices: function(result) {
                var self = this, failMacs = [], failList = [];
                $.each(self.scheduleList, function(i, item) {
                    if (result.indexOf(item.mac) < 0) {
                        item.progress = 0;
                        failList.push(item);
                    }
                });
                self.scheduleList = failList;
                $.each(self.otaDeviceList, function(i, item) {
                    if (result.indexOf(item.mac) < 0) {
                        failMacs.push(item.mac);
                    }
                });
                self.failMacs = failMacs;
            },
            selectDevice: function (bin) {
                if (this.bin == bin) {
                    this.bin = "";
                } else {
                    this.bin = bin;
                }
            }
        },
        created: function () {
             window.onOTAProgressChanged = this.onOTAProgressChanged;
             window.onOTAResult = this.onOTAResult;
        },

    });
    return OtaInfo;
});