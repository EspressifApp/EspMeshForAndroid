define(["vue", "MINT", "Common", "Util", "txt!../../pages/index.html", "../js/footer", "./resetDevice",
"./operateDevice", "./addGroup", "./load", "./aboutDevice", "./otaInfo", "./automation",
 "./ibeacon", "./scanDevice", "./remind", "./attr", "./setDevicePair", "./joinDevice", "./command",
 "./sendIP", "./blueFail", "./wifiFail", "./config", "./newVersion", "./guide", "./car"],
    function(v, MINT, Common, Util, index, footer, resetDevice, operateDevice, addGroup, load, aboutDevice,
        otaInfo, automation, ibeacon, scanDevice, remind, attr, setDevicePair, joinDevice, command,
        sendIP, blueFail, wifiFail, config, newVersion, guide, car) {

    var Index = v.extend({

        template: index,

        data: function(){
            return {
                flag: false,
                device: "device",
                addGroupId: "device-addGroup",
                colorId: "device-color",
                temperatureId: "device-temperature",
                otaDeviceId: "ota-device-id",
                deviceList: [],
                deviceInfo: "",
                name: "",
                loadDesc: "",
                infoShow: false,
                topStatus: "",
                groupName: "",
                powerFlag: false,
                showAdd: false,
                isWifiConnect: true,
                blueEnable: true,
                isDevice: true,
                searchName: "",
                otaMacs: [],
                commandMacs: [],
                autoId: "automation-device",
                groupList: this.$store.state.groupList,
                pairList: [],
                positionList: [],
                temporaryAddList: [],
                temporaryDelList: [],
                listMacs: [],
                wifiNum: 0,
                showScanDevice: true,
                hsb: "",
                hideTrue: false,
                loadShow: false,
                wifiFlag: false,
                indexList: [],
                loadList: [],
                loadMoreing: false,
                pullLoad: false,
            }
        },
        watch: {
           // 如果路由有变化，会再次执行该方法d
           '$route': function (to, form) {
               if (to.path == "/") {
                   this.$store.commit("setShowScanBle", true);
                   this.onBackIndex();
               }

           }
        },
        mounted: function() {
            var self = this;
            self.wifiNum = 0;
            espmesh.registerPhoneStateChange();
            self.$store.commit("setShowScanBle", true);
            setTimeout(function() {
                espmesh.hideCoverImage();
                espmesh.checkAppVersion();
                self.loadHWDevices();
                Common.reload(self);
            }, 500)
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                if (self.deviceList.length > 0) {
                    self.$refs.remind.hide();

                    if (self.hideTrue) {
                        self.hideLoad();
                    }
                    self.positionList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (!Util._isEmpty(item.position)) {
                            self.positionList.push(item.position);
                        }
                    });

                    if (Util._isEmpty(self.searchName)) {
                        self.indexList = Util.sortList(self.deviceList);
                    } else {
                        var searchList = [];
                        $.each(self.deviceList, function(i, item) {
                            if (item.name.indexOf(self.searchName) != -1 || item.position.indexOf(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        })
                        self.indexList = Util.sortList(searchList);
                    }
                    setTimeout(function(){
                        var list = [];
                        var loadLen = self.loadList.length;
                        var len = self.indexList.length;
                        if (loadLen <= 20) {
                            loadLen = 20;
                        }
                        if (len > 0 ) {
                            $.each(self.indexList, function(i, item) {
                                list.push(item);
                                if (list.length == loadLen || list.length == len) {
                                    self.loadList = list;
                                    return false;
                                }
                            })
                        } else {
                            self.loadList = [];
                        }
                        if (len > loadLen) {
                            self.loadMoreing = false;
                        }
                    }, 100)
                } else {
                    self.loadList = [];
                    self.$store.commit("setTsfTime", "");
                }
            }
        },
        methods:{
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
            loadMoreList: function() {
                var self = this,
                    total = this.indexList.length,
                    len = this.loadList.length ;
                if (total > 20) {
                    if (len < total) {
                        console.log("按需加载。。。");
                        for (var i = len; i < total; i++) {
                            this.loadList.push(this.indexList[i]);
                            if (i - len == 8) {
                                return false;
                            }
                        }
                        if (this.loadList.length == total) {
                            this.loadMoreing = true;
                        } else {
                            this.loadMoreing = false;
                        }
                    } else {
                        this.loadMoreing = true;
                    }
                } else {
                    this.loadMoreing = true;
                }
            },
            addDevice: function (event) {
                Common.addDevice(this);
            },
            showGuide: function() {
                this.flag = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.guide.show();
            },
            joinDevice: function (event) {
                this.flag = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.join.show();
            },
            showVideo: function() {
                 espmesh.newWebView(VIDEO_URL);
            },
            addGroup: function () {
               Common.addGroup(this);
            },
            loadHWDevices: function() {
                Common.loadHWDevices(this)
            },
            getBxColor: function(layer, tsfTime) {
                return Util.getBxColor(layer);
            },
            getRssiIcon: function(rssi) {
                return Util.getWIFIRssiIcon(rssi);
            },
            setPairs: function() {
                Common.setPairs(this);
            },
            setPair: function(device) {
                return Common.setPair(this, device);
            },
            loadGroups: function() {
                Common.loadGroups(this);
            },
            setGroup: function() {
                Common.setGroup(this);
            },
            linkShow: function(item) {
                if (!Util._isEmpty(item.mlink_trigger)) {
                    if (item.mlink_trigger == 1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            conReload: function() {
                Common.conReload(this)
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                    Common.stopBleScan();
                    this.$store.commit("setShowScanBle", false);
                } else {
                    this.$store.commit("setShowScanBle", true);
                    this.onBackIndex();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.$store.commit("setShowScanBle", true);
                this.onBackIndex();
            },
            hideLoad: function () {
                this.$refs.load.hide();
                this.loadShow = false;
                this.hideTrue = false;
            },
            showLoad: function () {
                var self = this;
                setTimeout(function() {
                    self.loadShow = true;
                    self.$refs.load.hide();
                    self.$refs.load.showTrue();
                }, 100)

            },
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                this.$store.commit("setShowScanBle", false);
                setTimeout(function() {
                    if (self.deviceList.length > 0) {
                        self.deviceInfo = item;
                        self.$store.commit("setDeviceInfo", self.deviceInfo);
                        Common.stopBleScan();
                        if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                            self.$refs.operate.show();
                        } else if (tid != BUTTON_SWITCH) {
                            if (tid >= MIN_CAR && tid <= MAX_CAR) {
                                self.$refs.car.show();
                            } else {
                                self.$refs.attr.show();
                            }
                        }
                    }
                }, 50)
            },
            showAbout: function () {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.aboutDevice.show();
            },
            showReport: function () {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.report.show();
            },
            showBlueFail: function() {
                Common.showBlueFail(this);
            },
            showWifiFail: function() {
               Common.showWifiFail(this);
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs.push(this.deviceInfo.mac);
                this.$store.commit("setShowScanBle", false);
                this.$refs.ota.show();
            },
            showOtaBack: function() {
                var self = this;
                self.cancelOperate();
                window.onOtaBack = self.onOtaBack;
                MINT.MessageBox.confirm("当前版本：" + self.deviceInfo.version + "，确定要回退到上一个版本？", "版本回退",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var mac = self.deviceInfo.mac;
                        var data = '{"' + MESH_MAC + '": "' + mac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + OTA_FALLBACK + '","' +
                                DEVICE_DELAY + '": ' + DELAY_TIME + ',"callback": "onOtaBack", "tag": { "mac": "'+
                                        mac +'"}}';
                        espmesh.requestDevice(data);
                    }, 1000);

                }).catch(function(err){
                    window.onBackPressed = self.hide;
                });
            },
            onOtaBack: function(res) {
                var self= this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (!Util._isEmpty(res.result)) {
                        if (!Util._isEmpty(res.result.status_code) && res.result.status_code == 0) {
                        } else {
                            Util.toast(MINT, self.$t('版本回退失败'))
                        }
                    } else {
                        Util.toast(MINT, self.$t('版本回退失败'))
                    }

                } else {
                    Util.toast(MINT, self.$t('版本回退失败'))
                }
                MINT.Indicator.close();
                window.onBackPressed = self.hide;
            },
            showPair: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.setDevicePair.show();
            },
            showAuto: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.auto.show();
            },
            showConfig: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.config.show();
            },
            showCommand: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs.push(self.deviceInfo.mac);
                setTimeout(function() {
                    self.$refs.command.show();
                })
            },
            showSendIp: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs.push(self.deviceInfo.mac);
                setTimeout(function() {
                    self.$refs.sendIP.show();
                })
            },
            showDel: function (e) {
                $("#content-info .item").removeClass("active");
                $(e.currentTarget).addClass("active");
            },
            isShowConfig: function(tid) {
                var flag = false;
                if (tid == BUTTON_SWITCH_14) {
                    flag = true;
                }
                return flag;
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getFlag: function(position) {
                var self = this, flag = false;
                if (self.positionList.indexOf(position) != self.positionList.lastIndexOf(position)) {
                    flag = true;
                }
                return flag;

            },
            isLigth: function (tid) {
                return Common.isLigth(tid)
            },
            isSensor: function (tid, characteristics) {
                return Common.isSensor(tid, characteristics)
            },
            getSensorTemperature: function(characteristics) {
                return Common.getSensorTemperature(characteristics);
            },
            getSensorHumidity: function(characteristics) {
                return Common.getSensorHumidity(characteristics);
            },
            getSensorLuminance: function(characteristics) {
                return Common.getSensorLuminance(characteristics);
            },
            hide: function() {
                this.onBackIndex();
            },
            delDevice: function (e) {
                Common.delDevice(this)
            },
            onDelDevice: function(res) {
               Common.onDelDevice(this, res);
            },
            getColor: function (characteristics, tid) {
                return Util.getColor(characteristics, tid);
            },
            editName: function () {
                Common.editName(this);
            },
            onEditName: function(res) {
                Common.onEditName(this, res);
                this.onBackIndex();
            },
            getStatus: function(characteristics) {
                return Common.getStatus(characteristics);
            },
            close: function (mac, status, e) {
                Util.addBgClass(e);
                Common.close(this, mac, status);
            },
            closeDevice: function(mac) {
                var self = this, status = 0;
                self.powerFlag = !self.powerFlag;
                status = self.powerFlag ? STATUS_ON : STATUS_OFF;
                self.close(mac, status);
            },
            operateClose: function(mac, status, e) {
                var self = this;
                self.close(mac, status, e);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            showOperate: function (item) {
                var self = this, status = 0;
                Common.stopBleScan();
                self.$store.commit("setShowScanBle", false);
                var mac = item.mac;
                $.each(self.deviceList, function(i, item) {
                    if (item.mac == mac) {
                        self.deviceInfo = item;
                        return false;
                    }
                });
                $.each(self.deviceInfo.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                        return false;
                    }
                });
                self.powerFlag = (status == STATUS_ON ? true : false)
                self.flag = false;
                self.infoShow = true;
                self.$store.commit("setDeviceInfo", self.deviceInfo);
                window.onBackPressed = self.hideOperate;
            },
            hideOperate: function () {
                this.$store.commit("setShowScanBle", true);
                this.onBackIndex();
                this.infoShow = false;
            },
            cancelOperate: function() {
                this.$store.commit("setShowScanBle", true);
                this.infoShow = false;
            },
            loadTop: function() {
                var self = this;
                self.pullLoad = true;
                self.deviceList = [];
                self.loadList = [];
                self.$store.commit("setList", self.deviceList);
                setTimeout(function() {
                    if (!self.loadShow) {
                        self.$refs.load.hide();
                        console.log("下拉刷新");
                        self.loadShow = true;
                        self.$store.commit("setShowScanBle", true);
                        Common.stopBleScan();
                        espmesh.scanDevicesAsync();
                    } else {
                        self.pullLoad = false;
                        self.$refs.loadmore.onTopLoaded();
                    }
                    self.isLoad = false;
                }, 50);
            },
            getPosition: function(position) {
                return Util.getPosition(position);
            },
            showDesc: function(position) {
                var flag = false;
                if (!Util._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            clearListMacs: function() {
                this.listMacs = [];
            },
            onDeviceFound: function (device) {
                Common.onDeviceFound(this, device);
            },
            onDeviceLost: function (mac) {
               Common.onDeviceLost(this, mac);
            },
            onDeviceStatusChanged: function (item) {
                Common.onDeviceStatusChanged(this, item);
            },
            startBleScan: function() {
                Common.startBleScan(this);
            },
            onBackIndex: function() {
                Common.onBackIndex(this);
            },
            onWifiStateChanged: function(wifi) {
                Common.onWifiStateChanged(this, wifi);
            },
            onBluetoothStateChanged: function(blue) {
                Common.onBluetoothStateChanged(this, blue);
            },
            onScanBLE: function (devices) {
                Common.onScanBLE(this, devices);
            },
            onDeviceScanned: function(devices) {
               Common.onDeviceScanned(this, devices);
            },
            onDeviceScanning: function(devices) {
                Common.onDeviceScanning(this, devices);
            },
            onCheckAppVersion: function(res) {
                var self = this;
                console.log(res);
                var appInfo = self.$store.state.appInfo;
                console.log(JSON.stringify(appInfo))
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res)
                    if (res.status == 0) {
                        if (res.version > appInfo.version_code) {
                            self.$store.commit("setIsNewVersion", true);
                            self.$store.commit("setNewAppInfo", res);
                            self.$refs.newVersion.show();
                        }
                    }
                }
            },
            onAddQueueTask: function() {
            },
        },
        created: function () {
            window.onDeviceScanned = this.onDeviceScanned;
            window.onDeviceFound = this.onDeviceFound;
            window.onDeviceLost = this.onDeviceLost;
            window.onDeviceStatusChanged = this.onDeviceStatusChanged;
            window.onWifiStateChanged = this.onWifiStateChanged;
            window.onScanBLE = this.onScanBLE;
            window.onDeviceScanning = this.onDeviceScanning;
            window.onTopoScanned = this.onTopoScanned;
            window.onDelDevice = this.onDelDevice;
            window.onEditName = this.onEditName;
            window.onBluetoothStateChanged = this.onBluetoothStateChanged;
            window.onAddQueueTask = this.onAddQueueTask;
            window.onCheckAppVersion = this.onCheckAppVersion;
        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-operateDevice": operateDevice,
            "v-load": load,
            "v-aboutDevice": aboutDevice,
            "v-otaInfo": otaInfo,
            "v-automation": automation,
            "v-ibeacon": ibeacon,
            "v-scanDevice": scanDevice,
            "v-remind": remind,
            "v-attr": attr,
            "v-setDevicePair": setDevicePair,
            "v-joinDevice": joinDevice,
            "v-command": command,
            "v-sendIP": sendIP,
            "v-blueFail": blueFail,
            "v-wifiFail": wifiFail,
            "v-config": config,
            "v-newVersion": newVersion,
            "v-guide": guide,
            "v-car": car
        }

    });

    return Index;
});
