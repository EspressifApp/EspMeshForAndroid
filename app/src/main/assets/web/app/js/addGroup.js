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
                self.total = list.length;
                return self.sortList(list);
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                $("span.span-radio").removeClass("active");
                this.selected = 0;
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
                var res = espmesh.saveGroup(JSON.stringify(obj));
                if (res) {
                    var groupList = this.$store.state.groupList;
                    obj.id = res;
                    groupList.push(obj);
                    this.$store.commit("setGroupList", groupList);
                    this.hide();
                    this.$router.push({
                        path: "/group"
                    });
                }
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
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined || str === "null" || str === "undefined" ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        created: function () {

        }

    });
    return AddGroup;
});