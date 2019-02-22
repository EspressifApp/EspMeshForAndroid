define(["vue","MINT", "Util", "txt!../../pages/automation-all.html" ],
    function(v, MINT, Util, automationAll) {
        var AutomationAll = v.extend({

            template: automationAll,
            props: {
                deviceInfo: {
                    type: Object
                },
                autoId: {
                    type: String
                }
            },
            data: function(){
                return {
                    existEvent: false,
                    autoIdAll: "",
                    eventNames: [],
                    deviceList: [],
                    eventFlag: false,
                    eventCid: -1,
                    eventCidList: [],
                    isSelectedMacs: [],
                    selected: 0,
                }
            },
            computed: {
                count: function () {
                    var self = this, list = [];
                    if (self.$parent.deviceEvent) {
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
                show: function() {
                    var self = this;
                    self.autoIdAll = self.autoId + "-all";
                    self.selected = 0;
                    self.existEvent = false;
                    self.eventFlag = false;
                    self.eventCid = -1;
                    self.isSelectedMacs = [];
                    self.deviceList = self.$store.state.deviceList;
                    $("#" + self.autoIdAll + " span.span-radio").removeClass("active");
                    console.log(JSON.stringify(self.deviceInfo));
                    window.onGetAllEvent = this.onGetAllEvent;
                    setTimeout(function() {
                       MINT.Indicator.open();
                       setTimeout(function() {
                           self.getEvent("");
                       }, 1000);
                    })
                },
                checkRadio: function(cid) {
                    var self = this;
                    self.eventCid = cid;
                    setTimeout(function() {
                        self.eventFlag = false;
                           MINT.Indicator.open();
                           setTimeout(function() {
                               self.getEvent(cid);
                               MINT.Indicator.close();
                           }, 1000);
                    }, 200)
                },
                getEvent: function(cid) {
                    var self = this;
                    var obj = {"cid": cid};
                    if (cid == "") {
                        obj = {"cid": ""};
                    }
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                        GET_EVENT +'", "callback": "onGetAllEvent", "tag": '+JSON.stringify(obj)+'}';
                    espmesh.requestDeviceAsync(data);

                },
                getEventMacs: function(cid, deviceEvents) {
                    var self = this, executeMacs = [];
                    $.each(deviceEvents, function(i, item) {
                        var execute_mac = [];
                        if (!Util._isEmpty(cid)) {
                            if (item.trigger_cid == cid) {
                                execute_mac = item.execute_mac;
                                self.eventNames.push({name: item.name});
                            }
                        } else {
                            execute_mac = item.execute_mac;
                            self.eventNames.push({name: item.name});
                        }
                        $.each(execute_mac, function(j, subItem) {
                            if (executeMacs.indexOf(subItem) == -1) {
                                executeMacs.push(subItem);
                            }
                        })
                    });
                    return executeMacs;
                },
                hide: function () {
                    this.$parent.hide();
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
                    var self = this, docs = $("#" + self.autoIdAll + " span.span-radio.active"),
                        macs = [], tid = self.deviceInfo.tid,
                        parentMac = self.deviceInfo.mac;
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    if (macs.length > 0) {
                        MINT.Indicator.open();
                        if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                            if (tid == TOUCH_PAD_SWITCH) {
                                setTimeout(function() {
                                    Util.switchTouchDefaultEvent(parentMac, macs, self.$store.state.deviceIp);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);
                            } else {
                                setTimeout(function() {
                                    Util.switchDefaultEvent(parentMac, macs, self.$store.state.deviceIp);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);

                            }
                        } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                            if (tid == SENSOR_24) {
                                setTimeout(function() {
                                    Util.sensor24DefaultEvent(parentMac, macs, self.$store.state.deviceIp);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);
                            } else {
                                setTimeout(function() {
                                    Util.sensorDefaultEvent(parentMac, macs, self.$store.state.deviceIp);
                                    MINT.Indicator.close();
                                    self.hide();
                                }, 500);
                            }

                        } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                            setTimeout(function() {
                                Util.lightSyscEvent(parentMac, macs, self.$store.state.deviceIp);
                                MINT.Indicator.close();
                                self.hide();
                            }, 500);

                        }
                    } else if (self.existEvent) {
                        MINT.MessageBox.confirm(self.$t('emptyEventDesc'), self.$t('emptyEventTitle'),{
                                confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            MINT.Indicator.open();
                            setTimeout(function() {
                                self.delEvent(parentMac);
                                MINT.Indicator.close();
                                self.hide();
                            }, 500);

                        });

                    } else {
                        self.hide();
                    }
                },
                delEvent: function (parentMac) {
                    var data = '{"' + MESH_MAC + '": "' + parentMac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                        '"events":' + JSON.stringify(this.eventNames) + '}';
                    espmesh.requestDeviceAsync(data);

                },
                selectMac: function(mac) {
                    var num = this.isSelectedMacs.indexOf(mac);
                    if (num == -1) {
                        this.isSelectedMacs.push(mac);
                    } else {
                        this.isSelectedMacs.splice(num, 1);
                    }
                    this.selected = this.isSelectedMacs.length;
                },
                isSelected: function(mac) {
                    var self = this,
                        flag = false;
                    if (self.isSelectedMacs.indexOf(mac) != -1) {
                        flag = true;
                    }
                    return flag;
                },
                selectAllDevice: function (e) {
                    var self = this;
                    var doc = $(e.currentTarget).find("span.span-radio")[0];
                    if ($(doc).hasClass("active")) {
                        $(doc).removeClass("active");
                        this.selected = 0;
                        this.isSelectedMacs = [];
                    } else {
                        $(doc).addClass("active");
                        this.selected = this.count;
                        var allMacs = [];
                        $.each(this.deviceList, function(i, item) {
                            if (item.mac != self.deviceInfo.mac) {
                                allMacs.push(item.mac);
                            }
                        })
                        this.isSelectedMacs = allMacs;
                    }

                },
                onGetAllEvent: function(res) {
                    var self = this;
                    console.log(res);
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (!Util._isEmpty(res.result)) {
                            var result = res.result;
                            var tag = res.tag;
                            if (!Util._isEmpty(result.trigger)) {
                                var deviceEvents = result.trigger;
                                if (!Util._isEmpty(deviceEvents)) {
                                    self.existEvent = true;
                                    var executeMacs = self.getEventMacs(tag.cid, deviceEvents);
                                    console.log(JSON.stringify(executeMacs));
                                    $.each(self.deviceList, function(i, item) {
                                        if (executeMacs.indexOf(item.mac) > -1) {
                                            self.selected++;
                                            self.isSelectedMacs.push(item.mac);
                                        }
                                    });
                                }
                            }
                        }
                    }
                    MINT.Indicator.close();
                },
            }

        });

        return AutomationAll;
    });