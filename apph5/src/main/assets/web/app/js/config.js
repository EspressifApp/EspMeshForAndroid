define(["vue","MINT", "Util", "txt!../../pages/config.html"],
    function(v, MINT, Util, config) {
        var Config = v.extend({

            template: config,
            props: {
                deviceInfo: {
                    type: Object
                },
            },
            data: function(){
                return {
                    showFlag: false,
                    function_config: {"function0": "", "function1": "", "function2": "", "function3": ""},
                    roomList: [],
                    group_config: {"group0": "", "group1": "", "group2": "", "group3": ""},
                    currentGroup: "",
                    selectCurrentRoom: "",
                    showSelect: false,
                    shortPress: [{"id": "6", "name": this.$t('brightness') + "+"},
                        {"id": "7", "name": this.$t('brightness') + "-"},
                        {"id": "8", "name": this.$t('temp') + "+"},
                        {"id": "9", "name": this.$t('temp') + "-"},
                        {"id": "10", "name": this.$t('configMode')}]
                }
            },
            computed: {

            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    window.onSaveButton14 = self.onSaveButton14;
                    window.onGetConfig = self.onGetConfig;
                    window.onLoadRoomConfig = self.onLoadRoomConfig;
                    espmesh.loadAllValuesInFile(JSON.stringify({name: ROOM_LIST, callback: "onLoadRoomConfig"}));
                    self.function_config = {"function0": "", "function1": "", "function2": "", "function3": ""};
                    self.group_config = {"group0": "", "group1": "", "group2": "", "group3": ""};
                    setTimeout(function() {
                        self.meshDrop();
                        MINT.Indicator.open();
                        setTimeout(function() {
                            self.getEvent();
                            MINT.Indicator.close();
                        }, 1000)
                    }, 200)
                    self.showFlag = true;
                },
                onValuesChange: function(picker, values) {

                },
                getRoomName: function(key) {
                    var roomKey = this.group_config[key];
                    if (!Util._isEmpty(roomKey)) {
                        return Util.gbkToStr(Util.strSplit(roomKey));
                    }
                    return "";
                },
                getEvent: function() {
                    var self = this;
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                        WALL_CONTROL_CONFIG_GET +'", "callback": "onGetConfig"}';
                    espmesh.requestDevice(data);
                },
                meshDrop: function () {
                    var self = this;
                    //拖动创建元素
                    $('.control-wrapper').find('div.shortPress').draggable({
                        helper: 'clone',
                        containment: ".content-info",
                        scope: '.btn-round',
                    });
                    $('div.content-info').find('div.btn-round').droppable({
                        scope: ".btn-round",
                        accept: ".shortPress",
                        hoverClass: "highlight",
                        drop: function (event, ui) {
                            var dragui = ui.draggable,
                                id = dragui.attr('data-value'),
                                eventCid = $(this).attr("data-value");
                            self.function_config[eventCid] = id;
                        }
                    })
                },
                getActive: function(name) {
                    var flag = false;
                    for(var i in this.function_config) {
                        if (!Util._isEmpty(this.function_config[i])) {
                            flag = true;
                            break;
                        }
                    }
                    return flag;
                },
                getBtnName: function(key) {
                    var name = "";
                    for(var i in this.function_config) {
                        var str = this.function_config[i]
                        if (str == key) {
                            switch(i) {
                                case "function0": name = "A"; break;
                                case "function1": name = "B"; break;
                                case "function2": name = "C"; break;
                                case "function3": name = "D"; break;
                                default: break;
                            }
                        }
                    }
                    return name;
                },
                isExist: function(key) {
                    var flag = false;
                    for(var i in this.function_config) {
                        var str = this.function_config[i]
                        if (str == key) {
                            flag = true;
                            break;
                        }
                    }
                    return flag;
                },
                delExist: function(key) {
                    for(var i in this.function_config) {
                        var str = this.function_config[i]
                        if (str == key) {
                            this.function_config[i] = "";
                        }
                    }
                },
                showSelectRoom: function(key) {
                    console.log(key);
                    this.currentGroup = key;
                    this.selectCurrentRoom = this.group_config[key];
                    this.showSelect = true;
                    window.onBackPressed = this.hideSelectRoom;
                },
                hideSelectRoom: function() {
                    this.currentGroup = "";
                    this.selectCurrentRoom = "";
                    window.onBackPressed = this.hide;
                    this.showSelect = false;
                },
                selectRoom: function(roomKey) {
                    this.selectCurrentRoom = roomKey;
                },
                isShowGroup: function(key) {
                    if (!Util._isEmpty(this.group_config[key])) {
                        return true;
                    } else {
                        return false;
                    }
                },
                saveDevice: function() {
                    this.group_config[this.currentGroup] = this.selectCurrentRoom;
                    console.log(JSON.stringify(this.group_config));
                    this.hideSelectRoom();
                },
                hide: function () {
                    this.showFlag = false;
                    MINT.Indicator.close();
                    this.$emit("configShow");
                },
                hideParent: function() {
                    this.showFlag = false;
                    MINT.Indicator.close();
                    this.$parent.hideParent();
                },
                hideThis: function() {
                    window.onBackPressed = this.hide;
                },
                save: function() {
                    var self = this;
                    for(var i in self.group_config) {
                        var room = self.group_config[i];
                        if (Util._isEmpty(room)) {
                            MINT.Toast({
                                message: '请选择房间',
                                position: 'bottom',
                            });
                            return false;
                        }
                        break;
                    }
                    var objGroup = {};
                    for(var i in self.group_config) {
                        var value = self.group_config[i];
                        if (!Util._isEmpty(value)) {
                            objGroup[i] = value;
                        }
                    }
                    var objFun = {};
                    for(var i in self.function_config) {
                        var value = self.function_config[i];
                        if (!Util._isEmpty(value)) {
                            objFun[i] = {cid: 0, value: value};
                        }
                    }
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + WALL_CONTROL_CONFIG_SET + '",' +
                            '"group_config":' + JSON.stringify(self.group_config) + ',"function_config":' + JSON.stringify(objFun) + ',"callback": "onSaveButton14"}}';
                    setTimeout(function() {
                        espmesh.requestDevice(data);
                    }, 1000)
                },
                getRoomByDevice: function(deviceList) {
                    var self = this;
                    var deviceList = this.$store.state.deviceList;
                    var roomList = [], roomKeys = [];
                    $.each(deviceList, function(i, item) {
                        if (!Util._isEmpty(item.group) && item.group.length > 0) {
                            var keys = item.group;
                            for (var i = 0; i < keys.length; i++) {
                                var key = keys[i];
                                if (roomKeys.indexOf(key) == -1) {
                                    roomKeys.push(key);
                                    var macs = [];
                                    $.each(deviceList, function(j, itemSub) {
                                        if (!Util._isEmpty(itemSub.group) && itemSub.group.length > 0) {
                                            if (itemSub.group.indexOf(key) != -1) {
                                                macs.push(itemSub.mac);
                                            }
                                        }
                                    })
                                    var name = Util.gbkToStr(Util.strSplit(key));
                                    roomList.push({key: key,
                                          value: encodeURIComponent(JSON.stringify({name: $.trim(name), url: "room_5.jpg",
                                          macs: macs}))});
                                }
                            }
                        }
                    });
                    return roomList;
                },
                onGetConfig: function(res) {
                    var self = this;
                    if (res !== "{}" && !Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (!Util._isEmpty(res.result)) {
                            res = res.result;
                            self.group_config = res.group_config;
                            console.log(JSON.stringify(self.group_config));
                            for (var i in res.function_config) {
                                var value = res.function_config[i];
                                if (!Util._isEmpty(value)) {
                                    value = value.value;
                                    self.function_config[i] = value;
                                }
                            }
                        }
                    }
                },
                onLoadRoomConfig: function(res) {
                    var self = this;
                    console.log(JSON.stringify(res));
                    var roomList = [], roomKeys = [];
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.name == ROOM_LIST) {
                            res = res.content;
                            var item = "";
                            if (!Util._isEmpty(res)) {
                                for(var i in res) {
                                    var key = i;
                                    roomKeys.push(key);
                                    var obj = JSON.parse(decodeURIComponent(res[i]));
                                    item = {key: key, value: encodeURIComponent(JSON.stringify({name: obj.name, url: obj.url,
                                          macs: []}))};
                                    roomList.push(item);
                                }
                            }
                        }
                    }
                    var list = this.getRoomByDevice();
                    console.log(JSON.stringify(list));
                    $.each(list, function(i, item) {
                        var key = item.key;
                        if (roomKeys.indexOf(key) != -1) {
                            $.each(roomList, function(j, itemSub) {
                                if (key == itemSub.key) {
                                    roomList.splice(j, 1, item);
                                    return false;
                                }
                            })
                        } else {
                            roomList.push(item);
                            roomKeys.push(key);
                        }
                    });
                    console.log(JSON.stringify(roomList));
                    if (roomList.length > 0) {
                        var list = [];
                        $.each(roomList, function(i, item) {
                            var value = JSON.parse(decodeURIComponent(item.value));
                            list.push({roomKey: item.key, name: value.name, url: value.url, macs: value.macs});
                        });
                        this.roomList = list;
                    }
                },
                onSaveButton14: function(res) {
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res) && res != "{}") {
                        res = JSON.parse(res);
                        if (!Util._isEmpty(res.result)) {
                            if (res.result.status_code == 0) {
                                MINT.Toast({
                                    message: '配置成功',
                                    position: 'bottom',
                                });
                                this.hide();
                            } else {
                                MINT.Toast({
                                    message: '配置失败',
                                    position: 'bottom',
                                });
                            }
                        } else {
                            MINT.Toast({
                                message: '配置失败',
                                position: 'bottom',
                            });
                        }
                    } else {
                        MINT.Toast({
                            message: '配置失败',
                            position: 'bottom',
                        });
                    }

                }
            },
            components: {
            }

        });

        return Config;
    });