define(["vue","MINT", "Util", "txt!../../pages/ibeacon.html", "./ibeaconInfo"],
    function(v, MINT, Util, ibeacon, ibeaconInfo) {

        var Ibeacon = v.extend({

            template: ibeacon,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    ibeaconInfo: {},
                    meter: 0,
                    rssi: 0,
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.onBackIbean();
                    self.addFlag = true;
                    self.rssi = 0;
                    self.meter = 0;
                    MINT.Indicator.open();
                    window.onGetIbeacon = this.onGetIbeacon;
                    window.onScanBLE = self.onConScanBLE;
                    setTimeout(function(){
                        self.getIbeacon();
                    },500);
                },
                hide: function () {
                    this.addFlag = false;
                    espmesh.stopBleScan();
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("ibeanShow");
                },
                onBackIbean: function () {
                    var self = this;
                    clearTimeout(SCAN_DEVICE);
                    espmesh.stopBleScan();
                    espmesh.startBleScan();
                    window.onScanBLE = self.onConScanBLE;
                    window.onBackPressed = self.hide;
                },
                getIbeacon: function() {
                    var data = '{"' + MESH_MAC + '": "' + this.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+this.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                        GET_IBEACON + '", "callback":"onGetIbeacon"}';
                    espmesh.requestDevice(data);

                },
                showInfo: function() {
                    espmesh.stopBleScan();
                    this.$refs.ibeaconInfo.show();
                },
                getIcon: function() {
                    console.log(this.deviceInfo.tid);
                    return Util.getIcon(this.deviceInfo.tid);
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
                onGetIbeacon: function(res) {
                    if (!Util._isEmpty(res)) {
                        this.ibeaconInfo = JSON.parse(res).result;
                    }
                    MINT.Indicator.close();
                },
                onConScanBLE: function (devices) {
                    var self = this;
                    console.log(devices);
                    if (!Util._isEmpty(devices)) {
                        devices = JSON.parse(devices);
                        $.each(devices, function(i, item) {
                            if (self.deviceInfo.mac == item.bssid) {
                                self.rssi = item.rssi;
                                self.meter = Util.distance(item.rssi);
                                return  false;
                            }
                        })
                    }
                    window.onBackPressed = self.hide;
                }
            },
            components: {
                "v-ibeaconInfo": ibeaconInfo
            }

        });

        return Ibeacon;
    });