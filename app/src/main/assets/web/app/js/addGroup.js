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
                var self = this, list = [];
                self.deviceList = self.$store.state.deviceList;
                if (Util._isEmpty(self.searchName)) {
                    list = self.deviceList;
                } else {
                    var searchList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (item.position.search(self.searchName) != -1 || item.name.search(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    list = searchList;
                }
                if ($("#" + self.addGroupId).hasClass("active")) {
                    var allMacs = [];
                    $.each(list, function(i, item) {
                        allMacs.push(item.bssid);
                    })
                    self.isSelectedMacs = allMacs;
                }
                self.total = list.length;
                return self.sortList(list);
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
                var docs = $("#"+ this.addGroupId + " .item span.span-radio.active"),
                    macs = [];
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                var obj = {name: this.name, is_user: false, is_mesh: false, device_macs: macs};
                espmesh.saveGroups(JSON.stringify([obj]));
                espmesh.loadGroups();
                this.hide();
                this.$router.push({
                    path: "/group"
                });
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
                        allMacs.push(item.mac);
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