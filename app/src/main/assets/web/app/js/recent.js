define(["vue", "MINT", "Util", "txt!../../pages/recent.html", "../js/footer", "./resetDevice", "../js/addGroup",
    "../js/groupInfo", "./operateDevice", "../js/groupColor", "./aboutDevice", "./otaInfo", "./automation", "./attr"],
    function(v, MINT, Util, recent, footer, resetDevice, addGroup, groupInfo, operateDevice,
        groupColor, aboutDevice, otaInfo, automation, attr) {

    var Recent = v.extend({
        template: recent,

        data: function(){
            return {
                flag: false,
                recent: "recent",
                showDevice: false,
                showGroup: false,
                recentList: [],
                otaMacs: [],
                colorDeviceId: "recent-device-color",
                temperatureDeviceId: "recent-device-temperature",
                colorGroupId: "recent-group-color",
                temperatureGroupId: "recent-group-temperature",
                autoId: "recent-automation-device",
                addGroupId: "recent-addGroup",
                editRecentId: "edit-recent-id",
                otaRecentId: "ota-recent-id",
                lightRecentId: "light-recent-id",
                deviceInfo: "",
                powerFlag: "",
                showAll: false,
                groupObj: "",
                deviceList: this.$store.state.deviceList,
                groupList: this.$store.state.groupList,
                groupName: "",
                mixList: this.$store.state.mixList
            }
        },
        mounted: function() {
            var self = this;
            self.onBackRecent();
            window.onEditDeviceName = this.onEditDeviceName;
            var res = espmesh.loadLastOperations("10");
            self.mixList = [];
            if (!Util._isEmpty(res)) {
                self.recentList = JSON.parse(res);
                if (self.groupList.length <= 0) {
                    var groups = espmesh.loadGroups();
                    if (!Util._isEmpty(groups)) {
                        self.groupList = JSON.parse(groups);
                        self.$store.commit("setGroupList", this.groupList);
                    }
                }
                $.each(self.recentList, function(i, item) {
                    if (item.type == RECENT_TYPE_DEVICE) {
                        $.each(self.deviceList, function(j, itemSub) {
                            if (item.identity == itemSub.mac) {
                                self.mixList.push({type: item.type, obj: itemSub});
                                return false;
                            }
                        })
                    } else {
                        $.each(self.groupList, function(j, itemSub) {
                            if (item.identity == itemSub.id) {
                                self.mixList.push({type: item.type, obj: itemSub});
                                return false;
                            }
                        })
                    }
                })
                self.$store.commit("setRecentList", self.mixList);

            }
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
                self.mixList = self.$store.state.mixList;
                var macs = self.getAllMacs();
                var list = [];
                $.each(self.mixList, function(i, item) {
                    if (item.type == RECENT_TYPE_DEVICE) {
                        if (macs.indexOf(item.obj.mac) > -1) {
                            list.push(item);
                        }
                    } else {
                        list.push(item);
                    }
                });
                return list;
            }
        },
        methods:{
            focus: function (e) {
                $(e.currentTarget).parent().addClass("active");
            },
            blur: function (e) {
                $(e.currentTarget).parent().removeClass("active");
            },
            addDevice: function (event) {
                this.flag = false;
                this.$refs.device.show();
            },
            getLightMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                        macs.push(item.mac);
                    }
                });
                return macs;
            },
            getAllMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    macs.push(item.mac);
                });
                return macs;
            },
            addGroup: function () {
                var self = this;
                self.flag = false;
                MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                    {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                    self.$refs.add.show();
                    self.groupName = obj.value;
                });

            },
            getColor: function (characteristics, tid) {
                var self = this,
                    hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                    mode = 0, temperature = 0, brightness = 0;
                $.each(characteristics, function(i, item) {
                    if (item.cid == HUE_CID) {
                        hueValue = item.value;
                    }else if (item.cid == SATURATION_CID) {
                        saturation = item.value;
                    }else if (item.cid == VALUE_CID) {
                        luminance = item.value;
                    } else if (item.cid == STATUS_CID) {
                        status = item.value;
                    } else if (item.cid == MODE_CID) {
                        mode = item.value;
                    } else if (item.cid == TEMPERATURE_CID) {
                        temperature = item.value;
                    } else if (item.cid == BRIGHTNESS_CID) {
                        brightness = item.value;
                    }
                })
                if (status == STATUS_ON) {
                    if (mode == MODE_CTB) {
                        rgb = Util.modeFun(temperature, brightness);
                    } else {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }

                }
                if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                    rgb = "#3ec2fc";
                }
                return rgb;
            },
            typeBoolean: function(type) {
                var typeFlag = false;
                if (type == RECENT_TYPE_DEVICE) {
                    typeFlag = true;
                }
                return typeFlag;
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                } else {
                    this.onBackRecent();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.onBackRecent();
            },
            showInfo: function () {
                this.hideGroupOperate();
                this.$refs.info.show();
            },
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    self.deviceInfo = item;
                    self.$store.commit("setDeviceInfo", self.deviceInfo);
                    self.$refs.operate.show();
                } else {
                    self.deviceInfo = item;
                    self.$store.commit("setDeviceInfo", self.deviceInfo);
                    self.$refs.attr.show();
                }
            },
            getIcon: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return "icon-light";
                } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    return "icon-power";
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    return "icon-sensor";
                }
            },
            isLigth: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return true;
                } else {
                    return false;
                }
            },
            delDevice: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                MINT.MessageBox.confirm(self.$t('deleteDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.onBackRecent();
                    self.infoShow = false;
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var mac = self.deviceInfo.mac;
                        var data = '{"' + MESH_MAC + '": "' + mac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                            DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                        espmesh.requestDevice(data);
                        espmesh.removeDeviceForMac(mac);
                        self.infoShow = false;
                        $.each(self.deviceList, function(i, item) {
                            if (item.mac == mac) {
                                self.deviceList.splice(i, 1);
                                return false;
                            }
                        })
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);

                    }, 1000);
                });
            },
            showAbout: function () {
                this.showDevice = false;
                this.$refs.aboutDevice.show();
            },
            showOta: function () {
                this.showDevice = false;
                this.otaMacs = [];
                this.otaMacs.push(this.deviceInfo.mac);
                this.$refs.ota.show();
            },
            showAuto: function() {
                this.showDevice = false;
                this.$refs.auto.show();
            },
            getStatus: function(characteristics) {
                var self = this, status = 0;
                $.each(characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                    }
                });
                return (status == STATUS_ON ? true : false);
            },
            getStatusByGroup: function (macs) {
                var self = this, statusFlag = false;
                if (!Util._isEmpty(macs)) {
                    if (macs.length > 0) {
                        $.each(self.deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) > -1) {
                                $.each(item.characteristics, function(j, itemSub) {
                                    if (itemSub.cid == STATUS_CID) {
                                        if (itemSub.value == STATUS_ON) {
                                            statusFlag = true;
                                            return false;
                                        }

                                    }
                                });
                                if (statusFlag) {
                                    return false;
                                }
                            }
                        });
                    }
                }
                return statusFlag;
            },
            editDeviceName: function () {
                var self = this;
                self.showDevice = false;
                self.onBackRecent();
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editNameDesc'),
                    {inputValue: self.deviceInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                    self.deviceInfo.name = obj.value;
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + RENAME_DEVICE + '",' +
                        '"name":' + JSON.stringify(obj.value) + ',"callback": "onEditDeviceName"}';
                    setTimeout(function(){
                        espmesh.requestDevice(data);
                    }, 500);
                });
            },
            onEditDeviceName: function(res) {
                var self = this;
                res = JSON.parse(res).result;
                if (res.status_code == 0) {
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.deviceInfo.mac) {
                            self.deviceList.splice(i, 1);
                            return false;
                        }
                    });
                    self.deviceList.push(self.deviceInfo);
                }
            },
            isShow: function(id) {
                var flag = false;
                if (id >= MIN_LIGHT && id <= MAX_LIGHT) {
                    flag = true;
                }
                return flag;

            },
            editGroupName: function () {
                var self = this;
                if (self.showAll) {
                    MINT.Toast({
                      message: self.$t('prohibitEditDesc'),
                      position: 'middle',
                    });
                } else {
                    self.showGroup = false;
                    MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                        {inputValue: self.groupObj.name, inputPlaceholder: self.$t('addGroupInput'),
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                        self.onBackRecent();
                        espmesh.saveGroup(self.groupObj.id, obj.value, null);
                        self.groupObj.name = obj.value;
                        self.changeStore();
                        self.groupList.push(self.groupObj);
                        self.$store.commit("setGroupList", self.groupList);
                    });
                }

            },
            getDevicesByGroup: function (obj) {
                var self = this, count = 0,
                    macs = obj.device_macs;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            count ++;
                        }
                    });
                }
                return count;

            },
            dissolutionGroup: function (e) {
                var self = this,
                    doc = $(e.currentTarget);
                if (self.showAll) {
                    MINT.Toast({
                      message: self.$t('prohibitDelDesc'),
                      position: 'middle',
                    });
                } else {
                    MINT.MessageBox.confirm(self.$t('delGroupDesc'), self.$t('delGroupTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        self.showGroup = false;
                        self.onBackRecent();
                        espmesh.deleteGroup(self.groupObj.id);
                        $("#" + self.groupObj.id).remove();
                        self.changeStore();
                        var list = self.$store.state.mixList;
                        $.each(list, function(i, item) {
                            if (item.type == RECENT_TYPE_GROUP) {
                                if (item.obj.id == self.groupObj.id) {
                                    list.splice(i, 1);
                                    return false;
                                }
                            }
                        })
                        self.$store.commit("setRecentList", list);
                        self.$store.commit("setGroupList", self.groupList);
                    });
                }

            },
            delDevices: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                MINT.MessageBox.confirm(self.$t('deleteGroupDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.showGroup = false;
                    self.onBackRecent();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var macs = self.groupObj.device_macs;
                        var devices = [];
                        $.each(self.deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) < 0) {
                                devices.push(item);
                            }
                        })
                        self.deviceList = devices;
                        var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                            ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                            DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                        espmesh.requestDevicesMulticast(data);
                        espmesh.removeDevicesForMacs(JSON.stringify(macs));
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);
                    }, 1000);

                });
            },
            changeStore: function () {
                var self = this;
                $.each(self.groupList, function(i, item) {
                    if (item.id == self.groupObj.id) {
                        self.groupList.splice(i, 1);
                        return false;
                    }
                });

            },
            showDeviceOperate: function (e) {
                var self = this, status = 0;
                var mac = $(e.target).attr("data-value");
                $.each(self.deviceList, function(i, item) {
                    if (mac == item.mac) {
                        self.deviceInfo = item;
                        return false;
                    }
                });
                var characteristics = [];
                $.each(self.deviceInfo.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                    }
                    characteristics.push(item);
                });
                self.powerFlag = (status == STATUS_ON ? true : false)
                self.flag = false;
                self.showDevice = true;
                window.onBackPressed = self.hideDeviceOperate;
            },
            hideDeviceOperate: function () {
                this.onBackRecent();
                this.showDevice = false;
            },
            showGroupOperate: function (e) {
                var self = this, status = 0;
                var mac = $(e.target).attr("data-value");
                $.each(self.groupList, function(i, item) {
                    if (mac == item.id) {
                        self.groupObj = item;
                        return false;
                    }
                });
                self.flag = false;
                self.showGroup = true;
                window.onBackPressed = self.hideGroupOperate;
            },
            hideGroupOperate: function () {
                this.onBackRecent();
                this.showGroup = false;
            },
            showColor: function (item) {
                var self = this;
                self.flag = false;
                self.groupObj = "";
                self.groupObj = item;
                setTimeout(function () {
                    self.$refs.groupcolor.show();
                }, 500);
            },
            closeAll: function (status) {
                this.close(this.getLightMacs(), status);
            },
            closeDevice: function (mac, status) {
                var self = this;
                self.close([mac], status);
                setTimeout(function() {
                    window.onBackPressed = self.hideDeviceOperate;
                })
            },
            closeGroup: function(macs, status) {
                var self = this;
                self.close(macs, status);
                setTimeout(function() {
                    window.onBackPressed = self.hideGroupOperate;
                })
            },
            close: function (macs, status) {
                var self = this, meshs = [];
                self.currentStatus = (status == STATUS_ON ? true : false);
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                    ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                       '"characteristics":' + JSON.stringify(meshs) + '}';

                espmesh.requestDevicesMulticast(data);
                self.changeDevice(macs, status);
            },
            changeDevice: function (macs, status) {
                var self = this;
                $.each(self.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(i, item) {
                            if (item.cid == STATUS_CID) {
                                item.value = parseInt(status);
                            }
                            characteristics.push(item);
                        });
                        item.characteristics = characteristics;
                        self.deviceList.splice(i, 1, item);
                    }
                });
                self.$store.commit("setList", self.deviceList);
            },
            onBackRecent: function() {
                var startTime = 0;
                var self = this;
                self.$store.commit("setShowScanBle", false);
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
            }

        },
        created: function () {

        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-groupInfo": groupInfo,
            "v-groupColor": groupColor,
            "v-operateDevice": operateDevice,
            "v-aboutDevice": aboutDevice,
            "v-otaInfo": otaInfo,
            "v-automation": automation,
            "v-attr": attr
        }

    });

    return Recent;
});