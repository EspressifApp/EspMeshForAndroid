define(["vue","MINT", "Util", "txt!../../pages/reports.html"],
    function(v, MINT, Util, reports) {

        var Reports = v.extend({

            template: reports,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    newDate: "",
                    todayData: [],
                    deviceList: [],
                    yesterdayData: [],
                    weekData: [],
                    monthData: [],
                    todayYData: [],
                    todayXData: [],
                    monthYData: [],
                    monthXData: [],
                    pieData: [],
                    realTimeYData: [],
                    realTimeXData: [],
                    scanTimerId: "",
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    window.onMonthData = self.onMonthData;
                    self.deviceList = self.$store.state.deviceList;
                    self.todayXData = [];
                    self.todayYData = [];
                    self.monthXData = [];
                    self.monthYData = [];
                    self.realTimeYData = [];
                    self.realTimeXData = [];
                    self.addFlag = true;
                    setTimeout(function() {
                        self.getData();
                    }, 500)
                    MINT.Indicator.open();
                },
                getData: function() {
                    var self = this;
                    self.newDate = new Date();
                    self.getPeople(self.getTheMonth(self.newDate), self.getCurrentTime(self.newDate), "onMonthData");
                },
                getCurrentTime: function(date) {
                    return date.getTime();
                },
                getOneTime: function(date) {
                    var hours = date.getHours(),
                        minutes = date.getMinutes(),
                        seconds = date.getSeconds(),
                        time = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
                    return time;
                },
                getWeek: function(date) {
                    var day = date.getDay(),
                        time = day * 24 * 60 * 60 * 1000 + this.getOneTime(date);
                    return (date.getTime() - time)
                },
                getYesterday: function(date) {
                    var time = 24 * 60 * 60 * 1000 + this.getOneTime(date);
                    return (date.getTime() - time)
                },
                getTheMonth: function(date) {
                    var day = date.getDate(),
                        time = day * 24 * 60 * 60 * 1000 + this.getOneTime(date);
                    return (date.getTime() - time)
                },
                getZeroTime: function(date) {
                    return (date.getTime() - this.getOneTime(date));
                },
                getPieData: function() {
                    var self = this, macs = [], obj = {};
                    for (var i = 0; i < self.todayData.length; i++) {
                        var item = self.todayData[i];
                        if (item.scanner) {
                            var mac = item.scanner;
                            if (macs.indexOf(item.scanner) == -1) {
                                obj[mac] = 0
                                macs.push(mac);
                            }
                            obj[mac] ++
                        }

                    }
                    var pieData = []
                    $.each(self.deviceList, function(i, item) {
                        var mac = item.mac
                        if (macs.indexOf(mac) != -1) {
                            pieData.push({value: obj[mac], name: item.name})
                        }
                    })
                    self.pieData = pieData;
                    console.log(JSON.stringify(pieData));
                    if (Util._isEmpty(PIE_CHART)) {
                        self.initPieEcharts("pie-chart");
                    } else {
                        PIE_CHART.setOption({
                            series: [{
                                data: pieData
                            }]
                        })
                    }
                },
                getRealTimeData: function(date) {
                    var self = this;
                    var endTime = date.getTime();
                    var time = 5 * 1000;
                    var startTime = endTime - time;
                    if (self.realTimeYData.length >= 25) {
                        self.realTimeYData.shift();
                    }
                    self.realTimeYData.push(self.getBlockData(self.todayData, startTime, endTime));
                    if (self.realTimeXData.length >= 25) {
                        self.realTimeXData.shift();
                    }
                    self.realTimeXData.push(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                    if (Util._isEmpty(TODAY_CHART)) {
                        self.initLineEcharts("line-chart");
                    } else {
                        TODAY_CHART.setOption({
                            xAxis:[{
                                data: self.realTimeXData
                            }],
                            series: [{
                                data: self.realTimeYData
                            }]
                        })
                    }
                },
                getLineToday: function(date) {
                    var self = this,
                        hours = date.getHours();
                    self.todayYData = [];
                    self.todayXData = [];
                    var startTime = self.getZeroTime(date);
                    for(var i = 0; i <= hours; i++) {
                        var time = self.getHoursTime(1),
                            endTime = startTime + time;
                        self.todayYData.push(self.getBlockData(self.todayData, startTime, endTime));
                        startTime = endTime;
                        self.todayXData.push(i + ":00");

                    }
                    if (Util._isEmpty(MONTH_CHART)) {
                        self.initBarEcharts("bar-chart");
                    } else {
                        MONTH_CHART.setOption({
                            xAxis:[{
                                data: self.todayXData
                            }],
                            series: [{
                                data: self.todayYData
                            }]
                        })
                    }
                },
                getHoursTime: function(hour) {
                    return hour * 60 * 60 * 1000;
                },
                getBlockData: function(data, zeroTime, currentTime) {
                    var self = this, list = [];
                    $.each(data, function(i, item) {
                        var time = item.time;
                        if (time >= zeroTime && time <= currentTime) {
                            list.push(item);
                        }
                    });
                    return list.length;
                },
                hide: function () {
                    this.addFlag = false;
                    MINT.Indicator.close();
                    this.$parent.curSelect = 1;
                    espmesh.stopScanSniffer();
                    if (!Util._isEmpty(this.scanTimerId)) {
                        clearInterval(this.scanTimerId);
                        this.scanTimerId = "";
                    }
                    if (!Util._isEmpty(TODAY_CHART)) {
                        TODAY_CHART.clear();
                    }
                    if (!Util._isEmpty(MONTH_CHART)) {
                        MONTH_CHART.clear();
                    }
                    if (!Util._isEmpty(PIE_CHART)) {
                        PIE_CHART.clear();
                    }
                    TODAY_CHART = "";
                    MONTH_CHART = "";
                    PIE_CHART = "";
                    this.$emit("reportsInfoShow");
                },
                getPeople: function(startTime, endTime, callback) {
                   espmesh.loadSniffers(JSON.stringify({"min_time": startTime, "max_time": endTime,
                            "del_duplicate": true, "callback": callback}));
                },
                onMonthData: function(res) {
                    var self = this;
                    self.monthData = [];
                    if (!Util._isEmpty(res) && res !== "[]") {
                        res= JSON.parse(res);
                        var todayData = [], yesterdayData = [], weekData = [];
                        var zeroTime = self.getZeroTime(self.newDate);
                        var currentTime = self.getCurrentTime(self.newDate);
                        var yersterDay = self.getYesterday(self.newDate);
                        var oneTime = self.getOneTime(self.newDate);
                        var yersterDay = self.getYesterday(self.newDate);
                        var oneTime = self.getOneTime(self.newDate);
                        var weekTime = self.getWeek(self.newDate);
                        if (self.$store.state.systemInfo != "Android") {
                            zeroTime = parseInt(zeroTime / 1000);
                            currentTime = parseInt(currentTime / 1000);
                            yersterDay = parseInt(yersterDay / 1000);
                            oneTime = parseInt(oneTime / 1000);
                            weekTime = parseInt(weekTime / 1000)
                        }
                        $.each(res, function (i, item) {
                            var time = item.time;
                            if (time >= zeroTime && time <= currentTime) {
                                if (self.$store.state.systemInfo != "Android") {
                                    item.time = time * 1000;
                                }
                                todayData.push(item);
                            } else if (time >= yersterDay && time <= oneTime) {
                                yesterdayData.push(item)
                            }
                            if (time >= weekTime && time <= currentTime) {
                                weekData.push(item)
                            }
                        })
                        self.todayData = todayData;
                        console.log(self.todayData.length);
                        self.yesterdayData = yesterdayData;
                        self.weekData = weekData;
                        self.monthData = res;
                        self.getRealTimeData(self.newDate);
                        setTimeout(function() {
                            self.getLineToday(self.newDate);
                        }, 500);
                        setTimeout(function() {
                            self.getPieData()
                        }, 1000)
                        setTimeout(function() {
                            if (self.addFlag) {
                                self.getData();
                            }
                        }, 3000);
                    }
                    MINT.Indicator.close();
                },
                initLineEcharts: function (id) {
                    var self = this;
                    TODAY_CHART = echarts.init(document.getElementById(id), null, {renderer: 'svg'});
                    var option = {
                        title: {
                            text: self.$t("realTimeChange"),
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                           trigger: 'axis',
                        },
                        animation: false,
                        legend: {
                            show: false
                        },
                        toolbox: {
                            show: false
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis : [
                            {
                                type : 'category',
                                boundaryGap : false,
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1,
                                        opacity: 0.7
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
                                data : self.realTimeXData
                            }
                        ],
                        yAxis : [
                            {
                                type : 'value',
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1
                                    }
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },
//                                axisLabel: {
//                                    inside: true
//                                }

                            }
                        ],
                        series : [
                            {
                                name: self.$t("today"),
                                type: 'line',
                                stack: self.$t("total"),
                                lineStyle:{
                                    normal:{
                                        color: "#00c0ef"  //连线颜色
                                    }
                                },
                                smooth: true,
                                areaStyle: {
                                    normal:{
                                        color: {
                                            type: 'linear',
                                            x: 0,
                                            y: 0,
                                            x2: 0,
                                            y2: 1,
                                            colorStops: [{
                                                offset: 0, color: '#00c0ef' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#00c0ef' // 100% 处的颜色
                                            }],
                                            globalCoord: false // 缺省为 false
                                        }
                                    }
                                },
                                data: self.realTimeYData
                            }


                        ]
                    };
                    TODAY_CHART.setOption(option);
                },
                initBarEcharts: function (id) {
                    var self = this;
                    MONTH_CHART = echarts.init(document.getElementById(id), null, {renderer: 'svg'});
                    var option = {
                        title: {
                            text: self.$t("statisticsChange"),
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                            trigger: 'axis',
                            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        animation: false,
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis : [
                            {
                                type : 'category',
                                data : self.todayXData ,
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1,
                                        opacity: 0.7
                                    }
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: true,
                                    alignWithLabel: true
                                },
                            }
                        ],
                        yAxis : [
                            {
                                type : 'value',
                                axisLine:{
                                    lineStyle:{
                                        color:'#858585',
                                        width:1
                                    }
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: "#f4f4f4"
                                    }
                                },
                                axisTick: {
                                    show: false
                                },

                            }
                        ],
                        series : [
                            {
                                name: self.$t("quantity"),
                                type: 'bar',
                                barWidth: '60%',
                                itemStyle: {
                                    color: "#3ec2fc"
                                },
                                label: {
                                    show: true,
                                    position: "top",
                                },
                                data: self.todayYData
                            }
                        ]
                    };
                    MONTH_CHART.setOption(option);
                },
                initPieEcharts: function (id) {
                    var self = this;
                    PIE_CHART = echarts.init(document.getElementById(id));
                    var option = {
                        title : {
                            text: self.$t("equipmentStatistics"),
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        animation: false,
                        tooltip : {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            show: true,
                            type: 'scroll',
                            orient: 'vertical',
                            right: 0,
                            top: 10,
                            bottom: 10,
                        },
                        series : [
                            {
                                name: self.$t('nav.device'),
                                type: 'pie',
                                radius : '75%',
                                center: ['30%', '50%'],
                                data: self.pieData,
                                label: {
                                    show: false
                                },
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };
                    PIE_CHART.setOption(option);
                },

            },
            components: {
            }

        });

        return Reports;
    });