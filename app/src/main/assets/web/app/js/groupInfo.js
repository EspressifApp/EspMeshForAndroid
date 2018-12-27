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
                window.onBackPressed = this.hide;
                $("#"+ this.editDeviceId+" span.span-radio").removeClass("active");
                this.deviceList = this.$store.state.deviceList;
                var macsSelects = this.getDevicesByGroup(this.group.device_macs);
                this.selected = macsSelects.length;
                for (var i in macsSelects) {
                    $("#"+ this.editDeviceId+ " span.span-radio[data-value='"+macsSelects[i]+"']").addClass("active");
                }
                this.addFlag = true;
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
                var res = espmesh.saveGroup(JSON.stringify(self.group));
                if (res) {
                    var groupList = self.$store.state.groupList;
                    if (groupList.length > 0) {
                        $.each(groupList, function(i, item) {
                            if (item.id == res) {
                                groupList.splice(i, 1, self.group);
                                return false;
                            }
                        })
                    }
                    self.$store.commit("setGroupList", groupList);
                    self.hide();
                }
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
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                } else {
                    doc.addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.total;
                }

            },
            selectDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    this.selected -= 1;
                } else {
                    doc.addClass("active");
                    this.selected += 1;
                }
            },
            getDevicesByGroup: function (macs) {
                var self = this, selectMacs = [];
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
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