define(["vue", "MINT", "Util", "txt!../../pages/timingDevice.html", "../js/timing"],
    function(v, MINT, Util, timingDevice, timing) {

        var TimingDevice = v.extend({
            template: timingDevice,
            props: {
                timingInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    flag: false,
                    deviceList: this.$store.state.deviceList,
                    timingDeviceId: "timing-device-id",
                    total: 0,
                    selected: 0,
                    timingSelectId: "timing-select-id",
                    timingMacs: [],
                    existMacs:[],
                    name: "",
                }
            },
            computed: {
                list: function () {
                    var self = this, list = [];
                    if (self.flag) {
                        self.deviceList = self.$store.state.deviceList;
                        list = Util.sortList(self.deviceList);
                        self.total = list.length;
                    }
                    return list;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.deviceList = self.$store.state.deviceList;
                    $("span.span-radio").removeClass("active");
                    self.selected = 0;
                    if (self.timingInfo) {
                        self.existMacs = self.timingInfo.macs;
                        self.name = self.timingInfo.name;
                    } else {
                        self.existMacs = [];
                        self.name = "";
                    }
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                        self.setSelected();
                    });
                    self.flag = true;
                },
                timingFun: function() {
                    var self = this;
                    self.timingMacs = self.getMacs();
                    setTimeout(function() {
                        self.$refs.timing.show();
                    }, 100)
                },
                setSelected: function() {
                    var self = this;
                    $.each(self.deviceList, function(i, item) {
                        var mac = item.mac;
                        if (self.existMacs.indexOf(mac) > -1) {
                            self.selected++;
                            $("#" + self.timingSelectId + " span.span-radio[data-value='"+mac+"']").addClass("active");
                        }
                    });

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
                hide: function () {
                    this.flag = false;
                    this.$emit("timingDeviceShow");
                },
                hideThis: function() {
                    window.onBackPressed = this.hide;
                },
                hideParent: function() {
                    this.hide();
                    this.$parent.getList();
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
                getMacs: function() {
                    var docs = $("#"+ this.timingSelectId + " span.span-radio.active"),
                        macs = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    return macs;
                },
                saveDevice: function() {
                    var self= this,
                        macs = self.getMacs();
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_CALENDAR + '","' +
                                MESH_CALENDAR + '": ' + JSON.stringify(self.timingInfo) + ',"callback": "saveDeviceResult"}';
                    MINT.Indicator.open();
                    setTimeout(function() {
                        espmesh.requestDevicesMulticast(data);
                    }, 1000)
                },
                saveDeviceResult: function(res) {
                    var self= this;
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.result.length > 0) {
                            MINT.Toast({
                              message: self.$t('saveSuccessDesc'),
                              position: 'bottom',
                              duration: 2000
                            });
                            this.hideParent();
                        } else {
                            MINT.Toast({
                              message: self.$t('saveFailDesc'),
                              position: 'bottom',
                              duration: 2000
                            });
                        }
                    } else {
                        MINT.Toast({
                          message: self.$t('saveFailDesc'),
                          position: 'bottom',
                          duration: 2000
                        });
                    }
                    MINT.Indicator.close();
                }
            },
            components: {
                "v-timing": timing
            },
            created: function () {
                window.saveDeviceResult = this.saveDeviceResult;
            }

        });
        return TimingDevice;
    });