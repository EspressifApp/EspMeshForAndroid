define(["vue", "MINT", "txt!../../pages/addEvent.html"],
    function(v, MINT, addEvent) {

    var AddEvent = v.extend({

        template: addEvent,
        props: {
            name: {
                type: String
            }
        },
        data: function(){
            return {
                flag: false,
                eventList: [],
                deviceInfo: {},
                deviceList: [],
                deviceEvent: {},
                subDeviceList: [],
                cidList: [],
                bgColor: "#000",
                eventType: EVENT_TYPE,
                changeColor: false,
                changeSlider: false,
                showStatus: false,
                showSlider: false,
                subShowStatus: false,
                subShowColor: false,
                triggerCompare: {},
                eventStatus: 0,
                eventClass: "off",
                subDeviceStatus: 0,
                subDeviceClass: "off",
                htmlSlider: "",
                sliderMin: 0,
                sliderMax: 0,
                sliderStep: 0,
                sliderVal: 0,
                type: "",
                desc: "",
                text: "",
                eventCid: ""
            }
        },

        computed: {

        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.eventOperate();
                self.deviceInfo = self.$store.state.deviceInfo;
                self.deviceList = self.$store.state.deviceList;
                var res = window.espmesh.loadDeviceEventsPositioin(self.deviceInfo.mac);
                self.deviceEvent = JSON.parse(res);
                self.eventList = JSON.parse(self.deviceEvent.events);
                self.desc = "";
                self.text = "";
                self.type = "";
                self.eventCid = "";
                self.changeColor = false;
                self.changeSlider = false;
                self.showStatus = false;
                self.showSlider = false;
                self.subShowStatus = false;
                self.subShowColor = false;
                self.triggerCompare = {};
                self.htmlSlider = "";
                self.sensorVal = [];
                self.sliderMin = 0;
                self.sliderMax = 0;
                self.sliderStep = 0;
                self.sliderVal = 0;
                self.subDeviceStatus = 0;
                self.subDeviceClass = "off";
                if (!self._isEmpty(self.name)) {
                   self.eventItem();
                   self.getDescAndText();
                } else {
                     self.addEventItem();
                }
                self.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("addEventShow");
            },
            eventOperate: function() {
                var self = this;
                $(document).on('click', 'div.on-off', function(event){
                    self.changeSwitch(this);
                });
            },
            changeSwitch: function (obj) {
                var doc = $(obj);
                var docStrong = doc.parent().parent().parent().find("strong");
                if (doc.hasClass("off")) {
                    doc.addClass("on").removeClass("off");
                    docStrong.text("on");
                    doc.attr("data-status", STATUS_ON);
                } else {
                    doc.addClass("off").removeClass("on");
                    docStrong.text("off");
                    doc.attr("data-status", STATUS_OFF);
                }
            },
            eventItem: function() {
                var self = this,
                    mac = self.deviceInfo.mac;
                $.each(self.eventList, function(i, item){
                    if (item.name == self.name) {
                        self.getEventDevices(item.execute_mac);
                        self.type = item.trigger_content.request;
                        self.eventCid = item.trigger_cid;
                        self.triggerCompare = item.trigger_compare;
                        return false;
                    }
                });
            },
            addEventItem: function() {
                var self = this;
                if(self.eventList.length > 0) {
                    self.getEventDevices(self.eventList[0].execute_mac);
                }
                self.getAttr();
                self.desc = "When the status of the device changes, the lights associated with it change accordinglys";
            },
            getEventDevices: function(subMacs) {
                var list = [], self = this, hueValue = 0, saturation = 0, luminance = 0;
                $.each(self.deviceList, function(i, item) {
                    if (subMacs.indexOf(item.mac) > -1) {
                        list.push(item);
                    }
                });
                if (list.length > 0) {
                    var device = list[0];
                    $.each(device.characteristics, function(i, itemSub) {
                        if (itemSub.cid == HUE_CID) {
                            hueValue = itemSub.value;
                        }else if (itemSub.cid == SATURATION_CID) {
                            saturation = itemSub.value;
                        }else if (itemSub.cid == VALUE_CID) {
                            luminance = itemSub.value;
                        }else if (itemSub.cid == STATUS_CID) {
                            self.subDeviceStatus = itemSub.value;
                        }
                    })
                }
                self.subDeviceClass = (self.subDeviceStatus == STATUS_ON) ? "on" : "off";
                self.bgColor = Raphael.getRGB("hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+
                                        (luminance / 100) +")").hex;
                self.subDeviceList = list;
            },
            getCidList: function(cids) {
                 var list = [], self = this;
                 $.each(self.deviceInfo.characteristics, function(j, item) {
                     var cid = item.cid;
                     if (cids.indexOf(cid) > -1) {
                         list.push(item);
                     }
                 });
                 self.cidList = list;
            },
            getAttr: function() {
                 var self= this,
                     tid = self.deviceInfo.tid;
                 if (tid >= MIN_SWITCH && tid <=  MAX_SWITCH) {
                     if (tid == TOUCH_PAD_SWITCH) {
                         self.eventType = EVENT_TYPE;
                         self.getCidList(SWITCH_TOUCH_CID_LIST);
                     } else {
                         self.eventType = [];
                         self.eventType.push(EVENT_TYPE[1]);
                         self.getCidList(SWITCH_CID_LIST);
                         self.showStatus = true;
                         self.eventClass = (self.eventStatus == STATUS_ON) ? "on" : "off";
                     }

                 } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                     self.eventType = [];
                     self.eventType.push(EVENT_TYPE[0]);
                     self.getCidList(LIGHT_CID_LIST);
                 } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR)  {
                     self.getCidList(SENSOR_CID_LIST);
                     self.eventType = [];
                     self.showSlider = true;
                     self.eventType.push(EVENT_TYPE[1]);
                     self.showSensorEvent();
                 }
            },
            getDescAndText: function() {
                var self= this,
                    tid = self.deviceInfo.tid,
                    name = self.name;
                if (name.indexOf("_") > -1) {
                    name = name.split("_")[0];
                }
                name = name.toLocaleLowerCase();
                if (tid >= MIN_SWITCH && tid <=  MAX_SWITCH) {
                    if (tid == TOUCH_PAD_SWITCH) {
                        self.eventType = EVENT_TYPE;
                        self.getCidList(SWITCH_TOUCH_CID_LIST);
                    } else {
                        self.eventType = [];
                        self.eventType.push(EVENT_TYPE[1]);
                        self.getCidList(SWITCH_CID_LIST);
                        self.showStatus = true;
                        self.eventStatus = self.triggerCompare[OPERATOR_EQUAL];
                        self.eventClass = (self.eventStatus == STATUS_ON) ? "on" : "off";
                    }

                    self.text = "If the switch status at " + name + ", " +
                        "the lights associated with it is also " + name;
                    self.desc = "When the status of the switch change, the lights associated with it change accordingly";
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    self.eventType = [];
                    self.eventType.push(EVENT_TYPE[0]);
                    self.getCidList(LIGHT_CID_LIST);
                    self.text = "If the light status at " + name + ", " +
                            "the lights associated with it is also " + name;
                    self.desc = "When the light properties change, the lights associated with them will also change accordingly";
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR)  {
                    self.getCidList(SENSOR_CID_LIST);
                    self.eventType = [];
                    self.showSlider = true;
                    self.eventType.push(EVENT_TYPE[1]);
                    self.showSensorEvent();
                    self.text = "If the sensor status at " + name + ", " +
                                    "the lights associated with it is also " + name;
                    self.desc = "When the status of the sensor change, the lights associated with it change accordingly";
                } else {
                    self.text = "If the device status at " + name + ", " +
                                    "the lights associated with it is also " + name;
                    self.desc = "When the status of the device change, the lights associated with it change accordingly";
                }
            },
            getIcon: function () {
                var self = this,
                    tid = self.deviceInfo.tid,
                    icon = "";
                if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    icon = "icon-power";
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    icon = "icon-serson";
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    icon = "icon-light";
                }
                return icon;
            },
            showSensorEvent: function() {
                var self = this,
                    max = self.triggerCompare[OPERATOR_MAX],
                    min = self.triggerCompare[OPERATOR_MIN],
                    itemMac = self.getDeviceBymac();
                if (self._isEmpty(max) && self._isEmpty(min)) {
                    max = min = self.triggerCompare[OPERATOR_EQUAL];
                } else if (self._isEmpty(min)) {
                    min = 0;
                }else if (self._isEmpty(max)) {
                    max = itemMac.max;
                }
                if (max == min) {
                    self.htmlSlider = "<i class='symbol'>" + OPERATOR_EQUAL + "</i><i class='num-value'>" + min + "</i>";
                } else {
                    self.htmlSlider = "<i class='symbol'>" + OPERATOR_MIN + "</i>&nbsp;<i class='num-value'>" + min + "</i>&nbsp;&&nbsp;" +
                        "<i class='symbol'>" + OPERATOR_MAX + "</i>&nbsp;<i class='num-value'>" + max + "</i>";
                }
                self.sliderMin = min;
                self.sliderMax = max;
                self.sliderStep = itemMac.step;
                self.sliderVal = itemMac.max;
            },
            getDeviceBymac: function (mac) {
                var self = this, itemMac;
                $.each(self.deviceInfo.characteristics, function(j, itemSub) {
                    var cid = itemSub.cid;
                    if (SENSOR_CID_LIST.indexOf(cid) > -1) {
                        itemMac = itemSub;
                    }
                });
                return itemMac;
            },
            hideSlider: function() {
                this.changeSlider = false;
            },
            initSlider: function () {
                var self = this;
                self.changeSlider = true;
                var docSlider = $("#event-slider");
                docSlider.slider({
                    range: true,
                    min: 0,
                    max: parseInt(1000),
                    step: parseInt(10),
                    values: [parseInt(self.sliderMin), parseInt(self.sliderMax)],
                    slide: function( event, ui ) {
                        self.sliderMin = ui.values[0];
                        self.sliderMax = ui.values[1];
                        self.changeConditions(ui.values[1], ui.values[0])
                    }
                });
            },
            changeConditions: function (max, min) {
                var self = this;
                if (max == min) {
                    self.htmlSlider = "<i class='symbol'>" + OPERATOR_EQUAL + "</i><i class='num-value'>" + min + "</i>";
                } else {
                   self.htmlSlider = "<i class='symbol'>" + OPERATOR_MIN + "</i>&nbsp;<i class='num-value'>" + min + "</i>&nbsp;&&nbsp;" +
                        "<i class='symbol'>" + OPERATOR_MAX + "</i>&nbsp;<i class='num-value'>" + max + "</i>"
                }
            },
            eventPlus: function() {

            },
            setEvent: function () {
                var self = this,
                    events = [],
                    macs = [],
                    tid = self.deviceInfo.tid,
                    mac = self.deviceInfo.mac;
                if (self._isEmpty(self.name)) {
                    self.name = self.text;
                }
                if (self._isEmpty(self.name)) {
                    MINT.Toast({
                        message: 'Please enter a name！',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.type)) {
                    MINT.Toast({
                        message: 'Please choose a type！',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                $.each(self.subDeviceList, function(i, item) {
                    macs.push(item.mac);
                });
                if (tid >= MIN_SWITCH && tid <=  MAX_SWITCH) {
                    var rgb = Raphael.getRGB(self.bgColor);
                    var hsb = Raphael.rgb2hsb(rgb);
                    if (tid == TOUCH_PAD_SWITCH) {
                        if (self.eventCid == TOUC_PAD_BTN_3) {
                            events.push(self._assemblySyscEvent(self.name, self.eventCid, macs));
                        } else {
                            events.push(self._assemblySwitchEvent(self.name, self.eventCid, macs,
                                hsb.h * 360, hsb.s * 100, hsb.b * 100));
                        }
                    } else {
                       events.push(self._assemblySwitchEvent(self.name, self.eventCid, macs,
                                                       hsb.h * 360, hsb.s * 100, hsb.b * 100));
                    }
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    events.push(self._assemblySyscEvent(self.name, self.eventCid, macs));

                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    var compare = {};
                    if (self.sliderMin == self.sliderMax) {
                        compare = {'==': self.sliderMin, '~': 50}
                    } else {
                        compare = {'>': self.sliderMin, '<': self.sliderMax, '~': 50}
                    }
                    events.push(self._assemblyOtherEvent(self.name, self.eventCid, macs, self.subDeviceStatus));
                }
                MINT.Indicator.open();
                setTimeout(function() {
                    var data = '{"' + MESH_MAC + '": "' + mac + '","' + MESH_REQUEST + '": "' + SET_EVENT + '",' +
                        '"events":' + JSON.stringify(events) + ', "callback": "onSetEvent", "tag": {"event": '+
                        JSON.stringify(events)+', "mac": "'+mac+'"}}';
                    espmesh.requestDeviceAsync(data);

                }, 500);

            },
            onSetEvent: function(res) {
                var self = this;
                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    var result = res.result;
                    var tag = res.tag;
                    if (result.status_code == 0) {
                        self.editSession(tag.mac, null , JSON.parse(tag.events));
                        MINT.Toast({
                            message: 'event added successfully！',
                            position: 'bottom',
                            duration: 2000
                        });
                        self.hide();
                    } else {
                        MINT.Toast({
                            message: 'event failed to add！',
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                } else {
                    MINT.Toast({
                        message: 'event failed to add！',
                        position: 'bottom',
                        duration: 2000
                    });
                }
                MINT.Indicator.close();
            },
            editSession: function (mac, position, events) {
                var self = this,
                    res = window.espmesh.loadDeviceEventsPositioin(mac),
                    deviceEvents = [], editEvents = [];
                if (self._isEmpty(res)) {
                    deviceEvents = events;
                    window.espmesh.saveDeviceEventsPosition(mac, JSON.stringify(events), JSON.stringify(position));
                } else {
                    res = JSON.parse(res);
                    var names = [];
                    if (!self._isEmpty(events) && events.length > 0) {
                        editEvents = JSON.parse(res.events);
                        $.each(events, function(j, itemSub) {
                            deviceEvents.push(itemSub);
                            names.push(itemSub.name);
                        });
                        $.each(editEvents, function(i, item) {
                            if (names.indexOf(item.name) < 0) {
                                deviceEvents.push(item);
                            }
                        });
                        window.espmesh.saveDeviceEventsPosition(mac, JSON.stringify(deviceEvents), res.position);
                    }
                }
                self.$emit("changEventList");
            },
            attriType: function(type) {
                this.type = type;
            },
            attribute: function(cid){
                var self = this;
                self.eventCid = cid,
                tid = self.deviceInfo.tid;
                if(tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    if (tid == TOUCH_PAD_SWITCH) {
                        if (cid != TOUC_PAD_BTN_3) {
                            self.type = EVENT_TYPE[1];
                        } else {
                            self.type = EVENT_TYPE[0];
                        }
                    } else {
                         self.showStatus = true;
                         self.subShowStatus = true;
                         self.subShowColor = true;
                    }
                }
            },
            changeColor: function() {

            },
            hideColor: function() {
                this.changeColor = false;
            },
            eventColorPicke: function () {
                var self = this;
                self.changeColor = true;
                var docPicker = $("#event-color-picker");
                var doc = $("span.color-spicker");
                docPicker.empty();
                var top = docPicker.offset().top;
                var width = $(document).width();
                var leftWidth = docPicker.offset().left ;
                self.initColorPicker(self.bgColor, leftWidth, "event-color-picker", top, true);
            },
            initColorPicker: function (hsb, left, id, top) {
                var self = this;
                Raphael(function() {
                    var cp = Raphael.colorwheel(left,
                        top, 180, hsb,
                        document.getElementById(id), 50, 10, true),
                        clr = hsb;
                    var onchange = function (item) {
                        return function (clr) {
                            clr = Raphael.color(clr);
                            self.bgColor = "rgb("+ clr.r + "," + clr.g + "," + clr.b + ")";
                        };
                    };
                    cp.onchange = onchange(cp);
                })
            },
            _assemblyOtherEvent: function (name, cid, mac, compare, status) {
                var event = {
                    "name": name,
                    "trigger_cid": cid,
                    "trigger_content": {"request": CONTROL},
                    "trigger_compare": compare,
                    "execute_mac": mac,
                    "execute_content":{"request": SET_STATUS,"characteristics":[
                        {"cid": STATUS_CID,"value": status}
                    ]}
                };
                return event;
            },
            _assemblySwitchEvent: function (name, cid, mac, hue, saturation) {
                var event = {
                    "name": name,
                    "trigger_cid": cid,
                    "trigger_content": {"request": CONTROL},
                    "trigger_compare": MESH_LIGHT_SYSC_COLOR,
                    "execute_mac": mac,
                    "execute_content":{"request": SET_STATUS,"characteristics":[
                        {"cid": HUE_CID,"value": hue},
                        {"cid": SATURATION_CID,"value": saturation},
                    ]}
                };
                return event;
            },
            _assemblySyscEvent: function (name, cid, childMacs) {
                var event = {
                    "name": name,
                    "trigger_content": {"request": SYSC,"execute_cid": cid},
                    "trigger_cid": cid,
                    "trigger_compare": MESH_LIGHT_SYSC,
                    "execute_mac": childMacs
                };
                return event;
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        created: function () {

        },
        components: {
        }

    });
    return AddEvent;
});