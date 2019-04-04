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
                    yesterdayData: [],
                    todayChart: "",
                    monthChart: "",
                    weekData: [],
                    monthData: [],
                    todayYData: [],
                    todayXData: [],
                    monthYData: [],
                    monthXData: [],
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    window.onTodayData = self.onTodayData;
                    window.onYesterdayData = self.onYesterdayData;
                    window.onWeekData = self.onWeekData;
                    window.onMonthData = self.onMonthData;
                    self.todayXData = [];
                    self.todayYData = [];
                    self.monthXData = [];
                    self.monthYData = [];
                    self.addFlag = true;
                    setTimeout(function() {
                        self.getData();
                    }, 500);
                    MINT.Indicator.open();
                },
                getData: function() {
                    var self = this;
                    self.newDate = new Date();
                    self.getPeople(self.getZeroTime(self.newDate), self.getCurrentTime(self.newDate), "onTodayData");
                    self.getPeople(self.getYesterday(self.newDate), self.getOneTime(self.newDate), "onYesterdayData");
                    self.getPeople(self.getWeek(self.newDate), self.getCurrentTime(self.newDate), "onWeekData");
                    self.getPeople(self.getTheMonth(self.newDate), self.getCurrentTime(self.newDate), "onMonthData");
                    MINT.Indicator.close();
                    //self.initPieEcharts("pie-chart");
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
                getLineToday: function(date) {
                    var self = this,
                        hours = date.getHours() + 1;
                    self.todayYData = [];
                    self.todayXData = [];
                    var startTime = self.getZeroTime(date);
                    for(var i = 0; i <= hours; i++) {
                        if (i == 0) {
                            self.todayYData.push(0);
                        } else {
                            var time = self.getHoursTime(1),
                                endTime = startTime + time;
                            self.todayYData.push(self.getBlockData(self.todayData, startTime, endTime));
                            startTime = endTime;
                        }
                        self.todayXData.push(i + ":00");

                    }
                    if (Util._isEmpty(self.todayChart)) {
                        self.initLineEcharts("line-chart");
                    } else {
                        self.todayChart.setOption({
                            xAxis:[{
                                data: self.todayXData
                            }],
                            series: [{
                                data: self.todayYData
                            }]
                        })
                    }
                },
                getBarMonth: function(date) {
                    var self = this,
                        day = date.getDate();
                    self.monthYData = [];
                    self.monthXData = [];
                    var startTime = (date.getTime() - day * 24 * 60 * 60 * 1000);
                    if (day > 2) {
                        for(var i = 1; i < day; i++) {
                            var time = self.getHoursTime(24),
                                endTime = startTime + time
                            self.monthYData.push(self.getBlockData(self.monthData, startTime, endTime));
                            self.monthXData.push(i);
                            startTime = endTime;
                        }
                    }
                    self.monthYData.push(self.todayData.length);
                    self.monthXData.push(day);
                    if (Util._isEmpty(self.monthChart)) {
                        self.initBarEcharts("bar-chart")
                    } else {
                        self.monthChart.setOption({
                            xAxis:[{
                                data: self.monthXData
                            }],
                            series: [{
                                data: self.monthYData
                            }]
                        })
                    }
                },
                getHoursTime: function(hour) {
                    return hour * 60 * 60 * 1000;
                },
                getBlockData: function(data, zeroTime, currentTime) {
                    var list = [];
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
                    espmesh.stopScanSniffer();
                    this.$emit("reportsInfoShow");
                },
                getPeople: function(startTime, endTime, callback) {
                   espmesh.loadSniffers(JSON.stringify({"min_time": startTime, "max_time": endTime,
                            "del_duplicate": false, "callback": callback}));
                },
                onTodayData: function(res) {
                    this.todayData = [];
                    if (!Util._isEmpty(res)) {
                        this.todayData = JSON.parse(res);
                    }
                    this.getLineToday(this.newDate);
                    this.getBarMonth(this.newDate);
                },
                onYesterdayData: function(res) {
                    this.yesterdayData = [];
                    if (!Util._isEmpty(res)) {
                        this.yesterdayData = JSON.parse(res);
                    }
                },
                onWeekData: function(res) {
                    this.weekData = [];
                    if (!Util._isEmpty(res)) {
                        this.weekData = JSON.parse(res);
                    }
                },
                onMonthData: function(res) {
                    this.monthData = [];
                    if (!Util._isEmpty(res)) {
                        this.monthData = JSON.parse(res);
                    }
                },
                initLineEcharts: function (id) {
                    var self = this;
                    self.todayChart = echarts.init(document.getElementById(id));
                    var option = {
                        title: {
                            text: '当日人流量变化趋势',
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                           trigger: 'axis',
                        },
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
                                data : self.todayXData
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
                                name:'今天',
                                type:'line',
                                stack: '总量',
                                lineStyle:{
                                    normal:{
                                        color: "#0d63e5"  //连线颜色
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
                                                offset: 0, color: '#0d63e5' // 0% 处的颜色
                                            }, {
                                                offset: 1, color: '#0d63e5' // 100% 处的颜色
                                            }],
                                            globalCoord: false // 缺省为 false
                                        }
                                    }
                                },
                                data: self.todayYData
                            }


                        ]
                    };
                    self.todayChart.setOption(option);
                },
                initBarEcharts: function (id) {
                    var self = this;
                    self.monthChart = echarts.init(document.getElementById(id));
                    var option = {
                        title: {
                            text: '当月人流量变化趋势',
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
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis : [
                            {
                                type : 'category',
                                data : self.monthXData ,
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
                                name:'人数',
                                type:'bar',
                                barWidth: '60%',
                                itemStyle: {
                                    color: "#3ec2fc"
                                },
                                label: {
                                    show: true,
                                    position: "top",
                                },
                                data: self.monthYData
                            }
                        ]
                    };
                    self.monthChart.setOption(option);
                },
                initPieEcharts: function (id) {
                    var myChart = echarts.init(document.getElementById(id));
                    var option = {
                        title : {
                            text: '设备统计占比',
                            textStyle: {
                                fontWeight: 'normal',              //标题颜色
                                color: '#858585',
                                fontSize: 14
                            },
                        },
                        tooltip : {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            show: true,
                            type: 'scroll',
                            orient: 'vertical',
                            right: 10,
                            top: 20,
                            bottom: 20,
                        },
                        series : [
                            {
                                name: '设备',
                                type: 'pie',
                                radius : '55%',
                                center: ['40%', '50%'],
                                data:[
                                    {value:335, name:'light-1'},
                                    {value:310, name:'light-2'},
                                    {value:234, name:'light-3'},
                                    {value:135, name:'light-4'},
                                    {value:1548, name:'light-5'}
                                ],
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
                    myChart.setOption(option);
                },

            },
            components: {
            }

        });

        return Reports;
    });