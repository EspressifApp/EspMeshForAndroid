define(["vue", "MINT", "Util", "txt!../../pages/group.html", "../js/footer", "./resetDevice", "../js/addGroup",
    "../js/groupInfo", "../js/groupColor", "../js/otaInfo", "../js/joinMesh", "./command", "./sendIP",
    "./blueFail", "./wifiFail"],
    function(v, MINT, Util, group, footer, resetDevice, addGroup, groupInfo, groupColor, otaInfo,
        joinMesh, command, sendIP, blueFail, wifiFail) {

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
                groupObj: "",
                otaMacs: [],
                commandMacs: [],
                currentStatus: true,
                searchName: "",
                groupName: "",
                isWifiConnect: true,
                blueEnable: true,
            }
        },
        watch: {
           // 如果路由有变化，会再次执行该方法d
           '$route': function (to, form) {
               if (to.path == "/group") {
                   this.loadGroups();
               }
           }
        },
        mounted: function() {
            this.loadGroups();
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
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
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
            loadGroups: function() {
                this.onBackGroup();
                espmesh.loadGroups();
            },
            getAllStatus: function () {
                var self = this,statusFlag = false;
                $.each(self.deviceList, function(i, item) {
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
                });
                return statusFlag;
            },
            getStatusByGroup: function (macs) {
                var self = this, statusFlag = false;
                if (macs.length > 0) {
                    self.deviceList = self.$store.state.deviceList;
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
                return statusFlag;
            },
            isShow: function(macs) {
                var self = this,
                    flag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                                flag = true;
                            }
                        }
                    });
                }
                return flag;

            },
            isShowGroup: function(macs, flag) {
                var self = this, countFlag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            countFlag = true;
                            return false;
                        }
                    });
                }
                if (!flag) {
                    countFlag = true;
                }
                return countFlag;
            },
            isShowNo: function() {
                var self = this, num = 0;
                $.each(self.groupList, function(i, item) {
                    if (!item.is_user) {
                        num++;
                    }
                });
               return num == 0 ? true : false
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
                this.hideOperate();
                this.$refs.info.show();
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs = this.groupObj.device_macs;
                this.$refs.ota.show();
            },
            showCommand: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs = this.groupObj.device_macs;
                setTimeout(function() {
                    self.$refs.command.show();
                })
            },
            showSendIP: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs = this.groupObj.device_macs;
                setTimeout(function() {
                    self.$refs.sendIP.show();
                })
            },
            editName: function () {
                var self = this;
                if (self.groupObj.is_user) {
                    MINT.Toast({
                        message: self.$t('prohibitEditDesc'),
                        position: 'middle',
                    });
                } else{
                    self.hideOperate();
                     MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                         {inputValue: self.groupObj.name, inputPlaceholder: self.$t('addGroupInput'),
                         confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                         self.groupObj.name = obj.value;
                         espmesh.saveGroups(JSON.stringify([self.groupObj]));
                         self.changeStore();
                         self.groupList.push(self.groupObj);
                         self.$store.commit("setGroupList", self.groupList);
                     });
                }


            },
            dissolutionGroup: function (e) {
                var self = this,
                    doc = $(e.currentTarget);
                if (self.groupObj.is_user) {
                    MINT.Toast({
                        message: self.$t('prohibitDelDesc'),
                        position: 'middle',
                    });
                } else {
                    self.hideOperate();
                    MINT.MessageBox.confirm(self.$t('delGroupDesc'), self.$t('delGroupTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        console.log(self.groupObj.id);
                        espmesh.deleteGroup(self.groupObj.id + "");
                        self.changeStore();
                        self.$store.commit("setGroupList", self.groupList);
                    });
                }
            },
            delDevices: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                self.hideOperate();
                MINT.MessageBox.confirm(self.$t('deleteGroupDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var macs = self.groupObj.device_macs;
                        console.log(JSON.stringify(macs));
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
                        console.log(data);
                        espmesh.requestDevicesMulticast(data);
                        espmesh.removeDevicesForMacs(JSON.stringify(macs));
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);
                    }, 1000);

                });
            },
            isJoinMesh: function(groupObj) {
                var flag = false;
                if (groupObj.id == parseInt(groupObj.name, 16)) {
                    flag = true;
                }
                return flag;
            },
            joinMesh: function() {
                this.infoShow = false;
                this.$refs.mesh.show();
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
            showOperate: function (group) {
                var self = this, status = 0;
                self.groupObj = ""
                $.each(self.groupList, function(i, item) {
                    if (item.id == group.obj.id) {
                        self.groupObj = item;
                        return false;
                    }
                });
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
                self.groupObj = "";
                self.groupObj = item;
                setTimeout(function () {
                    self.$refs.groupcolor.show();
                }, 300);
            },
            close: function (macs, status, id, e) {
                Util.addBgClass(e);
                var self = this, meshs = [];
                self.currentStatus = (status == STATUS_ON ? true : false);
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                    ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask(JSON.stringify({"method":"requestDevicesMulticast","argument": data}));
                self.changeDevice(macs, status);
            },
            operateClose: function(macs, status, id, e) {
                var self = this;
                self.close(macs, status, id, e);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
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
            onBackGroup: function() {
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
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-groupInfo": groupInfo,
            "v-otaInfo": otaInfo,
            "v-groupColor": groupColor,
            "v-joinMesh": joinMesh,
            "v-command": command,
            "v-sendIP": sendIP,
            "v-blueFail": blueFail,
            "v-wifiFail": wifiFail
        }
    });
    return Group;
});
