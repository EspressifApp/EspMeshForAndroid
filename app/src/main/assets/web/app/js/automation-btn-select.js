define(["vue","MINT", "Util", "txt!../../pages/automation-btn-select.html", "../js/automation-btn-devices",
    "../js/automation-btn"],
    function(v, MINT, Util, automationBtnSelect, automationBtnDevices, automationBtn, automationBtnM) {

        var AutomationBtnSelect = v.extend({
            template: automationBtnSelect,
            props: {
                deviceInfo: {
                    type: String
                },
                autoId: {
                    type: String
                },
            },
            data: function(){
                return {
                    autoIdBtn: "",
                    isMuch: false,
                    eventType: -1,
                    newEventType: -1,
                    eventFlag: true,
                    existEvent: false,
                    deviceEvents: []
                }
            },
            computed: {

            },
            methods:{
                show: function() {
                    var self = this;
                    self.eventFlag = true;
                    self.eventType = -1;
                    self.newEventType = -1;
                    self.existEvent = false;
                    self.deviceEvents = [];
                    self.autoIdBtn = self.autoId + "-btn";
                    self.isMuch = false;
                    window.onGetEvent = this.onGetEvent;
                    setTimeout(function() {
                        MINT.Indicator.open();
                        setTimeout(function() {
                            self.getEvent();
                        }, 1000)
                    }, 200)
                },
                getEvent: function() {
                    var self = this;
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","' + MESH_REQUEST + '": "' +
                        GET_EVENT +'", "callback": "onGetEvent"}';
                    var res = espmesh.requestDeviceAsync(data);
                    console.log(JSON.stringify(self.deviceEvents));

                },
                delDeviceEvent: function(newType) {
                    var self = this;
                    MINT.MessageBox.confirm(self.$t('delExistEventDesc'), self.$t('emptyEventTitle'),{
                            confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        MINT.Indicator.open();
                        var eventNames = [];
                        $.each(self.deviceEvents, function(i, item) {
                            var name = item.name;
                            if (eventNames.indexOf(name) == -1) {
                                eventNames.push({name: name});
                            }
                        });
                        setTimeout(function() {
                            self.delEvent(eventNames, newType);
                            MINT.Indicator.close();
                        }, 500);
                    });
                },
                delEvent: function (eventNames, newType) {
                    var self = this;
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac + '","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                        '"events":' + JSON.stringify(eventNames) + '}';
                    espmesh.requestDeviceAsync(data);
                    self.existEvent = false;
                    self.deviceEvents = [];
                    setTimeout(function() {
                        self.jump(newType);
                    }, 200)
                },
                checkRadio: function(type) {
                    this.newEventType = parseInt(type);
                },
                next: function() {
                    var self = this;
                    if (self.newEventType > 0) {
                        if (self.existEvent && self.newEventType != self.eventType) {
                            self.delDeviceEvent(self.newEventType);
                        } else  {
                            self.jump(self.newEventType);
                        }
                    }
                },
                jump: function(type) {
                    var self = this;
                    self.eventType = type;
                    console.log(self.eventType);
                    if (type == SINGLE_GROUP) {
                        self.isMuch = false;
                        setTimeout(function() {
                            self.$refs.autoBtnDevices.show();
                        }, 200)
                    } else {
                        self.isMuch = true;
                        setTimeout(function() {
                            self.$refs.autoBtn.show();
                        }, 200)
                    }
                },
                hide: function () {
                    this.$parent.hide();
                    MINT.Indicator.close();
                },
                hideParent: function() {
                    this.$parent.hide();
                    MINT.Indicator.close();
                },
                hideThis: function() {
                    window.onBackPressed = this.hide;
                },
                onGetEvent: function(res) {
                    var self = this;
                    console.log(res);
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (!Util._isEmpty(res.result)) {
                            var result = res.result;
                            if (!Util._isEmpty(result.trigger)) {
                                self.deviceEvents = result.trigger;
                                if (!Util._isEmpty(self.deviceEvents)) {
                                   if (self.deviceEvents.length > 0) {
                                      self.existEvent = true;
                                      self.eventType = self.deviceEvents[0].event_class;
                                      self.newEventType = self.eventType;
                                   }
                                }
                            }
                        }
                    }
                    MINT.Indicator.close();
                }
            },
            components: {
                "v-automationBtn": automationBtn,
                "v-automationBtnDevices": automationBtnDevices
            }

        });

        return AutomationBtnSelect;
    });