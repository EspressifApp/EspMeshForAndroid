define(["vue", "MINT", "txt!../../pages/eventInfo.html", "../js/addEvent"],
    function(v, MINT, eventInfo, addEvent) {

    var EventInfo = v.extend({

        template: eventInfo,

        data: function(){
            return {
                flag: false,
                eventList: [],
                deviceInfo: {},
                deviceEvent: {},
                eventName: ""
            }
        },

        computed: {

        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.deviceInfo = self.$store.state.deviceInfo;
                var res = espmesh.loadDeviceEventsPositioin(self.deviceInfo.mac);
                self.deviceEvent = JSON.parse(res);
                self.eventList = JSON.parse(self.deviceEvent.events);
                window.onDeleteEvent = this.onDeleteEvent;
                self.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("eventShow");
            },
            hideParent: function() {
                window.onBackPressed = this.hide;
            },
            setEventList: function() {
                var self = this;
                var res = espmesh.loadDeviceEventsPositioin(self.deviceInfo.mac);
                self.deviceEvent = JSON.parse(res);
                self.eventList = JSON.parse(self.deviceEvent.events);
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
            getName: function(name) {
                if (name.indexOf("_") > -1) {
                    name = name.split("_")[0];
                }
                return name;
            },
            getDesc: function(item) {
                var self = this,
                    tid = self.deviceInfo.tid,
                    val = "", name = item.name;
                if (name.indexOf("_") > -1) {
                    name = name.split("_")[0];
                }
                if (tid >= MIN_SWITCH && tid <=  MAX_SWITCH) {
                    val = name.toLocaleLowerCase();
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    val = name.toLocaleLowerCase();
                } else {
                    var status = "",
                        compare = item.trigger_compare;
                    for(var i in compare) {
                        status += i + compare[i] + ",";
                    }
                    val = status.substr(0,status.lastIndexOf(","));
                }
                return val;
            },
            deleteEvent: function(name) {
                var self = this,
                    events = [],mac = self.deviceInfo.mac;
                events.push({name: name});
                MINT.MessageBox.confirm("Confirm to delete this event?", "Delete events",{
                        confirmButtonText: "Confirm", cancelButtonText: "Cancel"}).then(function(action) {
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                        '"events":' + JSON.stringify(events) + ', "callback": "onDeleteEvent", "tag": {"mac": "'+
                        mac+'", "name": "'+name+'"}}';
                    setTimeout(function(){
                        espmesh.requestDeviceAsync(data);
                    }, 500);
                });

            },
            onDeleteEvent: function(res) {
                var self = this;
                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    var result = res.result;
                    var tag = res.tag;
                    if (result.status_code == 0) {
                        $.each(self.eventList, function(i, item) {
                            if (item.name == tag.name) {
                                self.eventList.splice(i, 1);
                                return false;
                            }
                        });
                        if (self.eventList.length == 0) {
                            JSPLUMB_INSTANCE.removeAllEndpoints(tag.mac);
                            self.hide();
                            $("#" + tag.mac).removeClass("active");
                        }
                        espmesh.saveDeviceEventsPosition(mac, JSON.stringify(self.eventList), self.deviceEvent.position);
                    }
                }
                MINT.Indicator.close();
            },
            showItemEvent: function(name) {
                var self =this;
                self.eventName = name;
                setTimeout(function() {
                    self.$refs.addEvent.show();
                },200);
            },

            showEvent: function (item, parentName) {
                var tid = self.deviceInfo.tid,
                    html = "";
                if (tid >= MIN_SWITCH && tid <=  MAX_SWITCH) {
                    html = showSwitchEvent(item);
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    html = showLightEvent(item);
                } else {
                    html = showSensorEvent(item);
                }
                return html;
            },
            addEvent: function() {

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
            "v-addEvent": addEvent
        }

    });
    return EventInfo;
});