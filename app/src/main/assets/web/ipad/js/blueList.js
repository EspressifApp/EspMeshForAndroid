define(["vue", "MINT", "Util", "txt!../../pages/blueList.html"],
    function(v, MINT, Util, blueList) {

        var BlueList = v.extend({
            template: blueList,
            data: function(){
                return {
                    flag: false,
                    blueList: [],
                    blueInfo: {},
                    customData: "",
                    colorList: ["#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8000ff"],
                    currentRgb: "",
                    selectMac: "",
                }
            },
            computed: {
                list: function() {
                    if (this.flag) {
                        console.log(this.blueList.length)
                        if (this.blueList.length > 0) {
                            MINT.Indicator.close();
                        }
                        return this.blueList;
                    }
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.blueList = [];
                    window.onScanBLE = self.onConScanBLE;
                    window.onMeshBLEDeviceConnectionChanged = self.onMeshBLEDeviceConnectionChanged;
                    setTimeout(function() {
                        Util.setStatusBarWhite();
                        MINT.Indicator.open("设备扫描中...");
                        window.onBackPressed = self.hide;
                        self.startBleScan();
                    });
                    self.customData = "";
                    self.currentRgb = "";
                    self.blueInfo = {};
                    self.flag = true;
                },
                isConnected: function() {
                    console.log(JSON.stringify(this.blueInfo));
                    if (JSON.stringify(this.blueInfo) != "{}") {
                        return true
                    }
                    return false;
                },
                hide: function () {
                    this.flag = false;
                    espmesh.stopBleScan();
                    this.blueInfo = {};
                    Util.setStatusBarBlue();
                    MINT.Indicator.close();
                    this.$emit("blueListShow");
                },
                selectColor: function(item) {
                    var self = this;
                    if (self.currentRgb == item) {
                        self.currentRgb = "";
                    } else {
                        self.currentRgb = item;
                        var meshs = [];
                        meshs.push({cid: HUE_CID, value: this.getHue(item)});
                        meshs.push({cid: SATURATION_CID, value: 100});
                        self.customData = '{"type":"json","value":{"header":{"group":["010000000000"]},"body":{"request":"set_status",'
                            +'"characteristics":'+JSON.stringify(meshs)+'}}}';
                        setTimeout(function() {
                            self.postData();
                        })
                    }
                },
                selectSwitch: function(status) {
                    var self = this;
                    self.currentRgb = "";
                    self.customData = '{"type":"json","value":{"header":{"group":["010000000000"]},"body":{"request":"set_status",'
                        +'"characteristics":[{"cid":0,"value":'+parseInt(status)+'}]}}}';
                    setTimeout(function() {
                        self.postData();
                    })
                },
                postData: function() {
                    var self = this;
                    MINT.Indicator.open();
                    setTimeout(function() {
                        console.log(self.customData);
                        MINT.Indicator.close();
                        if (Util.isJSON(self.customData)) {
                            espmesh.postDataToMeshBLEDevice(self.customData);
                        } else {
                            INSTANCE_TOAST = MINT.Toast({
                                message: self.$t('jsonDesc'),
                                position: 'bottom',
                            });
                        }
                    }, 1000)
                },
                getHue: function(color) {
                    switch(color){
                        case "#ff0000":
                            return 0;
                            break;
                        case "#ff8000":
                            return 30;
                            break;
                        case "#ffff00":
                            return 60;
                            break;
                        case "#00ff00":
                            return 120;
                            break;
                        case "#00ffff":
                            return 180;
                            break;
                        case "#0000ff":
                            return 240;
                            break;
                        case "#8000ff":
                            return 270;
                            break;
                        default:
                            return 191;
                            break;
                    }
                },
                showBlue: function(item) {
                    var self = this;
                    self.blueInfo = item;
                    self.selectMac = item.mac;
                    espmesh.disconnectMeshBLEDevice();
                    MINT.Indicator.open("设备连接中...");
                    setTimeout(function() {
                        self.connectBlue(item);
                    }, 100)
                },
                connectBlue: function(item) {
                    espmesh.connectMeshBLEDevice(JSON.stringify({"address": item.mac}))
                },
                startBleScan: function() {
                    var self = this;
                    console.log(self.$store.state.blueInfo);
                    if (self.$store.state.blueInfo) {
                        espmesh.startBleScan(JSON.stringify({"settings":{"scan_mode":2}}));
                    } else {
                        MINT.Toast({
                            message: self.$t('bleConDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                hideParent: function() {
                    window.onBackPressed = this.hide;
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                getRssiIcon: function(rssi) {
                    return Util.getWIFIRssiIcon(rssi);
                },
                onConScanBLE: function(devices) {
                    var self = this;
                    devices = JSON.parse(devices);
                    devices = Util.blueNameDecode(self, devices);
                    $.each(devices, function(i, item) {
                        var name = item.name;
                        if(Util.isBeacon(name, item.version, item.beacon)) {
                            var flag = true,
                                obj = Util.assemblyObjectNoPosition(item, self);
                            $.each(self.blueList, function(j, itemSub) {
                                if (item.mac == itemSub.mac) {
                                    if (item.rssi >= self.rssiValue) {
                                        self.blueList.splice(j, 1, obj);
                                    }
                                    flag = false;
                                    return false;
                                }
                            })
                            if (flag && !Util._isEmpty(obj)) {
                                self.blueList.push(obj);
                            }
                        }
                    })
                    window.onBackPressed = self.hide;
                },
                onMeshBLEDeviceConnectionChanged: function(res) {
                    var self = this;
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.connected) {
                            MINT.Toast({
                                message: "连接成功",
                                position: 'bottom',
                                duration: 2000
                            });
                            setTimeout(function() {
                                self.$refs.blueConnect.show();
                            }, 100)
                        } else {
                            MINT.Toast({
                                message: "连接失败",
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                    } else {
                        MINT.Toast({
                            message: "连接失败",
                            position: 'bottom',
                            duration: 2000
                        });
                    }

                }
            },
            components: {
            }

        });
        return BlueList;
    });