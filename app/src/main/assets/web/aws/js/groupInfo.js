define(["vue", "MINT", "Util", "txt!../../pages/groupInfo.html", "./operateDevice"],
    function(v, MINT, Util, groupInfo, operateDevice) {

    var GroupInfo = v.extend({
        template: groupInfo,
        props: {
            group: {
                type: Object
            },
            editDeviceId: {
                type: String
            }

        },
        data: function(){
            return {
                addFlag: false,
                deviceList: this.$store.state.deviceList,
                total: 0,
                oldIotIds: [],
                selected: 0,
                searchDeviceName: "",
                isSelectedMacs: [],
            }
        },
        computed: {
            infoList: function () {
                var self = this, list = [];
                console.log("sads");
                if (self.addFlag) {
                    if (Util._isEmpty(self.searchDeviceName)) {
                        list = self.deviceList;
                    } else {
                        var searchList = [];
                        $.each(self.deviceList, function(i, item) {
                            if (item.name.indexOf(self.searchDeviceName) != -1) {
                                searchList.push(item);
                            }
                        })
                        list = searchList;
                    }
                    self.total = list.length;
                }
                return list;
            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.deviceList = self.$store.state.deviceList;
                setTimeout(function() {
                    self.oldIotIds = self.group.iotIds;
                    self.isSelectedMacs = self.getDevicesByGroup(self.group.iotIds);
                    self.selected = self.isSelectedMacs.length;
                })
                self.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                this.$emit("groupInfoShow");
            },
            sortList: function(list) {
                return list.sort(Util.sortBySub("deviceName"));
            },
            getAliStatus: function(status) {
                return Util.getAliStatus(status);
            },
            save: function () {
                var self = this;
                var docs = $("#"+ this.editDeviceId+" span.span-radio.active"),
                    iotIds = [], self = this;
                for (var i = 0; i < docs.length; i++) {
                    iotIds.push($(docs[i]).attr("data-value"));
                };
                var delIotIds = [];
                for (var i = 0 ; i < self.oldIotIds.length; i++) {
                    var iotId = self.oldIotIds[i];
                    if (iotIds.indexOf(iotId) == -1) {
                        delIotIds.push(iotId);
                    }
                }
                var addIotIds = [];
                for (var i = 0 ; i < iotIds.length; i++) {
                    var iotId = iotIds[i];
                    if (self.oldIotIds.indexOf(iotId) == -1) {
                        addIotIds.push(iotId);
                    }
                }
                if (delIotIds.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        var iotId = item.iotId;
                        if (delIotIds.indexOf(iotId) != -1) {
                            characteristics = item.characteristics;
                            var groups = Util.getAliGroup(characteristics);
                            var index = groups.indexOf(self.group.name)
                            groups.splice(index, 1);
                            item.characteristics = Util.setDeviceGroup(characteristics);
                            aliyun.setAliDeviceProperties(JSON.stringify({"iotId": [iotId],
                                "properties":{"DeviceArray": groups}}));
                            self.deviceList.splice(i, 1, item);
                        }
                    })
                }
                if (addIotIds.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        var iotId = item.iotId;
                        if (addIotIds.indexOf(iotId) != -1) {
                            characteristics = item.characteristics;
                            var groups = Util.getAliGroup(characteristics);
                            groups.push(self.group.name);
                            item.characteristics = Util.setDeviceGroup(characteristics, groups);
                            aliyun.setAliDeviceProperties(JSON.stringify({"iotId": [iotId],
                                "properties":{"DeviceArray": groups}}));
                            self.deviceList.splice(i, 1, item);
                        }
                    })
                }
                self.group.iotIds = iotIds;
                var groupList = self.$store.state.groupList;
                $.each(groupList, function(i, item) {
                    if (item.name == self.group.name) {
                        groupList.splice(i, 1, self.group);
                        return false;
                    }
                });
                self.$store.commit("setGroupList", groupList);
                self.$store.commit("setList", self.deviceList);
                self.hide();
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget).find("span.span-radio")[0];
                if ($(doc).hasClass("active")) {
                    $(doc).removeClass("active");
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    $(doc).addClass("active");
                    this.selected = this.total;
                    var allMacs = [];
                    $.each(this.deviceList, function(i, item) {
                        allMacs.push(item.iotId);
                    })
                    this.isSelectedMacs = allMacs;
                }

            },
            selectMac: function(iotId) {
                var num = this.isSelectedMacs.indexOf(iotId);
                if (num == -1) {
                    this.isSelectedMacs.push(iotId);
                } else {
                    this.isSelectedMacs.splice(num, 1);
                }
                this.selected = this.isSelectedMacs.length;
            },
            isSelected: function(iotId) {
                var self = this,
                    flag = false;
                if (self.isSelectedMacs.indexOf(iotId) != -1) {
                    flag = true;
                }
                return flag;
            },
            getDevicesByGroup: function (iotIds) {
                var self = this, selectMacs = [];
                $.each(self.deviceList, function(i, item) {
                    if (iotIds.indexOf(item.iotId) != -1) {
                        selectMacs.push(item.iotId);
                    }
                });
                return selectMacs;

            }
        },
        components: {
            "v-operateDevice": operateDevice
        }

    });
    return GroupInfo;
});