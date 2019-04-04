define(["vue", "MINT", "txt!../../pages/deviceTypeInfo.html", "../js/otaInfo"],
    function(v, MINT, deviceTypeInfo, otaInfo) {

        var DeviceTypeInfo = v.extend({
            template: deviceTypeInfo,

            props: {
                title: {
                    type: String
                },
                minTid: {
                    type: Number
                },
                maxTid: {
                    type: Number
                }
            },
            data: function(){
                return {
                    flag: false,
                    deviceList: this.$store.state.deviceList,
                    infoShow: false,
                    otaTypeId: "ota-type-id",
                    total: 0,
                    selected: 0,
                    typeSelectId: "type-select-id",
                    otaMacs: []
                }
            },
            computed: {
                list: function () {
                    var self = this, list = [];
                    self.deviceList = this.$store.state.deviceList;
                    $.each(self.deviceList, function(i, item) {
                        if (item.tid >= self.minTid && item.tid <= self.maxTid) {
                            list.push(item);
                        }
                    });
                    self.total = list.length;
                    return list;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.deviceList = self.$store.state.deviceList;
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                    });
                    self.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("deviceTypeInfoShow");
                },
                hideParent: function() {
                    window.onBackPressed = this.hide;
                },
                getIcon: function (tid) {
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        return "icon-light";
                    } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        return "icon-power";
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        return "icon-sensor";
                    }
                },
                getColor: function (characteristics, tid) {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
                    $.each(characteristics, function(i, item) {
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
                    if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                        rgb = "#3ec2fc";
                    }
                    return rgb;
                },
                showOperate: function (e) {
                    var self = this;
                    self.infoShow = true;
                    window.onBackPressed = self.hideOperate;
                },
                hideOperate: function () {
                    window.onBackPressed = this.hide;
                    this.infoShow = false;
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
                otaTypeShow: function() {
                    var self = this;
                    self.otaMacs = [];
                    this.infoShow = false;
                    self.otaMacs = self.getMacs();
                    if (self.otaMacs.length > 0) {
                        setTimeout(function() {
                            self.$refs.ota.show();
                        })
                    } else {
                        MINT.Toast({
                            message: self.$t('deviceOtaDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        self.hideOperate();
                    }

                },
                delDevices: function (e) {
                    var self = this;
                    var macs = self.getMacs();
                    if (macs.length > 0) {
                        MINT.MessageBox.confirm(self.$t('deleteTypeDeviceDesc'), self.$t('reconfigure'),
                         {confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            self.hideOperate();
                            MINT.Indicator.open();
                            setTimeout(function() {
                                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                                    ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                                    DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                                espmesh.requestDevicesMulticastAsync(data);
                                espmesh.removeDevicesForMacs(JSON.stringify(macs));
                                var devices = [];
                                $.each(self.deviceList, function(i, item) {
                                    if (macs.indexOf(item.mac) < 0) {
                                        devices.push(item);
                                    }
                                })
                                MINT.Indicator.close();
                                setTimeout(function() {
                                    self.hide();
                                });
                                self.deviceList = devices;
                                self.$store.commit("setList", self.deviceList);
                            }, 1000);

                        });
                    } else {
                        MINT.Toast({
                            message: self.$t('deleteSelectDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        self.hideOperate();
                    }

                },
                getMacs: function() {
                    var docs = $("#"+ this.typeSelectId + " span.span-radio.active"),
                        macs = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    return macs;
                }
            },
            components: {
                "v-otaInfo": otaInfo
            }

        });
        return DeviceTypeInfo;
    });