define(["vue", "MINT", "Util", "Common", "jsPlumb", "Hammer", "txt!../../pages/association.html",
    "../js/colorPicker"],
    function(v, MINT, Util, Common, jsPlumb, Hammer, association, colorPicker) {

    var Association = v.extend({
        template: association,
        data: function(){
            return {
                flag: false,
                association: "association",
                colorId: "association-color-id",
                temperatureId: "association-temperature-id",
                operateType: RECENT_TYPE_DEVICE,
                deviceMacs: [],
                isRoom: false,
                showColor: false,
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
        },
        computed: {
            list: function () {
                var self = this,
                    macs = self.eventDeviceMacs,
                    searchList = [];
                self.deviceList = self.$store.state.deviceList;
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
                    $('#lefticon').find('div.availability').draggable({
                        disabled: true
                    });
                    self.meshDrop();
                    // if (!Util._isEmpty(ISCROLL_BAR)) {
                    //     ISCROLL_BAR.refresh();
                    // } else {
                    //     self.initScroll();
                    // }
                }, 800);

                return searchList;
            }
        },
        methods:{
            show: function() {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                window.onBackPressed = self.hide;
                self.initPages();
                self.loadAllDeviceEventsCoordinate();
                setTimeout(function() {
                    Util.setStatusBarWhite();
                    self.initEvent();
                }, 700)
                self.flag = true;
            },
            hideColorInfo: function() {
                this.showColor = false;
            },
            loadHWDevices: function() {
                espmesh.loadHWDevices();
            },
            hide: function () {
                Util.setStatusBarBlue();
                JSPLUMB_INSTANCE.deleteEveryEndpoint();
                $("#draggable-content").find("div.elebox").remove();
                this.$emit("associationShow");
                MINT.Indicator.close();
                this.flag = false;
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
            getIcon: function(tid) {
                return Util.getIcon(tid);
            },
            getColor: function (characteristics, tid) {
                return Util.getColor(characteristics, tid);
            },
            getStatus: function(characteristics) {
                if (!Util._isEmpty(characteristics)) {
                    var luminance = 0;
                    $.each(characteristics, function(j, itemSub) {
                        if (itemSub.cid == VALUE_CID) {
                            luminance = itemSub.value;
                            return false;
                        }
                    })
                    return luminance;
                }
                return "";
            },
            initPages: function() {
                var self = this;
                var topocontent = $('#draggable-content'),
                    toporight = $('#draggable-info'),
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
                        Container:"draggable-content"
                    });

                    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });

                    window.jsp = instance;
                    JSPLUMB_INSTANCE = instance;
                    var canvas = document.getElementById("draggable-content");
                    self.initTouch("draggable-info");
                    self.getBodyWidth();
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
                                            setTimeout(function(){Util.switchTouchDefaultEvent(sourceId, linkMacs, null)}, 100);
                                            $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                        } else {
                                            setTimeout(function(){Util.switchDefaultEvent(sourceId, linkMacs, null)}, 100);
                                            $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                        }

                                    } else if (tidSourceId >= MIN_SENSOR && tidSourceId <= MAX_SENSOR &&
                                        tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {

                                        setTimeout(function(){Util.sensorDefaultEvent(sourceId, linkMacs, null)}, 100);
                                        $("#" + sourceId).addClass("active").find("div.label-style").text("ON-OFF");
                                    } else if (tidSourceId >= MIN_LIGHT && tidSourceId <= MAX_LIGHT &&
                                        tidTargetId >= MIN_LIGHT && tidTargetId <= MAX_LIGHT) {

                                        setTimeout(function(){Util.lightSyscEvent(sourceId, linkMacs, null)}, 100);
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
                                var top = doc.offset().top,
                                    left = doc.offset().left;
                                if (left < 130) {
                                    doc.css({"left": 0 + "px"});
                                }
                                if (top < 45) {
                                    doc.css({"top": 0 + "px"});
                                }
                                self.calculate(left, top);
                            },
                            stop: function () {
                                if (delDoc.hasClass("active")) {
                                    var flag = true;

                                    var parentMacs = self.getParentMac(el);
                                    setTimeout(function(){
                                        self.removeSession(parentMacs, el);
                                    }, 800);
                                } else {
                                    var height = 44,
                                        width = $("#lefticon").width(),
                                        top = doc.offset().top,
                                        left = doc.offset().left;
                                    if (top < 60) {
                                        doc.offset().top = 60;
                                    }
                                    if (left < 80) {
                                        doc.offset().left = 80;
                                    }
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
                Common.stopBleScan();
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
                        espmesh.requestDevicesMulticast(data);
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
                $('#lefticon').on({
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
            showEditDevice: function (mac, tid) {
                var self = this;
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    $.each(self.deviceList, function(i, item) {
                        if (item.mac == mac) {
                            self.$store.commit("setDeviceInfo", item);
                            return false;
                        }
                    })
                    self.deviceMacs = [mac];
                    setTimeout(function() {
                        self.showColor = true;
                        self.$refs.color.show();
                    }, 300)
                }
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
            getAllMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    macs.push(item.mac);
                });
                return macs;
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
                $('#lefticon').find('div.availability').draggable({
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
                        $("#draggable-content").css({transform: "scale(" + CURRSCALE + ")"});
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
                $('#lefticon').find('div.itemindex').draggable({
                    helper: 'clone',
                    scope: 'topo',
                    delay: "1000",
                    start: function(event, ui) {
                        clearTimeout(TIMER_DROP);
                        TIMER_DROP = "";
                    },
                    drag: function(event, ui) {
                        clearTimeout(TIMER_DROP);
                        //ISCROLL_BAR.scrollTo(0, self.distanceY);
                    },
                    stop: function (event, ui) {
                        $("#draggable-wrapper").empty().css({"display": "none"});
                        //ISCROLL_BAR.scrollTo(0, self.distanceY);
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
            initEvent: function () {
                var self = this;
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
//                    if (!Util._isEmpty(item.mlink_trigger) && item.mlink_trigger != 0) {
//                        macs.push(item.mac);
//                    }
                    macs.push(item.mac);
                });
                if (macs.length > 0) {
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                        GET_EVENT +'","callback": "onInitEvent"}';
                    espmesh.requestDevicesMulticast(data);
                }

            },
            addFirstMenu: function (item, coordinate) {
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
                    var newstyle = 'left:' + coordinate.left + 'px;top:' + coordinate.top + 'px',
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
                    $('#draggable-content').append(str);
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
                        if (item.mac == mac && !Util._isEmpty(item.events)) {
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
                                        var coordinate = itemSub.coordinate;
                                        if (!Util._isEmpty(coordinate)) {
                                            coordinate = JSON.parse(coordinate)
                                            self.addMenu(mac, item, coordinate);
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
                    self.loadAllDeviceEventsCoordinate();
                }
            },
            loadAllDeviceEventsCoordinate: function() {
                espmesh.loadAllDeviceEventsCoordinate(JSON.stringify({"callback": "onLoadAllDeviceEventsCoordinate", "tag": ""}));
            },
            addMenu: function (mac, item, coordinate) {
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
                    var newstyle = 'left:' + coordinate.left + 'px;top:' + coordinate.top + 'px',
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
                    $('#draggable-content').append(str);
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
            addSession: function (mac, coordinate, events) {
                var self = this;
                var eventsPositions = self.$store.state.eventsPositions;
                var device = "";
                $.each(eventsPositions, function(i, item) {
                    if (item.mac == mac) {
                        if (Util._isEmpty(item.events)) {
                            item.events = JSON.stringify([]);
                        }
                        device = item;
                        return false;
                    }
                });
                if (Util._isEmpty(device)) {
                    espmesh.saveDeviceEventsCoordinate(JSON.stringify({"mac": mac, "events": JSON.stringify(events),
                        "coordinate": JSON.stringify(coordinate)}));
                } else {
                    if (Util._isEmpty(coordinate)) {
                        coordinate = device.coordinate;
                    } else {
                        coordinate = JSON.stringify(coordinate);
                    }
                    if (Util._isEmpty(events) || events.length <= 0) {
                        events = device.events;
                    } else {
                        events = JSON.stringify(events);
                    }
                    espmesh.saveDeviceEventsCoordinate(JSON.stringify({"mac": mac, "events": events,
                        "coordinate": coordinate}));
                    self.loadAllDeviceEventsCoordinate();
                }
                self.loadAllDeviceEventsCoordinate();
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
                            espmesh.saveDeviceEventsCoordinate(JSON.stringify({"mac": item.mac,
                                "events": JSON.stringify(itemEvents), "coordinate": null}));
                        }
                    });
                } else {
                    $.each(events, function(i, item) {
                        var flag = true,
                            itemEvents = item.events;
                        if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                            $.each(eventsPositions, function(j, itemSub) {
                                if (item.mac == itemSub.mac) {
                                    espmesh.saveDeviceEventsCoordinate(JSON.stringify({"mac": item.mac,
                                        "events": JSON.stringify(itemEvents), "coordinate": itemSub.coordinate}));
                                    flag = false;
                                    return false;
                                }
                            })
                            if (flag) {
                                if (!Util._isEmpty(itemEvents) && itemEvents.length > 0) {
                                    espmesh.saveDeviceEventsCoordinate(JSON.stringify({"mac": item.mac,
                                        "events": JSON.stringify(itemEvents), "coordinate": null}));
                                }
                            }
                        }
                    })
                }
                self.loadAllDeviceEventsCoordinate();
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
                            espmesh.requestDevice(dataEvents);
                        }
                        if (events.length > 0) {
                            var dataEvents = '{"' + MESH_MAC + '": "' + parentMac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST +
                                '": "' + REMOVE_EVENT + '",' + '"events":' + JSON.stringify(events) + '}';
                            espmesh.requestDevice(dataEvents);
                        }
                        espmesh.saveDeviceEventsCoordinate(JSON.stringify({mac:device.mac, events: device.events, coordinate: device.coordinate}));
                    }
                    self.loadAllDeviceEventsCoordinate();

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
                            espmesh.requestDevice(dataChildEvents);
                        }
                    }
                    espmesh.deleteDeviceEventsCoordinate(childMac);
                    self.loadAllDeviceEventsCoordinate();
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
            getPosition: function(position) {
                return Util.getPosition(position);
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
                espmesh.loadAllDeviceEventsCoordinate(JSON.stringify({"callback": "onInitAllEvent", "tag": ""}));
            },
            onInitAllEvent: function(res) {
                var self = this;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    var events = JSON.parse(Util.Base64.decode(res.content)),
                        newEvents = [];
                    setTimeout(function() {
                        for (var i = 0; i < events.length; i++){
                            var item = events[i];
                            if (!Util._isEmpty(item.events)) {
                                for(var j = 0; j < self.deviceList.length; j++){
                                    var itemSub = self.deviceList[j];
                                    if (itemSub.mac == item.mac) {
                                        var coordinate = item.coordinate;
                                        if (!Util._isEmpty(coordinate)) {
                                            coordinate = JSON.parse(coordinate);
                                            self.addFirstMenu(itemSub, coordinate);
                                        } else {
                                            self.addFirstMenu(itemSub, {left: DEVICE_LEFT, top: DEVICE_TOP});
                                            DEVICE_LEFT += 80;
                                        }
                                        newEvents.push({mac: itemSub.mac, tid: itemSub.tid, events: item.events });
                                    }
                                }
                            }
                        }
                    })

                }
                setTimeout(function() {
                    self.addLink(newEvents);
                    MINT.Indicator.close();
                }, 3000);
            },
            onLoadAllDeviceEventsCoordinate: function(res) {
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    var result = JSON.parse(Util.Base64.decode(res.content));
                    this.$store.commit("setEventsPositions", result);
                }
            },
            onLoadHWDevices: function(res) {
                this.$store.commit("setSiteList", JSON.parse(res));
            },
            onAddQueueTask: function() {
            }
        },
        created: function () {
            window.OnAsyncDevice = this.OnAsyncDevice;
            window.onInitEvent = this.onInitEvent;
            window.onInitAllEvent = this.onInitAllEvent;
            window.onLoadAllDeviceEventsCoordinate = this.onLoadAllDeviceEventsCoordinate;
            window.onLoadHWDevices = this.onLoadHWDevices;
            window.onAddQueueTask = this.onAddQueueTask;
        },
        components: {
            "v-color": colorPicker
        }
    });
    return Association;
});
