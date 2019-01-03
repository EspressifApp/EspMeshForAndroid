define(["vue","MINT", "Util", "txt!../../pages/automation-btn-devices.html", "../js/automation-btn"],
    function(v, MINT, Util, automationBtnDevices, automationBtn) {

        var AutomationBtnDevices = v.extend({
            template: automationBtnDevices,
            props: {
                deviceInfo: {
                    type: String
                },
                autoId: {
                    type: String
                },
                deviceEvents: {
                    type: Array
                },
                isMuch: {
                    type: Boolean
                }
            },
            data: function(){
                return {
                    showFlag: false,
                    autoIdBtn: "",
                    showFlag: false,
                    existEvent: false,
                    eventDevices: false,
                    isMuch: false,
                    eventType: -1,
                    eventNames: [],
                    deviceList: [],
                    selectMacs: [],
                    selected: 0,

                }
            },
            computed: {
                count: function () {
                    var self = this, list = [];
                    if (self.showFlag) {
                        self.deviceList = Util.sortList(self.$store.state.deviceList);
                        $.each(self.deviceList, function(i, item) {
                            if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT && item.mac != self.deviceInfo.mac) {
                                list.push(item);
                            }
                        });
                    }
                    return list.length;
                }
            },
            methods:{
                onValuesChange(picker, values) {

                },
                show: function() {
                    var self = this;
                    self.selected = 0;
                    self.eventType = -1;
                    self.existEvent = false;
                    self.eventDevices = false;
                    self.autoIdBtn = self.autoId + "-btn";
                    self.selectMacs = [];
                    self.isMuch = false;
                    self.showFlag = true;
                    self.deviceList = self.$store.state.deviceList;
                    self.hideThis();
                    $("#" + self.autoIdBtn + " span.span-radio").removeClass("active");
                    setTimeout(function() {
                        MINT.Indicator.open();
                        setTimeout(function() {
                            self.getEvent();
                            MINT.Indicator.close();
                        }, 1000)
                    }, 200)
                },
                getEvent: function() {
                    var self = this;
                    if (!Util._isEmpty(self.deviceEvents)) {
                        var executeMacs = self.getEventMacs(self.deviceEvents);
                        $.each(self.deviceList, function(i, item) {
                            if (executeMacs.indexOf(item.mac) > -1) {
                                self.existEvent = true;
                                self.selected++;
                                $("#" + self.autoIdBtn + " span.span-radio[data-value='"+item.mac+"']").addClass("active");
                            }
                        });
                    }
                },
                getEventMacs: function(deviceEvents) {
                    var self = this, executeMacs = [];
                    $.each(deviceEvents, function(i, item) {
                        var execute_mac = item.execute_mac;
                        self.eventNames.push({name: item.name});
                        $.each(execute_mac, function(j, subItem) {
                            if (executeMacs.indexOf(subItem) == -1) {
                                executeMacs.push(subItem);
                            }
                        })
                    });
                    return executeMacs;
                },
                hide: function () {
                    this.showFlag = false;
                    this.$emit("autoDevicesShow");
                    MINT.Indicator.close();
                },
                hideParent: function () {
                    this.showFlag = false;
                    this.$parent.hideParent();
                },
                hideThis: function() {
                    window.onBackPressed = this.hide;
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
                showCondition: function(mac, tid) {
                    var self = this, flag = true;
                    if (mac == self.deviceInfo.mac || tid < MIN_LIGHT || tid > MAX_LIGHT) {
                        flag = false;
                    };
                    return flag;
                },
                save: function() {
                    var self = this, docs = $("#" + self.autoIdBtn + " span.span-radio.active"),
                        macs = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    if (macs.length > 0) {
                        self.selectMacs = macs;
                        setTimeout(function() {
                            self.$refs.autoBtn.show();
                        }, 100)
                    } else {
                        MINT.Toast({
                            message: self.$t('请选择设备！'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                delEvent: function (parentMac) {
                    var data = '{"' + MESH_MAC + '": "' + parentMac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                        '"events":' + JSON.stringify(this.eventNames) + '}';
                    espmesh.requestDeviceAsync(data);
                },
                selectAllDevice: function (e) {
                    var self = this;
                    var doc = $(e.currentTarget);
                    if (doc.hasClass("active")) {
                        doc.removeClass("active");
                        $("#" + self.autoIdBtn + " span.span-radio").removeClass("active");
                        this.selected = 0;
                    } else {
                        doc.addClass("active");
                        $("#" + self.autoIdBtn + " span.span-radio").addClass("active");
                        this.selected = this.count;
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
            components: {
                "v-automationBtn": automationBtn
            }

        });

        return AutomationBtnDevices;
    });