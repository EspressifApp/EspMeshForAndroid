define(["vue", "MINT", "Util", "txt!../../pages/group.html", "../js/footer", "./resetDevice", "../js/addGroup",
    "../js/groupInfo", "../js/groupColor", "../js/joinMesh", "./command", "./blueFail", "./wifiFail"],
    function(v, MINT, Util, group, footer, resetDevice, addGroup, groupInfo, groupColor,
        joinMesh, command, blueFail, wifiFail) {

    var Group = v.extend({
        template: group,

        data: function(){
            return {
                flag: false,
                group: "group",
                addGroupId: "group-addGroup",
                infoShow: false,
                editGroupId: "edit-group-id",
                colorId: "group-color",
                temperatureId: "group-temperature",
                otaGroupId: "ota-group-id",
                lightId: "light-group-id",
                joinMeshGroup: "join-mesh-group",
                joinSliderGroup: "join-slider-group",
                selectMeshAllId: "joinMesh-select-id",
                deviceList: this.$store.state.deviceList,
                groupList: this.$store.state.groupList,
                currentGroup: "",
                otaMacs: [],
                commandMacs: [],
                currentStatus: true,
                searchName: "",
                groupName: "",
                isWifiConnect: true,
                blueEnable: true,
            }
        },
        mounted: function() {
        },
        computed: {
            wifiEnable: function() {
                var wifiInfo = this.$store.state.wifiInfo;
                if (!Util._isEmpty(wifiInfo)) {
                    this.isWifiConnect = wifiInfo.connected;
                } else {
                    this.isWifiConnect = false;
                }
                return this.isWifiConnect;
            },
            isBlueEnable: function() {
                var blueEnable =  this.$store.state.blueInfo;
                if (!Util._isEmpty(blueEnable)) {
                    this.blueEnable = blueEnable;
                } else {
                    this.blueEnable = false;
                }
                return this.blueEnable;
            },
            list: function () {
                var self = this;
                self.groupList = self.$store.state.groupList;
                console.log(JSON.stringify(self.groupList));
                if (Util._isEmpty(self.searchName)) {
                    return self.groupList;
                } else {
                    var searchList = [];
                    $.each(self.groupList, function(i, item) {
                        if (item.name.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    return searchList;
                }
            },
            devices: function() {
                this.deviceList = this.$store.state.deviceList;
                this.getGroup(this.deviceList);
            }
        },

        methods:{
            addDevice: function (event) {
                var self = this;
                self.flag = false;
                if (!self.isWifiConnect) {
                    setTimeout(function() {
                        self.showWifiFail();
                    })
                    return false;
                }
                if (!self.blueEnable) {
                    setTimeout(function() {
                        self.showBlueFail();
                    })
                    return false;
                }
                self.$refs.device.show();
            },
            showBlueFail: function() {
                var self = this;
                setTimeout(function() {
                    self.$refs.blueFail.show();
                })
            },
            showWifiFail: function() {
                var self = this;
                setTimeout(function() {
                    self.$refs.wifiFail.show();
                })
            },
            getDevicesByGroup: function (macs) {
                var self = this, count = 0;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            count++;
                        }
                    });
                }
                return count;

            },
            getGroup: function(list) {
                var groupNames = [], group = {};
                $.each(list, function(i, item) {
                    var characteristics = item.characteristics;
                    if (!Util._isEmpty(characteristics)) {
                        if (!Util._isEmpty(characteristics["DeviceArray"])) {
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
                    }
                })
                var goupList = [];
                for(var i in group) {
                    goupList.push({name: i, iotIds: group[i]})
                }
                this.$store.commit("setGroupList", goupList)
            },
            addGroup: function () {
                var self = this;
                self.flag = false;
                MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                    {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn'),
                    inputValidator: function(val) {
                                return Util.isExistGroup(self.groupList, val)
                              }, inputErrorMessage: self.$t('isExistGroupDesc')
                    }).then(function(obj) {
                        setTimeout(function() {
                            self.$refs.add.show();
                            self.groupName = obj.value;
                        }, 100)
                });

            },
            getStatusByGroup: function(iotIds) {
                var self = this;
                var flag = false;
                if (!Util._isEmpty(iotIds)) {
                    for (var i = 0; i < self.deviceList.length; i++) {
                        var item = self.deviceList[i];
                        if (iotIds.indexOf(item.iotId) != -1) {
                            var characteristics = item.characteristics;
                            if(!Util._isEmpty(characteristics)) {
                                var lightSwitch = characteristics["LightSwitch"];
                                if (lightSwitch["value"] == STATUS_ON) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                return flag;
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                } else {
                    this.onBackGroup();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.onBackGroup();
            },
            showInfo: function () {
                var self = this;
                self.hideOperate();
                setTimeout(function() {
                    self.$refs.info.show();
                }, 200)
            },
            isShowSwitch: function(iotIds) {
                var self = this;
                var flag = false;
                if (!Util._isEmpty(iotIds)) {
                    $.each(self.deviceList, function(i, item) {
                        if (iotIds.indexOf(item.iotId) != -1) {
                            if (item.status === STATUS_ON) {
                                flag = true;
                                return false;
                            }
                        }
                    })
                }
                return flag;
            },
            editName: function () {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                    {inputValue: self.currentGroup.name, inputPlaceholder: self.$t('addGroupInput'),
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {

                    self.changeStore();
                    self.groupList.push(self.currentGroup);
                    self.$store.commit("setGroupList", self.groupList);
                });
            },
            delGroup: function (e) {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.confirm("确定要删除群组吗", "删除群组",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    $.each(self.deviceList, function(i, item) {
                        var iotId = item.iotId;
                        if (self.currentGroup.iotIds.indexOf(iotId) != -1) {
                            characteristics = item.characteristics;
                            var groups = Util.getAliGroup(characteristics);
                            var index = groups.indexOf(self.group.name)
                            groups.splice(index, 1);
                            item.characteristics = Util.setDeviceGroup(characteristics, groups);
                            aliyun.setAliDeviceProperties(JSON.stringify({"iotId": [iotId],
                                "properties":{"DeviceArray": groups}}));
                            self.deviceList.splice(i, 1, item);
                        }
                    })
                    self.$store.commit("setList", self.deviceList);
                    self.changeStore();
                    self.$store.commit("setGroupList", self.groupList);
                });
            },
            changeStore: function () {
                var self = this;
                $.each(self.groupList, function(i, item) {
                    if (item.name == self.currentGroup.name) {
                        self.groupList.splice(i, 1);
                        return false;
                    }
                });
            },
            unbindDevices: function (e) {
                var self = this;
                self.hideOperate();
                window.onAliDeviceUnbind = this.onAliDeviceUnbind;
                MINT.MessageBox.confirm("确定要解绑该群组下的设备吗", "解绑设备",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    MINT.Indicator.open();
                    setTimeout(function() {
                        aliyun.aliyunDeviceUnbindRequest(JSON.stringify(self.currentGroup.iotIds));
                    }, 1000);

                });
            },
            joinMesh: function() {
                this.infoShow = false;
                this.$refs.mesh.show();
            },
            showOperateCloud: function (group) {
                var self = this;
                console.log(group.obj);
                self.currentGroup = "";
                self.currentGroup = group.obj;
                self.flag = false;
                setTimeout(function() {
                    self.infoShow = true;
                    window.onBackPressed = self.hideOperate;
                }, 200)
            },
            hideOperate: function () {
                this.onBackGroup();
                this.infoShow = false;
            },
            showColor: function (item) {
                var self = this;
                self.flag = false;
                self.currentGroup = "";
                self.currentGroup = item;
                if (!self.isShowSwitch(self.currentGroup.iotIds)) {
                    return false;
                }
                setTimeout(function () {
                    self.$refs.groupcolor.show();
                }, 300);
            },
            close: function (iotIds, status,  e) {
                Util.addBgClass(e);
                var self = this;
                self.currentStatus = (status == STATUS_ON ? true : false);
                aliyun.setAliDeviceProperties(JSON.stringify({"iotId":iotIds,"properties":{"LightSwitch":parseInt(status)}}));
                Util.setAliDeviceStatus(this, iotIds, {"LightSwitch": status})
            },
            operateClose: function(macs, status, e) {
                var self = this;
                self.close(macs, status, e);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            onBackGroup: function() {
                var startTime = 0;
                var self = this;
                self.$store.commit("setShowScanBle", false);
                window.onBackPressed = function () {
                    Util.toast(MINT, self.$t('exitProgramDesc'))
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
            onAliDeviceUnbind: function(res) {
                var self = this;
                var flag = true;
                console.log(res)
                MINT.Indicator.close();
                if (res) {
                    res = JSON.parse(res)
                    if (res.length > 0) {
                        $.each(self.deviceList, function(i, item) {
                            if (res.indexOf(item.iotId) != -1) {
                                self.deviceList.splice(i, 1)
                                flag = false;
                            }
                        });
                        Util.toast(MINT, "解绑成功")
                        self.$store.commit("setList", self.deviceList);
                        self.getGroup(self.deviceList)
                    }
                }
                if (flag) {
                    Util.toast(MINT, "解绑失败")
                }
            }
        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-groupInfo": groupInfo,
            "v-groupColor": groupColor,
            "v-joinMesh": joinMesh,
            "v-command": command,
            "v-blueFail": blueFail,
            "v-wifiFail": wifiFail
        }
    });
    return Group;
});
