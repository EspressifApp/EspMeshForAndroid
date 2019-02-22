define(["vue", "MINT", "Util", "jsPlumb", "Hammer", "IScroll", "txt!../../pages/index.html",
    "../js/info", "../js/eventInfo", "../js/table", "./resetDevice", "./scanDevice", "./remind", "./writing"],
    function(v, MINT, Util, jsPlumb, Hammer, IScroll, index, info, eventInfo, table, resetDevice, scanDevice, remind, writing) {

    var Index = v.extend({
        template: index,
        data: function(){
            return {
                flag: false,
                colorId: "info-color-id",
                temperatureId: "info-temperature-id",
                deviceList: [],
                deviceInfo: "",
                name: "",
                infoShow: false,
                topStatus: "",
                powerFlag: false,
                showAdd: false,
                temporaryAddList: [],
                temporaryDelList: [],
                wifiNum: 0,
                searchName: "",
                eventDeviceMacs: [],
                hsb: "",
                listMacs: [],
                distanceY: 0,
            }
        },
        mounted: function() {
            this.wifiNum = 0;
            espmesh.hideCoverImage();
            this.$store.commit("setShowScanBle", true);
            this.$store.commit("setShowLoading", true);
            this.reload();
            this.initPages();
            this.eventDeviceMacs = [];
            this.loadHWDevices();
            espmesh.registerPhoneStateChange();
            this.loadAllDeviceEventsPosition();
        },
        computed: {
            list: function () {
                var self = this,
                    macs = self.eventDeviceMacs;
                    searchList = [];
                self.deviceList = self.$store.state.deviceList;
                if (self.deviceList.length > 0) {
                    self.$refs.remind.hide();
                }
                var list = [], dropList = [];
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
                        dropList.push(item);
                    } else {
                        list.push(item);
                    }
                });
                searchList = list;
                searchList.sort(Util.sortBy("name"));
                dropList.sort(Util.sortBy("name"));
                $.each(dropList, function(i, item) {
                    searchList.push(item);
                });
                setTimeout(function () {
                    $("#lefticon div.itemindex").draggable({
                        helper: 'clone',
                        scope: 'topo',
                        disabled: false
                    });
                    $('#collapse-switch, #collapse-light, #collapse-sensor').find('div.availability').draggable({
                        disabled: true
                    });
                    self.meshDrop();
                    if (!Util._isEmpty(ISCROLL_BAR)) {
                        ISCROLL_BAR.refresh();
                    } else {
                        self.initScroll();
                    }
                }, 800);

                return searchList;
            }
        },
        methods:{
            reload: function() {
                var self = this;
                if (self.$store.state.showLoading) {
                    MINT.Indicator.open(self.$t('loading'));
                }
                setTimeout(function() {
                    self.$store.commit("setList", []);
                    espmesh.scanDevicesAsync();
                }, 1000);
            },
            loadHWDevices: function() {
                espmesh.loadHWDevices();
            },
            conReload: function() {
                var self = this;
                self.$refs.remind.hide();
                self.$store.commit("setShowScanBle", true);
                self.$store.commit("setShowLoading", false);
                MINT.Indicator.open(self.$t('loadCon'));
                setTimeout(function() {
                     MINT.Indicator.close();
                    if (self.deviceList.length <= 0) {
                        MINT.Toast({
                          message: self.$t('refreshDesc'),
                          position: 'bottom',
                        });
                    };
                    if (self.$store.state.showScanBle) {
                        self.onBackIndex();
                    }
                    self.$store.commit("setShowLoading", true);
                }, 20000);
                setTimeout(function() {
                    self.stopBleScan();
                });
            },
            showTable: function () {
                this.stopBleScan();
                this.$store.commit("setShowScanBle", false);
                this.$store.commit("setShowLoading", false);
                this.$refs.table.show();
            },
            getSwitch: function(item) {
                var flag = false;
                if (item.tid >= MIN_SWITCH && item.tid <= MAX_SWITCH) {
                    flag = true;
                }
                return flag;
            },
            getLight: function(item) {
                var flag = false;
                if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                    flag = true;
                }
                return flag;
            },
            getSensor: function(item) {
                var flag = false;
                if (item.tid >= MIN_SENSOR && item.tid <= MAX_SENSOR) {
                    flag = true;
                }
                return flag;
            },
            getOther: function(item) {
                var flag = false;
                if (item.tid < MIN_LIGHT || item.tid >= MIN_OTHER) {
                    flag = true;
                }
                return flag;
            },
            getSwitchStatus: function(characteristics) {
                var status = 0;
                $.each(characteristics, function(j, itemSub) {
                    if (itemSub.cid == SENSOR_CID) {
                        status = itemSub.value;
                        return false;
                    }
                })
                return status;
            },
            getSensorStatus: function(characteristics) {
                var status = 0;
                $.each(characteristics, function(j, itemSub) {
                    if (itemSub.cid == SENSOR_CID) {
                        status = itemSub.value;
                        return false;
                    }
                })
                return status;
            },
            getLightLum: function (characteristics) {
                var luminance = 0;
                $.each(characteristics, function(j, itemSub) {
                    if (itemSub.cid == VALUE_CID) {
                        luminance = itemSub.value;
                        return false;
                    }
                })
                return luminance;
            },
            getColor: function (characteristics) {
                var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#fff";

                $.each(characteristics, function(i, item) {
                    if (item.cid == HUE_CID) {
                        hueValue = item.value;
                    }else if (item.cid == SATURATION_CID) {
                        saturation = item.value;
                    }else if (item.cid == VALUE_CID) {
                        luminance = item.value;
                    } else if (item.cid == STATUS_CID) {
                        status = item.value;
                    }
                })
                if (status == STATUS_ON) {
                    rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                }
                return rgb;
            },
            initPages: function() {
                var self = this;
                var topocontent = $('#topocontent'),
                    toporight = $('#toporight-index'),
                    lefticon = $('#lefticon'),
                    linewrap = $('#linewrap');
                jsPlumb.ready(function () {
                        //连接样式
                        var instance = jsPlumb.getInstance({
                                Endpoint : ["Blank", {radius:0}],
                                EndpointStyle : { fill : LINE_COLOR},
                                // HoverPaintStyle: {stroke: LINE_COLOR, strokeWidth: 1 },
                                ConnectionOverlays : [
                                    [ "Custom", { create: function(component) {
                                        return $("<div id='custom-wrapper'></div>"); }
                                        ,location: 1}],
                                    [ "Label", { label:"event", id:"label", cssClass:"labelstyle" }]
                                ],
                                DragOptions : { zIndex:2000 },
                                Container:"topocontent"
                            });

                        instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });

                        window.jsp = instance;
                        JSPLUMB_INSTANCE = instance;
                        var canvas = document.getElementById("topocontent");
                        self.initTouch("toporight-index");
                        self.getBodyWidth();
                        //自定义鼠标事件
                        var rightkeyPop = $('#rightkeyPop'),
                            relationWrap = $('#relationWrap'),
                            relevanceBox = $('#relevanceBox'),
                            delEle = $('#delEle');

                        $(document).on("contextmenu", function() { return false; });

                        $(document).on('click', 'div.delete-elebox', function(event){
                            idStr = $(this).data("id");
                            event.stopPropagation();
                            $.confirmInfo({
                                title : '删除元素及连接',
                                text : '确认删除此元素及其连接吗？',
                                sure : function(){
                                    instance.removeAllEndpoints(idStr);
                                    instance.remove(idStr);
                                    self.enabledDevice(idStr);
                                }
                            });
                        });
                        $(document).on('touchend', 'div.content-wrapper', function(event){
                            if( TOUCH_TIME == 0 ){
                                //第一次点击
                                TOUCH_TIME = new Date().getTime();
                            }else{
                                if( new Date().getTime() - TOUCH_TIME < 500 ){
                                    var mac = $(this).parent().attr("id"),
                                    tid = $(this).parent().attr("data-tid");
                                    TOUCH_TIME = 0;
                                    self.showEditDevice(mac, tid);
                                }else{
                                    TOUCH_TIME = new Date().getTime();
                                }
                            }
                            event.stopPropagation();

                        });
                        $(document).on('touchend', 'div.label-wrapper', function(event){
                            var mac = $(this).parent().attr("id");
                            self.showAllEventInfo(mac);
                            event.stopPropagation();
                        });
                    //    $(window).resize(function() {
                    //    	deviceColorPicker();
                    //  	});
                        lefticon.on("click", "a[data-toggle='collapse']", function() {
                            $("a[data-toggle='collapse']").find("i.caret-i")
                                .addClass("icon-right-dir").removeClass("icon-down-dir");
                            if ($(this).hasClass("active")) {

//                                if (!Util._isEmpty(ISCROLL_BAR)) {
//                                    ISCROLL_BAR.disable();
//                                }
                                $(this).removeClass("active").find("i.caret-i")
                                    .addClass("right").removeClass("icon-down-dir");
                            } else {
                                $("a[data-toggle='collapse']").removeClass("active");
                                $(this).addClass("active").find("i.caret-i")
                                    .addClass("icon-down-dir").removeClass("icon-right-dir");
                            }
                            ISCROLL_BAR.scrollTo(0, 0);
                            setTimeout(function() {
                                ISCROLL_BAR.refresh();
                            }, 1000)

                        });

                        //jsPlumb事件
                        instance.bind("click", function(info) {//点解连接线删除连接（bug,点击endpoint也能删除，但是点击label能提示不能删除）
                            self.detachLine(info);
                        });
                        instance.bind("connection", function(info) {//更改label关系
                            var sourceId = info.sourceId;
                            var targetId = info.targetId;
                            var tidSourceId = $("div[icontype='" + sourceId + "']").data("tid");
                            var tidTargetId = $("div[icontype='" + targetId + "']").data("tid");
                            if (tidSourceId >= MIN_LIGHT && tidSourceId <= MAX_LIGHT &&
                                tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {
                                info.connection.getOverlay("label").setLabel("SYNC");
                            } else {
                                info.connection.getOverlay("label").setLabel("ON-OFF");
                            }

                        });
                        instance.bind("connectionDragStop", function(info) {//点击连接线、overlay、label提示删除连线 + 不能以自己作为目标元素
                            var sourceId = info.sourceId;
                            var targetId = info.targetId;
                            if(sourceId == targetId){
                                //instance.detach(info);
                                instance.deleteConnection(info);
                            }else{
                                if(sourceId != null && targetId != null){
                                    var flag = true;
                                    var eventsPositions = self.$store.state.eventsPositions;
                                    var events = [];
                                    $.each(eventsPositions, function(i, item) {
                                        if (item.mac == sourceId) {
                                            events = JSON.parse(item.events);
                                        }
                                    });
                                    if(events.length > 0) {
                                        $.each(events, function(i, item) {
                                            if (item.execute_mac.indexOf(targetId) > -1) {
                                                flag = false;
                                                return false;
                                            }
                                        })
                                    }
                                    if (flag) {
                                        var tidSourceId = $("div[icontype='" + sourceId + "']").data("tid");
                                        var tidTargetId = $("div[icontype='" + targetId + "']").data("tid");
                                        var linkMacs = self.eventsMac(sourceId);
                                        if (tidSourceId >= MIN_SWITCH && tidSourceId <= MAX_SWITCH &&
                                            tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {
                                            if (tidSourceId == TOUCH_PAD_SWITCH) {
                                                setTimeout(function(){self.switchTouchDefaultEvent(sourceId, linkMacs, targetId)}, 100);
                                                $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                            } else {
                                                setTimeout(function(){self.switchDefaultEvent(sourceId, linkMacs, targetId)}, 100);
                                                $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                            }

                                        } else if (tidSourceId >= MIN_SENSOR && tidSourceId <= MAX_SENSOR &&
                                            tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {

                                            setTimeout(function(){self.sensorDefaultEvent(sourceId, linkMacs, targetId)}, 100);
                                            $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                        } else if (tidSourceId >= MIN_LIGHT && tidSourceId <= MAX_LIGHT &&
                                            tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {

                                            setTimeout(function(){self.lightSyscEvent(sourceId, linkMacs, targetId)}, 100);
                                            $("#" + sourceId).addClass("active").find("div.label-style").text("SYNC");

                                        } else {
                                            instance.deleteConnection(info);
                                        }
                                    } else {
                                        JSPLUMB_INSTANCE.deleteConnection(info);
                                    }
                                    info.unbind('mousedown');
                                }
                            };
                        });
                        function eventsMac(sourceId) {
                            var macs = [];
                            var connections = instance.getAllConnections();
                            $.each(connections, function(i, item) {
                                if (item.sourceId == sourceId && macs.indexOf(item.targetId) < 0) {
                                    macs.push(item.targetId);
                                }
                            })
                            return macs;
                        }
                        //
                        // initialise element as connection targets and source.
                        //
                        JSPLUMB_INITNODE = function (el, lineColor) {
                            var doc = $("#" + el);
                            // initialise draggable elements.
                            var delDoc = $("#delete-device")
                            instance.draggable(doc,{
                                drag: function() {
                                    self.calculate(doc.offset().left, doc.offset().top);
                                },
                                stop: function () {
                                    if (delDoc.hasClass("active")) {
                                        var flag = true;

                                        var parentMacs = self.getParentMac(el);
                                        setTimeout(function(){
                                            self.removeSession(parentMacs, el);
                                        }, 800);
                                    } else {
                                        var height = $("div.topoheader").height(),
                                            width = $("div.topoleft").width(),
                                            top = doc.offset().top,
                                            left = doc.offset().left;
                                        setTimeout(function(){self.addSession(el, {top: (top - height), left: (left - width) } , []);}, 500);

                                    }
                                }
                            });
                            instance.makeSource(doc, {
                                filter: ".drop-topo",
                                anchor: BODY_WIDTH,
                                EndpointStyle: {width: 20, height: 20},
                                connector: ["Flowchart", {stub: [0, 0], gap: 2, cornerRadius: 5, alwaysRespectStubs: true }],
                                connectorStyle: { stroke: lineColor, strokeWidth: 1},
                            });
                            instance.makeTarget(doc, {
                                dropOptions: { hoverClass: "dragHover" },
                                anchor: "LeftMiddle",
                            });
                            instance.fire("jsPlumbDemoNodeAdded", el);
                        };

                        //拖动创建元素
                        self.meshDrop();
                        self.copyDrop();
                        toporight.droppable({
                            scope: 'topo',
                            accept: ".itemindex",
                            drop: function(event, ui){
                                //获取基本元素与参数
                                var $this = $(this),
                                    dragui = ui.draggable,
                                    fatop = parseInt($this.offset().top),
                                    faleft = parseInt($this.offset().left),
                                    uitop = parseInt(ui.offset.top),
                                    uileft = parseInt(ui.offset.left),
                                    icon = dragui.children('i').attr('class'),
                                    color = dragui.children('i').css('color'),
                                    spantxt = dragui.children('span').text(),
                                    uid = dragui.attr('icontype'),
                                    tid = dragui.data("tid"),
                                    status = dragui.data("status"),
                                    alluid = topocontent.children('div.' + uid);
                                self.disabledDevice(uid);
                                //ID计算
                                var allicon = alluid.length,
                                    idnum = 0,
                                    idArr  = new Array;
                                alluid.each(function(i) {
                                    idArr.push(parseInt($(this).attr('id').split('_')[1]));
                                });
                                idArr.sort(function(a,b){return a>b?1:-1});
                                for(i = 0; i < allicon; i++){
                                    var idArrOne = parseInt(idArr[i]);
                                    if(i != idArrOne){
                                        idnum = idArrOne - 1;
                                        break;
                                    }else{
                                        idnum = allicon;
                                    }
                                }
                                var left = (uileft - faleft),
                                    top = (uitop - fatop);
                                //插入元素组织
                                var newstyle = 'left:' + left + 'px;top:' + top + 'px',
                                    newid = uid,
                                    str = '<div data-tid="' + tid + '" class="elebox '+uid+'" id='+newid+' style='+newstyle+'>';
                                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                                    str += '<div class="join-wrapper"><span></span><span></span></div><div class="content-wrapper"><div data-id="' + newid + '" class="left edit-elebox"><i class="' + icon +
                                        '" style="color: ' + color + '"></i></div><div ' +
                                        'class="right"><span class="dragPoint">'+spantxt+'</span>'+
                                        '<span>Bright：<i class="luminance">' + status + '</i>%</div></div>';
                                } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                                    str += '<div class="content-wrapper"><div class="left"><i class="'+icon+'"></i></div><div ' +
                                        'class="right"><span class="dragPoint">'+spantxt+'</span>'+
                                        '<span>Status：' + (status == STATUS_ON ? 'ON' : 'OFF') + '</div></div>';
                                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                                    str += '<div class="content-wrapper"><div class="left"><i class="'+icon+'"></i></div><div ' +
                                        'class="right"><span class="dragPoint">'+spantxt+'</span>'+
                                        '<span>Sensitive：' + status + '</div></div>';
                                }
                                str += '<div class="drop-wrapper drop-topo"></div><div class="label-wrapper">' +
                                            '<span class="label-line"></span><div class="label-style label-topo"></div></div></div>';
                                topocontent.append(str);

                                setTimeout(function(){
                                    self.getEvent(uid, tid, true);
                                    self.addSession(uid, {top: top, left: left } , []);
                                },100);
                                JSPLUMB_INITNODE(uid, LINE_COLOR);
                            }
                        });

                    });
            },
            calculate: function (devTopLeft, devTopRight) {
                var doc = $("#delete-device");
                var wHeight = $(window).height(),
                    wWidth = $(window).width(),
                    delTopLeft = wWidth - DEL_HEIGHT,
                    delTopRight = wHeight - DEL_WIDTH,
                    left = devTopLeft + DEVICE_WIDTH,
                    top = devTopRight + DEVICE_HEIGHT;
                if (top >= delTopRight && left >= delTopLeft) {
                    doc.addClass("active");
                } else {
                    doc.removeClass("active");
                }

            },
            getDisabled: function(mac) {
                var flag = false;
                if (this.eventDeviceMacs.indexOf(mac) > -1) {
                    flag = true;
                }
                return flag;
            },
            eventsMac: function (sourceId) {
                var macs = [];
                var connections = JSPLUMB_INSTANCE.getAllConnections();

                $.each(connections, function(i, item) {
                    if (item.sourceId == sourceId) {
                        macs.push(item.targetId);
                    }
                })
                return macs;
            },
            showAllEventInfo: function(mac) {
                var self = this;
                $.each(self.deviceList, function(i, item) {
                    if (item.mac == mac) {
                        self.$store.commit("setDeviceInfo", item);
                        return false;
                    }
                })
                self.stopBleScan();
                this.$store.commit("setShowScanBle", false);
                this.$store.commit("setShowLoading", false);
                self.$refs.event.show();
            },
            detachLine: function (info){//删除连接
                var self = this;
                MINT.MessageBox.confirm("Do you want to delete this connection?", "Delete connection",{
                     confirmButtonText: "Confirm", cancelButtonText: "Cancel"}).then(function(action) {
                    MINT.Indicator.open();
                    JSPLUMB_INSTANCE.deleteConnection(info);
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                        DEVICE_DELAY + '": "' + DELAY_TIME + '"}';
                    setTimeout(function(){
                        espmesh.requestDevicesMulticastAsync(data);
                        MINT.Indicator.close();
                    }, 500);
                });
            },

            getParentMac: function (childMac) {
                var self = this,
                    connections = JSPLUMB_INSTANCE.getAllConnections(),
                    parentMacs = [],
                    delDoc = $("#delete-device"),
                    eventMacs = [];
                $.each(connections, function(i, item) {
                    if (item.targetId == childMac) {
                        parentMacs.push(item.sourceId);
                        eventMacs.push(item.sourceId);
                    }
                })
                JSPLUMB_INSTANCE.removeAllEndpoints(childMac);
                JSPLUMB_INSTANCE.remove(childMac);
                self.enabledDevice(childMac);
                delDoc.removeClass("active");
                $.each(connections, function(i, item) {
                    var len = eventMacs.indexOf(item.sourceId);
                    if (len > -1) {
                        eventMacs.splice(len, 1);
                    }
                })
                var len = eventMacs.length;
                if (len > 0) {
                    for(var i = 0; i < len; i ++) {
                        $("#" + eventMacs[i]).removeClass("active");
                    }

                }
                return parentMacs;
            },
            copyDrop: function () {
                var self = this;
                $('#collapse-switch, #collapse-light, #collapse-sensor').on({
                    touchstart: function() {
                        var $this = $(this);
                        POSITION_TOP = $this.offset().top;
                        if (!$this.hasClass("availability")) {
                            TIMER_DROP = setTimeout(function() {
                                var doc = $("#draggable-wrapper");
                                //将点击的元素内容复制
                                var clickElement = null,
                                    icon = $this.children('i').attr("class"),
                                    color = $this.children('i').css('color'),
                                    uid = $this.attr('icontype'),
                                    spantxt = $this.children('span').text(),
                                    clickElement = '<div data-id="'+uid+'"  class="drop-content"><i class="' +
                                        icon+'" style="color: ' + color + '"></i><span class="name">' +
                                        spantxt + '</span></div>';
                                doc.empty().append(clickElement).css({"display": "block", "top": POSITION_TOP, "left": "0"});
                            }, 1000);
                        }
                    },
                    touchend: function() {
                        clearTimeout(TIMER_DROP);
                        var doc = $(this),
                            top = doc.offset().top;
                        if (!Util._isEmpty(TIMER_DROP)) {
                            var mac = doc.attr("data-value"),
                                tid = doc.attr("data-tid");
                            if( TOUCH_TIME == 0 ){
                                //第一次点击
                                TOUCH_TIME = new Date().getTime();
                            }else{
                                if(new Date().getTime() - TOUCH_TIME < 500 ){
                                    TOUCH_TIME = 0;
                                    self.showEditDevice(mac, tid);
                                }else{
                                    TOUCH_TIME = new Date().getTime();
                                }
                            }
                            event.stopPropagation();
                        }
                        $("#draggable-wrapper").empty().css({"display": "none"});
                        return false;
                    }
                }, 'div.itemindex');
            },
            initScroll: function () {
                var self = this;
                ISCROLL_BAR = new IScroll('#topoleft', {
                    hScroll: false,
                    bounce: false,
                    momentum: false,
                    scrollbars: false,
                    mouseWheel: false,
                    interactiveScrollbars: false,
                    shrinkScrollbars: false,
                    preventDefault: false,
                    fadeScrollbars: false,
                    disableMouse: true
                });
                ISCROLL_BAR.on("scrollEnd", function() {
                    self.distanceY = ISCROLL_BAR.y;
                })

            },
            refreshBtn: function() {
                this.loadAllDeviceEventsPosition();
                JSPLUMB_INSTANCE.deleteEveryEndpoint();
                $("#topocontent").find("div.elebox").remove();
                this.stopBleScan();
                this.reload();
            },
            resetBtn: function() {
                var self = this,
                macs = self.getAllMacs();
                self.resetDevice(macs);
            },
            getAllMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    macs.push(item.mac);
                });
                return macs;
            },
            resetDevice: function(macs) {
                var self = this;
                MINT.MessageBox.confirm("Confirm restore factory setting?", "Factory data reset",{
                    confirmButtonText: "Confirm", cancelButtonText: "Cancel"}).then(function(action) {
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                        DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                    setTimeout(function(){
                        JSPLUMB_INSTANCE.deleteEveryEndpoint();
                        $("#topocontent").find("div.elebox").remove();
                        espmesh.requestDevicesMulticastAsync(data);
                        var devices = [];
                        $.each(self.deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) < 0) {
                                devices.push(item);
                            }
                        })
                        self.deviceList = devices;
                        MINT.Indicator.close();
                        self.$store.commit("setList", self.deviceList);
                    }, 500);
                });
            },
            addEventDeviceMacs: function(mac) {
                var self = this;
                if (self.eventDeviceMacs.indexOf(mac) < 0) {
                    self.eventDeviceMacs.push(mac);
                }
            },
            delEventDeviceMacs: function(mac) {
                var self = this,
                    num = self.eventDeviceMacs.indexOf(mac);
                if (num > -1) {
                    self.eventDeviceMacs.splice(num, 1);
                }
            },
            disabledDevice: function (mac) {
                this.addEventDeviceMacs(mac);
                $('#collapse-switch, #collapse-light, #collapse-sensor').find('div.availability').draggable({
                    disabled: true
                });

            },
            enabledDevice: function (mac) {
                this.delEventDeviceMacs(mac);
                $("#lefticon div.itemindex[icontype='" + mac + "']").draggable({
                    helper: 'clone',
                    scope: 'topo',
                    disabled: false
                });

            },
            initTouch: function (id) {
                var scale = 1;
                var mc = new Hammer.Manager(document.getElementById(id));
                mc.add(new Hammer.Pinch({ threshold: 0 }));
                mc.on("pinchmove pinchstart pinchin pinchout", function(ev){
                    if(ev.type == "pinchstart"){
                        scaleIndex = CURRSCALE || 1;
                    }
                    CURRSCALE = scaleIndex * ev.scale;
                    if (CURRSCALE >= 1) {
                        CURRSCALE = 1;
                    }
                    if (CURRSCALE <= 0.2) {
                        CURRSCALE = 0.2;
                    }
                    if(typeof ev.scale != 'undefined') {
                        $("#topocontent").css({transform: "scale(" + CURRSCALE + ")"});
                        JSPLUMB_INSTANCE.setZoom(CURRSCALE);
                    }
                });
                mc.on('pinchend',function(ev){
                    scale = CURRSCALE;
                });
            },
            meshDrop: function () {
                var self = this;
                //拖动创建元素
                $('#collapse-switch, #collapse-light, #collapse-sensor').find('div.itemindex').draggable({
                    helper: 'clone',
                    scope: 'topo',
                    delay: "1000",
                    start: function(event, ui) {
                        clearTimeout(TIMER_DROP);
                        TIMER_DROP = "";
                    },
                    drag: function(event, ui) {
                        clearTimeout(TIMER_DROP);
                        ISCROLL_BAR.scrollTo(0, self.distanceY);
                    },
                    stop: function (event, ui) {
                        $("#draggable-wrapper").empty().css({"display": "none"});
                        ISCROLL_BAR.scrollTo(0, self.distanceY);
                    }
                });
            },
            getBodyWidth: function () {
                var width = document.body.offsetWidth;
                if (width <= 960) {
                    BODY_WIDTH = [1, 0.5, 1, 0, 70, 0];
                } else {
                    BODY_WIDTH = [1, 0.5, 1, 0, 90, 0];
                }
            },
            showEditDevice: function (mac, tid) {
                var self = this;
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == mac) {
                            self.$store.commit("setDeviceInfo", item);
                            return false;
                        }
                    })
                    self.stopBleScan();
                    self.$refs.info.show();
                }
            },
            addDevice: function (event) {
                this.stopBleScan();
                this.$store.commit("setShowScanBle", false);
                this.$store.commit("setShowLoading", false);
                this.$refs.device.show();
            },
            showWriting: function() {
                this.stopBleScan();
                this.$store.commit("setShowScanBle", false);
                this.$store.commit("setShowLoading", false);
                this.$refs.writing.show();
            },
            removeInfo: function () {
                $("input").val("");
                $("div.mask").addClass("hidden");
                var docWrapper = $('#event-wrapper');
                if (docWrapper.hasClass('active')) {
                    docWrapper.hide(function() {
                        docWrapper.removeClass('active');
                    })
                }
                $("div.event-info").removeClass("active");
            },
            removeModal: function () {
                $("input").val("");
                $("div.event-mask").addClass("hidden");
                $("div.event-modal").removeClass("active");
            },
            switchTouchDefaultEvent: function(parentMac, childMacs, childMac) {
                var self = this;
                var splitMac = parentMac.substr((parentMac.length - 3), 3);
                var events = [];

                var eventLumiLnance = self._assemblySyscEvent("SYSC" + splitMac, TOUC_PAD_BTN_3, childMacs);
                events.push(eventLumiLnance);

                var eventRed = self._assemblySwitchEvent("RED_" + splitMac,TOUC_PAD_BTN_0,
                    childMacs, SYSC_RED_HUE, SYSC_RED_SATURATION);
                events.push(eventRed);

                var eventGreen = self._assemblySwitchEvent("GREEN_" + splitMac, TOUC_PAD_BTN_1,
                    childMacs, SYSC_GREEN_HUE, SYSC_GREEN_SATURATION);
                events.push(eventGreen);

                var eventBlue = self._assemblySwitchEvent("BLUE_" + splitMac, TOUC_PAD_BTN_2,
                    childMacs, SYSC_BLUE_HUE, SYSC_BLUE_SATURATION);
                events.push(eventBlue);

                self._addRequestEvent(parentMac, events, childMac);
            },
            sensorDefaultEvent: function (parentMac, childMacs, childMac) {
                var self = this;
                var splitMac = parentMac.substr((parentMac.length - 3), 3);
                var events = [];
                var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SENSOR_CID,
                    childMacs, MESH_SENSOR_ON_COMPARE, STATUS_ON);
                events.push(eventON);
                var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SENSOR_CID,
                    childMacs, MESH_SENSOR_OFF_COMPARE, STATUS_OFF);
                events.push(eventOFF);
                self._addRequestEvent(parentMac, events, childMac);
            },
            switchDefaultEvent: function(parentMac, childMacs, childMac) {
                var self = this;
                var splitMac = parentMac.substr((parentMac.length - 3), 3);
                var events = [];
                var eventON = self._assemblyOtherEvent(ON_EN + "_" + splitMac, SWITCH_CID,
                    childMacs, MESH_LIGHT_ON_COMPARE, STATUS_ON);
                events.push(eventON);
                var eventOFF = self._assemblyOtherEvent(OFF_EN + "_" + splitMac, SWITCH_CID,
                    childMacs, MESH_LIGHT_OFF_COMPARE, STATUS_OFF);
                events.push(eventOFF);

                self._addRequestEvent(parentMac, events, childMac);

            },

            lightSyscEvent: function (parentMac, childMacs, childMac) {
                var self = this;
                var splitMac = parentMac.substr((parentMac.length - 3), 3);
                var events = [];

                var eventOn = self._assemblySyscEvent("ON_" + splitMac, STATUS_CID, childMacs);
                var eventValue = self._assemblySyscEvent("VALUE_" + splitMac, VALUE_CID, childMacs);
                var eventHue = self._assemblySyscEvent("HUE_" + splitMac, HUE_CID, childMacs);
                var eventSaturation = self._assemblySyscEvent("SATURATION_" + splitMac, SATURATION_CID, childMacs);
                var eventTemperature = self._assemblySyscEvent("TEMPERATURE_" + splitMac, TEMPERATURE_CID, childMacs);
                var eventBrightess = self._assemblySyscEvent("BRIGHTNESS_" + splitMac, BRIGHTNESS_CID, childMacs);

                events.push(eventOn);
                events.push(eventValue);
                events.push(eventHue);
                events.push(eventSaturation);
                events.push(eventTemperature);
                events.push(eventBrightess);
                self._addRequestEvent(parentMac, events, childMac);
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
            _addRequestEvent: function (parentMac, events, childMac) {
                var data = '{"' + MESH_MAC + '": "' + parentMac +
                        '","'+DEVICE_IP+'": "'+this.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_EVENT + '",' +
                        '"events":' + JSON.stringify(events) + ', "callback": "OnAsyncDevice", "tag": {"mac": "'+
                        parentMac+'", "childMac": "'+childMac+'"}}';
                sessionStorage.setItem(childMac+ "_" + parentMac, JSON.stringify(events));
                espmesh.requestDeviceAsync(data);
            },
            initEvent: function () {
                var self = this,
                    eventMacs = self.getAllMacs();
                MINT.Indicator.close();
                MINT.Indicator.open(self.$t('loadEvent'));
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(eventMacs) +
                    ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                    GET_EVENT +'","callback": "onInitEvent"}';
                espmesh.requestDevicesMulticastAsync(data);
            },
            addFirstMenu: function (item, position) {
                var hueValue = 0,
                    saturation = 0,
                    luminance = 0,
                    meshMac = item.mac,
                    status = 0,
                    tid = item.tid,
                    doc = $("#"+ meshMac).attr("data-tid");
                if (Util._isEmpty(doc)) {
                    $.each(item.characteristics, function(j, itemSub) {
                        if (itemSub.cid == HUE_CID) {
                            hueValue = itemSub.value;
                        }else if (itemSub.cid == SATURATION_CID) {
                            saturation = itemSub.value;
                        }else if (itemSub.cid == VALUE_CID) {
                            luminance = itemSub.value;
                        }else if (itemSub.cid == STATUS_CID) {
                            status = itemSub.value;
                        }
                    });
                    var color = "#999";
                    if (status == STATUS_ON) {
                        var hsb = "hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+(luminance / 100) +")";
                        color = Raphael.getRGB(hsb);
                    }
                    var newstyle = 'left:' + position.left + 'px;top:' + position.top + 'px',
                        str = '<div data-tid="' + tid + '" class="elebox '+meshMac+'" id='+meshMac+' style='+newstyle+'>';
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        str += '<div class="join-wrapper"><span></span><span></span></div><div class="content-wrapper">'+
                            '<div data-id="' + meshMac + '" class="left edit-elebox"><i class="icon-light" style="color: ' +
                            color + '"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Bright：<i class="luminance">' + luminance + '</i>%</div></div>';
                    } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        str += '<div class="content-wrapper"><div class="left"><i class="icon-power"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Status：' + (status == STATUS_ON ? 'ON' : 'OFF') + '</div></div>';
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        str += '<div class="content-wrapper"><div class="left"><i class="icon-sensor"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Sensitive：' + status + '</div></div>';
                    }
                    str += '<div class="drop-wrapper drop-topo"></div><div data-mac="' + meshMac + '" class="label-wrapper">' +
                             '<span class="label-line"></span><div class="label-style label-topo"></div></div></div>';
                    $('#topocontent').append(str);
                    JSPLUMB_INITNODE(meshMac, LINE_COLOR);
                    this.disabledDevice(meshMac);
                }

            },
            addLink: function (events) {
                var self = this;
                if (events.length > 0) {
                    $.each(events, function(i, item) {
                        var macs = [],
                            tid = item.tid,
                            mac = item.mac,
                            itemEvents = JSON.parse(item.events),
                            doc = $("#" + mac);

                        $.each(itemEvents, function(j, itemEvent) {
                            var executeMac = itemEvent.execute_mac;
                            for (var k in executeMac) {
                                if (macs.indexOf(executeMac[k]) < 0) {
                                    macs.push(executeMac[k]);
                                }
                            }

                        })
                        if (macs.length > 0) {
                            for (var k in macs) {
                                var docEleboxId = $("#" + macs[k]).attr("id");
                                if (Util._isEmpty(docEleboxId)) {
                                    var flag = false;
                                    $.each(self.deviceList, function(i, item) {
                                        if (item.mac == macs[k]) {
                                            self.addFirstMenu(item, {left: DEVICE_LEFT, top: DEVICE_TOP});
                                            DEVICE_LEFT += 80;
                                            flag = true;
                                            return false;
                                        }
                                    })
                                    if (flag) {
                                        doc.addClass("active");
                                    }
                                } else {
                                    doc.addClass("active");
                                }
                                var conor = JSPLUMB_INSTANCE.connect({ source: mac, target: macs[k]});
                                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                                    //conor.getOverlay("label").setLabel("SYNC");
                                    doc.find("div.label-style").text("SYNC");
                                } else {
                                   // conor.getOverlay("label").setLabel("ON_OFF");
                                    doc.find("div.label-style").text("ON_OFF");
                                }
                            }
                        }

                    });
                }
            },
            getEvent: function (mac, tid, flag){
                var self = this,
                    macs = [];
                var eventsPositions = self.$store.state.eventsPositions;
                if (!Util._isEmpty(eventsPositions) && eventsPositions.length > 0) {
                    var events = [];
                    $.each(eventsPositions, function(i, item) {
                        if (item.mac == mac) {
                            events = JSON.parse(item.events);
                        }
                    })
                    $.each(events, function(j, itemEvent) {
                        var executeMac = itemEvent.execute_mac;
                        for (var i in executeMac) {
                            if (macs.indexOf(executeMac[i]) < 0) {
                                macs.push(executeMac[i]);
                            }
                        }
                    })
                    if (macs.length > 0) {
                        $.each(self.deviceList, function(i, item) {
                            var deviceMac = item.mac;
                            if (macs.indexOf(deviceMac) > -1) {
                                $.each(eventsPositions, function(j, itemSub) {
                                    if (deviceMac == itemSub.mac) {
                                        var position = itemSub.position;
                                        position = JSON.parse(position)
                                        if (!Util._isEmpty(position)) {
                                            self.addMenu(mac, item, position);
                                        } else {
                                            self.addMenu(mac, item, {left: DEVICE_LEFT, top: DEVICE_TOP});
                                            DEVICE_LEFT += 80;
                                        }
                                        return false;
                                    }
                                });
                            }
                        })
                    }
                    self.loadAllDeviceEventsPosition();
                }
            },
            loadAllDeviceEventsPosition: function() {
                espmesh.loadAllDeviceEventsPosition(JSON.stringify({"callback": "onLoadAllDeviceEventsPosition", "tag": ""}));
            },
            addMenu: function (mac, item, position) {
                var self = this,
                    hueValue = 0,
                    saturation = 0,
                    luminance = 0,
                    meshMac = item.mac,
                    doc = $("#" + meshMac),
                    docParent = $("#" + mac),
                    status = 0,
                    tid = docParent.attr("data-tid");
                if (!doc.length) {
                    setTimeout(function(){self.getEvent(meshMac, tid, false);},100);
                    $.each(item.characteristics, function(j, itemSub) {
                        if (itemSub.cid == HUE_CID) {
                            hueValue = itemSub.value;
                        }else if (itemSub.cid == SATURATION_CID) {
                            saturation = itemSub.value;
                        }else if (itemSub.cid == VALUE_CID) {
                            luminance = itemSub.value;
                        }else if (itemSub.cid == STATUS_CID) {
                            status = itemSub.value;
                        }
                    })
                    var color = "#999";

                    if (status == STATUS_ON) {
                        var hsb = "hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+(luminance / 100) +")";
                        color = Raphael.getRGB(hsb);
                    }
                    var newstyle = 'left:' + position.left + 'px;top:' + position.top + 'px',
                        str = '<div data-tid="' + tid + '" class="elebox '+meshMac+'" id='+meshMac+' style='+newstyle+'>';
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        str += '<div class="join-wrapper"><span></span><span></span></div><div class="content-wrapper">'+
                            '<div data-id="' + meshMac + '" class="left edit-elebox"><i class="icon-light" style="color: ' +
                            color + '"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Bright：<i class="luminance">' + luminance + '</i>%</div></div>';
                    } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        str += '<div class="content-wrapper"><div class="left"><i class="icon-power"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Status：' + (status == STATUS_ON ? 'ON' : 'OFF') + '</div></div>';
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        str += '<div class="content-wrapper"><div class="left"><i class="icon-sensor"></i></div><div ' +
                            'class="right"><span class="dragPoint">'+item.name+'</span>'+
                            '<span>Sensitive：' + status + '</div></div>';
                    }
                    str += '<div class="drop-wrapper drop-topo"></div><div class="label-wrapper">' +
                              '<span class="label-line"></span><div class="label-style label-topo"></div></div></div>';
                    $('#topocontent').append(str);
                }
                JSPLUMB_INITNODE(meshMac, LINE_COLOR);
                var conor = JSPLUMB_INSTANCE.connect({ source: mac, target: meshMac});
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    conor.getOverlay("label").setLabel("SYNC");
                } else {
                    conor.getOverlay("label").setLabel("ON_OFF");
                }
                self.disabledDevice(meshMac);
            },
            addSession: function (mac, position, events) {
                var self = this;
                var eventsPositions = self.$store.state.eventsPositions;
                var device = "";
                $.each(eventsPositions, function(i, item) {
                    if (item.mac == mac) {
                        device = item;
                        return false;
                    }
                });
                if (Util._isEmpty(device)) {
                    espmesh.saveDeviceEventsPosition(JSON.stringify({"mac": mac, "events": JSON.stringify(events),
                        "position": JSON.stringify(position)}));
                } else {
                    if (Util._isEmpty(position)) {
                        position = device.position;
                    } else {
                        position = JSON.stringify(position);
                    }
                    if (Util._isEmpty(events) || events.length <= 0) {
                        events = device.events;
                    } else {
                        events = JSON.stringify(events);
                    }
                    espmesh.saveDeviceEventsPosition(JSON.stringify({"mac": mac, "events": events,
                        "position": position}));
                    self.loadAllDeviceEventsPosition();
                }
                self.loadAllDeviceEventsPosition();
            },
            addSessions: function (events) {
                var self = this,
                    deviceEvents = [];
                var macs = [];
                var eventsPositions = self.$store.state.eventsPositions;
                if (eventsPositions.length == 0) {
                    $.each(events, function(i, item) {
                        var itemEvents = item.events;
                        if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                            espmesh.saveDeviceEventsPosition(JSON.stringify({"mac": item.mac,
                                "events": JSON.stringify(itemEvents), "position": null}));
                        }
                    });
                } else {
                    $.each(events, function(i, item) {
                        var flag = true,
                            itemEvents = item.events;
                        if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                            $.each(eventsPositions, function(j, itemSub) {
                                if (item.mac == itemSub.mac) {
                                    espmesh.saveDeviceEventsPosition(JSON.stringify({"mac": item.mac,
                                        "events": JSON.stringify(itemEvents), "position": itemSub.position}));
                                    flag = false;
                                    return false;
                                }
                            })
                            if (flag) {
                                if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                                    espmesh.saveDeviceEventsPosition(JSON.stringify({"mac": item.mac,
                                        "events": JSON.stringify(itemEvents), "position": null}));
                                }
                            }
                        }
                    })
                }
                self.loadAllDeviceEventsPosition();
            },
            removeSession: function (parentMacs, childMac) {
                var self = this;
                var eventsPositions = self.$store.state.eventsPositions;
                if (!Util._isEmpty(parentMacs) && parentMacs.length > 0) {
                    for(var i = 0; i < parentMacs.length; i ++){
                        var parentMac = parentMacs[i],
                            parentEvents = [],
                            events = [], device = "";
                        $.each(eventsPositions, function(i, item) {
                            if (item.mac == parentMac) {
                                device = item;
                                return false;
                            }
                        })
                        if (!Util._isEmpty(device.events)) {
                            var deviceEvents = JSON.parse(device.events);
                            $.each(deviceEvents, function(i, item) {
                                var macs = item.execute_mac;
                                var len = macs.indexOf(childMac);
                                if (len > -1) {
                                    macs.splice(len, 1);
                                }
                                if (macs.length > 0) {
                                    item.execute_mac = macs;
                                    parentEvents.push(item);
                                } else {
                                    events.push({name: item.name});
                                }
                            });
                            device.events = parentEvents;
                        }
                        if (parentEvents.length > 0) {
                            var dataEvents = '{"' + MESH_MAC + '": "' + parentMac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST +
                                '": "' + SET_EVENT + '",' + '"events":' + JSON.stringify(parentEvents) + '}';
                            espmesh.requestDeviceAsync(dataEvents);
                        }
                        if (events.length > 0) {
                            var dataEvents = '{"' + MESH_MAC + '": "' + parentMac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST +
                                '": "' + REMOVE_EVENT + '",' + '"events":' + JSON.stringify(events) + '}';
                            espmesh.requestDeviceAsync(dataEvents);
                        }
                        espmesh.saveDeviceEventsPosition(JSON.stringify({mac:device.mac, events: device.events, position: device.position}));
                    }
                    self.loadAllDeviceEventsPosition();

                }
                setTimeout(function() {
                    eventsPositions = self.$store.state.eventsPositions;
                    var eventsChild = [], deviceChild = "";
                    $.each(eventsPositions, function(i, item) {
                        if (item.mac == childMac) {
                            deviceChild = item;
                            return false;
                        }
                    });
                    if (!Util._isEmpty(deviceChild.events)) {
                        var deviceEvents = JSON.parse(deviceChild.events);
                        $.each(deviceEvents, function(i, item) {
                            eventsChild.push({name: item.name});
                        });
                        if (!Util._isEmpty(eventsChild) && eventsChild.length > 0) {
                            var dataChildEvents = '{"' + MESH_MAC + '": "' + childMac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + REMOVE_EVENT + '",' +
                                '"events":' + JSON.stringify(eventsChild) + '}';
                            espmesh.requestDeviceAsync(dataChildEvents);
                        }
                    }
                    espmesh.deleteDeviceEventsPosition(childMac);
                    self.loadAllDeviceEventsPosition();
                }, 1500)

            },
            OnAsyncDevice: function (res) {
                var self = this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    var mac = res.tag.mac,
                        childMac = res.tag.childMac,
                        macs = [];

                    if (!Util._isEmpty(res.result) && res.result.status_code == 0) {
                        var events = sessionStorage.getItem(childMac+ "_" + mac);
                        self.addSession(mac, null , JSON.parse(events));

                    } else {
                        var connections = JSPLUMB_INSTANCE.getAllConnections();
                        $.each(connections, function(i, item) {
                            if (item.targetId == childMac && item.sourceId == mac) {
                                JSPLUMB_INSTANCE.deleteConnection(item);
                            } else if (item.sourceId == mac) {
                                macs.push(item.targetId );
                            }
                        })
                        if (macs.length <= 0) {
                            $("#" + mac).removeClass("active");
                        }
                        MINT.Toast({
                            message: 'failed to connect device',
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                    sessionStorage.removeItem(childMac+ "_" + mac);
                }

            },
            removeAllParentNode: function (mac) {
                var self = this,
                    eventsPositions = self.$store.state.eventsPositions,
                    parentMacs = [];
                if (!Util._isEmpty(eventsPositions)) {
                    $.each(eventsPositions, function(i, item) {
                        var itemEvents = JSON.parse(item.events);
                        if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                            var event = itemEvents[0],
                                executeMac = event.execute_mac;
                            if (executeMac.indexOf(mac) > -1 && executeMac.length == 1) {
                                $("#" + item.mac).removeClass("active");
                            }
                        }
                    })
                }
            },
            getAllParentNode: function (mac, tid) {
                var self = this,
                    eventsPositions = self.$store.state.eventsPositions,
                    parentMacs = [];
                if (!Util._isEmpty(eventsPositions)) {
                    $.each(eventsPositions, function(i, item) {
                        var itemEvents = JSON.parse(item.events);
                        if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                            var event = itemEvents[0],
                                executeMac = event.execute_mac,
                                parentMac = item.mac;
                            if (executeMac.indexOf(mac) > -1) {
                                var conor = JSPLUMB_INSTANCE.connect({ source: parentMac, target: mac});
                                $("#" + parentMac).addClass("active");
                                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                                    conor.getOverlay("label").setLabel("SYNC");
                                } else {
                                    conor.getOverlay("label").setLabel("ON_OFF");
                                }
                            }
                        }
                    })
                }
            },
            getDevices: function(macs, names) {
                var self = this, lists = [];
                if (macs.length > 0) {
                    var staMacs = Util.staMacForBleMacs(macs);
                    $.each(self.deviceList, function(i, item) {
                        var mac = item.mac;
                        var bleMac = Util.bleMacForStaMac(mac);
                        if (staMacs.indexOf(item.mac) < 0) {
                            lists.push(item);
                        } else {
                            if (names[bleMac] && names[bleMac] == item.name) {
                                lists.push(item);
                            } else {
                                self.getParentMac(item.mac);
                            }
                        }
                    });
                    self.deviceList = lists;
                    self.$store.commit("setList", self.deviceList);
                }
            },
            clearListMacs: function() {
                this.listMacs = [];
            },
            getPosition: function(position) {
                return Util.getPosition(position);
            },
            getPOrN: function(position, name) {
                var self = this, obj = name,
                    objP = self.getPosition(position);
                if (!Util._isEmpty(objP)) {
                    obj = objP;
                }
                return obj;
            },
            startBleScan: function() {
                var self = this;
                if (self.$store.state.blueInfo) {
                    espmesh.startBleScan();
                } else {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
            stopBleScan: function() {
                clearTimeout(SCAN_DEVICE);
                espmesh.stopBleScan();
            },
            onInitEvent: function(deviceEvents) {
                var self = this;
                var events = [];
                if (!Util._isEmpty(deviceEvents)) {
                    deviceEvents = JSON.parse(deviceEvents).result;
                    $.each(deviceEvents, function(i, item) {
                        if (!Util._isEmpty(item.trigger)) {
                            self.addSessions([{mac: item.mac, events: item.trigger}]);
                        }
                    })
                }
                espmesh.loadAllDeviceEventsPosition(JSON.stringify({"callback": "onInitAllEvent", "tag": ""}));
            },
            onBackIndex: function() {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                window.onBluetoothStateChanged = self.onBluetoothStateChanged;
                if (self.$store.state.showScanBle) {
                    window.onScanBLE = self.onScanBLE;
                    window.onDeviceFound = self.onDeviceFound;
                    window.onDeviceLost = self.onDeviceLost;
                    setTimeout(function() {
                        self.$store.commit("setConScanDeviceList", []);
                    }, 60000);
                    SCAN_DEVICE = setTimeout(function() {
                        self.startBleScan();
                    }, 10000);
                }

                var startTime = 0;
                window.onBackPressed = function () {
                    MINT.Toast({
                        message: self.$t('exitProgramDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    if (startTime == 0) {
                        startTime = new Date().getTime();
                    } else {
                        if (new Date().getTime() - startTime < 2000) {
                            espmesh.finish();
                        } else {
                            startTime = new Date().getTime();
                        }
                    }
                }
            },
            onDeviceFound: function (device) {
                var self = this;
                if (Util._isEmpty(self.deviceList)) {
                    self.deviceList = [];
                }
                if (!Util._isEmpty(device) && !self.loadShow) {
                    device = JSON.parse(device);
                    var isExist = true;
                    if (self.temporaryAddList.length == 0) {
                        setTimeout(function() {
                            var num = self.temporaryAddList.length,
                                macs = [];
                            if (num != 0) {
                                var onLine = self.$t('deviceOnline'),
                                    //onLineText = self.getPOrN(device.position, device.name);
                                    onLineText = device.name;
                                self.showAdd = false;
                                if (!Util._isEmpty(INSTANCE_TOAST)) {
                                    INSTANCE_TOAST.close();
                                }
                                if (num > 1) {
                                    onLine = self.$t('deviceOnlineNum');
                                    onLineText = num;
                                }
                                INSTANCE_TOAST = MINT.Toast({
                                    message: onLine + ":" + onLineText,
                                    position: 'bottom',
                                });
                                self.deviceList = self.$store.state.deviceList;
                                $.each(self.deviceList, function(i, item) {
                                    macs.push(item.mac);
                                })
                                var eventsPositions = self.$store.state.eventsPositions;
                                $.each(self.temporaryAddList, function(i, item) {
                                    if (macs.indexOf(item.mac) == -1) {
                                        self.deviceList.push(item);
                                    }

                                    var device = "";
                                    $.each(eventsPositions, function(j, itemEvent) {
                                        if (itemEvent.mac == item.mac) {
                                            device = itemEvent;
                                        }
                                    })
                                    if (!Util._isEmpty(device)) {
                                        self.addFirstMenu(item, JSON.parse(device.position));
                                        var mac = item.mac,
                                            tid = item.tid;
                                        self.addLink([{mac: mac, tid: tid, events: device.events }]);
                                        self.getAllParentNode(mac, tid);
                                    }
                                })
                                self.deviceList = Util.uniqeByKeys(self.deviceList, ["mac"]);
                                self.$store.commit("setList", self.deviceList);
                                self.temporaryAddList = [];
                                self.clearListMacs();
                            }
                        }, 4000);
                    }
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == device.mac) {
                            isExist = false;
                        }
                    });
                    if (isExist) {
                        self.temporaryAddList.push(device);
                    }
                }
            },
            onDeviceLost: function (mac) {
                var self = this;
                if (!Util._isEmpty(mac) && !self.loadShow) {
                    if (self.temporaryDelList.length == 0) {
                        setTimeout(function() {
                            var num = self.temporaryDelList.length;
                            if (num != 0) {
                                var item = {};
                                for (var i = self.deviceList.length - 1; i >= 0; i--) {
                                    var obj = self.deviceList[i];
                                    if (self.temporaryDelList.indexOf(obj.mac) != -1) {
                                        item = obj;
                                        self.deviceList.splice(i, 1);
                                        self.getParentMac(obj.mac);
                                    }
                                }
                                if (self.deviceList.length <= 0) {
                                    self.showAdd = true;
                                }
                                var offLine = self.$t('deviceOffline'),
                                    //offLineText = self.getPOrN(item.position, item.name);
                                    offLineText = item.name;
                                if (!Util._isEmpty(INSTANCE_TOAST)) {
                                    INSTANCE_TOAST.close();
                                }
                                if (num > 1) {
                                    offLine = self.$t('deviceOfflineNum');
                                    offLineText = num;
                                }
                                INSTANCE_TOAST = MINT.Toast({
                                    message: offLine + ":" + offLineText,
                                    position: 'bottom',
                                });
                                self.$store.commit("setList", self.deviceList);
                                self.temporaryDelList = [];
                            }
                        }, 3000);
                    }
                    self.temporaryDelList.push(mac);
                    self.clearListMacs();
                }
            },
            onDeviceStatusChanged: function (item) {
                var self = this,
                    hueValue = 0,
                    saturation = 0,
                    luminance = 0;
                if (!Util._isEmpty(item)) {
                    item = JSON.parse(item);
                    var mac = item.mac,
                        characteristics = item.characteristics;
                    $.each(self.deviceList, function(i, itemSub) {
                        if (itemSub.mac == mac) {
                            self.deviceList.splice(i, 1);
                            itemSub.characteristics = characteristics;
                            self.deviceList.push(itemSub);
                            return false;
                        }
                    })
                    $.each(characteristics, function(i, itemSub) {
                        if (itemSub.cid == HUE_CID) {
                            hueValue = itemSub.value;
                        }else if (itemSub.cid == SATURATION_CID) {
                            saturation = itemSub.value;
                        }else if (itemSub.cid == VALUE_CID) {
                            luminance = itemSub.value;
                        }else if (itemSub.cid == STATUS_CID) {
                            status = itemSub.value;
                        }
                    })
                    var doc = $("#" + mac);
                    var rgb = Raphael.getRGB("hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+
                        (luminance / 100) +")").hex;
                    doc.find(".left").find("i").css("color", rgb);
                    doc.find(".luminance").text(Math.round(parseFloat(luminance)));

                    self.$store.commit("setList", self.deviceList);
                }

            },
            onWifiStateChanged: function(wifi) {
                var self = this;
                wifi =JSON.parse(wifi);
                if (wifi.connected) {
                    if (self.wifiNum != 0) {
                        clearTimeout(WIFI_TIMER);
                        wifi.ssid = decodeURIComponent(wifi.ssid);
                        WIFI_TIMER = setTimeout(function() {
                            MINT.Toast({
                                message: self.$t('wifiChangeDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            if (!self.loadShow) {
                                self.wifiFlag = true;
                                JSPLUMB_INSTANCE.deleteEveryEndpoint();
                                $("#topocontent").find("div.elebox").remove();
                                self.reload();
                            }
                        }, 3000);
                    }
                    self.wifiNum++;
                    self.$store.commit("setWifiInfo", wifi);
                }
            },
            onBluetoothStateChanged: function(blue) {
                if (!Util._isEmpty(blue)) {
                    blue = JSON.parse(blue);
                    if (blue.enable || blue.enable == "true") {
                        blue.enable = true;
                    } else {
                        blue.enable = false;
                    }
                    this.$store.commit("setBlueInfo", blue.enable);
                }
            },
            onScanBLE: function (devices) {
                var self = this,
                    scanList = [],rssiList = [], notExist = [],
                    rssiValue = self.$store.state.rssiInfo;
                if (!Util._isEmpty(devices) && self.$store.state.showScanBle && !self.loadShow) {
                    var conScanDeviceList = self.$store.state.conScanDeviceList;
                    devices = JSON.parse(devices);
                    $.each(devices, function(i, item) {
                        if (item.rssi >= rssiValue && Util.isMesh(item.name, item.version)) {
                            rssiList.push(item);
                        }
                    })
                    if (rssiList.length > 0) {
                       var names = {};
                       $.each(devices, function(i, item) {
                           if (self.listMacs.indexOf(item.mac) == -1) {
                               notExist.push(item.mac);
                               names[item.mac] = item.name;
                               self.listMacs.push(item.mac);
                           }
                       })
                        if (Util._isEmpty(conScanDeviceList) || conScanDeviceList.length <= 0) {
                            if (notExist.length > 0) {
                                self.getDevices(notExist, names);
                            }
                            var len = self.deviceList.length;
                            if (len > 0) {
                                self.$refs.remind.hide();
                                self.$refs.scanDevice.show();
                                self.$refs.scanDevice.onBackReset();
                            } else {
                                self.$refs.scanDevice.hideThis();
                                self.$refs.remind.show();
                            }
                            self.$store.commit("setScanDeviceList", rssiList);

                        } else {
                            $.each(rssiList, function(i, item) {
                                if (conScanDeviceList.indexOf(item.bssid) <= -1) {
                                    scanList.push(item);
                                }
                            });
                            if (scanList.length > 0) {
                                if (notExist.length > 0) {
                                    self.getDevices(notExist, names);
                                }
                                var len = self.deviceList.length;
                                if (len > 0) {
                                    self.showAdd = false;
                                    self.$refs.remind.hide();
                                    self.$refs.scanDevice.show();
                                } else {
                                    self.showAdd = true;
                                    self.$refs.scanDevice.hideParent();
                                    self.$refs.remind.show();
                                }
                                self.$store.commit("setScanDeviceList", rssiList);
                            }
                        }
                    }

                }
            },
            onDeviceScanned: function(devices) {
               var self = this;
               if (!Util._isEmpty(devices)) {
                   devices = JSON.parse(devices);
                   self.deviceList = [];
                   if(devices.length > 0) {
                       self.showAdd = false;
                       $.each(devices, function(i, item) {
                           self.deviceList.push(item);
                       });
                       setTimeout(function() {
                           self.initEvent();
                       }, 500);
                       self.deviceList = Util.uniqeByKeys(self.deviceList, ["mac"]);
                   } else {
                       MINT.Indicator.close();
                       self.showAdd = true;
                       MINT.Toast({
                         message: self.$t('notLoadDesc'),
                         position: 'bottom',
                       });
                       self.onBackIndex();
                   }
               }
               if (self.deviceList.length > 0) {
                   self.$store.commit("setDeviceIp", self.deviceList[0].host);
               }
               self.$store.commit("setList", self.deviceList);
            },
            onDeviceScanning: function(devices) {
                var self = this;
                if (!Util._isEmpty(devices)) {
                    devices = JSON.parse(devices);
                    self.deviceList = self.$store.state.deviceList;
                    $.each(devices, function(i, item) {
                        self.deviceList.push(item);
                    });

               }
               self.$store.commit("setList", self.deviceList);
            },
            onInitAllEvent: function(res) {
                var self = this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    var events = JSON.parse(decodeURIComponent(res.content));
                    $.each(self.deviceList, function(i, item) {
                        $.each(events, function(j, itemSub){
                            if (itemSub.mac == item.mac) {
                                var position = itemSub.position;
                                if (!Util._isEmpty(position)) {
                                    position = JSON.parse(position);
                                    self.addFirstMenu(item, position);
                                } else {
                                    self.addFirstMenu(item, {left: DEVICE_LEFT, top: DEVICE_TOP});
                                    DEVICE_LEFT += 80;
                                }
                                events.push({mac: item.mac, tid: item.tid, events: itemSub.events });
                            }
                        })
                    })
                }
                setTimeout(function() {
                    self.addLink(events);
                    self.startBleScan();
                    self.onBackIndex();
                    MINT.Indicator.close();
                }, 1000);
            },
            onLoadAllDeviceEventsPosition: function(res) {
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    var result = JSON.parse(decodeURIComponent(res.content));
                    this.$store.commit("setEventsPositions", result);
                }
            },
            onLoadHWDevices: function(res) {
                this.$store.commit("setSiteList", JSON.parse(res));
            },
        },
        created: function () {
             window.onDeviceScanned = this.onDeviceScanned;
             window.onDeviceFound = this.onDeviceFound;
             window.onDeviceLost = this.onDeviceLost;
             window.onDeviceStatusChanged = this.onDeviceStatusChanged;
             window.onWifiStateChanged = this.onWifiStateChanged;
             window.onScanBLE = this.onScanBLE;
             window.OnAsyncDevice = this.OnAsyncDevice;
             window.onDeviceScanning = this.onDeviceScanning;
             window.onInitEvent = this.onInitEvent;
             window.onBluetoothStateChanged = this.onBluetoothStateChanged;
             window.onInitAllEvent = this.onInitAllEvent;
             window.onLoadAllDeviceEventsPosition = this.onLoadAllDeviceEventsPosition;
             window.onLoadHWDevices = this.onLoadHWDevices;
        },
        components: {
            "v-info": info,
            "v-eventInfo": eventInfo,
            "v-table": table,
            "v-resetDevice": resetDevice,
            "v-scanDevice": scanDevice,
            "v-remind": remind,
            "v-writing": writing
        }

    });
    return Index;
});