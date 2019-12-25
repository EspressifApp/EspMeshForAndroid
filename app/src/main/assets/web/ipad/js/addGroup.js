define(["vue", "MINT", "Common", "Util", "txt!../../pages/addGroup.html"],
    function(v, MINT, Common, Util, addGroup) {

    var AddGroup = v.extend({
        template: addGroup,
        props: {
            name: {
                type: Object
            },
            isEdit: {
                type: Boolean
            }
        },
        data: function(){
            return {
                flag: false,
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
                return Util.sortList(list);
            }
        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.deviceList = self.$store.state.deviceList;
                self.flag = true;
                self.isSelectedMacs = [];
                self.selected = 0;
                setTimeout(function() {
                    Util.setStatusBarWhite();
                }, 200)
            },
            hide: function () {
                this.flag = false;
                Util.setStatusBarBlue();
                MINT.Indicator.close();
                this.$emit("addGroupShow");
            },
            save: function () {
                Common.saveGroup(this);

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
                Common.selectAllDevice(this, this.deviceList, e)
            },
            selectMac: function(mac) {
                Common.selectMac(this, mac)
            },
            isSelected: function(mac) {
                return Common.isSelected(this.isSelectedMacs, mac)
            }
        },
        components: {
        }

    });
    return AddGroup;
});