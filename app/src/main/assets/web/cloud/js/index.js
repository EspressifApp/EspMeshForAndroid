define(["vue", "MINT", "Util", "txt!../../pages/index.html", "../js/footer", "./resetDevice",
        "./operateDevice", "./addGroup", "./load", "./scanDevice", "./remind",
        "./joinDevice", "./command", "./blueFail", "./wifiFail", "./newVersion"],
    function(v, MINT, Util, index, footer, resetDevice, operateCloudDevice, addGroup, load,
             scanDevice, remind, joinDevice, command, blueFail, wifiFail, newVersion) {

        var Index = v.extend({

            template: index,

            data: function(){
                return {
                    flag: false,
                    device: "device",
                    addGroupId: "device-addGroup",
                    colorId: "device-color",
                    temperatureId: "device-temperature",
                    deviceList: [],
                    bindDeviceList: [],
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
                    commandMacs: [],
                    groupList: this.$store.state.groupList,
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
                    stopId: "",
                    isLogin: false
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
                    espmesh.checkAppVersion();
                    aliyun.isAliUserLogin();
                }, 500)
            },
            computed: {
                list: function () {
                    var self = this, deviceList = [];
                    self.deviceList = self.$store.state.deviceList;
                    deviceList = self.deviceList;
                    if (deviceList.length > 0) {
                        self.$refs.remind.hide();
                        if (self.hideTrue) {
                            self.hideLoad();
                        }
                        if (Util._isEmpty(self.searchName)) {
                            self.indexList = self.sortList(deviceList);
                        } else {
                            var searchList = [];
                            $.each(deviceList, function(i, item) {
                                if (item.name.indexOf(self.searchName) != -1) {
                                    searchList.push(item);
                                }
                            })
                            self.indexList = self.sortList(searchList);
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
                },
                isLoginFun: function() {
                    this.isLogin = this.$store.state.isLogin;
                    if (this.isLogin) {
                        this.reload()
                    } else {
                        this.showAdd = true
                    }
                    return "";
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
                    var self = this;
                    self.flag = false;

                    if (!self.isWifiConnect) {
                        self.showWifiFail();
                        return false;
                    }
                    if (!self.blueEnable) {
                        self.showBlueFail();
                        return false;
                    }
                    if (!self.isLogin) {
                        aliyun.aliUserLogin();
                        return false;
                    }
                    self.$store.commit("setShowScanBle", false);
                    self.$refs.device.show();
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
                    var self = this;
                    this.flag = false;
                    if (Util._isEmpty(self.deviceList)) {
                        self.deviceList = [];
                    }
                    self.groupList = self.$store.state.groupList;
                    MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                        {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                            confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn'),
                            inputValidator: function(val) {
                                return Util.isExistGroup(self.groupList, val)
                            }, inputErrorMessage: self.$t('isExistGroupDesc')
                        }).then(function(obj) {
                        setTimeout(function() {
                            self.$refs.group.show();
                            self.groupName = obj.value;
                        }, 100)
                    });

                },
                sortList: function(list) {
                    return list.sort(Util.sortBy("deviceName"));;
                },
                getBxColor: function(layer, tsfTime) {
                    return Util.getBxColor(layer);
                },
                getRssiIcon: function(rssi) {
                    return Util.getWIFIRssiIcon(rssi);
                },
                getGroupName: function(groups, id, name) {
                    $.each(groups, function(i, item) {
                        if (item.id == id) {
                            name = item.name;
                            return false;
                        }
                    })
                    return name;
                },
                setName: function(tid) {
                    var name = "";
                    if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        name = "Switch_" + tid;
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        name = "Sensor_" + tid;
                    } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        name = "Light_" + tid;
                    } else {
                        name = "Other_" + tid;
                    }
                    return name;
                },
                getAllMacs: function () {
                    var iotIds = [], self = this;
                    $.each(self.deviceList, function(i, item){
                        iotIds.push(item.iotId);
                    });
                    return iotIds;
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
                    var self = this;
                    self.showAdd = false;
                    self.hideTrue = true;
                    self.$refs.remind.hide();
                    self.$store.commit("setShowScanBle", true);
                    if (self.deviceList.length <= 0) {
                        self.stopBleScan();
                        self.loadDesc = self.$t('loadCon');
                        if (!self.loadShow) {
                            self.showLoad();
                            setTimeout(function() {
                                self.loadShow = false;
                            }, 110);

                        }
                    }
                    setTimeout(function() {
                        self.hideLoad();
                        if (self.deviceList.length <= 0) {
                            MINT.Toast({
                                message: self.$t('pullDownDesc'),
                                position: 'bottom',
                            });
                        };
                        if (self.$store.state.showScanBle) {
                            self.onBackIndex();
                        }
                    }, 20000);
                    setTimeout(function() {
                        self.stopBleScan();
                    });
                },
                reload: function() {
                    var self = this;
                    if (self.isLogin) {
                        setTimeout(function(){
                            if (!self.wifiFlag) {
                                self.stopBleScan();
                            }
                            self.showLoad();
                            self.$store.commit("setList", []);
                            self.loadList = [];
                            self.aliStartDiscovery();
                        }, 50);
                    } else {
                        aliyun.aliUserLogin();
                    }

                },
                showUl: function () {
                    this.flag = !this.flag;
                    if (this.flag) {
                        window.onBackPressed = this.hideUl;
                        this.stopBleScan();
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
                showAbout: function () {
                    this.infoShow = false;
                    this.$store.commit("setShowScanBle", false);
                    this.$refs.aboutDevice.show();
                },
                showBlueFail: function() {
                    var self = this;
                    self.$store.commit("setShowScanBle", false);
                    self.stopBleScan();
                    setTimeout(function() {
                        self.$refs.blueFail.show();
                    })

                },
                showWifiFail: function() {
                    var self = this;
                    self.$store.commit("setShowScanBle", false);
                    self.stopBleScan();
                    setTimeout(function() {
                        self.$refs.wifiFail.show();
                    })
                },
                showCommand: function() {
                    var self = this;
                    self.infoShow = false;
                    self.commandMacs = [];
                    self.commandMacs.push(self.deviceInfo.iotId);
                    setTimeout(function() {
                        self.$refs.command.show();
                    })
                },
                showDel: function (e) {
                    $("#content-info .item").removeClass("active");
                    $(e.currentTarget).addClass("active");
                },
                hideDel: function (e) {
                    $("#content-info .item").removeClass("active");
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                isLigth: function (tid) {
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        return true;
                    } else {
                        return false;
                    }
                },
                isSensor: function (tid, characteristics) {
                    if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        var temperature = false, humidity = false, luminance = false;
                        if (!Util._isEmpty(characteristics)) {
                            $.each(characteristics, function(i, item) {
                                if (item.cid == SENSOR_TEMPERATURE_CID && item.name == SENSOR_TEMPERATURE_NAME) {
                                    temperature = true;
                                } else if (item.cid == SENSOR_HUMIDITY_CID && item.name == SENSOR_HUMIDITY_NAME) {
                                    humidity = true;
                                } else if (item.cid == SENSOR_LUMINANCE_CID && item.name == SENSOR_LUMINANCE_NAME) {
                                    luminance = true;
                                }
                            });
                        }
                        if (temperature && humidity && luminance) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                },
                getSensorTemperature: function(characteristics) {
                    var temperature = 0;
                    if (!Util._isEmpty(characteristics)) {
                        $.each(characteristics, function(i, item) {
                            if (item.cid == SENSOR_TEMPERATURE_CID && item.name == SENSOR_TEMPERATURE_NAME) {
                                temperature = item.value;
                            }
                        });
                    }
                    return temperature;
                },
                getSensorHumidity: function(characteristics) {
                    var humidity = 0;
                    if (!Util._isEmpty(characteristics)) {
                        $.each(characteristics, function(i, item) {
                            if (item.cid == SENSOR_HUMIDITY_CID && item.name == SENSOR_HUMIDITY_NAME) {
                                humidity = item.value;
                                return false;
                            }
                        });
                    }
                    return humidity;
                },
                getSensorLuminance: function(characteristics) {
                    var luminance = 0;
                    if (!Util._isEmpty(characteristics)) {
                        $.each(characteristics, function(i, item) {
                            if (item.cid == SENSOR_LUMINANCE_CID && item.name == SENSOR_LUMINANCE_NAME) {
                                luminance = item.value;
                                return false;
                            }
                        });
                    }
                    return luminance;
                },
                unbindDevice: function (e) {
                    var self = this;
                    window.onAliDeviceUnbind = this.onAliDeviceUnbind;
                    MINT.MessageBox.confirm("确定要解除设备绑定吗？","设备解绑",{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        self.cancelOperate();
                        MINT.Indicator.open();
                        setTimeout(function() {
                            aliyun.aliDeviceUnbindRequest(JSON.stringify([self.deviceInfo.iotId]));
                        }, 1000);

                    }).catch(function(err){
                        self.onBackIndex();
                    });
                },
                getColor: function (characteristics, tid) {
                    return Util.getColor(characteristics, tid);
                },
                editName: function () {
                    var self = this;
                    self.cancelOperate();
                    MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editNameDesc'),
                        {inputValue: self.deviceInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                            inputValidator:function(v){if (Util.stringToBytes(v).length > 32){return false} {}},
                            inputErrorMessage: self.$t('longDesc'),
                            confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                        self.deviceInfo.name = obj.value;
                        var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.iotId +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + RENAME_DEVICE + '",' +
                            '"name":' + JSON.stringify(obj.value) + ',"callback": "onEditName"}';
                        setTimeout(function(){
                            espmesh.requestDevice(data);
                        }, 600);
                    }).catch(function(err) {
                        self.onBackIndex();
                    });
                },
                showOperate: function (item) {
                    var self = this, status = 0;
                    self.stopBleScan();
                    self.$store.commit("setShowScanBle", false);
                    var iotId = item.iotId;
                    $.each(self.deviceList, function(i, item) {
                        if (item.iotId == iotId) {
                            self.deviceInfo = item;
                            return false;
                        }
                    });
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
                            self.loadShow = true;
                            self.$store.commit("setShowScanBle", true);
                            self.stopBleScan();
                            self.$refs.load.hide();
                            self.aliStartDiscovery();
                        } else {
                            self.pullLoad = false;
                            self.$refs.loadmore.onTopLoaded();
                        }
                        self.isLoad = false;
                    }, 50);
                },
                clearListMacs: function() {
                    this.listMacs = [];
                },
                aliStartDiscovery: function() {
                    var self = this;
                    console.log('asdasdas');
                    aliyun.getAliDeviceList();
                    // if (!Util._isEmpty(self.stopId)) {
                    //     clearTimeout(self.stopId);
                    //     self.stopId = "";
                    // }
                    // self.stopId = setTimeout(function() {
                    //     aliyun.aliStopDiscovery();
                    //     self.stopId = "";
                    // }, 30000)
                },
                //云端设备操控
                operateItemCloud: function(item) {
                    var self = this;
                    if (item.status == STATUS_ON  && !self.pullLoad) {
                        self.isCloud = true;
                        self.deviceCloudInfo = item;
                        self.$store.commit("setDeviceCloudInfo", self.deviceCloudInfo);
                        self.stopBleScan();
                        self.$store.commit("setShowScanBle", false);
                        setTimeout(function() {
                            self.$refs.operateCloud.show();
                        })
                    }
                },
                getAliStatus: function(status) {
                    return Util.getAliStatus(status);
                },
                getAliColor: function(characteristics) {
                    if (!Util._isEmpty(characteristics)) {
                        if (!Util._isEmpty(characteristics["HSVColor"])) {
                            var hsv = characteristics["HSVColor"];
                            if (!Util._isEmpty(characteristics["LightSwitch"])) {
                                var lightSwitch = characteristics["LightSwitch"];
                                if (lightSwitch["value"] == STATUS_ON) {
                                    return Util.getDeviceRgb(hsv.value["Hue"], hsv.value["Saturation"], hsv.value["Value"]);
                                }
                            }
                        }
                    }
                    return "#6b6b6b";
                },
                getAliSwitch: function(characteristics) {
                    if(!Util._isEmpty(characteristics)) {
                        if (!Util._isEmpty(characteristics["LightSwitch"])) {
                            var lightSwitch = characteristics["LightSwitch"];
                            if (lightSwitch["value"] == STATUS_ON) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                },
                getGroup: function(list) {
                    var groupNames = [], group = {};
                    $.each(list, function(i, item) {
                        var characteristics = item.characteristics;
                        if (characteristics["DeviceArray"]) {
                            var groups = characteristics["DeviceArray"];
                            groups = groups['value'];
                            for (var k = 0; k < groups.length; k++) {
                                var name = groups[k];
                                if (groupNames.indexOf(name) != -1) {
                                    group[name].push(item.iotId);
                                } else {
                                    groupNames.push(name);
                                    group[name] = [item.iotId]
                                }
                            }
                        }

                    })
                    var goupList = [];
                    for(var i in group) {
                        goupList.push({name: i, iotIds: group[i]})
                    }
                    this.$store.commit("setGroupList", goupList)
                },
                closeCloud: function(iotId, status) {
                    aliyun.setAliDeviceProperties(JSON.stringify({"iotId":[iotId],"properties":{"LightSwitch":parseInt(status)}}));
                    this.setDeviceCloud(iotId, status);
                },
                setDeviceCloud: function(iotId, status) {
                    Util.setAliDeviceStatus(this, [iotId], {"LightSwitch": status})
                },
                onEditName: function(res) {
                    var self = this;
                    res = JSON.parse(res);
                    if (res.result.status_code == 0) {
                        $.each(self.deviceList, function(i, item){
                            if (item.iotId == self.deviceInfo.iotId) {
                                self.deviceList.splice(i, 1, self.deviceInfo);
                                return false;
                            }
                        });
                    }
                    self.$store.commit("setList", self.deviceList);
                    self.onBackIndex();
                },
                startBleScan: function() {
                    var self = this;
                    if (self.$store.state.blueInfo) {
                        espmesh.startBleScan();
                    } else {
                        MINT.Toast({
                            message: self.$t('bleConDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }

                },
                stopBleScan: function() {
                    clearTimeout(SCAN_DEVICE);
                    espmesh.stopBleScan();
                },
                onBackIndex: function() {
                    var self = this;
                    clearTimeout(SCAN_DEVICE);
                    self.blueEnable =  self.$store.state.blueInfo;
                    window.onBluetoothStateChanged = this.onBluetoothStateChanged;
                    if (self.$store.state.showScanBle) {
                        window.onScanBLE = self.onScanBLE;
                        window.onDeviceFound = self.onDeviceFound;
                        window.onDeviceLost = self.onDeviceLost;
                        setTimeout(function() {
                            self.$store.commit("setConScanDeviceList", []);
                        }, 60000);
                        SCAN_DEVICE = setTimeout(function() {
                            self.startBleScan();
                        }, 10000);
                    }

                    var startTime = 0;
                    window.onBackPressed = function () {
                        MINT.Toast({
                            message: self.$t('exitProgramDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        if (startTime == 0) {
                            startTime = new Date().getTime();
                        } else {
                            if (new Date().getTime() - startTime < 2000) {
                                espmesh.finish();
                            } else {
                                startTime = new Date().getTime();
                            }
                        }
                    }
                },
                onWifiStateChanged: function(wifi) {
                    var self = this;
                    console.log(wifi);
                    var wifiInfo = this.$store.state.wifiInfo;
                    wifi = JSON.parse(wifi);
                    if (wifi.connected) {
                        self.isWifiConnect = wifi.connected;
                        if (wifi.encode) {
                            wifi.ssid = Util.Base64.decode(wifi.ssid);
                        }
                        if (wifi.ssid == wifiInfo.ssid) {
                            return false;
                        }
                        if (self.wifiNum != 0) {
                            clearTimeout(WIFI_TIMER);
                            WIFI_TIMER = setTimeout(function() {
                                MINT.Toast({
                                    message: self.$t('wifiChangeDesc'),
                                    position: 'bottom',
                                    duration: 2000
                                });
                                if (!self.loadShow) {
                                    self.showAdd = false;
                                    self.wifiFlag = true;
                                    self.loadDesc = self.$t('loading');
                                    self.reload();
                                }
                            }, 3000);
                        }
                        self.wifiNum++;
                        self.$store.commit("setWifiInfo", wifi);
                    } else {
                        self.isWifiConnect = false;
                        self.$store.commit("setWifiInfo", "");
                    }
                },
                onBluetoothStateChanged: function(blue) {
                    if (!Util._isEmpty(blue)) {
                        blue = JSON.parse(blue);
                        if (blue.enable != "false" && (blue.enable || blue.enable == "true")) {
                            blue.enable = true;
                        } else {
                            blue.enable = false;
                        }
                        this.$store.commit("setBlueInfo", blue.enable);
                        this.blueEnable =  blue.enable;
                    }
                },
                onScanBLE: function (devices) {
                    var self = this,
                        scanList = [], rssiList = [], notExist = [],
                        rssiValue = self.$store.state.rssiInfo;
                    if (!Util._isEmpty(devices) && self.$store.state.showScanBle && self.showScanDevice && !self.loadShow && self.isLogin) {
                        var conScanDeviceList = self.$store.state.conScanDeviceList;
                        devices = JSON.parse(devices);
                        $.each(devices, function(i, item) {
                            if (item.rssi >= rssiValue && Util.isCloud(item.name, item.version, item.beacon)) {
                                rssiList.push(item);
                            }
                        })
                        if (rssiList.length > 0) {
                            var names = {};
                            $.each(devices, function(i, item) {
                                if (self.listMacs.indexOf(item.mac) == -1) {
                                    if (!Util._isEmpty(item.beacon)) {
                                        if (item.beacon == BEACON_MDF) {
                                            notExist.push(item.mac);
                                            names[item.mac] = item.name;
                                            self.listMacs.push(item.mac);
                                        }
                                    } else {
                                        notExist.push(item.mac);
                                        names[item.mac] = item.name;
                                        self.listMacs.push(item.mac);
                                    }
                                }
                            })
                            if (Util._isEmpty(conScanDeviceList) || conScanDeviceList.length <= 0) {
                                var len = self.deviceList.length;
                                if (len > 0) {
                                    self.showAdd = false;
                                    self.$refs.remind.hide();
                                    self.$refs.scanDevice.show();
                                    self.$refs.scanDevice.onBackReset();
                                } else {
                                    self.showAdd = true;
                                    self.$refs.scanDevice.hideThis();
                                    self.$refs.remind.show();
                                }
                                self.$store.commit("setScanDeviceList", rssiList);

                            } else {
                                $.each(rssiList, function(i, item) {
                                    if (conScanDeviceList.indexOf(item.bssid) <= -1) {
                                        scanList.push(item);
                                    }
                                });
                                if (scanList.length > 0) {
                                    var len = self.deviceList.length;
                                    if (len > 0) {
                                        self.showAdd = false;
                                        self.$refs.remind.hide();
                                        self.$refs.scanDevice.show();
                                    } else {
                                        self.showAdd = true;
                                        self.$refs.scanDevice.hideParent();
                                        self.$refs.remind.show();
                                    }
                                    self.$store.commit("setScanDeviceList", rssiList);
                                }
                            }
                        }
                    }
                },
                onCheckAppVersion: function(res) {
                    var self = this;
                    var appInfo = self.$store.state.appInfo;
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
                onIsAliUserLogin: function(res) {
                    var flag = true;
                    console.log(res);
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        this.$store.commit("setIsLogin", res.isLogin);
                        if (res.isLogin) {
                            flag = false;
                            aliyun.getAliUserInfo();
                        }
                    }
                    if (flag) {
                        aliyun.aliUserLogin();
                        this.onBackIndex();
                    }
                    espmesh.hideCoverImage();

                },
                onGetAliUserInfo: function(res) {
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        this.$store.commit("setUserInfo", res);
                    }
                },
                onAliStartDiscovery: function(res) {
                    var self = this;
                    console.log(res)
                    var flag = true;
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        if (res.code == 200) {
                            if (res.data.length > 0) {
                                flag = false;
                                self.deviceList = res.data;
                                aliyun.getAliDeviceList();
                            }
                        }
                    }
                    if (flag) {
                        self.$store.commit("setList", []);
                        self.loadShow = false;
                        self.pullLoad = false;
                        self.showAdd = true;
                        self.hideLoad();
                        self.$refs.loadmore.onTopLoaded();
                    }

                },
                onGetAliDeviceList: function(res) {
                    var self = this;
                    var flag = true;
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        if (res.code == 200) {
                            var iotIds = [];
                            var data = res.data;
                            console.log(data.length);
                            $.each(data, function(i, item) {
                                if (iotIds.indexOf(item.iotId) == -1) {
                                    iotIds.push(item.iotId);
                                }
                            });
                            if (iotIds.length > 0) {
                                self.bindDeviceList = data;
                                self.showAdd = false;
                                aliyun.getAliDeviceProperties(JSON.stringify(iotIds));
                                flag = false;
                            }
                        } else if (res.code == 401) {
                            aliyun.aliUserLogout();
                            this.$store.commit("setUserInfo", "");
                            this.$store.commit("setIsLogin", false);
                            aliyun.aliUserLogin();
                        }
                    }
                    if (flag) {
                        setTimeout(function() {
                            self.$store.commit("setList", []);
                            self.loadShow = false;
                            self.pullLoad = false;
                            self.showAdd = true;
                            self.hideLoad();
                            self.$refs.loadmore.onTopLoaded();
                        }, 1000)
                    }

                },
                onGetAliDeviceProperties: function (res) {
                    var self = this;
                    console.log(res);
                    var iotIds = [];
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        $.each(self.bindDeviceList, function(i, item) {
                            $.each(res, function(j, itemSub) {
                                if (item.iotId == itemSub.iotId) {
                                    item["characteristics"] = itemSub;
                                    self.bindDeviceList.splice(i, 1, item);
                                    return false;
                                }
                            })
                            iotIds.push(item.iotId);
                        });
                        // $.each(self.deviceList, function(i, item) {
                        //     if (iotIds.indexOf(item.iotId) != -1) {
                        //         iotIds.bind = true;
                        //     } else {
                        //         iotIds.bind = false;
                        //     }
                        // })
                        console.log(JSON.stringify(self.bindDeviceList));
                        self.$store.commit("setList", self.bindDeviceList);
                        //self.getGroup(self.bindDeviceList);
                    }
                    setTimeout(function() {
                        console.log("closed");
                        self.loadShow = false;
                        self.pullLoad = false;
                        self.hideLoad();
                        self.$refs.loadmore.onTopLoaded();
                    }, 1000)
                    self.onBackIndex();
                },
                onSetAliDeviceProperties: function(res) {
                },
                onAliDeviceUnbind: function(res) {
                    var self = this;
                    var flag = true;
                    MINT.Indicator.close();
                    if (res) {
                        res = JSON.parse(res)
                        if (res.length > 0) {
                            $.each(self.deviceList, function(i, item) {
                                if (res.indexOf(item.iotId) != -1) {
                                    self.deviceList.splice(i, 1)
                                    flag = false;
                                    return false;
                                }
                            });
                            MINT.Toast({
                                message: "解绑成功",
                                position: 'bottom',
                                duration: 2000
                            });
                            self.$store.commit("setList", self.deviceList);
                        }
                    }
                    if (flag) {
                        MINT.Toast({
                            message: "解绑失败",
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                onAliUserLogin: function(res) {
                    console.log(res);
                    if (!Util._isEmpty(res) && res != "{}") {
                        console.log(res);
                        res = JSON.parse(res);
                        this.$store.commit("setUserInfo", res);
                        this.$store.commit("setIsLogin", true);
                    }
                }
            },
            created: function () {
                window.onWifiStateChanged = this.onWifiStateChanged;
                window.onScanBLE = this.onScanBLE;
                window.onTopoScanned = this.onTopoScanned;
                window.onEditName = this.onEditName;
                window.onLoadHWDevices = this.onLoadHWDevices;
                window.onLoadGroups = this.onLoadGroups;
                window.onBluetoothStateChanged = this.onBluetoothStateChanged;
                window.onAddQueueTask = this.onAddQueueTask;
                window.onCheckAppVersion = this.onCheckAppVersion;
                window.onIsAliUserLogin = this.onIsAliUserLogin;
                window.onGetAliUserInfo = this.onGetAliUserInfo;
                window.onGetAliDeviceList = this.onGetAliDeviceList;
                window.onGetAliDeviceProperties = this.onGetAliDeviceProperties;
                window.onSetAliDeviceProperties = this.onSetAliDeviceProperties;
                window.onAliStartDiscovery = this.onAliStartDiscovery;
                window.onAliUserLogin = this.onAliUserLogin;
            },
            components: {
                "v-footer": footer,
                "v-resetDevice": resetDevice,
                "v-addGroup": addGroup,
                "v-operateCloudDevice": operateCloudDevice,
                "v-load": load,
                "v-scanDevice": scanDevice,
                "v-remind": remind,
                "v-joinDevice": joinDevice,
                "v-command": command,
                "v-blueFail": blueFail,
                "v-wifiFail": wifiFail,
                "v-newVersion": newVersion
            }

        });

        return Index;
    });
