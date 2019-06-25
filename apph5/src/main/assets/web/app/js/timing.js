define(["vue", "MINT", "Util", "txt!../../pages/timing.html", "./calendar", "./timingAdd"],
    function(v, MINT, Util, timing, calendar, timingAdd) {

    var Timing = v.extend({

        template: timing,
        props: {
            timingInfo: {
                type: Object
            },
            timingMacs: {
                type: Array
            }
        },
        data: function(){
            return {
                flag: false,
                dateList: [],
                days: [],
                name: "",
                calendar: {
                    value:[], //默认日期
                    multi:true,
                    lunar:true, //显示农历
                    select: function(value){
                    }
                },
                workDay: false,
                weekEnd: false,
                holiday: false,
            }
        },
        computed: {

        },
        methods:{
            show: function () {
                var self = this;
                window.onBackPressed = self.hide;
                self.workDay = false;
                self.weekEnd = false;
                self.holiday = false;
                if (self.timingInfo) {
                    self.days = self.timingInfo.days;
                    self.name = self.timingInfo.name;
                    self.$refs.calendar.isEdit = true;
                } else {
                    self.days = [];
                    self.name = "";
                }
                self.days = self.setValue();
                self.calendar = {value: self.days, multi:true, lunar:true, select: function(value){}},
                self.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("timingShow");
            },
            hideThis: function () {
                window.onBackPressed = this.hide;
            },
            setValue: function() {
                var self = this,
                    list = [];
                $.each(self.days, function(i, item) {
                    var day = []; item = item.toString();
                    day.push(parseInt(item.substr(0, 4)));
                    day.push(parseInt(item.substr(4, 2)));
                    day.push(parseInt(item.substr(6, 2)));
                    list.push(day);
                })
                return list;
            },
            hideParent: function () {
                this.hide();
                this.$parent.hideParent();
            },
            selectWorkDay: function() {
                var self = this;
                self.workDay = !self.workDay;
                self.$refs.calendar.isEdit = false;
                self.$refs.calendar.selectWorkDay();
            },
            selectWeekEnd: function() {
                var self = this;
                self.weekEnd = !self.weekEnd;
                self.$refs.calendar.isEdit = false;
                self.$refs.calendar.selectWeekEnd();
            },
            selectHoliday: function() {
                var self = this;
                self.holiday = !self.holiday;
                self.$refs.calendar.isEdit = false;
                self.$refs.calendar.selectHoliday();
            },
            timingAddFun: function() {
                var self = this;
                self.dateList = self.$refs.calendar.multiDays;
                setTimeout(function() {
                    self.$refs.timingAdd.show();
                }, 100)

            },
            getDate: function() {
                var self = this, dayList = [];
                self.dateList = self.$refs.calendar.multiDays;
                $.each(self.dateList, function(i, item) {
                    var day = "";
                    day += item[0]
                    if (parseInt(item[1]) < 10) {
                        day += "0" + item[1];
                    } else {
                        day += item[1]
                    }
                    if (parseInt(item[2]) < 10) {
                        day += "0" + item[2];
                    } else {
                        day += item[2]
                    }
                    dayList.push(parseInt(day));
                });
                return dayList;
            },
            saveDate: function() {
                var self= this,
                    dayList = self.getDate();
                self.timingInfo.days = dayList;
                self.timingInfo.days_num = dayList.length;
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.timingMacs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_CALENDAR + '","' +
                        MESH_CALENDAR + '": ' + JSON.stringify(self.timingInfo) + ',"callback": "saveDateResult"}';
                MINT.Indicator.open();
                setTimeout(function() {
                    espmesh.requestDevicesMulticast(data);
                }, 1000)
            },
            saveDateResult: function(res) {
                var self= this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.result.length > 0) {
                        MINT.Toast({
                          message: self.$t('saveSuccessDesc'),
                          position: 'bottom',
                          duration: 2000
                        });
                        self.hideParent();
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
            "v-calendar": calendar,
            "v-timingAdd": timingAdd
        },
        created: function () {
            window.saveDateResult = this.saveDateResult;
        }

    });

    return Timing;
});