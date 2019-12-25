define(["vue", "MINT", "Common", "Util", "txt!../../pages/info.html", "../js/colorPicker",
    "../js/aboutDevice", "../js/otaInfo", "../js/command", "../js/setDevicePair", "../js/association", "../js/attr"],
    function(v, MINT, Common, Util, info, colorPicker, aboutDevice, otaInfo, command, setDevicePair, association, attr) {

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
                    operateType: RECENT_TYPE_DEVICE,
                    searchName: "",
                    deviceMacs: [],
                    selectMac: "",
                    deviceList: [],
                    deviceInfo: {},
                    isDevice: true,
                    isRoom: false,
                    otaId: "info-device-otaId"
                }
            },
            computed: {
                list: function() {
                    var self = this;
                    if (self.flag) {
                        self.deviceList = self.$store.state.deviceList;
                        if (self.deviceList.length == 0) {
                            self.hide();
                        } else {
                            self.deviceList = Util.sortList(self.deviceList);
                            var macs = [];
                            $.each(self.deviceList, function(i, item) {
                                macs.push(item.mac)
                            })
                            if (macs.indexOf(self.selectMac) == -1 && !Util._isEmpty(self.selectMac)) {
                                self.selectDevice(self.deviceList[0])
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
                    self.deviceList =  Util.sortList(self.$store.state.deviceList);
                    self.deviceInfo = self.$store.state.deviceInfo;
                    self.selectMac = self.deviceInfo.mac;
                    self.deviceMacs = [self.selectMac];
                    window.onEditName = self.onEditName;
                    window.onDelDevice = self.onDelDevice;
                    self.flag = true;
                    setTimeout(function() {
                        Util.setStatusBarWhite();
                    }, 200)
                    setTimeout(function () {
                        Common.stopBleScan();
                        self.showColorOrAttr(self.deviceInfo);
                    }, 600)
                },
                cancelOperate: function() {
                },
                // 编辑名称
                editName: function () {
                    window.onEditName = this.onEditName;
                    Common.editName(this);
                },
                onEditName: function(res) {
                    Common.onEditName(this, res);
                },
                delDevice: function() {
                    Common.delDevice(this)
                },
                onDelDevice: function(res) {
                    Common.onDelDevice(this, res)
                },
                showAbout: function() {
                    this.$refs.aboutDevice.show();
                },
                showPair: function() {
                    this.$refs.setDevicePair.show();
                },
                showAssociation: function() {
                    this.$refs.association.show();
                },
                showOta: function () {
                    this.$refs.ota.show();
                },
                showCommand: function() {
                    this.$refs.command.show();
                },
                isLigth: function(tid) {
                    return Common.isLigth(tid)
                },
                hideAllShow: function() {
                    this.$refs.aboutDevice.hide();
                    this.$refs.setDevicePair.hide();
                    this.$refs.ota.hide();
                    this.$refs.command.hide();
                },
                hide: function () {
                    this.hideAllShow();
                    Util.setStatusBarBlue();
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("infoShow");
                    this.flag = false;
                },
                hideThis: function() {
                    Util.setStatusBarWhite();
                    window.onBackPressed = this.hide;
                },
                selectDevice (item) {
                    var self = this;
                    self.deviceInfo = item;
                    self.selectMac = item.mac;
                    self.deviceMacs = [self.selectMac];
                    self.$store.commit("setDeviceInfo", this.deviceInfo);
                    self.showColorOrAttr(item);
                },
                showColorOrAttr: function(item) {
                    var self = this;
                    setTimeout(function() {
                        if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                            self.$refs.color.show();
                        } else {
                            self.$refs.attr.show();
                        }
                    })
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
                showDesc: function(position) {
                    var flag = false;
                    if (!Util._isEmpty(position)) {
                        flag = true;
                    }
                    return flag;
                },
                getRssiIcon: function(rssi) {
                    return Util.getWIFIRssiIcon(rssi);
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                getColor: function (characteristics, tid) {
                    return Util.getColor(characteristics, tid);
                },
                getStatus: function(characteristics) {
                    if (!Util._isEmpty(characteristics)) {
                        return Common.getStatus(characteristics);
                    }
                    return false;
                },
                close: function (mac, status) {
                    status = status ? 0 : 1;
                    Common.close(this, mac, status);
                },
                onAddQueueTask: function() {
                },
            },
            created: function () {
                window.onAddQueueTask = this.onAddQueueTask;
            },
            components: {
                "v-color": colorPicker,
                "v-aboutDevice": aboutDevice,
                "v-otaInfo": otaInfo,
                "v-command": command,
                "v-setDevicePair": setDevicePair,
                "v-association": association,
                "v-attr": attr
            }

        });
        return Info;
    });