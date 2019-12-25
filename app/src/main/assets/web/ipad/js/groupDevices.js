define(["vue", "MINT", "Common", "Util", "txt!../../pages/groupDevices.html"],
    function(v, MINT, Common, Util, groupDevices) {

    var GroupDevices = v.extend({
        template: groupDevices,
        props: {
            groupInfo: {
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
                setTimeout(function() {
                    self.isSelectedMacs = self.getDevicesByGroup(self.groupInfo.device_macs);
                    self.selected = self.isSelectedMacs.length;
                })
            },
            hide: function () {
                this.flag = false;
                this.$emit("groupDevicesShow");
            },
            save: function () {
                this.groupInfo.device_macs = this.isSelectedMacs;
                this.$store.commit('setGroupInfo', this.groupInfo);
                espmesh.saveGroups(JSON.stringify([this.groupInfo]));
                espmesh.loadGroups();
                this.hide();
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
        }

    });
    return GroupDevices;
});