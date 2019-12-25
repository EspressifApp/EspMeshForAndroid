define(["vue", "MINT", "Util", "txt!../../pages/timingAdd.html"], function(v, MINT, Util, timingAdd) {

    var TimingAdd = v.extend({
        template: timingAdd,
        props: {
            timingInfo: {
                type: Object,
            },
            timingMacs: {
                type: Array
            },
            dateList: {
                type: Array
            }
        },
        data: function(){
            return {
                addFlag: false,
                addList: [],
                name: "",
                slots:[{values: ["ON", "OFF"]}],
                addIndex: -1,
                dayList: [],
                showType: false,

            }
        },
        computed: {

        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                this.addList = [{"start": "", "end": "", "state": ""}];
                this.dayList = [];
                if (this.timingInfo) {
                    this.name = this.timingInfo.name;
                    this.addList = this.timingInfo.interval;
                } else {
                    this.name = "";
                }
                this.getDate();
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                MINT.Indicator.close();
                this.$emit("timingAddShow");
            },
            hideThis: function () {
                this.hide();
                this.$parent.hideParent();
            },
            getDate: function() {
                var self = this;
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
                    self.dayList.push(parseInt(day));
                });
            },
            addPlus: function() {
                this.addList.push({"start": "", "end": "", "state": ""});
            },
            delAdd: function(index) {
                this.addList.splice(index, 1);
            },
            openTimingType: function(index) {
                this.showType = true;
                this.addIndex = index;
            },
            hideType: function() {
                this.showType = false;
            },
            onTypeChange: function(picker, values) {
                this.timingType = values[0]
            },
            openStartTime: function(index) {
                this.$refs.startTime.open();
                this.addIndex = index;
            },
            openEndTime: function(index) {
                this.$refs.endTime.open();
                this.addIndex = index;
            },
            getStartHour: function() {
                var startHour = "00"
                if (this.addIndex != -1) {
                    console.log(this.addList[this.addIndex]["start"]);
                    if (this.addList[this.addIndex]["start"] != "") {
                        startHour =   this.addList[this.addIndex]["start"].split(":")[0];
                    }
                }
                return startHour;
            },
            typeConfirm: function(value) {
                this.addList[this.addIndex]["state"] = this.$refs.picker.getValues()[0];
                this.hideType();
            },
            startConfirm: function(value) {
                this.addList[this.addIndex]["start"] = value;
            },
            endConfirm: function(value) {
                this.addList[this.addIndex]["end"] = value;
            },
            assembly: function() {
                var self = this,
                    intervals = [];
                $.each(self.addList, function(i, item) {
                    if (item["start"] != "" && item["end"] != "" && item["state"] != "") {
                        intervals.push(item)
                    }
                });
                return intervals;
            },
            assemblyData: function(name, days, intervals) {
                var event = {"name": name,
                     "days_num": days.length,
                     "days": days,
                     "interval_num": intervals.length,
                     "interval": intervals,
                     "time_format": "utc"
                    }
                return event;
            },
            save: function () {
                var self = this;
                var intervals = self.assembly();
                if (intervals.length == 0) {
                    Util.toast(MINT, self.$t('notEmpty'));
                    return false;
                }
                if (!Util._isEmpty(self.name)) {
                    self.saveData(self.name, intervals);
                } else {
                    MINT.MessageBox.prompt(self.$t('addTimingDesc'), self.$t('addTimingTitle'),
                        {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                        self.saveData(obj.value, intervals);
                    });
                }

            },
            saveData: function(name, intervals) {
                var self= this;
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.timingMacs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_CALENDAR + '","' +
                            MESH_CALENDAR + '": ' + JSON.stringify(self.assemblyData(name, self.dayList, intervals)) +
                            ',"callback": "saveResult"}';
                MINT.Indicator.open();
                setTimeout(function() {
                    espmesh.requestDevicesMulticast(data);
                }, 1000)
            },
            saveResult: function(res) {
                var self= this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.result.length > 0) {
                        Util.toast(MINT, self.$t('saveSuccessDesc'));
                        self.hideThis();
                    } else {
                        Util.toast(MINT, self.$t('saveFailDesc'));
                    }
                } else {
                    Util.toast(MINT, self.$t('saveFailDesc'));
                }
                MINT.Indicator.close();
            }
        },
        created: function () {
            window.saveResult = this.saveResult;
        }

    });
    return TimingAdd;
});