define(["vue", "MINT", "Common", "Util", "txt!../../pages/groupInfo.html", "../js/colorPicker",
    "../js/otaInfo", "../js/command", "../js/groupDevices", "../js/resetDevice"],
    function(v, MINT, Common, Util, info, colorPicker, otaInfo, command, groupDevices, resetDevice) {

        var Info = v.extend({
            template: info,
            props: {
                colorId: {
                    type: String
                },
                temperatureId: {
                    type: String
                }
            },
            data: function(){
                return {
                    flag: false,
                    operateType: RECENT_TYPE_GROUP,
                    searchName: "",
                    deviceList: [],
                    deviceMacs: [],
                    groupInfo: {},
                    selectId: "",
                    groupList: [],
                    isDevice: true,
                    isRoom: false,
                    otaId: "group-device-otaId",
                    isEdit: false,
                    isJoin: true,
                    selectAllId: 'select-groupInfo-id',
                    importId: 'import-groupInfo-id',
                    resetId: 'reset-groupInfo-id',
                    sliderId: 'slider-groupInfo-id'
                }
            },
            computed: {
                monitorGroups: function() {
                    var self = this;
                    if (self.flag) {
                        self.groupList = self.$store.state.groupList;
                        var list = [], groupIds = [];
                        $.each(self.groupList, function(i, item) {
                            if (self.isShowGroup(item.device_macs, item.is_user)) {
                                list.push(item);
                                if (groupIds.indexOf(item.id) == -1) {
                                    groupIds.push(item.id);
                                }
                            }
                        })
                        if (list.length == 0) {
                            self.hide();
                        } else {
                            if (groupIds.indexOf(self.selectId) == -1 && !Util._isEmpty(self.selectId)) {
                                self.selectDevice(list[0])
                            }
                        }
                    }
                }
            },
            methods:{
                //显示内容并初始化数据
                show: function() {
                    var self = this;
                    self.hideThis();
                    self.groupList = self.$store.state.groupList;
                    self.groupInfo = self.$store.state.groupInfo;
                    self.deviceList = self.$store.state.deviceList;
                    self.selectId = self.groupInfo.id;
                    self.deviceMacs = self.groupInfo.device_macs;
                    window.onEditName = self.onEditName;
                    self.flag = true;
                    setTimeout(function() {
                        Util.setStatusBarWhite();
                    }, 200)
                    setTimeout(function () {
                        self.$refs.color.show();
                    }, 600)
                },
                getDevicesByGroup: function(macs) {
                    return Common.getDevicesByGroup(this, macs)
                },
                getStatusByGroup: function (macs) {
                   return Common.getStatusByGroup(this, macs)
                },
                isShowPower: function(macs) {
                    return Common.isShowPower(this, macs);
                },
                close: function(macs, status) {
                    Common.closeList(this, macs, status);
                },
                isShowGroup: function(macs, flag) {
                    return Common.isShowGroup(this, macs, flag);
                },
                cancelOperate: function() {
                },
                // 编辑名称
                editName: function () {
                    Common.editGroupName(this);
                },
                onEditName: function(res) {
                    Common.onEditName(this, res);
                },
                hideOperate: function() {
                },
                dissolutionGroup: function() {
                    Common.dissolutionGroup(this)
                },
                delGroupDevices: function() {
                    Common.delGroupDevices(this)
                },
                showGroupInfo: function() {
                    var self = this;
                    self.isEdit = false;
                    setTimeout(function() {
                        self.$refs.groupDevices.show();
                    }, 50)
                },
                editGroupInfo: function() {
                    var self = this;
                    self.isEdit = true;
                    setTimeout(function() {
                        self.$refs.groupDevices.show();
                    }, 50)
                },
                showOta: function () {
                    this.$refs.ota.show();
                },
                showJoin: function() {
                    this.$refs.device.show();
                },
                showCommand: function() {
                    this.$refs.command.show();
                },
                hideAllShow: function() {
                    this.$refs.ota.hide();
                    this.$refs.command.hide();
                    this.$refs.device.hide();
                    this.$refs.groupDevices.hide()
                },
                hide: function () {
                    this.hideAllShow();
                    Util.setStatusBarBlue();
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("infoShow");
                    this.flag = false;
                },
                hideThis: function() {
                    window.onBackPressed = this.hide;
                },
                initHide: function() {
                    this.hideThis();
                    var item = this.$store.state.groupInfo;
                    this.selectDevice(item);

                },
                selectDevice (item) {
                    var self = this;
                    self.groupInfo = item;
                    self.$store.commit('setGroupInfo', self.groupInfo);
                    self.selectId = item.id;
                    self.deviceMacs = item.device_macs;
                    setTimeout(function() {
                        self.$refs.color.show();
                    })
                },
                close: function (mac, status) {
                    Common.closeList(this, mac, status)
                },
                onAddQueueTask: function() {
                },
            },
            created: function () {
                window.onAddQueueTask = this.onAddQueueTask;
            },
            components: {
                "v-color": colorPicker,
                "v-otaInfo": otaInfo,
                "v-command": command,
                "v-groupDevices": groupDevices,
                "v-resetDevice": resetDevice
            }

        });
        return Info;
    });