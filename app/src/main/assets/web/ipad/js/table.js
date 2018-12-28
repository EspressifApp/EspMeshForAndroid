define(["vue", "MINT", "Util", "IScroll", "txt!../../pages/table.html", "../js/info", "../js/setTable", "../js/tableColor"],
    function(v, MINT, Util, IScroll, table, info, setTable, tableColor) {

    var Table = v.extend({

        template: table,

        data: function(){
            return {
                tableFlag: false,
                tablecolorId: "table-color-id",
                tabletemperatureId: "table-temperature-id",
                deviceList: [],
                deviceInfo: {},
                selectAllShow: true,
                colNum: COL_NUM,
                rowNum: ROW_NUM,
                distanceY: 0,
            }
        },
        mounted: function() {
            this.operateEvent();
            this.lightDrop();
        },
        computed: {
            lightList: function () {
                var self = this,list = [];
                if (self.tableFlag) {
                    self.deviceList = this.$store.state.deviceList;
                    $.each(self.deviceList, function(i, item) {
                        if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                            list.push(item);
                        }
                    });
                    list.sort(Util.sortBy("name"));
                    setTimeout(function() {
                        self.dragLight();
                    }, 200)
                }
                return list;
            }
        },
        methods:{
            show: function() {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                self.selectAllShow = true;
                self.initTableScroll();
                self.getTable();
                setTimeout(function(){
                    self.initDeviceScroll();
                }, 500);
                self.tableFlag = true;
            },
            hideTable: function () {
                this.tableFlag = false;
                this.$store.commit("setShowScanBle", true);
                this.$store.commit("setShowLoading", true);
                this.$emit("tableShow");
            },
            hideParent: function() {
                window.onBackPressed = this.hideTable;
            },
            getColor: function (characteristics) {
                var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
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
            showInfoDevice: function (mac) {
                var self = this;
                $.each(self.deviceList, function(i, item) {
                    if (item.mac == mac) {
                        self.$store.commit("setDeviceInfo", item);
                        return false;
                    }
                })
                self.$refs.infoTable.show();
            },
            lightDrop: function () {
                var self = this;
                $('#collapse-light-table').on({
                    touchstart: function(event) {
                        var $this = $(this);
                        POSITION_TOP = $this.offset().top;
                        if (!$this.hasClass("availability")) {
                            TIMER_DROP = setTimeout(function() {
                                var draggableDiv = $("#draggableDiv");
                                //将点击的元素内容复制
                                var clickElement = null,
                                    color = $this.children('i').css('color'),
                                    spantxt = $this.children('span').text(),
                                    uid = $this.attr('icontype'),
                                    clickElement = '<p id="' + uid + '" class="icon"><i class="' +
                                        'icon-light" style="color: ' + color + '"></i></p><p class="name">' +
                                        spantxt + '</p>';
                                var uitop = parseInt(POSITION_TOP);
                                POSITION_LEFT = event.originalEvent.changedTouches[0].clientX - 40;
                                draggableDiv.empty().append(clickElement).css({"display": "block", "top": uitop, "left": POSITION_LEFT});
                            }, 1000);
                        }
                    },
                    touchend: function() {
                        clearTimeout(TIMER_DROP);
                        var doc = $(this),
                            top = doc.offset().top,
                            left = doc.offset().left;
                        if (!Util._isEmpty(TIMER_DROP)) {
                            var mac = doc.attr("data-value");
                            if(TOUCH_TIME == 0 ){
                                //第一次点击
                                TOUCH_TIME = new Date().getTime();
                            }else{
                                if(new Date().getTime() - TOUCH_TIME < 500 ){
                                    TOUCH_TIME = 0;
                                    self.showInfoDevice(mac);
                                }else{
                                    TOUCH_TIME = new Date().getTime();
                                }
                            }
                        }
                        POSITION_TOP = 0;
                        POSITION_LEFT = 0;
                        $("#draggableDiv").empty().css({"display": "none"});
                        return false;
                    }
                }, 'div.itemtable');
            },
            dragLight: function() {
                $("#collapse-light-table").find("div.itemtable").draggable({
                    helper: 'clone',
                    scope: 'topo',
                    opacity: 0.01,
                    delay: '1000',
                    drag: function (event, ui) {
                        var uitop = parseInt(ui.offset.top);
                        $("#draggableDiv").css({"display": "block", "top": uitop, "left": (event.clientX -40)});
                        ISCROLL_DEVICE.scrollTo(0, self.distanceY);
                    },
                    stop: function () {
                        // //拖拽结束，将拖拽容器内容清空
                        $("#draggableDiv").empty().css({"display": "none"});
                        ISCROLL_DEVICE.scrollTo(0, self.distanceY);
                    }
                });
            },

            droppableTable: function () {
                //“放”的操作代码
                var self = this;
                $("#table-wrapper table td").droppable({
                    scope: 'topo',
                    accept: ".itemtable",
                    hoverClass: "highlight",
                    drop: function (event, ui) {
                        var $this = $(this),
                            dragui = ui.draggable,
                            color = dragui.children('i').css('color'),
                            spantxt = dragui.children('span').text(),
                            uid = dragui.attr('icontype'),
                            str = self.addTableHtml(uid, spantxt, color);
                            col = $this.attr("data-id");
                            row = $this.parent().attr("data-id");
                        var id = $this.find("div").attr("data-id");
                        if (self._isEmpty(id)) {
                            self.disabledTableDevice(uid);
                            $this.append(str);
                            setTimeout(function() {
                                self.setTable(uid, col, row);
                            }, 500);
                        }
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });
            },
            getTable: function () {
                var self = this;
                var res = espmesh.loadDeviceTable();

                if (!self._isEmpty(res)) {
                    res = JSON.parse(res);
                    var devices = espmesh.loadTableDevices();
                    COL_NUM = res.column;
                    ROW_NUM = res.row;
                    self.init(COL_NUM, ROW_NUM, "table-drop");
                    if (!self._isEmpty(devices)) {
                        devices = JSON.parse(devices);
                        $.each(devices, function(i, item) {
                            var mac = item.mac,
                                characteristics = [],
                                hueValue = 0,
                                saturation = 0,
                                luminance = 0,
                                status,
                                color = "#999",
                                name;
                            $.each(self.deviceList, function(j, itemSub){
                                if (itemSub.mac == mac) {
                                    characteristics = itemSub.characteristics;
                                    name = itemSub.name;
                                    return false;
                                }
                            })
                            if (characteristics.length > 0) {
                                $.each(characteristics, function(j, itemSub) {
                                    if (itemSub.cid == HUE_CID) {
                                        hueValue = itemSub.value;
                                    }else if (itemSub.cid == SATURATION_CID) {
                                        saturation = itemSub.value;
                                    }else if (itemSub.cid == VALUE_CID) {
                                        luminance = itemSub.value;
                                    } else if (itemSub.cid == STATUS_CID) {
                                        status = itemSub.value;
                                    }
                                });

                                var hsb = "hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+(luminance / 100) +")";
                                if (status === STATUS_ON) {
                                    color = Raphael.getRGB(hsb).hex;
                                }
                                var str = self.addTableHtml(mac, name, color);
                                var doc = $("#table-wrapper tr[data-id='" + item.row + "']").find("td[data-id='" + item.column + "']");
                                doc.empty().append(str);
                                setTimeout(function(){
                                    self.disabledTableDevice(mac);
                                }, 100)

                            }

                        })
                    }

                } else {
                    self.init(self.colNum, self.rowNum, "table-drop");
                    espmesh.saveDeviceTable("{column: "+self.colNum+", row: "+self.rowNum+"}");
                }
                setTimeout(function() {
                    self.droppableTable();
                }, 100);
            },
            addTableHtml: function  (mac, name, color) {
                var html = '<div data-id="' + mac + '" class="td-content"><p class="icon"><i class="icon-light" ' +
                    'style="color: ' + color +'"></i></p><p class="name">' + name + '</p><div id="' + mac + '" ' +
                    ' class="td-modal"></div><div class="td-round"><i class="icon-ok-circled"></i></div>' +
                    '<div data-mac="' + mac + '" class="td-unactive"></div></div>';
                return html;
            },
            setTable: function (mac, col, row) {
                var doc = $("div[data-id='" + mac +"']");
                var name = doc.find(".name").text();
                var color = doc.find(".icon").find("i").css("color");
                espmesh.saveTableDevices(JSON.stringify([{mac: mac, name: name, color: color,
                    column: parseInt(col), row: parseInt(row)}]));
            },
            colorPlateBtn: function() {
                this.$refs.tableColor.show();
            },
            tableBtn: function() {
                this.$refs.setTable.show();
            },
            deleteTable: function () {
                var self= this,
                    macs = [],
                docs = $("#table-wrapper table td.active").find(".td-content");
                for(var i = 0; i < docs.length; i++) {
                    var mac = $(docs[i]).attr("data-id");
                    macs.push(mac);
                    self.enabledTableDevice(mac);
                }
                docs.parent().removeClass("active");
                docs.remove();
                espmesh.removeTableDevices(JSON.stringify(macs));
            },
            disabledTableDevice: function (mac) {
                var doc = $("#lefticon-table div.itemtable[icontype='" + mac + "']").parent().parent();
                var docLi = $("#lefticon-table div.itemtable[icontype='" + mac + "']").parent();
                $("#lefticon-table div.itemtable[icontype='" + mac + "']").addClass("availability");
                $('#collapse-light-table').find('div.availability').draggable({
                    disabled: true
                });
                doc.append(docLi);
            },
            enabledTableDevice: function (mac) {
                var doc = $("#lefticon-table div.itemtable[icontype='" + mac + "']").parent().parent();
                var docLi = $("#lefticon-table div.itemtable[icontype='" + mac + "']").parent();
                doc.prepend(docLi);
                $("#lefticon-table div.itemtable[icontype='" + mac + "']").removeClass("availability");
                $("#lefticon-table div.itemtable[icontype='" + mac + "']").draggable({
                    helper: 'clone',
                    scope: 'topo',
                    disabled: false
                });

            },
            init: function (colNum, rowNum, id) {
                var doc = $("#" + id);
                doc.empty();
                var trHtml = "";
                for(var i = 0; i < rowNum; i++) {
                    trHtml += "<tr data-id='" + i + "'>";
                    var tdHtml = "";
                    for(var j = 0; j < colNum; j++) {
                        tdHtml += "<td  data-id='" + j + "'></td>"
                    }
                    trHtml += tdHtml;
                    trHtml += "</tr>";
                }
                doc.append(trHtml);
            },
            initDeviceScroll: function () {
                ISCROLL_DEVICE = new IScroll('#topo-content-table', {
                    hScroll: false,
                    bounce: false,
                    momentum: false,
                    scrollbars: false,
                    mouseWheel: false,
                    interactiveScrollbars: false,
                    shrinkScrollbars: false,
                    preventDefault: false,
                    fadeScrollbars: false,
                    disableMouse: true,
                });
                ISCROLL_DEVICE.on("scrollEnd", function() {
                    self.distanceY = ISCROLL_DEVICE.y;
                    console.log(self.distanceY);
                })
            },
            initTableScroll: function () {
                ISCROLL_TABLE = new IScroll('#toporight-content-table', {
                    scrollbars: false,
                    mouseWheel: true,
                    interactiveScrollbars: true,
                    shrinkScrollbars: 'scale',
                    fadeScrollbars: true
                });
            },
            operateEvent: function() {
                var self = this,
                    selectTag = null,
                    flag = true,
                    docWrapper = $("#table-wrapper");

                $("#lefticon-table").on("click", "a[data-toggle='collapse']", function() {
                    $("a[data-toggle='collapse']").find("i.caret-i")
                        .addClass("icon-right-dir").removeClass("icon-down-dir");
                    if ($(this).hasClass("active")) {
                        $(this).removeClass("active").find("i.caret-i")
                            .addClass("icon-right-dir").removeClass("icon-down-dir");
                    } else {
                        $("a[data-toggle='collapse']").removeClass("active");
                        $(this).addClass("active").find("i.caret-i")
                            .addClass("icon-down-dir").removeClass("icon-right-dir");
                    }
                    ISCROLL_DEVICE.scrollTo(0, 0);
                    setTimeout(function() {
                        ISCROLL_DEVICE.refresh();
                    }, 1000)
                });
                docWrapper.on({
                    touchstart: function() {
                        selectTag = $(this).find("div.td-modal").attr("id");
                        if (docWrapper.hasClass("active")) {
                            if (!self._isEmpty(selectTag)) {
                                var doc = $(this);
                                if (doc.hasClass("active")) {
                                    doc.removeClass("active");
                                } else {
                                    doc.addClass("active");
                                }
                            }

                        }
                    },
                    touchmove: function(e) {
                        e = e || window.event;
                        e.preventDefault();
                        var touch = e.originalEvent.targetTouches[0];
                        var ele = document.elementFromPoint(touch.pageX, touch.pageY);
                        if (docWrapper.hasClass("active")) {
                            var selectSubTag = $(ele).attr("id");
                            if (selectTag != selectSubTag && !self._isEmpty(selectSubTag)) {
                                selectTag = selectSubTag;
                                var doc = $(ele).parent().parent();
                                if (doc.hasClass("active")) {
                                    doc.removeClass("active");
                                } else {
                                    doc.addClass("active");
                                }
                            }
                        } else {
                             var selectSubTag = $(ele).attr("data-mac");
                             if (selectTag != selectSubTag && !self._isEmpty(selectSubTag)) {
                                 selectTag = selectSubTag;
                                 self.editLightStatus(ele);
                             }
                         }
                    },
                    touchend: function() {

                    }
                }, "td");
                docWrapper.on({
                    touchstart: function(e) {
                        var that = this;
                        selectTag = $(this).attr("data-mac");
                        console.log(selectTag);
                        flag = true;
                        if (!docWrapper.hasClass("active") && !self._isEmpty(selectTag)) {
                            TIMER_ID = setTimeout(function(){
                                self.editTableBtn();
                                $(that).parent().parent().addClass("active");
                            }, 800);
                        }
                        e.stopPropagation();
                    },
                    touchmove: function(e) {
                        clearTimeout(TIMER_ID);
                        if (!docWrapper.hasClass("active")) {
                            if (flag && !self._isEmpty(selectTag)) {
                                self.editLightStatus(this);
                                flag = false;
                            }
                            e = e || window.event;
                            e.preventDefault();
                            var touch = e.originalEvent.targetTouches[0];
                            var ele = document.elementFromPoint(touch.pageX, touch.pageY);
                            var selectSubTag = $(ele).attr("data-mac");
                            if (selectTag != selectSubTag && !self._isEmpty(selectSubTag)) {
                                selectTag = selectSubTag;
                                self.editLightStatus(ele);
                            }
                        }
                        e.stopPropagation();
                    },
                    touchend: function(e) {
                        clearTimeout(TIMER_ID);
                        if (flag && !self._isEmpty(selectTag) && !docWrapper.hasClass("active")) {
                            self.editLightStatus(this);
                            flag = false;
                        }
                        e.stopPropagation();
                    }
                }, "div.td-unactive");
            },
            editLightStatus: function (obj) {
                var self = this,
                    mac = $(obj).attr("data-mac");
                if (!self._isEmpty(self.deviceList)) {
                    var meshs = [],
                        device,
                        status,
                        color = "#999",
                        hueValue = 0,
                        saturation = 0,
                        luminance = 0,
                        position = 0;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == mac) {
                            device = item;
                            position = i;
                            return false;
                        }
                    });
                    var characteristic, num,
                        characteristics = device.characteristics;
                    $.each(characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            num = i;
                            characteristic = item;
                            status = item.value;

                        }
                    });

                    if (status == STATUS_ON) {
                        characteristic.value = STATUS_OFF;
                    } else {
                        characteristic.value = STATUS_ON;
                        var hsb = "hsb("+ (hueValue / 360) +","+ (saturation / 100) +","+(luminance / 100) +")";
                        color = Raphael.getRGB(hsb).hex;
                    }
                    characteristics.splice(num, 1);
                    characteristics.push(characteristic);
                    device.characteristics = characteristics;
                    self.deviceList.splice(position, 1, device);
                    meshs.push({cid: STATUS_CID, value: parseInt(characteristic.value)});
                    $("div[data-id='" + mac + "']").find("p").find("i").css("color", color);
                    var data = '{"' + MESH_MAC + '": "' + mac + '","'+NO_RESPONSE+'": true,"' +MESH_REQUEST + '": "' + SET_STATUS + '",' +
                            '"characteristics":' + JSON.stringify(meshs) + '}';
                    espmesh.addQueueTask("requestDeviceAsync", data);
                }

            },
            selectAllBtn: function() {
                this.selectAllShow = false;
                $("#table-wrapper table td").find(".td-content").parent().addClass("active");
            },
            unselectAllBtn: function() {
                this.selectAllShow = true;
                $("#table-wrapper table td").find(".td-content").parent().removeClass("active");
            },
            editTableBtn: function () {
                var doc = $("#editTableBtn"),
                    text = doc.text();
                if (text == "Edit") {
                    window.onBackPressed = this.editTableBtn;
                    $("a.navigation-device").removeClass("hidden");
                    $("#table-wrapper").addClass("active");
                    $("#table-wrapper").find("table").removeClass("unactive");
                    doc.find(".name").text("Cancel");
                    doc.find(".icon").addClass("icon-cancel").removeClass("icon-edit");
                } else {
                    this.reduction();
                }
            },
            reduction: function() {
                var doc = $("#editTableBtn");
                $("a.navigation-device").addClass("hidden");
                $("#table-wrapper").removeClass("active");
                doc.find(".name").text("Edit");
                doc.find(".icon").addClass("icon-edit").removeClass("icon-cancel");
                $("#table-wrapper").find("table").addClass("unactive");
                $("#table-wrapper table td.active").find(".td-content").parent().removeClass("active");
                window.onBackPressed = this.hideTable;
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
            "v-info": info,
            "v-setTable": setTable,
            "v-tableColor": tableColor
        }

    });
    return Table;
});