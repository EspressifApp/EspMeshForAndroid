define(["vue", "MINT", "Util", "txt!../../pages/timingList.html", "./timingDevice"],
    function(v, MINT, Util, timingList, timingDevice) {

    var TimingList = v.extend({
        template: timingList,
        data: function(){
            return {
                flag: false,
                infoShow: false,
                timingList: [],
                timingInfo: "",
                macs: [],
            }
        },
        computed: {

        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = self.hide;
                self.timingList = [];
                setTimeout(function() {
                    self.getAllMacs();
                    self.getList();
                });
                self.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("timingListShow");
            },
            hideThis: function() {
                window.onBackPressed = this.hide;
            },
            timingDeviceFun: function() {
                var self = this;
                self.timingInfo = "";
                setTimeout(function() {
                    self.$refs.timingDevice.show();
                }, 100)
            },
            getAllMacs: function() {
                var self = this,
                    deviceList = this.$store.state.deviceList;
                $.each(deviceList, function(i, item) {
                    var mac = item.mac;
                    if (self.macs.indexOf(mac) == -1) {
                        self.macs.push(mac);
                    }
                })
            },
            itemInfo: function(item) {

            },
            editInfo: function(item) {
                var self = this;
                self.infoShow = false;
                self.timingInfo = item;
                setTimeout(function() {
                    self.$refs.timingDevice.show();
                }, 100)

            },
            removeTiming: function(item) {
                var self = this,
                    name = item.name,
                    macs = item.macs;
                console.log(JSON.stringify(macs));
                MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('deleteBtn'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST +
                        '": "' + REMOVE_CALENDAR + '","' + MESH_CALENDAR + '":"' + name +
                        '", "callback": "onRemoveTiming", "tag": {"name": "'+name+'"}}';

                    setTimeout(function() {
                        espmesh.requestDevicesMulticastAsync(data);
                    }, 1000);

                }).catch(function(err){
                    self.hideThis();
                });

            },
            getList: function() {
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(this.macs) +
                    ',"'+DEVICE_IP+'": "'+this.$store.state.deviceIp+'","' + MESH_REQUEST +
                    '": "' + GTE_CALENDAR + '","callback": "getListResult"}';
                MINT.Indicator.open();
                espmesh.requestDevicesMulticastAsync(data);
            },
            getListResult: function(res) {
                var self = this, list = [], resultList = {}, calendarList = [];
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    $.each(res.result, function(i, item) {
                        if (!Util._isEmpty(item.calendar)) {
                            $.each(item.calendar, function(j, subItem) {
                                var name = subItem.name;
                                if (list.indexOf(name) == -1) {
                                    list.push(name);
                                    resultList[name] = [];
                                    calendarList.push(subItem);
                                }
                                resultList[name].push(item.mac);
                            })
                        }
                    });
                    $.each(calendarList, function(i, item) {
                        item["macs"] = resultList[item.name];
                        calendarList.splice(i, 1, item);
                    })
                    self.timingList = calendarList;
                }
                MINT.Indicator.close();
            },
            onRemoveTiming: function(res) {
                if (!Util._isEmpty(res)) {
                res = JSON.parse(res);
                var result = res.result;
                var tag = res.tag;
                if (result.length > 0) {
                    $.each(self.timingList, function(i, item) {
                        if (tag.name == item.name) {
                            self.timingList.splice(i, 1);
                            return false;
                        }
                    })
                } else {
                    MINT.Toast({
                      message: self.$t('deleteFailDesc'),
                      position: 'bottom',
                      duration: 2000
                    });
                }

            } else {
                MINT.Toast({
                  message: self.$t('deleteFailDesc'),
                  position: 'bottom',
                  duration: 2000
                });
            }

            MINT.Indicator.close();
            },
        },
        components: {
            "v-timingDevice": timingDevice
        },
        created: function () {
            window.getListResult = this.getListResult;
            window.onRemoveTiming = this.onRemoveTiming;
        }

    });
    return TimingList;
});