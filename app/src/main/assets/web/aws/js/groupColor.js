define(["vue", "MINT", "Util", "txt!../../pages/groupColor.html", "../js/colorPicker", "../js/groupInfo",
        "../js/joinMesh", "./command"],
    function(v, MINT, Util, groupColor, colorPicker, groupInfo, joinMesh, command) {

    var GroupColor = v.extend({

        template: groupColor,
        props: {
            group: {
                type: String
            },
            lightId: {
                type: String
            },
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            }

        },
        data: function(){
            return {
                showFlag: false,
                infoShow: false,
                sceneList: [
                   {name: this.$t('read'), icon: "icon-read", h: "34", s: "96", b: "99"},
                   {name: this.$t('athletics'), icon: "icon-ball", h: "222", s: "57", b: "91"},
                   {name: this.$t('dinner'), icon: "icon-rice", h: "176", s: "55", b: "77"},
                   {name: this.$t('sleep'), icon: "icon-moon", h: "273", s: "61", b: "76"},
                   {name: this.$t('thinking'), icon: "icon-thinking", h: "155", s: "72", b: "74"},
                   {name: this.$t('work'), icon: "icon-work", h: "99", s: "73", b: "70"},
                   {name: this.$t('recreation'), icon: "icon-film", h: "48", s: "95", b: "99"},
                   {name: this.$t('alarm'), icon: "icon-alarm", h: "344", s: "81", b: "96"},
                   {name: this.$t('love'), icon: "icon-love", h: "357", s: "60", b: "99"},
                ],
                showSet: false,
                showColor: false,
                editColorId: "edit-color-id",
                otaGroupColorId: "ota-group-color-id",
                joinMeshColor:"join-mesh-color",
                joinSliderColor: "join-slider-color",
                colorSelectedAllId: "color-selected-id",
                otaMacs: [],
                commandColorMacs: [],
                operateType: RECENT_TYPE_GROUP,
                operateCurrent: 0,
                deviceList: [],
                groupMacs: [],
                groupDevices: [],
                total: 0,
                selected: 0,
                groupList: [],
                attrList: [],
                isSelectedMacs: [],
            }
        },
        computed: {
            colorList: function(){
                var self = this;
                self.groupDevices = [];
                if (self.showFlag) {
                    self.deviceList = self.$store.state.deviceList;
                    self.groupList = self.$store.state.groupList;
                    $.each(self.groupList, function(i, item) {
                        if (item.name == self.group.name) {
                            self.group = item;
                        }
                    });
                    self.getGroupDevices();
                }
                if ($("#" + self.colorSelectedAllId).hasClass("active")) {
                    var allMacs = [];
                    $.each(self.groupDevices, function(i, item) {
                        allMacs.push(item.iotId);
                    })
                    self.isSelectedMacs = allMacs;
                }
                setTimeout(function() {
                    var docs = $("#" + self.lightId + " .item span.span-radio.active");
                    self.selected = docs.length;
                });
                self.total = self.groupDevices.length;
                return self.groupDevices;
            }

        },
        methods:{
            show: function() {
                var self = this;
                self.onBackGroupColor();
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
                self.getGroupDevices();
                self.isSelectedMacs = [];
                $("#" +self.colorSelectedAllId).addClass("active");
                $(".slider-input").slider('destroy');
                self.showFlag = true;
            },
            hide: function () {
                this.$emit("groupColorShow");
                this.showFlag = false;
                this.$refs.color.hideColor();
            },
            onBackGroupColor: function () {
                window.onBackPressed = this.hide;
            },
            showOperate: function () {
                window.onBackPressed = this.hideOperate;
                this.infoShow = true;
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs = this.getMacs();
                if (this.otaMacs.length == 0) {
                    MINT.Toast({
                        message: self.$t('deviceOtaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                this.$refs.ota.show();
            },
            showCommand: function () {
                var self = this;
                self.infoShow = false;
                self.commandColorMacs = [];
                self.commandColorMacs = self.getMacs();
                if (self.commandColorMacs.length == 0) {
                    return false;
                }
                setTimeout(function() {
                    self.$refs.command.show();
                })
            },
            hideOperate: function () {
                window.onBackPressed = this.hide;
                this.infoShow = false;
            },
            getGroupDevices: function() {
                var self = this,
                    iotIds = self.group.iotIds;
                self.groupDevices = [];
                $.each(self.deviceList, function(i, item) {
                    if(iotIds.indexOf(item.iotId) > -1) {
                        self.groupDevices.push(item);
                    }
                });
                self.total = self.selected = self.groupDevices.length;
            },
            addSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num == -1) {
                    this.isSelectedMacs.push(mac);
                }
            },
            delSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num != -1) {
                    this.isSelectedMacs.splice(num, 1);
                }
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
                var doc = $(e.currentTarget).find("span.span-radio")[0];
                if ($(doc).hasClass("active")) {
                    $(doc).removeClass("active");
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    $(doc).addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.total;
                    var allMacs = [];
                    $.each(this.groupDevices, function(i, item) {
                        allMacs.push(item.iotId);
                    })
                    this.isSelectedMacs = allMacs;
                }

            },
            getMacs: function() {
                var docs = $("#"+ this.lightId + " .item span.span-radio.active"),
                    macs = [];
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                return macs;
            },
            groupInfo: function () {
                this.hideOperate();
                this.$refs.info.show();
            },
            getGroupColor: function (characteristics) {
                if (!Util._isEmpty(characteristics)) {
                    var hsv = characteristics["HSVColor"];
                    var lightSwitch = characteristics["LightSwitch"];
                    if (lightSwitch["value"] == STATUS_ON) {
                        return Util.getDeviceRgb(hsv.value["Hue"], hsv.value["Saturation"], hsv.value["Value"]);
                    }

                }
                return "#6b6b6b";
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
            editName: function () {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('addGroupTitle'),
                    {inputValue: self.group.name, inputPlaceholder: self.$t('addGroupInput'),
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                    self.group.name = obj.value;
                    espmesh.saveGroups(JSON.stringify([self.group]));
                    self.changeStore();
                    self.groupList.push(self.group);
                    self.$store.commit("setGroupList", self.groupList);
                });
            },
            delGroup: function (e) {
                var self = this;
                 MINT.MessageBox.confirm("确定要删除群组吗", "删除群组",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    $.each(self.deviceList, function(i, item) {
                        var iotId = item.iotId;
                        if (self.group.iotIds.indexOf(iotId) != -1) {
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
                    self.hide();
                });
            },
            unbindDevices: function () {
                var self = this;
                window.onAliDeviceUnbind = this.onAliDeviceUnbind;
                MINT.MessageBox.confirm("确定要解绑该群组下的设备吗", "解绑设备",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        aliyun.aliyunDeviceUnbindRequest(JSON.stringify(self.group.iotIds));
                    }, 1000);

                });
            },
            close: function (status) {
                var self = this,
                    iotIds = self.getMacs();
                self.currentStatus = (status == STATUS_ON ? true : false);
                aliyun.setAliDeviceProperties(JSON.stringify({"iotId":iotIds,"properties":{"LightSwitch":parseInt(status)}}));
                Util.setAliDeviceStatus(this, iotIds, {"LightSwitch": status})
            },
            changeStore: function () {
                var self = this;
                $.each(self.groupList, function(i, item) {
                    if (item.name == self.group.name) {
                        self.groupList.splice(i, 1);
                        return false;
                    }
                });

            },
            getGroup: function(list) {
                var groupNames = [], group = {};
                $.each(list, function(i, item) {
                    var characteristics = item.characteristics;
                    var groups = characteristics["DeviceArray"];
                    if (!Util._isEmpty(groups)) {
                        console.log(JSON.stringify(groups));
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
            operate: function (id, e) {
                var self = this;
                self.groupMacs = self.getMacs();
                if (id == 1) {
                    Util.setStatusBarBlack();
                    setTimeout(function() {
                        self.$refs.color.show();
                    }, 200)
                } else {
                    Util.setStatusBarBlue();
                }
                self.operateCurrent = id;
            },
            getColor: function (h, s, b) {
                return Raphael.getRGB("hsb(" + h / 360 + "," + s / 100 + "," + b / 100 + ")").hex;
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
                        MINT.Toast({
                            message: "解绑成功",
                            position: 'bottom',
                            duration: 2000
                        });
                        self.$store.commit("setList", self.deviceList);
                        self.getGroup(self.deviceList);
                        self.hide();
                    }
                }
                if (flag) {
                    MINT.Toast({
                        message: "解绑失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
            }
        },
        components: {
            "v-groupInfo": groupInfo,
            "v-color": colorPicker,
            "v-joinMesh": joinMesh,
            "v-command": command
        }

    });

    return GroupColor;
});