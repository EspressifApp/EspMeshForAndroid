define(["vue","MINT", "Util", "txt!../../pages/scanInfo.html"],
    function(v, MINT, Util, scanInfo) {

        var ScanInfo = v.extend({

            template: scanInfo,
            props: {
                scanInfo: {
                    type: Object
                },
                rootMac: {
                    type: String
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    scanClass: SNIFFER_CLASS,
                    scanType: SNIFFER_TYPE_SELECT,
                    scanFilter: SNIFFER_FILTER,
                    type: "",
                    selectTypes: [],
                    notice_threshold: "",
                    esp_module_filter: "",
                    ble_scan_interval: "",
                    ble_scan_window: ""
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = this.hide;
                    window.onSetIbeacon = this.onSetIbeacon;
                    this.getValue();
                    this.addFlag = true;
                    setTimeout(function() {
                        self.notice_threshold = self.scanInfo.notice_threshold;
                        self.esp_module_filter = self.scanInfo.esp_module_filter;
                        self.ble_scan_interval = self.scanInfo.ble_scan_interval;
                        self.ble_scan_window = self.scanInfo.ble_scan_window;
                    }, 100)
                },
                hide: function () {
                    this.addFlag = false;
                    MINT.Indicator.close();
                    this.$emit("scanInfoShow");
                },
                getValue: function() {
                    var self = this;
                    if (!Util._isEmpty(this.scanInfo)) {
                        var type = this.scanInfo.type;
                        switch(type) {
                            case 0: self.selectTypes = [];break;
                            case 1: self.selectTypes = ["1"];break;
                            case 2: self.selectTypes = ["2"];break;
                            case 3: self.selectTypes = ["1","2"];break;
                            default: self.selectTypes = [];break;
                        }
                    }
                },
                isShowBle: function() {
                    if (this.selectTypes.indexOf("2") != -1) {
                        return true;
                    }
                    return false;
                },
                setIbeacon: function() {
                    var self = this,
                        deviceList  = self.$store.state.deviceList,
                        macs = [];
                    $.each(deviceList, function(i, item) {
                        macs.push(item.mac);
                    })
                    var type = "";
                    if (self.selectTypes.length > 1) {
                        type = 3;
                    } else if (self.selectTypes.length == 0) {
                        type = 0;
                    } else {
                        type = parseInt(self.selectTypes[0]);
                    }
                    self.type = type;
                    MINT.Indicator.open();
                    var data = ""
                    if (type == 0) {
                        data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                            ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_SNIFFER +
                            '","type":'+type+', "callback": "onSetIbeacon"}';
                    } else if (type == 1) {
                        data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                            ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_SNIFFER +
                            '","type":'+type+',"notice_threshold":'+
                            self.notice_threshold+',"esp_module_filter":'+self.esp_module_filter+
                            ', "callback": "onSetIbeacon"}';
                    } else {
                        data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                            ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_SNIFFER +
                            '","type":'+type+',"notice_threshold":'+
                            self.notice_threshold+',"esp_module_filter":'+self.esp_module_filter+
                            ',"ble_scan_interval":'+self.ble_scan_interval+',"ble_scan_window":'+
                            self.ble_scan_window+', "callback": "onSetIbeacon"}';
                    }
                    setTimeout(function() {
                        espmesh.requestDevicesMulticast(data);
                    }, 1000);

                },
                getColor: function () {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
                    $.each(this.deviceInfo.characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    })
                    if (status == STATUS_ON) {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }
                    return rgb;
                },
                onSetIbeacon: function(res) {
                    var self = this;
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res).result;
                        if (res.length > 0 && res[0].status_code == 0) {
                            Util.toast(MINT, self.$t('editSuccessDesc'));
                            self.scanInfo.type = self.type;
                            self.scanInfo.notice_threshold = self.notice_threshold;
                            self.scanInfo.esp_module_filter = self.esp_module_filter;
                            self.scanInfo.ble_scan_interval = self.ble_scan_interval;
                            self.scanInfo.ble_scan_window = self.ble_scan_window;
                            setTimeout(function() {
                                self.hide();
                            }, 1000);
                        } else {
                            Util.toast(MINT, self.$t('editFailDesc'));
                        }
                    } else {
                        Util.toast(MINT, self.$t('editFailDesc'));
                    }
                    console.log(JSON.stringify(self.scanInfo));
                    MINT.Indicator.close();
                },
            },
        });

        return ScanInfo;
    });