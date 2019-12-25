define(["vue", "Util", "txt!../../pages/addGroup.html"], function(v, Util, addGroup) {

    var AddGroup = v.extend({
        template: addGroup,
        props: {
            name: {
                type: String
            },
            addGroupId: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                deviceList: this.$store.state.deviceList,
                total: 0,
                selected: 0,
                searchName: "",
                isSelectedMacs: [],
            }
        },
        computed: {
            list: function () {
                var self = this, deviceList = [], list = [];
                if (self.addFlag) {
                    self.deviceList = self.$store.state.deviceList;
                    $.each(self.deviceList, function(i, item) {
                        if (item.status == STATUS_ON) {
                            deviceList.push(item)
                        }
                    })
                    self.deviceList = deviceList;
                    if (Util._isEmpty(self.searchName)) {
                        list = deviceList;
                    } else {
                        var searchList = [];
                        $.each(deviceList, function(i, item) {
                            if (item.name.search(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        })
                        list = searchList;
                    }
                    if ($("#" + self.addGroupId).hasClass("active")) {
                        var allMacs = [];
                        $.each(list, function(i, item) {
                            allMacs.push(item.iotId);
                        })
                        self.isSelectedMacs = allMacs;
                    }
                    self.total = list.length;
                }
                return list;
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                this.selected = 0;
                this.isSelectedMacs = [];
                this.addFlag = true;

            },
            hide: function () {
                this.addFlag = false;
                this.$emit("addGroupShow");
            },
            getAliStatus: function(status) {
                return Util.getAliStatus(status);
            },
            save: function () {
                var self = this;
                var docs = $("#"+ this.addGroupId + " .item span.span-radio.active"),
                    iotIds = [];
                for (var i = 0; i < docs.length; i++) {
                    iotIds.push($(docs[i]).attr("data-value"));
                };
                console.log(JSON.stringify(iotIds));
                var deviceList = self.$store.state.deviceList;
                if (iotIds.length > 0) {
                    $.each(deviceList, function(i, item) {
                        var iotId = item.iotId;
                        if (iotIds.indexOf(iotId) != -1) {
                            var characteristics = item.characteristics;
                            var groups = Util.getAliGroup(characteristics);
                            if (groups.indexOf(self.name) == -1) {
                                groups.push(self.name);
                                item.characteristics = Util.setDeviceGroup(characteristics, groups);
                                console.log(JSON.stringify(item.characteristics));
                                aliyun.setAliDeviceProperties(JSON.stringify({"iotId": [iotId],
                                    "properties":{"DeviceArray": groups}}));
                                deviceList.splice(i, 1, item);
                            }
                        }
                    })
                    self.$store.commit("setList", deviceList);
                    var groupList = self.$store.state.groupList;
                    groupList.push({name: self.name, iotIds: iotIds})
                    self.$store.commit("setGroupList", groupList);
                    this.hide();
                    this.$router.push({
                        path: "/group"
                    });
                } else {
                    MINT.Toast({
                        message: "请选择设备",
                        position: 'bottom',
                        duration: 2000
                    });
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
                    this.selected = this.total;
                    var allMacs = [];
                    $.each(this.deviceList, function(i, item) {
                        allMacs.push(item.iotId);
                    })
                    this.isSelectedMacs = allMacs;
                }
            },
        },
        created: function () {

        }

    });
    return AddGroup;
});