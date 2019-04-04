define(["vue", "MINT", "Util", "txt!../../pages/writing.html"],
    function(v, MINT, Util, writing) {

        var Table = v.extend({

            template: writing,

            data: function(){
                return {
                    writingFlag: false,
                    colorFlag: false,
                    selectMacs: [],
                    currentRgb: "#ff0000",
                    currentWrite: -1,
                    writeId: "",
                    colorList: ["#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8000ff"],
                    trList0: ["240ac48b9fd0", "240ac48b8e60", "240ac48b94bc", "240ac48b8f9c", "240ac48b965c",
                        "240ac48b8e30", "240ac48b91d0", "240ac48b94d0", "240ac48b8e40", "240ac48b9aa8", "240ac48ba2bc",
                        "240ac48b8b78", "240ac48b8ee4", "240ac48ba288", "240ac48b90e4", "240ac48b9e6c"],
                    trList1: ["240ac48b9e54","240ac48b9a30", "240ac48b98e8", "240ac48ba4f4", "240ac48b87c8", "240ac48b8f88",
                        "30aea457d59c", "240ac48b9b54", "240ac48b935c", "240ac48ba334", "240ac48b8714", "240ac48b9390",
                        "30aea457d5f4", "240ac48b8cf8", "240ac48b91a4", "240ac48b9028"],
                    trList2: ["240ac48ba24c", "240ac48ba454", "240ac48b96a8",
                        "240ac48ba3fc", "240ac48b8a9c", "240ac48ba188", "240ac48ba180", "30aea457d47c", "240ac48b98c4",
                        "240ac48b8dc0", "240ac48b9878", "240ac48b8b30", "240ac48b97d8", "240ac48ba4d0", "240ac48b9d44",
                        "240ac48b91bc"],
                    trList3: ["30aea457d340", "30aea457d588", "240ac48b97d4", "240ac48b92e0", "240ac48ba4e4",
                        "240ac48b8c48", "240ac48b8bf4", "240ac48b8a30", "240ac48b90ac", "240ac48ba2ac", "240ac48b8ea4",
                        "240ac48ba4b8", "240ac48b92a0", "240ac48ba148", "240ac48b93c4", "240ac48ba0ec"],
                    trList4: ["240ac48ba3c8",
                        "240ac48b9cb4", "240ac48b9250", "240ac48b90e0", "240ac48b9eb4", "240ac48b9bf0", "240ac48b9468",
                        "240ac48b8858", "240ac48b945c", "240ac48b96c8", "240ac48b8a60", "240ac48ba4cc", "240ac48b8844",
                        "240ac48b9604", "240ac48b8f40", "240ac48b9af0"],
                    trList5: ["240ac48b8954", "240ac48b8fa8", "240ac48b8c5c",
                        "240ac48b8f70", "240ac48b97e4", "240ac48b8c44", "240ac48b9194", "240ac48b98fc", "240ac48ba3a0",
                        "240ac48b9854", "240ac48b9470", "240ac48b8c8c", "240ac48b9158", "240ac48b8e64", "240ac48b912c",
                        "240ac48b916c"],
                    trList6: ["240ac48b97c0", "240ac48b9660", "240ac48b9488", "240ac48b9ff8", "240ac48b9084",
                        "240ac48b978c", "240ac48b9a90", "240ac48b8ef0", "30aea457d594", "240ac48b9684", "240ac48b8cd4",
                        "30aea457d600", "240ac48b8cd0", "30aea457d5c4", "30aea457d578", "240ac48b93c8"],
                    trList7: ["240ac48b8950",
                        "240ac48b98e0", "240ac48b8ee0", "240ac48b8e5c", "240ac48b8930", "240ac48b8b44", "240ac48b8bc4",
                        "240ac48ba184", "240ac48b97a0", "240ac48ba428", "30aea457d5f8", "240ac48b9d84", "240ac48ba1b0",
                        "240ac48b8c00", "30aea457d510", "240ac48ba558"],
                    trList8: ["240ac48b988c", "240ac48ba2dc", "240ac48ba42c",
                        "240ac48b8d74", "240ac48b8940", "240ac48b9690", "240ac48b8a20", "240ac48b9d0c", "240ac48b94a0",
                        "240ac48b8efc", "240ac48b8fc4", "240ac48b9338", "30aea457d480", "240ac48b9978", "240ac48b9be0",
                        "240ac48b91a8"],
                    trList9: ["240ac48b980c", "30aea457d54c", "240ac48b9258", "240ac48b9440", "240ac48b9a84",
                        "240ac48b8ebc", "240ac48b8f78", "240ac48b9724", "240ac48b9f8c", "240ac48b99a4", "240ac48b9220",
                        "240ac48b8cbc", "240ac48ba3b4", "240ac48b8b9c", "240ac48b8ab4", "240ac48b92c0"],
                    trList10: ["240ac48b8d80",
                        "240ac48b87f8", "240ac48b8710", "240ac48b9f38", "30aea457d2f0", "240ac48ba014", "240ac48ba0d4",
                        "240ac48b8b58", "240ac48b9e5c", "240ac48b9fb4", "240ac48b9238", "240ac48b98b0", "240ac48b987c",
                        "240ac48b8e78", "240ac48ba580", "240ac48b963c"],
                    trList11: ["240ac48b9bf4", "240ac48ba4c8", "240ac48b9038",
                        "240ac48b87a4", "30aea457d3d8", "240ac48b8c54", "240ac48ba190", "240ac48ba008", "240ac48b893c",
                        "240ac48b9f70", "240ac48b8c24", "240ac48b90c8", "240ac48b961c", "240ac48b99d8", "240ac48b910c",
                        "240ac48b9d1c"],
                    trList12: ["240ac48b8924", "240ac48ba5b8", "240ac48b8838", "240ac48b9414", "240ac48b917c",
                        "240ac48b8dac", "240ac48ba3d8", "240ac48ba400", "240ac48b9ee8", "30aea457d680", "240ac48ba2e4",
                        "240ac48b8e00", "240ac48b9a94", "30aea457d544", "240ac48b8f7c", "240ac48b8e38"],
                    trList13: ["240ac48b94f8",
                        "240ac48b97a4", "240ac48b8738", "240ac48ba1f4", "240ac48b886c", "240ac48b9d18", "30aea457d610",
                        "240ac48ba0d0", "240ac48b8c2c", "240ac48b91dc", "240ac48b9f5c", "240ac48ba484", "240ac48ba534",
                        "240ac48b946c", "240ac48ba3dc", "240ac48b9234"],
                    trList14: ["240ac48b9204", "240ac48b9344", "240ac48b9110",
                        "30aea457d6c0", "240ac48b9c1c", "240ac48ba120", "240ac48b9f68", "240ac48b8d08", "240ac48b9fa4",
                        "240ac48b9594", "240ac48b8f24", "240ac48b9270", "240ac48b8dfc", "240ac48ba530", "30aea457d61c",
                        "240ac48ba618"],
                    trList15: ["240ac48b870c", "240ac48ba0e0", "240ac48b9c2c", "240ac48b87a8", "240ac48ba500",
                        "240ac48b9240", "30aea457d724", "240ac48ba108", "240ac48b97bc", "30aea457d52c", "30aea457d5ec",
                        "240ac48b9600", "240ac48ba310", "240ac48b9dc4", "240ac48b9988", "240ac48b9058"],
                    twoList: ["240ac48b94d0","240ac48b8f88","30aea457d59c","240ac48b935c","240ac48ba334","240ac48ba3fc",
                        "240ac48b8a9c","240ac48b9878","240ac48b8b30","30aea457d340","30aea457d588","240ac48b97d4",
                        "240ac48ba4e4","240ac48b8c48","240ac48b8bf4","240ac48b8a30","240ac48b90ac","240ac48ba2ac",
                        "240ac48b8ea4","240ac48b92a0","240ac48ba148","240ac48b93c4","240ac48b8858","240ac48b8f70",
                        "240ac48b97e4","240ac48b8c44","240ac48b9194","240ac48b98fc","240ac48ba3a0","240ac48b9854",
                        "240ac48b9470","240ac48b8c8c","240ac48b978c","240ac48b8ef0","240ac48b9684","240ac48b8ee0",
                        "240ac48b8e5c","240ac48b8930","240ac48b8b44","240ac48b8bc4","240ac48ba184","240ac48b97a0",
                        "240ac48ba428","30aea457d5f8","240ac48b9d84","240ac48ba1b0","240ac48b8d74","240ac48b9338",
                        "240ac48b9258","240ac48b9a84","240ac48b9220","240ac48ba3b4","240ac48b87f8","240ac48b8710",
                        "240ac48b9f38","30aea457d2f0","240ac48ba014","240ac48b9fb4","240ac48b9238","240ac48b98b0",
                        "240ac48b987c","240ac48b8e78","240ac48b9bf4","240ac48b87a4","240ac48ba190",
                        "240ac48b893c","240ac48b90c8","240ac48b910c","240ac48ba585","240ac48b8838","240ac48b9414",
                        "240ac48b917c","240ac48b8dac","240ac48ba2e4","240ac48b8e00","240ac48b9a94","240ac48ba1f4",
                        "240ac48ba484","240ac48b9344","30aea457d6c0","240ac48ba120","240ac48b9594","240ac48b9270",
                        "240ac48ba530","240ac48b870c","240ac48ba0e0","240ac48b9c2c","240ac48b87a8","240ac48ba500",
                        "240ac48b9240","30aea457d724","240ac48b97bc","30aea457d52c","30aea457d5ec","240ac48b9600",
                        "240ac48ba310","240ac48b9dc4","240ac48b9988"],
                    oneList: ["240ac48ba2bc","240ac48b935c","240ac48ba334","240ac48b8714","240ac48b9390","240ac48ba3fc",
                        "240ac48b8a9c","240ac48ba188","240ac48ba180","30aea457d47c","240ac48b92e0","240ac48b90e0",
                        "240ac48b8858","240ac48b8f70","240ac48b98fc","240ac48b9488","240ac48b8ef0","240ac48b98e0",
                        "240ac48b8ee0","240ac48b8e5c","240ac48b8930","240ac48b8b44","240ac48b8bc4","240ac48ba184",
                        "240ac48b97a0","240ac48ba428","30aea457d5f8","240ac48b9d84","240ac48ba1b0","240ac48b8c00",
                        "240ac48b9d0c","240ac48b9724","240ac48b8b58","240ac48b9238","240ac48b90c8","240ac48b9414",
                        "240ac48ba400","240ac48b9a94","240ac48b8738","240ac48ba0d0","240ac48ba534","240ac48b946c",
                        "240ac48b9344","240ac48ba120","240ac48b8d08","240ac48ba530","30aea457d724"],
                    threeList: ["240ac48b8e40","240ac48b935c","240ac48ba24c","240ac48ba454","240ac48b96a8","240ac48ba3fc",
                        "240ac48b8a9c","240ac48ba188","240ac48b98c4","240ac48b8c48","240ac48b90ac","240ac48ba2ac",
                        "240ac48b8ea4","240ac48ba4b8","240ac48b92a0","240ac48ba148","240ac48b9cb4","240ac48b9bf0",
                        "240ac48b8858","240ac48b9604","240ac48b8fa8","240ac48b8c44","240ac48b9194","240ac48b9854",
                        "240ac48b9158","240ac48b9488","240ac48b9084","240ac48b9684","240ac48b8ee0","240ac48b8930",
                        "240ac48ba428","240ac48b8d74","240ac48b8efc","240ac48b9258","240ac48b9a84","240ac48b99a4",
                        "240ac48b8710","240ac48ba014","240ac48b9e5c","240ac48b9238","240ac48ba4c8","240ac48b8c54",
                        "240ac48b893c","240ac48b8c24","240ac48b8924","240ac48ba400","240ac48b8e00","240ac48ba0d0",
                        "240ac48ba534","240ac48b9f68","240ac48b8dfc","240ac48ba530","30aea457d61c","240ac48ba500",
                        "240ac48b9240","240ac48b9dc4"],
                    fourList: ["240ac48b9a30","240ac48b9b54","240ac48b935c","240ac48b8cf8","240ac48b96a8","240ac48ba188",
                        "240ac48ba180","240ac48b8dc0","240ac48b9878","240ac48b8b30","240ac48b97d8","240ac48ba4d0",
                        "240ac48b9d44","240ac48b92e0","240ac48b8c48","240ac48ba2ac","240ac48ba148","240ac48b9bf0",
                        "240ac48b96c8","240ac48b9604","240ac48b8c44","240ac48b9854","240ac48b8e64","240ac48b97c0",
                        "240ac48b9660","240ac48b9488","240ac48b9ff8","240ac48b978c","240ac48b9684","30aea457d5c4",
                        "240ac48b8e5c","240ac48b8b44","240ac48b97a0","240ac48ba428","240ac48b8c00","240ac48b8d74",
                        "240ac48b9690","240ac48b9d0c","240ac48b8efc","240ac48b9978","240ac48b9440","240ac48b8ebc",
                        "240ac48b8f78","240ac48b99a4","240ac48b8cbc","240ac48b8b9c","240ac48b9f38","240ac48ba014",
                        "240ac48b9fb4","240ac48b987c","240ac48b87a4","240ac48b9f70","240ac48b9414","30aea457d680",
                        "240ac48b8738","240ac48b886c","240ac48b91dc","240ac48b946c","240ac48ba3dc","240ac48b9344",
                        "240ac48ba120","240ac48b9f68","240ac48b8d08","240ac48b9fa4","240ac48b9594","240ac48b8f24",
                        "240ac48b9270","240ac48b8dfc","240ac48ba530"],
                    fiveList: ["240ac48b965c","240ac48b94d0","240ac48b87c8","240ac48b9b54","240ac48ba3fc","240ac48ba180",
                        "30aea457d47c","240ac48b98c4","240ac48b8dc0","240ac48b9878","240ac48b8b30","240ac48b97d8",
                        "240ac48ba4d0","240ac48b92e0","240ac48b8bf4","240ac48ba2ac","240ac48ba148","240ac48b9250",
                        "240ac48b90e0","240ac48b9bf0","240ac48b96c8","240ac48b8844","240ac48b8fa8","240ac48b8f70",
                        "240ac48b97e4","240ac48b98fc","240ac48b9854","240ac48b97c0","240ac48b9ff8","240ac48b8ef0",
                        "240ac48b9684","30aea457d600","240ac48b8e5c","240ac48b8bc4","240ac48ba428","240ac48ba1b0",
                        "240ac48b8c00","240ac48b8d74","240ac48b9690","240ac48b8efc","240ac48b9978","240ac48b9440",
                        "240ac48b9724","240ac48b99a4","240ac48b9f38","240ac48b9e5c","240ac48ba190","240ac48ba585",
                        "240ac48b9414","240ac48ba400","240ac48b9ee8","30aea457d544","240ac48b97a4","240ac48ba1f4",
                        "240ac48b8c2c","240ac48ba484","240ac48ba3dc","240ac48b9204","30aea457d6c0","240ac48b9270",
                        "30aea457d61c","240ac48ba500","240ac48b9240","30aea457d724","240ac48ba108","240ac48b97bc",
                        "30aea457d52c","30aea457d5ec","240ac48b9600"]
                    }

            },
            computed: {

            },
            methods:{
                show: function() {
                    this.writingFlag = true;
                    window.onAddQueueTask = this.onAddQueueTask;
                    this.currentWrite = -1;
                    this.clearWriting();
                    this.operateEvent();
                },
                hideTable: function () {
                    this.writingFlag = false;
                    this.$store.commit("setShowScanBle", true);
                    this.$store.commit("setShowLoading", true);
                    if (!Util._isEmpty(this.writeId)) {
                        clearInterval(this.writeId);
                    }
                    espmesh.closeDeviceLongSocket(this.$store.state.deviceIp);
                    this.$emit("writingShow");
                },
                hideParent: function() {
                    window.onBackPressed = this.hideTable;
                },
                colorPlateBtn: function() {
                    this.colorFlag = true;
                },
                hideColor: function() {
                    this.colorFlag = false;
                },
                clearWriting: function() {
                    $("#table-wirting-wrapper").find("td.active").find("span").css("background", "#00c0ef");
                    $("#table-wirting-wrapper").find("td").removeClass("active");
                    this.editAllStatus();
                },
                selectColor: function(color) {
                    this.currentRgb = color;
                    $("#table-wirting-wrapper").find("td.active").find("span").css("background", this.currentRgb);
                    this.getMacs();
                    this.currentWrite = -1;
                },
                getMacs: function() {
                    var docs = $("#table-wirting-wrapper").find("td.active").find("span"),
                        macs = [];
                    $.each(docs, function (i, item) {
                        var mac = $(item).attr("data-id");
                        if (macs.indexOf(mac) == -1) {
                            macs.push(mac);
                        }
                    })
                    this.editLightStatus(macs, this.currentRgb);
                },
                writeColor: function(list, num, flag) {
                    var self = this;
                    self.currentWrite = num;
                    if (!Util._isEmpty(self.writeId) && flag) {
                        clearInterval(self.writeId);
                    }
                    var docs = $("#table-wirting-wrapper").find("span.writing-round");
                    console.log(docs.length);
                    self.clearWriting();
                    $.each(docs, function(i, item) {
                        var mac = $(item).attr("data-id");
                        if (list.indexOf(mac) != -1) {
                            $(item).parent().addClass("active");
                            $(item).css("background", self.currentRgb);
                        }
                    });
                    setTimeout(function() {
                        self.editLightStatus(list, self.currentRgb);
                    }, 500)

                },
                writeCycle: function(num) {
                    var self = this;
                    self.currentWrite = num;
                    if (!Util._isEmpty(self.writeId)) {
                        clearInterval(self.writeId);
                    }
                    var number = 1;
                    self.writeId = setInterval(function() {
                        if (number == 1) {
                            self.writeColor(self.oneList, num, false);
                            number = 2;
                        } else if (number == 2) {
                            self.writeColor(self.twoList, num, false);
                            number = 3;
                        } else if (number == 3) {
                            self.writeColor(self.threeList, num, false);
                            number = 4;
                        } else if (number == 4) {
                            self.writeColor(self.fourList, num, false);
                            number = 5;
                        } else if (number == 5) {
                            self.writeColor(self.fiveList, num, false);
                            number = 1;
                        }
                    }, 3000);

                },
                operateEvent: function() {
                    var self = this,
                        selectTag = null,
                        flag = true,
                        docWrapper = $("#table-wirting-wrapper");
                    docWrapper.on({
                        touchstart: function() {
                            self.selectMacs = [];
                            selectTag = $(this).find("span.writing-round").attr("data-id");
                            if (!Util._isEmpty(selectTag)) {
                                var doc = $(this);
                                if (doc.hasClass("active")) {
                                    doc.removeClass("active");
                                    doc.find("span").css("background", "#00c0ef");
                                    self.editLightStatus([selectTag], "#00c0ef");
                                } else {
                                    doc.addClass("active");
                                    doc.find("span").css("background", self.currentRgb);
                                    self.selectMacs.push(selectTag);
                                }
                            }
                        },
                        touchmove: function(e) {
                            e = e || window.event;
                            e.preventDefault();
                            var touch = e.originalEvent.targetTouches[0];
                            var ele = document.elementFromPoint(touch.pageX, touch.pageY);
                            var selectSubTag = $(ele).attr("data-id");
                            if (selectTag != selectSubTag && !Util._isEmpty(selectSubTag) &&
                                selectSubTag != "table-drop-wirting" && selectSubTag != "table-wirting-wrapper"
                                && selectSubTag != "toporight-wirting-table") {
                                selectTag = selectSubTag;
                                var doc = $(ele).parent();
//                                if (doc.hasClass("active")) {
//                                    doc.removeClass("active");
//                                    doc.find("span").css("background", "#00c0ef");
//                                    self.editLightStatus(selectTag, "#00c0ef");
//                                } else {
                                doc.addClass("active");
                                if (self.selectMacs.indexOf(selectTag) == -1) {
                                    self.selectMacs.push(selectTag);
                                }
                                doc.find("span").css("background", self.currentRgb);
                                setTimeout(function() {
                                    self.editLightStatus(self.selectMacs, self.currentRgb);
                                }, 500)
//                                }
                            }
                        },
                        touchend: function() {

                        }
                    }, "td");
                },
                getHue: function(color) {
                    switch(color){
                        case "#ff0000":
                            return 0;
                            break;
                        case "#ff8000":
                            return 30;
                            break;
                        case "#ffff00":
                            return 60;
                            break;
                        case "#00ff00":
                            return 120;
                            break;
                        case "#00ffff":
                            return 180;
                            break;
                        case "#0000ff":
                            return 240;
                            break;
                        case "#8000ff":
                            return 270;
                            break;
                        default:
                            return 191;
                            break;
                    }
                },
                editAllStatus: function() {
                    var macs = this.trList0.concat(this.trList1, this.trList2, this.trList3, this.trList4, this.trList5,
                        this.trList6, this.trList7, this.trList8, this.trList9, this.trList10, this.trList11, this.trList12,
                        this.trList13, this.trList14, this.trList15);
                    this.setAllLight(macs);
                },
                setAllLight: function(macs) {
                    var self = this,
                        meshs = [];
                    meshs.push({cid: HUE_CID, value: 191});
                    meshs.push({cid: SATURATION_CID, value: 100});
                    if (macs.length >= 200) {
                        macs = ["ffffffffffff"];
                    }
                    var data = '{"macs": ' + JSON.stringify(macs) +
                        ',"host": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' +MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';
                    console.log(data);
                    espmesh.addQueueTask(JSON.stringify({"method":"requestDeviceLongSocket","argument": data}));
                },
                editLightStatus: function (macs, color) {
                    var self= this;
                    var meshs = [];
                    meshs.push({cid: HUE_CID, value: parseInt(self.getHue(color))});
                    meshs.push({cid: SATURATION_CID, value: 100});
                    if (macs.length >= 200) {
                        macs = ["ffffffffffff"];
                    }
                    var data = '{"macs": ' + JSON.stringify(macs) +
                        ',"host": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' +MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';
                    console.log(data);
                    if (macs.length > 0) {
                        espmesh.addQueueTask(JSON.stringify({"method":"requestDeviceLongSocket","argument": data}));
                    }
                },
                onAddQueueTask: function() {
                }
            },
            created: function () {

            },
            components: {
            }

        });
        return Table;
    });