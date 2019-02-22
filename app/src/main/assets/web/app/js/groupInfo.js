define(["vue", "MINT", "Util", "txt!../../pages/groupInfo.html", "../js/operateDevice"],
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
                selected: 0,
                searchName: "",
                isSelectedMacs: [],
            }
        },
        computed: {
            list: function () {
                var self = this, list = [];
                self.deviceList = self.$store.state.deviceList;
                if (Util._isEmpty(self.searchName)) {
                    list = self.deviceList;
                } else {
                    var searchList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (item.position.indexOf(self.searchName) != -1 || item.name.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    list = searchList;
                }
                self.total = list.length;
                return self.sortList(list);
            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.deviceList = self.$store.state.deviceList;
                self.addFlag = true;
                setTimeout(function() {
                    self.isSelectedMacs = self.getDevicesByGroup(self.group.device_macs);
                    self.selected = self.isSelectedMacs.length;
                })
            },
            hide: function () {
                this.addFlag = false;
                this.$emit("groupInfoShow");
            },
            sortList: function(list) {
                var self = this, emptyList = [], arrayList = [];
                $.each(list, function(i, item) {
                    if (!Util._isEmpty(item.position)) {
                        arrayList.push(item);
                    } else {
                        emptyList.push(item);
                    }
                });
                arrayList.sort(Util.sortBySub("position"));
                $.each(emptyList, function(i, item) {
                    arrayList.push(item);
                });
                return arrayList;
            },
            save: function () {
                var docs = $("#"+ this.editDeviceId+" span.span-radio.active"),
                    macs = [], self = this;
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                self.group.device_macs = macs;
                espmesh.saveGroups(JSON.stringify([self.group]));
                espmesh.loadGroups();
                self.hide();
            },
            showDesc: function(position) {
                var flag = false;
                if (!Util._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            getPosition: function(position) {
                return Util.getPosition(position);
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
                        allMacs.push(item.mac);
                    })
                    this.isSelectedMacs = allMacs;
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
            getDevicesByGroup: function (macs) {
                var self = this, selectMacs = [];
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) != -1) {
                        selectMacs.push(item.mac);
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