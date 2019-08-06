define(["vue", "MINT", "Util", "txt!../../pages/room.html", "../js/footer", "../js/addRoom", "./operateDevice"],
    function(v, MINT, Util, room, footer, addRoom, operateDevice) {

    var Room = v.extend({

        template: room,

        data: function(){
            return {
                room: "room",
                roomList: [],
                colorId: "room-color",
                roomExistKeys: [],
                roomInfo: "",
                newRoomKey: "",
                newRoomName: "",
                temperatureId: "room-temperature",
                active: "",
                infoShow: false,
                isDevice: false,
                isRoom: false,
                isShowDevice: false,
                deviceList: [],
            }
        },
        watch: {
            // 如果路由有变化，会再次执行该方法d
            '$route': function (to, form) {
                console.log(to.path);
                if (to.path == "/room") {
                    this.getRoomList();
                }
            }
        },
        mounted: function() {
            window.onLoadRoomList = this.onLoadRoomList;
            this.getRoomList();
        },
        computed: {
            list: function() {
                var list = this.$store.state.roomList;
                this.getRoomList(list);
            },
            getList: function() {
                this.deviceList = this.$store.state.deviceList;
                this.getRoomByDevice(this.deviceList);
            }
        },
        methods:{
            showAdd: function() {
                var self = this;
                self.roomInfo = "";
                setTimeout(function() {
                    self.$refs.addRoom.show();
                }, 100)
            },
            getRoomList: function() {
                window.onDelRoom = this.onDelRoom;
                window.onLoadRoomList = this.onLoadRoomList;
                espmesh.loadAllValuesInFile(JSON.stringify({name: ROOM_LIST, callback: "onLoadRoomList"}));
            },
            getDeviceList: function(macs) {
                var self = this,
                    list = [];
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) != -1) {
                        list.push(item);
                    }
                });
                return list;
            },
            showOperate: function(item) {
                var self = this;
                self.roomInfo = item;
                setTimeout(function() {
                    self.infoShow = true;
                    window.onBackPressed = self.hideOperate;
                })
            },
            hideOperate: function() {
                this.infoShow = false;
                window.onBackPressed = this.onBackRoom;
            },
            roomItem: function(item, flag) {
                var self = this;
                self.isDevice = false;
                self.isRoom = true;
                if (item.macs.length > 0 && flag) {
                    self.roomInfo = item;
                    setTimeout(function() {
                        self.$store.commit("setDeviceInfo", self.roomInfo);
                        self.$refs.operate.show();
                    })
                }
            },
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                self.isDevice = true;
                self.isRoom = false;
                setTimeout(function() {
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        self.$store.commit("setDeviceInfo", item);
                        self.$refs.operate.show();
                    } else if (tid != BUTTON_SWITCH) {
                        self.$store.commit("setDeviceInfo", item);
                        self.$refs.attr.show();
                    }
                }, 100)
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            isShow: function(macs) {
                var self = this,
                    flag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            if (item.tid >= MIN_LIGHT && item.tid <= MAX_LIGHT) {
                                flag = true;
                            }
                        }
                    });
                }
                return flag;
            },
            isLigth: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return true;
                } else {
                    return false;
                }
            },
            getStatus: function(characteristics) {
                var self = this, status = 0;
                if (!Util._isEmpty(characteristics)) {
                    $.each(characteristics, function(i, item) {
                        if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    });
                }
                return (status == STATUS_ON ? true : false);
            },
            getStatusByRoom: function (macs) {
                var self = this, statusFlag = false;
                if (macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) > -1) {
                            $.each(item.characteristics, function(j, itemSub) {
                                if (itemSub.cid == STATUS_CID) {
                                    if (itemSub.value == STATUS_ON) {
                                        statusFlag = true;
                                        return false;
                                    }

                                }
                            });
                            if (statusFlag) {
                                return false;
                            }
                        }
                    });
                }
                return statusFlag;
            },
            getColor: function (characteristics, tid) {
                return Util.getColor(characteristics, tid);
            },
            editName: function() {
                var self = this;
                self.hideOperate();
                window.onGetBufferForString = this.onGetBufferForString;
                window.onEditRoom = this.onEditRoom;
                window.onEditSaveRoom = this.onEditSaveRoom;
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                    {inputValue: self.roomInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn'),
                    inputValidator: function(val) {
                        if (val === null) {
                          return true;
                        }
                        var key = Util.toGbkBytes(val);
                        if (key.length > 6 || Util._isEmpty($.trim(val))) {
                            return false;
                        } else {
                            return true;
                        }
                      },
                     inputErrorMessage: '名称长度大于0且小于3个中文或6个字符和数字'
                      }).then(function(obj)  {
                    if (self.roomInfo.name != obj.value) {
                        self.newRoomName = obj.value;
                        MINT.Indicator.open();
                        setTimeout(function() {
                            var key = Util.intsToHex(Util.toGbkBytes(obj.value));
                            key = key.join("").toLocaleLowerCase();;
                            if (self.roomExistKeys.indexOf(key) != -1) {
                                MINT.Toast({
                                    message: "房间名称已存在",
                                    position: 'bottom',
                                    duration: 2000
                                });
                                MINT.Indicator.close();
                                //self.editName();
                                return false;
                            } else {
                                MINT.Indicator.open();
                                self.newRoomKey = key;
                                self.delData("onEditRoom");
                            }
                        }, 1000)
                    }

                });

            },
            editRoom: function() {
                var self = this;
                self.hideOperate();
                setTimeout(function() {
                    self.$refs.addRoom.show();
                }, 100)
            },
            delRoom: function() {
                var self = this;
                self.hideOperate();
                MINT.MessageBox.confirm("确定要删除该房间吗？", "删除房间",{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    MINT.Indicator.open();
                    setTimeout(function() {
                        self.delData("onDelRoom");
                    }, 1000)
                })
            },
            delData: function(callback) {
                var self = this;
                var meshData = '{"' + MESH_MAC + '": ' + JSON.stringify(self.roomInfo.macs) +
                        ',"'+DEVICE_IP+'": "' + self.$store.state.deviceIp +'","'+NO_RESPONSE+'": true,"' +
                    MESH_REQUEST + '": "' + REMOVE_GROUP + '","isGroup": false, "group":'+
                    JSON.stringify([self.roomInfo.roomKey])+',"callback": '+callback+'}';
                console.log(meshData);
                espmesh.requestDevicesMulticast(meshData);
            },
            getPosition: function(position) {
                return Util.getPosition(position);
            },
            showDesc: function(position) {
                var flag = false;
                if (!Util._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            close: function (macs, status, roomKey, e, isGroup) {
                Util.addBgClass(e);
                var self = this, meshs = [];
                self.currentStatus = (status == STATUS_ON ? true : false);
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp + '",';
                if (!Util._isEmpty(roomKey)) {
                    data += '"isGroup": '+isGroup+', "group":' + JSON.stringify([roomKey]) + ',';
                }
                data += '"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask(JSON.stringify({"method":"requestDevicesMulticast","argument": data}));
                self.changeDevice(macs, status);
            },
            operateClose: function(macs, status, roomKey, e) {
                var self = this;
                self.close(macs, status, roomKey, e, true);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            changeDevice: function (macs, status) {
                var self = this;
                $.each(self.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(i, item) {
                            if (item.cid == STATUS_CID) {
                                item.value = parseInt(status);
                            }
                            characteristics.push(item);
                        });
                        item.characteristics = characteristics;
                        self.deviceList.splice(i, 1, item);
                    }
                });
                self.$store.commit("setList", self.deviceList);

            },
            onGetBufferForString: function(res) {
                var self = this;
                res = JSON.parse(res);

            },
            onEditRoom: function(res) {
                var self = this;
                if (res != "{}" && !Util._isEmpty(res)) {
                    var delData = {name: ROOM_LIST, keys: [self.roomInfo.roomKey]};
                    espmesh.removeValuesForKeysInFile(JSON.stringify(delData));
                    $.each(self.deviceList, function(i, item) {
                        var groups = item.group,
                            index = groups.indexOf(self.roomInfo.roomKey);
                        if (index != -1) {
                            groups.splice(index, 1);
                            item.group = groups;
                            self.deviceList.splice(i, 1, item);
                        }
                    })
                    var meshData = '{"' + MESH_MAC + '": ' + JSON.stringify(self.roomInfo.macs) +
                        ',"'+DEVICE_IP+'": "' + self.$store.state.deviceIp +'","'+NO_RESPONSE+'": true,"' +
                        MESH_REQUEST + '": "' + SET_GROUP + '","isGroup": false,' +
                        '"group":' + JSON.stringify([self.newRoomKey]) + ', "callback": "onEditSaveRoom"}';
                    console.log(meshData);
                    espmesh.requestDevicesMulticast(meshData);
                } else {
                    MINT.Toast({
                        message: "房间名称修改失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
            onEditSaveRoom: function(res) {
                var self = this;
                if (res != "{}" && !Util._isEmpty(res)) {
                    var data = {name: ROOM_LIST, content: [{key: self.newRoomKey,
                        value: encodeURIComponent(JSON.stringify({name: self.newRoomName,
                        url: self.roomInfo.url, mac: self.roomInfo.macs}))}]};
                    espmesh.saveValuesForKeysInFile(JSON.stringify(data));


                    $.each(self.roomList, function(i, item) {
                        if (item.roomKey == self.roomInfo.roomKey) {
                            self.roomInfo.roomKey = self.newRoomKey;
                            self.roomInfo.name = self.newRoomName;
                            self.roomList.splice(i, 1, self.roomInfo);
                            var macs = self.roomInfo.macs;
                            $.each(self.deviceList, function(i, item) {
                                if (macs.indexOf(item.mac) != -1) {
                                    var groups = item.group;
                                    if (groups.indexOf(self.newRoomKey) == -1) {
                                        groups.push(self.newRoomKey);
                                        item.group = groups;
                                        self.deviceList.splice(i, 1, item);
                                    }
                                }
                            });
                            self.$store.commit("setList", self.deviceList);
                            return false;
                        }
                    })
                    self.active = self.newRoomKey;
                    self.newRoomKey = "";
                    MINT.Indicator.close();
                } else {
                    MINT.Toast({
                        message: "房间名称修改失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
            onDelRoom: function(res) {
                var self = this;
                console.log(res);
                if (res != "{}" && !Util._isEmpty(res)) {
                    var data = {name: ROOM_LIST, keys: [self.roomInfo.roomKey]};
                    espmesh.removeValuesForKeysInFile(JSON.stringify(data));
                    $.each(self.roomList, function(i, item) {
                        if (item.roomKey == self.roomInfo.roomKey) {
                            self.roomList.splice(i, 1);
                            $.each(self.deviceList, function(i, item) {
                                var groups = item.group,
                                    index = groups.indexOf(self.roomInfo.roomKey);
                                if (index != -1) {
                                    groups.splice(index, 1);
                                    item.group = groups;
                                    self.deviceList.splice(i, 1, item);
                                }
                            })
                            self.$store.commit("setList", self.deviceList);
                            return false;
                        }
                    });
                    self.active = "";
                } else {
                    MINT.Toast({
                        message: "删除失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
                MINT.Indicator.close();
            },
            onLoadRoomList: function(res) {
                var self = this;
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
                var list = this.$store.state.roomList;
                $.each(list, function(i, item) {
                    var key = item.key;
                    if (roomKeys.indexOf(key) != -1) {
                        $.each(roomList, function(j, itemSub) {
                            if (key == itemSub.key) {
                                var value = JSON.parse(decodeURIComponent(item.value));
                                var valueSub = JSON.parse(decodeURIComponent(itemSub.value));
                                roomList.splice(j, 1, {key: key,
                                    value: encodeURIComponent(JSON.stringify({name: value.name, url: valueSub.url,
                                    macs: value.macs}))});
                                return false;
                            }
                        })
                    } else {
                        roomList.push(item);
                        roomKeys.push(key);
                    }
                });

                if (roomList.length > 0) {
                    var list = [];
                    $.each(roomList, function(i, item) {
                        var value = JSON.parse(decodeURIComponent(item.value));
                        list.push({roomKey: item.key, name: value.name, url: value.url, macs: value.macs});
                    });
                    var data = {name: ROOM_LIST, content: roomList};
                    espmesh.saveValuesForKeysInFile(JSON.stringify(data));
                    self.setRoomList(list);
                }
            },
            setRoomList: function(list) {
                this.roomList = [], updateObj = '{';
                this.roomList = list;
                $.each(list, function(i, item) {
                    updateObj += '"'+item.roomKey+'":' + JSON.stringify(item.macs) + ",";
                })
                if (this.roomList.length > 0) {
                    updateObj = updateObj.substr(0, updateObj.length - 1);
                    updateObj +='}';
                    console.log(updateObj);
                    espmesh.updateDeviceGroup(updateObj);
                }
                this.roomList.push({roomKey: "create", name: "创建房间", url: "", macs: []});
                if (this.roomList.length > 1 && Util._isEmpty(this.active)) {
                    this.active = this.roomList[0].roomKey;
                }

            },
            getRoomByDevice: function(deviceList) {
                var self = this;
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
                console.log(JSON.stringify(roomList));
                self.$store.commit("setRoomList", roomList);
            },
            onBackRoom: function() {
                var startTime = 0;
                var self = this;
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
            }
        },
        created: function () {
            console.log("created");
        },
        components: {
            "v-footer": footer,
            "v-addRoom": addRoom,
            "v-operateDevice": operateDevice
        }

    });

    return Room;
});