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
                        "10": [], "11": [], "12": []},
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
                    shortPress: [{"id": "1", "name": this.$t('onOff')},
                        {"id": "2", "name": this.$t('brightMode'), h: "60", s: "0", b: "100"},
                        //{"id": "3", "name": this.$t('blinkMode'), h: "222", s: "57", b: "91"},
                        //{"id": "4", "name": this.$t('glitterMode'), h: "176", s: "55", b: "77"},
                        {"id": "5", "name": this.$t('readMode'), h: "39", s: "14", b: "90"},
                        {"id": "6", "name": this.$t('cozyMode'), h: "60", s: "10", b: "100"},
                        {"id": "7", "name": this.$t('bedtime'), h: "33", s: "100", b: "66"},
                        {"id": "8", "name": this.$t('delayedOn')},
                        {"id": "9", "name": this.$t('delayedOff')}],
                    longPress: [
                            {"id": "10", "name": this.$t('btnLightness')},{"id": "11", "name": this.$t('btnTemperature')},
                        {"id": "12", "name":  this.$t('btnColor')}],
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
                    window.onBackPressed = this.hide;
                    self.deviceList = self.$store.state.deviceList;
                    self.pressList = {"1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [],
                                            "10": [], "11": [], "12": []};
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
                            this.setButtonEvent(item.name, item.trigger_cid, true, 0, 0, 0, MODE_CID,
                                type, false, 0, 0, 0);
                        }
                    } else if (type == 10 || type == 11 || type == 12) {
                        var trigger_cid = item.trigger_cid, leftCid = 4, rightCid = 5;
                        if (trigger_cid == this.btnValues.longupleft || trigger_cid == this.btnValues.longupright) {
                            leftCid = this.btnValues.longupleft;
                            rightCid = this.btnValues.longupright;
                        } else {
                            leftCid = this.btnValues.longdownleft;
                            rightCid = this.btnValues.longdownright;
                        }
                        this.setLongEvent(leftCid, rightCid, item.execute_content.cid, type);
                    } else if (type == 8 || type == 9) {
                        this.setButtonEvent(item.name, item.trigger_cid, false, 0, 0, 0, item.execute_cid,
                            type, true, item.execute_content.cid, item.execute_content.operation,
                             item.execute_content.duration);
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
                            type, false, 0, 0, 0);
                    }
                    this.initBtnEvent(item.trigger_cid, type);

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
                initBtnEvent: function(cid, type) {
                    var self = this;
                    var name = "";
                    if (self.isMuch) {
                        cid = self.converBaseCid(cid);
                    }
                    switch (cid) {
                        case self.btnValues.upleft:
                            name = "A";
                            break;
                        case self.btnValues.upright:
                            name = "B";
                            break;
                        case self.btnValues.downleft:
                            name = "C";
                            break;
                        case self.btnValues.downright:
                            name = "D";
                            break;
                        case self.btnValues.longupleft:
                            name = "AB";
                            break;
                        case self.btnValues.longupright:
                            name = "AB";
                            break;
                        case self.btnValues.longdownleft:
                            name = "CD";
                            break;
                        case self.btnValues.longdownright:
                            name = "CD";
                            break;
                        default: break;

                    }
                    self.isExistPress(name);
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
                    $.each(list, function(i, item) {
                        $("#btn-select-device span.span-radio[data-value='"+item+"']").addClass("active");
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
                            var flag = false, name = "", h = 0, s = 0, b= 0, subCid = 0, delayFlag = false,
                                delayValue = 0, operation = 0;
                            $.each(self.shortPress, function(i, item) {
                                if (item.id == id) {
                                    if (id == "1") {
                                        flag = true;
                                        name = "SWITCH_" + eventCid;
                                        subCid = MODE_CID;
                                    } else if (id == "8") {
                                        if (self.isMuch) {
                                            eventCid = self.converCid(eventCid);
                                        }
                                        name = "DELAY_" + eventCid;
                                        delayFlag = true;
                                        operation = 1;
                                    } else if (id == "9") {
                                        if (self.isMuch) {
                                            eventCid = self.converCid(eventCid);
                                        }
                                        name = "DELAY_" + eventCid;
                                        delayFlag = true;
                                        operation = 0;
                                    } else {
                                        if (self.isMuch) {
                                            eventCid = self.converCid(eventCid);
                                        }
                                        name = "MODEL_" + eventCid;
                                        h = item.h;
                                        s = item.s;
                                        b = item.b;
                                    }
                                }
                            })
                            if (delayFlag) {
                                MINT.MessageBox.prompt(self.$t('delayTimeDesc'), self.$t('addDelayTitle'),
                                    {inputValue: "10", inputType: "number", inputPlaceholder: self.$t('addGroupInput'),
                                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                                    self.setButtonEvent(name, eventCid, flag, parseInt(h), parseInt(s), parseInt(b),
                                                subCid, parseInt(id), delayFlag, VALUE_CID, operation, parseInt(obj.value));
                                });

                            } else {
                                self.setButtonEvent(name, eventCid, flag, parseInt(h), parseInt(s), parseInt(b),
                                        subCid, parseInt(id), delayFlag, VALUE_CID, operation, 0);
                            }

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
                                rightCid = $(this).attr("data-right");
                            var name = "", subCid = 0
                            if (id == "10") {
                                subCid = VALUE_CID;
                            } else if (id == "11") {
                                subCid = SATURATION_CID;
                            } else if (id == "12") {
                                subCid = HUE_CID;
                            }
                            self.setLongEvent(leftCid, rightCid, subCid, parseInt(id));
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
                converCid: function(cid) {
                    var newCid = cid;
                    if (cid == this.btnValues.upleft) {
                        newCid = this.btnValues.longupleft;
                    } else if (cid == this.btnValues.upright) {
                        newCid = this.btnValues.longupright;
                    } else if (cid == this.btnValues.downleft) {
                        newCid = this.btnValues.longdownleft;
                    } else if (cid == this.btnValues.downright) {
                        newCid = this.btnValues.longdownright;
                    }
                    return newCid;
                },
                converBaseCid: function(cid) {
                    var newCid = cid;
                    if (cid == this.btnValues.longupleft) {
                        newCid = this.btnValues.upleft;
                    } else if (cid == this.btnValues.longupright) {
                        newCid = this.btnValues.upright;
                    } else if (cid == this.btnValues.longdownleft) {
                        newCid = this.btnValues.downleft;
                    } else if (cid == this.btnValues.longdownright) {
                        newCid = this.btnValues.downright;
                    }
                    return newCid;
                },
                setLongEvent: function(leftCid, rightCid, subCid, id) {
                    var self = this, event = "";
                    leftCid = parseInt(leftCid);
                    rightCid = parseInt(rightCid);
                    event = {leftCid: leftCid, rightCid: rightCid, subCid: subCid, eventType: id};
                    if (leftCid == self.btnValues.longupleft && rightCid == self.btnValues.longupright) {
                        self.eventUp.splice(0, 1, event)
                    } else if (leftCid == self.btnValues.longdownleft && rightCid == self.btnValues.longdownright) {
                        self.eventDown.splice(0, 1, event)
                    }
                    self.initBtnEvent(leftCid, id);

                },
                setButtonEvent: function(name, eventCid, flag, h, s, b, subCid, id, delayFlag, execCid,
                    operation, delayValue) {
                    var self = this, event = "";
                    eventCid = parseInt(eventCid);
                    event = {name: name, eventCid: eventCid, flag: flag, h: h, s: s, b: b, subCid: subCid, eventType: id,
                       delayFlag: delayFlag, execCid: execCid, operation: operation, delayVal: delayValue};
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
                        case self.btnValues.longupleft:
                            self.eventA.splice(0, 1, event)
                            break;
                        case self.btnValues.longupright:
                            self.eventB.splice(0, 1, event);
                            break;
                        case self.btnValues.longdownleft:
                            self.eventC.splice(0, 1, event);
                            break;
                        case self.btnValues.longdownright:
                            self.eventD.splice(0, 1, event);
                            break;
                        default: break;

                    }
                    this.initBtnEvent(eventCid, id);
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
                                message: "请选择事件",
                                position: 'bottom',
                            });
                            return false;
                        }
                    } else {
                        if (self.deviceA.length == 0 && self.deviceB.length == 0 && self.deviceC.length == 0 &&
                            self.deviceD.length == 0) {
                            MINT.Toast({
                                message: "请选择设备",
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
                            message: "请选择设备",
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
                                    item.delayFlag, item.execCid, item.operation, item.delayVal))
                        }
                        if (self.deviceA.length > 0) {
                            var cid = self.btnValues.upleft;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceA, cid,
                                    MODE_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, false, 0, 0))
                        }
                        if (self.eventB.length > 0 && self.deviceB.length > 0) {
                            var item = self.eventB[0];
                            events.push(Util.setModelEvent(item.name, self.deviceB, item.eventCid,
                                item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                item.delayFlag, item.execCid, item.operation, item.delayVal))
                        }
                        if (self.deviceB.length > 0) {
                            var cid = self.btnValues.upright;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceB, cid,
                                MODE_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, false, 0, 0))
                        }
                        if (self.eventC.length > 0 && self.deviceC.length > 0) {
                            var item = self.eventC[0];
                            events.push(Util.setModelEvent(item.name, self.deviceC, item.eventCid,
                                    item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                    item.delayFlag, item.execCid, item.operation, item.delayVal))
                        }
                        if (self.deviceC.length > 0) {
                            var cid = self.btnValues.downleft;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceC, cid,
                                    MODE_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, false, 0, 0))
                        }
                        if (self.eventD.length > 0 && self.deviceD.length > 0) {
                            var item = self.eventD[0];
                            events.push(Util.setModelEvent(item.name, self.deviceD, item.eventCid,
                                item.subCid, item.h, item.s, item.b, item.flag, item.eventType, MULTIPLE_GROUP,
                                item.delayFlag, item.execCid, item.operation, item.delayVal))
                        }
                        if (self.deviceD.length > 0) {
                            var cid = self.btnValues.downright;
                            events.push(Util.setModelEvent("SWITCH_" + cid, self.deviceD, cid,
                                MODE_CID, 0, 0, 0, true, 1, MULTIPLE_GROUP, false, 0, 0))
                        }
                    } else {
                        var eventList = self.eventA.concat(self.eventB, self.eventC, self.eventD);
                        $.each(eventList, function(i, item) {
                            events.push(Util.setModelEvent(item.name, self.selectMacs, item.eventCid,
                                    item.subCid, item.h, item.s, item.b, item.flag, item.eventType, SINGLE_GROUP,
                                    item.delayFlag, item.execCid, item.operation, item.delayVal))
                        })
                        var longEvents = self.eventUp.concat(self.eventDown);
                        $.each(longEvents, function(i, item) {
                            events.push(Util._assemblyLongEvent("REGULAR_" + item.leftCid, item.leftCid, self.selectMacs,
                                    item.subCid, item.eventType, SINGLE_GROUP, 0))
                            events.push(Util._assemblyLongEvent("REGULAR_" + item.rightCid, item.rightCid, self.selectMacs,
                                    item.subCid, item.eventType, SINGLE_GROUP, 1))
                        })
                    }
                    self.delEvent();
                    Util._addRequestEvent(parentMac, events);
                },
                delEvent: function () {
                    var self = this;
                    var eventNames = [];
                    $.each(self.deviceEvents, function(i, item) {
                        var name = item.name;
                        if (eventNames.indexOf(name) == -1) {
                            eventNames.push({name: name});
                        }
                    });
                    if(eventNames.length > 0) {
                        var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                                        '"events":' + JSON.stringify(eventNames) + '}';
                        espmesh.requestDeviceAsync(data);
                    }

                }
            },


            components: {
            }

        });

        return AutomationBtn;
    });