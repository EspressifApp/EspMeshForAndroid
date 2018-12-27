define(["vue", "Util", "txt!../../pages/importDevice.html"], function(v, Util, importDevice) {

    var ImportDevice = v.extend({
        template: importDevice,
        props: {
            importId: {
                type: String
            }
        },
        data: function(){
            return {
                importFlag: false,
                total: 0,
                selected: 0,
                pairList: [],
                scanDeviceList: [],
                deviceList: [],
                searchName: "",
            }
        },
        computed: {
            importList: function () {
                var self = this, list = [], macs = [], searchList = [], deviceMacs = [];
                if (self.importFlag) {
                    self.scanDeviceList = self.$store.state.scanDeviceList;
                    self.deviceList = self.$store.state.deviceList;
                    $.each(self.deviceList, function(i, item) {
                        deviceMacs.push(item.mac);
                    })
                    $.each(self.scanDeviceList, function(i, item) {
                        macs.push(item.mac);
                    })
                    var staMac = window.espmesh.getStaMacsForBleMacs(JSON.stringify(macs));
                    macs = JSON.parse(staMac);
                    $.each(self.pairList, function(i, item) {
                        if (macs.indexOf(item.mac) == -1 && deviceMacs.indexOf(item.mac) == -1) {
                            list.push(item);
                        }
                    });
                    if (!Util._isEmpty(self.searchName)) {
                        $.each(list, function(i, item) {
                            var position = item.floor + "-" + item.area + "-" + item.code;
                            if (position.indexOf(self.searchName) != -1 || item.mac.indexOf(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        });
                    } else {
                        searchList = list;
                    }
                    setTimeout(function() {
                        var docs = $("#" + self.importId + " span.span-radio.active");
                        self.selected = docs.length;
                    });
                    self.total = searchList.length;
                    window.onBackPressed = this.hide;
                }
                return searchList;
            }
        },
        methods:{
            show: function() {
                this.selected = 0;
                this.total = 0;
                this.deviceList = [];
                this.getDevices();
                this.onBackImport();
                this.importFlag = true;
            },
            hide: function () {
                this.importFlag = false;
                this.$emit("importShow");
            },
            onBackImport: function() {
                window.onBackPressed = this.hide;
            },
            getDevices: function() {
                var self = this,
                    pairs = window.espmesh.loadHWDevices();
                if (!Util._isEmpty(pairs)) {
                    self.pairList = JSON.parse(pairs);
                }
                self.selected = self.count = self.pairList.length;
                setTimeout(function() {
                    $("#" + self.importId + " span.span-radio").addClass("active");
                })
                self.$store.commit("setSiteList", self.pairList);
            },
            save: function () {
                var self = this, docs = $("#"+ this.importId + " .item span.span-radio.active"),
                    list = [];
                for (var i = 0; i < docs.length; i++) {
                    var mac = $(docs[i]).attr("data-value"),
                        position = $(docs[i]).attr("data-position"),
                        bleMac = window.espmesh.getBleMacsForStaMacs(JSON.stringify([mac]));
                    bleMac = JSON.parse(bleMac);
                    self.scanDeviceList.push({mac: bleMac[0], name: mac, rssi: 0, position: position});
                };
                console.log(JSON.stringify(self.scanDeviceList));
                self.$store.commit("setScanDeviceList", self.scanDeviceList);
                self.hide();
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
        },
        created: function () {

        }

    });
    return ImportDevice;
});