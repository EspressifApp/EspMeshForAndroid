define(["vue","MINT", "Util", "txt!../../pages/automation-btn.html"],
    function(v, MINT, Util, automationBtn) {
        var AutomationBtn = v.extend({

            template: automationBtn,
            props: {
                deviceInfo: {
                    type: Object
                },
                selectMacs: {
                    type: Array
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
                    autoIdBtn: "",
                    showFlag: false,
                    eventNames: [],
                    showSelect: false,
                    deviceList: [],
                    selected: 0,
                    selectDevices: false,
                    eventFlag: true,
                    eventCids: [],
                    btnValues: BUTTON_DEVICES,
                    pressList: {"1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
                        "10": [], "11": [], "12": [], "13": []},
                    eventA: [],
                    deviceA: [],
                    eventB: [],
                    deviceB: [],
                    eventC: [],
                    deviceC: [],
                    eventD:[],
                    deviceD: [],
                    eventUp: [],
                    eventDown: [],
                    existEvent: false,
                    isSelectedMacs: [],
                    shortPress: [{"id": "1", "name": this.$t('onOff')},
                        {"id": "8", "name": this.$t('brightness')},
                        {"id": "9", "name": this.$t('hue')},
                        {"id": "10", "name": this.$t('temp')},
                        {"id": "2", "name": this.$t('brightMode'), h: "60", s: "0", b: "100"},
                        //{"id": "3", "name": this.$t('blinkMode'), h: "222", s: "57", b: "91"},
                        //{"id": "4", "name": this.$t('glitterMode'), h: "176", s: "55", b: "77"},
                        {"id": "5", "name": this.$t('readMode'), h: "39", s: "14", b: "90"},
                        {"id": "6", "name": this.$t('cozyMode'), h: "60", s: "10", b: "100"},
                        {"id": "7", "name": this.$t('bedtime'), h: "33", s: "100", b: "66"}],
                    longPress: [
                            {"id": "11", "name": this.$t('brightness')},{"id": "12", "name": this.$t('hue')},
                        {"id": "13", "name": this.$t('temp')}],
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
                    return list;
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.eventFlag = true;
                    self.eventCid = "";
                    self.showSelect = false;
                    window.onBackPressed = self.hide;
                    window.onDelButton = self.onDelButton;
                    self.deviceList = self.$store.state.deviceList;
                    self.pressList = {"1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
                                            "10": [], "11": [], "12": [], "13": []};
                    self.eventA = [];
                    self.eventB = [];
                    self.eventC = [];
                    self.eventD =[];
                    self.deviceA = [];
                    self.deviceB = [];
                    self.deviceC = [];
                    self.deviceD =[];
                    self.eventUp = [];
                    self.eventDown = [];
                    self.selected = 0;
                    self.isSelectedMacs = [];
                    setTimeout(function() {
                        self.meshDrop();
                        MINT.Indicator.open();
                        setTimeout(function() {
                            self.getEvent();
                            MINT.Indicator.close();
                        }, 1000)
                    }, 200)
                    self.showFlag = true;
                },
                onValuesChange(picker, values) {

                },
                getEvent: function() {
                    var self = this;
                    if (!Util._isEmpty(self.deviceEvents)) {
                        $.each(self.deviceEvents, function(i, item) {
                            console.log(JSON.stringify(item));
                            self.initEvent(item);
                            if (self.isMuch) {
                                self.initDeviceMac(item);
                            }
                        });
                    }
                },
                initEvent: function(item) {
                    var type = parseInt(item.event_type);

                    if(type == 1) {
                        if(!this.isMuch) {
                            this.setButtonEvent(item.name, item.trigger_cid, true, 0, 0, 0, STATUS_CID,
                                type, 0, 2);
                        }
                        this.initBtnEvent(item.trigger_cid, type, false);
                    } else if (type == 11 || type == 12 || type == 13) {
                        var trigger_cid = item.trigger_cid, leftCid = STATUS_CID, rightCid = HUE_CID,
                            leftValue = BUTTON_EVENT_5, rightValue = BUTTON_EVENT_4, leftName = "", rightName = "";
                        if (trigger_cid == this.btnValues.upleft || trigger_cid == this.btnValues.upright) {
                            leftCid = this.btnValues.upleft;
                            rightCid = this.btnValues.upright;
                        } else {
                            leftCid = this.btnValues.downleft;
                            rightCid = this.btnValues.downright;
                        }
                        if (type == 11) {
                            leftValue = BUTTON_EVENT_8;
                            rightValue = BUTTON_EVENT_9;
                            leftName = "BRI_IN";
                            rightName = "BRI_DE";
                        } else if (type == 12) {
                            leftValue = BUTTON_EVENT_6;
                            rightValue = BUTTON_EVENT_7;
                            leftName = "WARM_IN";
                            rightName = "WARM_DE";
                        } else if (type == 13) {
                            leftValue = BUTTON_EVENT_4;
                            rightValue = BUTTON_EVENT_5;
                            leftName = "HUE_IN";
                            rightName = "HUE_DE";
                        }
                        this.setLongEvent(leftName, rightName, leftCid, rightCid, type, leftValue, rightValue);
                    } else if (type == 8 || type == 9 || type == 10) {
                        var defaultValue = 0;
                        if(type == "8") {
                            defaultValue = 4;
                        } else if (type == "9") {
                            defaultValue = 3;
                        } else if(type == "10") {
                            defaultValue = 5;
                        }
                        this.setButtonEvent(item.name, item.trigger_cid, false, h, s, b, item.execute_cid,
                                type, 0, defaultValue);
                    } else {
                        var h = 0, s = 0, b = 0;
                        $.each(item.execute_content.characteristics, function(i, obj) {
                            if (obj.cid == HUE_CID) {
                                h = obj.value;
                            } else if (obj.cid == SATURATION_CID) {
                                s = obj.value;
                            } else if (obj.cid == VALUE_CID) {
                                b = obj.value;
                            } else if (obj.cid == TEMPERATURE_CID && type == 2) {
                                h = obj.value;
                            } else if (obj.cid == BRIGHTNESS_CID && type == 2) {
                                b = obj.value;
                            }
                        });
                        this.setButtonEvent(item.name, item.trigger_cid, false, h, s, b, item.execute_cid,
                            type, 0);
                        console.log(type);
                        this.initBtnEvent(item.trigger_cid, type, false);
                    }


                },
                initDeviceMac: function(item) {
                    var self = this,
                        cid = item.trigger_cid;
                    if (cid == this.btnValues.longupleft || cid == this.btnValues.upleft) {
                        self.deviceA = item.execute_mac;
                    } else if (cid == this.btnValues.longupright || cid == this.btnValues.upright) {
                        self.deviceB = item.execute_mac;
                    } else if (cid == this.btnValues.longdownleft || cid == this.btnValues.downleft) {
                        self.deviceC = item.execute_mac;
                    } else if (cid == this.btnValues.longdownright || cid == this.btnValues.downright) {
                        self.deviceD = item.execute_mac;
                    }
                },
                initBtnEvent: function(cid, type, flag) {
                    console.log(type);
                    var self = this;
                    var name = "";
                    switch (cid) {
                        case self.btnValues.upleft:
                            if (flag) {
                                name = "AB";
                            } else {
                                name = "A";
                            }
                            break;
                        case self.btnValues.upright:
                            if (flag) {
                                name = "AB";
                            } else {
                                name = "B";
                            }
                            break;
                        case self.btnValues.downleft:
                            if (flag) {
                                name = "CD";
                            } else {
                                name = "C";
                            }
                            break;
                        case self.btnValues.downright:
                            if (flag) {
                                name = "CD";
                            } else {
                                name = "D";
                            }
                            break;
                        default: break;

                    }
                    self.isExistPress(name);
                    console.log(type);
                    if (self.pressList[type].indexOf(name) == -1) {
                        self.pressList[type].push(name);
                    }
                    self.pressList[type].sort();
                },
                delExist: function(name, type) {
                    var self = this;
                    switch (name) {
                        case "A":
                            self.eventA = [];
                            //self.deviceA = [];
                            break;
                        case "B":
                            self.eventB = [];
                            //self.deviceB = [];
                            break;
                        case "C":
                            self.eventC = [];
                            //self.deviceC = [];
                            break;
                        case "D":
                            self.eventD = [];
                            //self.deviceD = [];
                            break;
                        case "AB":
                            self.eventUp = [];
                            //self.deviceC = [];
                            break;
                        case "CD":
                            self.eventDown = [];
                            //self.deviceD = [];
                            break;
                        default: break;
                    }
                    var index = self.pressList[type].indexOf(name);
                    if (index != -1) {
                        self.pressList[type].splice(index, 1);
                    }
                },
                isExistPress: function(name) {
                    for(var i = 1; i <= 12; i++) {
                        var index = this.pressList[(i + "")].indexOf(name)
                        if (index != -1) {
                             this.pressList[(i + "")].splice(index, 1);
                        }
                    }
                },
                selectBtn: function(cid) {
                    var self = this;
                    if (self.isMuch) {
                        $("#btn-select-device span.span-radio").removeClass("active");
                        self.eventCid = parseInt(cid);
                        self.selected  = 0;
                        self.showSelect = true;
                        if (cid == self.btnValues.upleft) {
                            self.selected = self.deviceA.length;
                            self.isExist(self.deviceA);
                        } else if (cid == self.btnValues.upright) {
                            self.selected = self.deviceB.length;
                            self.isExist(self.deviceB);
                        } else if (cid == self.btnValues.downleft) {
                            self.selected = self.deviceC.length;
                            self.isExist(self.deviceC);
                        } else if (cid == self.btnValues.downright) {
                            self.selected = self.deviceD.length;
                            self.isExist(self.deviceD);
                        }
                        window.onBackPressed = this.hideThis;
                    }
                },
                isExist: function(list) {
                    var self = this;
                    self.isSelectedMacs = [];
                    $.each(list, function(i, item) {
                        self.isSelectedMacs.push(item);
                    })
                },
                saveDevice: function() {
                    var self = this, docs = $("#btn-select-device span.span-radio.active"),
                        macs = [];
                    for (var i = 0; i < docs.length; i++) {
                        macs.push($(docs[i]).attr("data-value"));
                    };
                    if (self.eventCid == self.btnValues.upleft) {
                        self.deviceA = macs;
                    } else if (self.eventCid == self.btnValues.upright) {
                        self.deviceB = macs;
                    } else if (self.eventCid == self.btnValues.downleft) {
                        self.deviceC = macs;
                    } else if (self.eventCid == self.btnValues.downright) {
                        self.deviceD = macs;
                    }
                    self.hideThis();
                },
                meshDrop: function () {
                    var self = this;
                    //拖动创建元素
                    $('.control-wrapper').find('div.shortPress').draggable({
                        helper: 'clone',
                        containment: ".content-info",
                        scope: '.btn-round',
                    });
                    $('.control-wrapper').find('div.longPress').draggable({
                        helper: 'clone',
                        containment: ".content-info",
                        scope: '.btn-long',
                    });
                    $('div.content-info').find('div.btn-round').droppable({
                        scope: ".btn-round",
                        accept: ".shortPress",
                        hoverClass: "highlight",
                        drop: function (event, ui) {
                            var dragui = ui.draggable,
                                id = dragui.attr('data-value');
                                eventCid = $(this).attr("data-value");
                            var flag = false, name = "", h = 0, s = 0, b= 0, subCid = 0,
                                defaultValue = 0;
                            $.each(self.shortPress, function(i, item) {
                                if (item.id == id) {
                                    if (id == "1") {
                                        flag = true;
                                        name = "SWITCH_" + eventCid;
                                        subCid = STATUS_CID;
                                        defaultValue = 2;
                                    } else if(id == "8") {
                                        name = "BRI_" + eventCid;
                                        subCid = STATUS_CID;
                                        defaultValue = 4;
                                    } else if (id == "9") {
                                        name = "WARM_" + eventCid;
                                        subCid = STATUS_CID;
                                        defaultValue = 3;
                                    } else if(id == "10") {
                                        name = "HUE_" + eventCid;
                                        subCid = STATUS_CID;
                                        defaultValue = 5;
                                    } else {
                                        name = "MODEL_" + eventCid;
                                        h = item.h;
                                        s = item.s;
                                        b = item.b;
                                    }
                                }
                            })
                            self.setButtonEvent(name, eventCid, flag, parseInt(h), parseInt(s), parseInt(b),
                                    subCid, parseInt(id), VALUE_CID, defaultValue);
                        }
                    })
                    $('div.content-info').find('div.btn-long').droppable({
                        scope: ".btn-long",
                        accept: ".longPress",
                        hoverClass: "highchild",
                        drop: function (event, ui) {
                            var dragui = ui.draggable,
                                id = dragui.attr('data-value'),
                                leftCid = $(this).attr("data-left"),
                                rightCid = $(this).attr("data-right"),
                                leftName = "",
                                rightName = "";
                            var name = "", subCid = 0;
                            if (id == "11") {
                                leftValue = BUTTON_EVENT_8;
                                rightValue = BUTTON_EVENT_9;
                                leftName = "BRI_IN";
                                rightName = "BRI_DE";
                            } else if (id == "12") {
                                leftValue = BUTTON_EVENT_6;
                                rightValue = BUTTON_EVENT_7;
                                leftName = "WARM_IN";
                                rightName = "WARM_DE";
                            } else if (id == "13") {
                                leftValue = BUTTON_EVENT_4;
                                rightValue = BUTTON_EVENT_5;
                                leftName = "HUE_IN";
                                rightName = "HUE_DE";
                            }
                            self.setLongEvent(leftName, rightName, leftCid, rightCid, parseInt(id), leftValue, rightValue);
                        }
                    })
                },
                hideSwitch: function(id) {
                    var flag = true;
                    if (this.isMuch) {
                        if (id == "1") {
                            flag = false;
                        }
                    }
                    return flag;
                },
                setLongEvent: function(leftName, rightName,leftCid, rightCid, id, leftValue, rightValue) {
                    var self = this, event = "";
                    leftCid = parseInt(leftCid);
                    rightCid = parseInt(rightCid);
                    event = {leftName: leftName, rightName: rightName, leftCid: leftCid, rightCid: rightCid,
                        eventType: id, leftValue: leftValue, rightValue: rightValue};
                    if (leftCid == self.btnValues.upleft && rightCid == self.btnValues.upright) {
                        self.eventUp.splice(0, 1, event)
                    } else if (leftCid == self.btnValues.downleft && rightCid == self.btnValues.downright) {
                        self.eventDown.splice(0, 1, event)
                    }
                    self.initBtnEvent(leftCid, id, true);
                },
                setButtonEvent: function(name, eventCid, flag, h, s, b, subCid, id, execCid, defaultValue) {
                    var self = this, event = "";
                    eventCid = parseInt(eventCid);
                    event = {name: name, eventCid: eventCid, flag: flag, h: h, s: s, b: b, subCid: subCid, eventType: id,
                        execCid: execCid, defaultValue: defaultValue};
                    switch (eventCid) {
                        case self.btnValues.upleft:
                            self.eventA.splice(0, 1, event);
                            break;
                        case self.btnValues.upright:
                            self.eventB.splice(0, 1, event);
                            break;
                        case self.btnValues.downleft:
                            self.eventC.splice(0, 1, event);
                            break;
                        case self.btnValues.downright:
                            self.eventD.splice(0, 1, event);
                            break;
                        default: break;
                    }
                    this.initBtnEvent(eventCid, id, false);
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
                hide: function () {
                    this.showFlag = false;
                    MINT.Indicator.close();
                    this.$emit("autoBtnShow");
                },
                hideParent: function() {
                    this.showFlag = false;
                    MINT.Indicator.close();
                    this.$parent.hideParent();
                },
                hideThis: function() {
                    this.showSelect = false;
                    window.onBackPressed = this.hide;
                },
                save: function() {
                    var self = this,
                        parentMac = self.deviceInfo.mac,
                        macs = [];
                    if (!self.isMuch) {
                        if (self.eventA.length == 0 && self.eventB.length == 0 && self.eventC.length == 0 &&
                            self.eventD.length == 0 && self.eventUp.length == 0 && self.eventDown.length == 0) {
                            MINT.Toast({
                                message: self.$t('selectEventDesc'),
                                position: 'bottom',
                            });
                            return false;
                        }
                    } else {
                        if (self.deviceA.length == 0 && self.deviceB.length == 0 && self.deviceC.length == 0 &&
                            self.deviceD.length == 0) {
                            MINT.Toast({
                                message: self.$t('selectDeviceDesc'),
                                position: 'bottom',
                            });
                            return false;
                        }
                    }
                    if (self.isMuch) {
                        macs = self.deviceA.concat(self.deviceB, self.deviceC, self.deviceD)
                    } else {
                        macs = self.selectMacs;
                    }
                    if (macs.length > 0) {
                        MINT.Indicator.open();
                         setTimeout(function() {
                             self.assemblyEvent(parentMac);
                             MINT.Indicator.close();
                             self.hideParent();
                         }, 500);
                    } else {
                        MINT.Toast({
                            message: self.$t('selectDeviceDesc'),
                            position: 'bottom',
                        });
                    }
                },
                assemblyEvent: function(parentMac) {
                    var self = this,
                        events = [];
                    if (self.isMuch) {
                        if (self.eventA.length > 0 && self.deviceA.length > 0) {
                            var item = self.eventA[0];
                            events.push(Util.setModelEvent(item.name, self.deviceA, item.eventCid,
                                    item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                    item.execCid, true, item.defaultValue, MESH_LIGHT_SYSC_COLOR_2))
                        }
                        if (self.deviceA.length > 0) {
                            var cid = self.btnValues.upleft;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceA, cid,
                                    STATUS_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, 0, false, 2,
                                    MESH_LIGHT_SYSC_COLOR))
                        }
                        if (self.eventB.length > 0 && self.deviceB.length > 0) {
                            var item = self.eventB[0];
                            events.push(Util.setModelEvent(item.name, self.deviceB, item.eventCid,
                                item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                item.execCid, true, item.defaultValue, MESH_LIGHT_SYSC_COLOR_2))
                        }
                        if (self.deviceB.length > 0) {
                            var cid = self.btnValues.upright;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceB, cid,
                                STATUS_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, 0, false, 2,
                                MESH_LIGHT_SYSC_COLOR))
                        }
                        if (self.eventC.length > 0 && self.deviceC.length > 0) {
                            var item = self.eventC[0];
                            events.push(Util.setModelEvent(item.name, self.deviceC, item.eventCid,
                                    item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                    item.execCid, true, item.defaultValue, MESH_LIGHT_SYSC_COLOR_2))
                        }
                        if (self.deviceC.length > 0) {
                            var cid = self.btnValues.downleft;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceC, cid,
                                    STATUS_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, 0, false, 2,
                                    MESH_LIGHT_SYSC_COLOR))
                        }
                        if (self.eventD.length > 0 && self.deviceD.length > 0) {
                            var item = self.eventD[0];
                            events.push(Util.setModelEvent(item.name, self.deviceD, item.eventCid,
                                item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                item.execCid, true, item.defaultValue, MESH_LIGHT_SYSC_COLOR_2))
                        }
                        if (self.deviceD.length > 0) {
                            var cid = self.btnValues.downright;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceD, cid,
                                STATUS_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, 0, false, 2,
                                MESH_LIGHT_SYSC_COLOR))
                        }
                        console.log(JSON.stringify(events));
                    } else {
                        var eventList = self.eventA.concat(self.eventB, self.eventC, self.eventD);
                        $.each(eventList, function(i, item) {
                            events.push(Util.setModelEvent(item.name, self.selectMacs, item.eventCid,
                                    item.subCid, item.h, item.s, item.b, item.flag, item.eventType, SINGLE_GROUP,
                                    item.execCid, false, item.defaultValue, MESH_LIGHT_SYSC_COLOR))
                        })
                        console.log(JSON.stringify(events));
                        var longEvents = self.eventUp.concat(self.eventDown);
                        $.each(longEvents, function(i, item) {
                            events.push(Util._assemblyLongEvent(item.leftName + item.leftCid, item.leftCid, self.selectMacs,
                                    MESH_LIGHT_SYSC_COLOR_2, item.eventType, SINGLE_GROUP, true, item.leftValue));
                            events.push(Util._assemblyLongEvent("STOP_" + item.leftCid, item.leftCid, self.selectMacs,
                                    MESH_LIGHT_SYSC_COLOR_3, item.eventType, SINGLE_GROUP, true, 0));
                            events.push(Util._assemblyLongEvent(item.rightName + item.rightCid, item.rightCid, self.selectMacs,
                                    MESH_LIGHT_SYSC_COLOR_2, item.eventType, SINGLE_GROUP, true, item.rightValue));
                            events.push(Util._assemblyLongEvent("STOP_" + item.rightCid, item.rightCid, self.selectMacs,
                                    MESH_LIGHT_SYSC_COLOR_3, item.eventType, SINGLE_GROUP, true, 0));
                        });
                        console.log(JSON.stringify(events));
                    }
                    self.delEvent(parentMac, events);
                },
                delEvent: function (parentMac, events) {
                    var self = this;
                    var eventNames = [];
                    $.each(self.deviceEvents, function(i, item) {
                        var name = item.name;
                        if (eventNames.indexOf(name) == -1) {
                            eventNames.push({name: name});
                        }
                    });
                    if(eventNames.length > 0) {
                        var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                            '"events":' + JSON.stringify(eventNames) + ',"callback": "onDelButton", "tag": {"mac": "'+
                            parentMac+'", "events": '+JSON.stringify(events)+'}}';
                        espmesh.requestDevice(data);
                    } else {
                        Util._addRequestEvent(parentMac, events, self.$store.state.deviceIp);
                    }
                },
                onDelButton: function(res) {
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        var tag = res.tag;
                        Util._addRequestEvent(tag.mac, tag.events, this.$store.state.deviceIp);
                    }
                }
            },
            components: {
            }

        });

        return AutomationBtn;
    });