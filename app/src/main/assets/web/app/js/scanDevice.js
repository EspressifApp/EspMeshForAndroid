define(["vue", "MINT", "Util", "txt!../../pages/scanDevice.html"],
    function(v, MINT, Util, scanDevice) {

    var ScanDevice = v.extend({

        template: scanDevice,

        data: function(){
            return {
                addFlag: false,
                deviceList: [],
                scanNum: 0,
                advancedShow: false
            }
        },
        computed: {
            count: function () {
                var self = this;
                var conDevices = self.$store.state.scanDeviceList;
                return conDevices.length;
            },
            imageShow: function() {
                var flag = true;
                var conDevices = this.$store.state.scanDeviceList;
                $.each(conDevices, function(i, item) {
                    if (item.tid != BUTTON_SWITCH) {
                        flag = false;
                        return false;
                    }
                })
                return flag;
            }
        },
        methods:{
            show: function() {
                this.onBackReset();
                this.deviceList = this.$store.state.deviceList;
                this.advancedShow = false;
                this.scanNum = 0;
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                this.$store.commit("setShowScanBle", true);
                espmesh.stopBleScan();
                this.$emit("scanDeviceShow");
            },
            hideThis: function () {
                this.addFlag = false;
            },
            hideParent: function () {
                this.addFlag = false;
                espmesh.stopBleScan();
            },
            onBackReset: function () {
                window.onBackPressed = this.hide;
            },
            setParent: function() {
                this.$emit("scanDeviceShow");
            },
            addConDevice: function() {
                this.advancedShow = false;
                this.conDeviceBtn();
            },
            joinConDevice: function() {
                this.advancedShow = true;
                this.conDeviceBtn();
            },
            conDeviceBtn: function() {
                this.scanNum = 0;
                clearTimeout(SCAN_DEVICE);
                espmesh.scanTopo();
                this.hideParent();
                MINT.Indicator.open();
            },
            conDevice: function() {
                var self = this,
                    conDevices = self.$store.state.scanDeviceList,
                    devices = self.$store.state.deviceList,
                    conMacs = [], macs = [], wifiName = "", password = "";
                $.each(conDevices, function(i, item) {
                    conMacs.push(item.bssid);
                });
                $.each(devices, function(i, item) {
                    macs.push(item.mac);
                });
                this.$parent.clearListMacs();
                self.$store.commit("setConScanDeviceList", conMacs);
                setTimeout(function(){
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + ADD_DEVICE + '","'+
                        'whitelist": '+JSON.stringify(conMacs)+'}';
                    espmesh.requestDevicesMulticast(data);
                    self.$store.commit("setScanDeviceList", []);
                    MINT.Indicator.close();
                    self.setParent();
                }, 1000);

            },
            onTopoScanned: function(deviceMacs) {
                var self = this, lists = [];
                if (!Util._isEmpty(deviceMacs)) {
                    deviceMacs = JSON.parse(deviceMacs);
                    if (deviceMacs.length > 0) {
                        $.each(self.deviceList, function(i, item) {
                            if (deviceMacs.indexOf(item.mac) > -1) {
                                lists.push(item);
                            }
                        });
                        self.deviceList = lists;
                        self.$store.commit("setList", self.deviceList);
                        if (self.advancedShow) {
                            self.$parent.joinDevice();
                            setTimeout(function(){
                                MINT.Indicator.close();
                            })
                        } else {
                            self.conDevice();
                        }
                    } else {
                        if (self.scanNum < 2) {
                            self.scanNum++;
                            espmesh.scanTopo();
                        } else {
                            self.$store.commit("setList", []);
                            MINT.Indicator.close();
                            Util.toast(MINT, self.$t('noDeviceDesc'));
                            self.$parent.addDevice();
                        }
                    }

                }
            }
        },
        created: function () {
            window.onTopoScanned = this.onTopoScanned;
        },


    });

    return ScanDevice;
});