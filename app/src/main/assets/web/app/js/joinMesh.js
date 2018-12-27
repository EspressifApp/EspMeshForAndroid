define(["vue", "MINT", "Util", "txt!../../pages/joinMesh.html", "./importDevice"],
    function(v, MINT, Util, joinMesh, importDevice) {

    var JoinMesh = v.extend({

        template: joinMesh,
        props: {
            group: {
                type: String
            },
            joinMeshId: {
                type: String
            },
            selectMeshAllId: {
                type: String
            },
            joinMeshSlider: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                showDesc: false,
                scanDeviceList: [],
                scanOldList: [],
                scanMacs: [],
                importMeshId: "mesh-import-id",
                count: 0,
                selected: 0,
                searchReset: "",
                resetPairList: [],
                rssiMin: -120,
                rssiMax: -40,
                rssiValue: -80,
                showFilter: false,
                showHeight: false,
                flagUl: false,
                isSelectedMacs: [],
                showFooterInfo: true,
            }
        },
        computed: {
            list: function () {
                var self = this, list = [];
                if (self.addFlag) {
                    self.scanDeviceList = self.$store.state.scanDeviceList;
                    self.getLoadMacs();
                    if (Util._isEmpty(self.searchReset)) {
                        $.each(self.scanDeviceList, function(i, item) {
                            if (item.rssi >= self.rssiValue) {
                                list.push(item);
                            }
                        });
                    } else {
                        $.each(self.scanDeviceList, function(i, item) {
                            if ((item.name.indexOf(self.searchReset) != -1 || item.position.indexOf(self.searchReset) != -1 )
                                && item.rssi >= self.rssiValue) {
                                list.push(item);
                            }
                        })
                    }
                    if (self.showFilter) {
                        var macList = [];
                        $.each(list, function(i, item) {
                            if (self.scanMacs.indexOf(item.mac) > -1) {
                                macList.push(item);
                            }
                        })
                        list = macList;
                    }
                    if ($("#" + self.selectMeshAllId).hasClass("active")) {
                        var allMacs = [];
                        $.each(list, function(i, item) {
                            allMacs.push(item.mac);
                        })
                        self.isSelectedMacs = allMacs;
                    }
                    setTimeout(function() {
                        var docs = $("#"+ self.joinMeshId +" span.span-radio.active");
                        self.selected = docs.length;
                    });
                    self.count = list.length;
                }
                return list;
            }
        },
        methods:{
            show: function() {
                var self = this;
                self.getLoadMacs();
                self.getPair();
                self.isSelectedMacs = [];
                setTimeout(function() {
                    self.onBackJoinMesh();
                    $("#" +self.selectMeshAllId).addClass("active");
                });
                self.scanDeviceList = [];
                self.$store.commit("setScanDeviceList", self.scanDeviceList);
                self.setScanList(self.scanDeviceList);
                self.selected = self.count = self.scanDeviceList.length;
                self.rssiValue = self.$store.state.rssiInfo;
                self.searchReset =  "";
                self.showFilter = false;
                self.showHeight = false;
                self.flagUl = false;
                self.showFooterInfo = true;
                self.initJoinSlider();
                self.addFlag = true;
                var oHeight = $(document).height();     //获取当前窗口的高度
                $(window).resize(function () {
                    if ($(document).height() >= oHeight) {
                        self.showFooterInfo = true;
                    } else {
                        self.showFooterInfo = false;
                    }
                })
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getPair: function() {
                var self = this,
                    pairs = espmesh.loadHWDevices();
                if (!Util._isEmpty(pairs)) {
                    self.resetPairList = JSON.parse(pairs);
                }
                self.$store.commit("setSiteList", self.resetPairList);
            },
            getPairInfo: function(mac) {
                var self = this, position = "";
                    staMac = espmesh.getStaMacsForBleMacs(JSON.stringify([mac]));
                staMac = JSON.parse(staMac);
                if (staMac.length > 0) {
                    $.each(self.resetPairList, function(i, item) {
                        if (item.mac == staMac[0]) {
                            position = item.floor + "-" + item.area + "-" + item.code;
                            return false;
                        }
                    });
                }
                return position;
            },
            hide: function () {
                this.$emit("meshShow");
                espmesh.stopBleScan();
                this.addFlag = false;
            },
            showFlag: function() {
                this.flagUl = !this.flagUl;
                if (this.flagUl) {
                    window.onBackPressed = this.hideFlag;
                } else {
                    this.onBackJoinMesh();
                }
            },
            hideFlag: function() {
                this.flagUl = false;
                this.onBackJoinMesh();
            },
            importDevice: function() {
                this.flagUl = false;
                this.$refs.import.show();
            },
            getLoadMacs: function() {
                var macs = espmesh.loadMacs();
                this.scanMacs = JSON.parse(macs)
            },
            getPosition: function(position) {
                var str = Util.getPosition(position);
                if (!Util._isEmpty(str)) {
                    return str;
                } else {
                    return "N/A";
                }
            },
            initJoinSlider: function() {
                var self = this;
                setTimeout(function() {
                    $("#" + self.joinMeshSlider).slider({
                        range: "min",
                        step: 1,
                        min: self.rssiMin,
                        max: self.rssiMax,
                        value: self.rssiValue,
                        slide: function(event, ui) {
                            self.rssiValue = ui.value;
                            self.$store.commit("setRssi", self.rssiValue);
                        },
                        stop: function(event, ui) {
                            self.rssiValue = ui.value;
                            self.$store.commit("setRssi", self.rssiValue);
                        }
                    })
                })
            },
            showHeightFun: function() {
                this.showHeight = !this.showHeight;
            },
            showFilterFun: function() {
                this.showFilter = !this.showFilter;
            },
            saveScanMac: function(mac) {
                var self = this,
                    index = self.scanMacs.indexOf(mac);
                if (index > -1) {
                    espmesh.deleteMac(mac);
                    self.scanMacs.splice(index, 1);
                } else {
                    espmesh.saveMac(mac);
                    self.scanMacs.push(mac);
                }
            },
            showMark: function(mac) {
                var flag = false;
                if (this.scanMacs.indexOf(mac) > -1) {
                    flag = true;
                }
                return flag;
            },
            conDevice: function() {
                var self = this;
                if (self.selected > 0) {
                    espmesh.stopBleScan();
                    MINT.Indicator.open();
                    var docs = $("#"+ self.joinMeshId +" span.span-radio.active"),
                        list = [], conMacs = [],
                        macs = self.group.device_macs;
                    for (var i = 0; i < docs.length; i++) {
                        conMacs.push($(docs[i]).attr("data-value"));
                    };
                    setTimeout(function(){
                        var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + ADD_DEVICE + '","'+
                                                'whitelist": '+JSON.stringify(conMacs)+'}';
                        espmesh.requestDevicesMulticastAsync(data);
                        self.$store.commit("setScanDeviceList", []);
                        MINT.Indicator.close();
                        self.hide();
                    }, 1000);
                    self.$store.commit("setConScanDeviceList", conMacs);
                }

            },
            onBackJoinMesh: function () {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                espmesh.stopBleScan();
                espmesh.startBleScan();
                window.onScanBLE = self.onConScanBLE;
                window.onBackPressed = self.hide;
            },
            addSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num == -1) {
                    this.isSelectedMacs.push(mac);
                }
            },
            delSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num != -1) {
                    this.isSelectedMacs.splice(num, 1);
                }
            },
            isSelected: function(mac) {
                var self = this,
                    flag = false;
                if (self.isSelectedMacs.indexOf(mac) != -1) {
                    flag = true;
                }
                return flag;
            },
            selectDevice: function (mac, e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    this.delSelectMac(mac);
                    this.selected -= 1;
                } else {
                    doc.addClass("active");
                    this.addSelectMac(mac);
                    this.selected += 1;
                }
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    doc.addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.count;
                    var allMacs = [];
                    $.each(this.scanDeviceList, function(i, item) {
                        allMacs.push(item.mac);
                    })
                    this.isSelectedMacs = allMacs;
                }

            },
            distance: function(rssi) {
                var iRssi = Math.abs(rssi),
                    power = (iRssi - 49) / (10 * 4.5);
                return Math.pow(10, power).toFixed(2);
            },
            setScanList: function(devices) {
                var self = this;
                $.each(devices, function(i, item) {
                    if(Util.isMesh(item.name, item.version)) {
                        var flag = true,
                            obj = {mac: item.mac, name: item.name, rssi: item.rssi, bssid: item.bssid,
                                position: self.getPairInfo(item.mac), tid: item.tid};
                        $.each(self.scanDeviceList, function(j, itemSub) {
                            if (item.mac == itemSub.mac) {
                                if (item.rssi >= self.rssiValue) {
                                    self.scanDeviceList.splice(j, 1, obj);
                                }
                                flag = false;
                                return false;
                            }
                        })
                        if (flag && !Util._isEmpty(obj)) {
                            self.scanDeviceList.push(obj);
                        }
                    }
                })
                self.$store.commit("setScanDeviceList", self.scanDeviceList);
            },
            onConScanBLE: function (devices) {
                var self = this;
                devices = JSON.parse(devices);
                self.setScanList(devices);
                window.onBackPressed = self.hide;
            }

        },
        components: {
            "v-importDevice": importDevice
        }


    });

    return JoinMesh;
});