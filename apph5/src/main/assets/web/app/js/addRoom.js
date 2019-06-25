define(["vue","MINT", "Util", "txt!../../pages/addRoom.html" ],
    function(v, MINT, Util, addRoom) {

        var AddRoom = v.extend({

            template: addRoom,
            props: {
                roomInfo: {
                    type: Object
                },
                roomExistKeys: {
                    type: Array
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    roomName: "",
                    newRoomMacs: [],
                    oldRoomMacs: [],
                    addedName: "",
                    notAddName: "",
                    roomKey: "",
                    newRoomKey: "",
                    active: "added",
                    deviceList: [],
                    imageList: [{id: "room5",name: "办公室", url: "room_5.jpg"},
                        {id: "room1",name: "客厅", url: "room_1.jpg"},
                        {id: "room3",name: "厨房", url: "room_3.jpg"},
                        {id: "room8",name: "洗手间", url: "room_8.jpg"},
                        {id: "room7",name: "阳台", url: "room_7.jpg"},
                        {id: "room4",name: "书房", url: "room_4.jpg"},
                        {id: "room6",name: "地下室", url: "room_6.jpg"},
                        {id: "room2",name: "卧室", url: "room_2.jpg"},],
                    imageShow: false,
                    currentImg: "room_5.jpg",
                    isShowDevice: false,
                    isShowAdded: false
                }
            },
            computed: {
                addedList: function() {
                    var self = this, list = [], searchList = [];
                    if (self.addFlag) {
                        var macs = self.newRoomMacs;
                        self.deviceList = self.$store.state.deviceList;
                        if (Util._isEmpty(self.addedName)) {
                            searchList = self.deviceList;
                        } else {
                            $.each(self.deviceList, function(i, item) {
                                if (item.name.indexOf(self.addedName) != -1 || item.position.indexOf(self.addedName) != -1) {
                                    searchList.push(item);
                                }
                            })
                        }
                        $.each(searchList, function(i, item) {
                            if (macs.indexOf(item.mac) != -1) {
                                list.push(item);
                            }
                        })
                    }
                    return list;
                },
                notAddList: function() {
                    var self = this, list = [], searchList = [];
                    if (self.addFlag) {
                        var macs = self.newRoomMacs;
                        self.deviceList = self.$store.state.deviceList;
                        if (Util._isEmpty(self.notAddName)) {
                            searchList = self.deviceList;
                        } else {
                            $.each(self.deviceList, function(i, item) {
                                if (item.name.indexOf(self.notAddName) != -1 || item.position.indexOf(self.notAddName) != -1) {
                                    searchList.push(item);
                                }
                            })
                        }
                        if (!self.isShowAdded) {
                            var notAdds = [];
                            $.each(searchList, function(i, item) {
                                if (Util._isEmpty(item.group) || item.group.length == 0) {
                                    notAdds.push(item);
                                } else if (item.group.length == 1 && !Util._isEmpty(self.roomKey)
                                    && item.group.indexOf(self.roomKey) != -1) {
                                    notAdds.push(item);
                                }
                            })
                            searchList = notAdds;
                        }
                        $.each(searchList, function(i, item) {
                            if (macs.indexOf(item.mac) == -1) {
                                list.push(item);
                            }
                        })
                    }
                    return list;
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    window.onSaveRoom = self.onSaveRoom;
                    window.onGetBufferForString = self.onGetBufferForString;
                    self.newRoomMacs = [];
                    self.oldRoomMacs = [];
                    self.roomKey = "";
                    self.roomName = "";
                    self.currentImg = "room_5.jpg"
                    window.onDelSaveRoom = self.onDelSaveRoom;
                    if (!Util._isEmpty(self.roomInfo)) {
                        self.oldRoomMacs = self.roomInfo.macs;
                        self.roomKey = self.roomInfo.roomKey;
                        self.roomName = self.roomInfo.name;
                        self.currentImg = self.roomInfo.url;
                        self.newRoomMacs = self.newRoomMacs.concat(self.oldRoomMacs);
                    }
                    self.isShowAdded = false;
                    self.addFlag = true;
                },
                hide: function () {
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("addRoomShow");
                    MINT.Indicator.close();
                    espmesh.loadAllValuesInFile(JSON.stringify({name: ROOM_LIST, callback: "onLoadRoomList"}));
                    this.addFlag = false;
                },
                showAdded: function() {
                    this.isShowAdded = !this.isShowAdded;
                },
                showImage: function() {
                    this.imageShow = true;
                },
                hideImage: function() {
                    this.imageShow = false;
                },
                getPosition: function(position) {
                    return Util.getPosition(position);
                },
                getIcon: function (tid) {
                    return Util.getIcon(tid);
                },
                showDesc: function(position) {
                    var flag = false;
                    if (!Util._isEmpty(position)) {
                        flag = true;
                    }
                    return flag;
                },
                showDevice: function() {
                    this.isShowDevice = true;
                    window.onBackPressed = this.hideDevice;
                },
                hideDevice: function() {
                    this.isShowDevice = false;
                    window.onBackPressed = this.hide;
                },
                selectImg: function(url, name) {
                    this.hideImage();
                    this.currentImg = url;
                    if (Util._isEmpty(this.roomName)) {
                        this.roomName = name;
                    }
                },
                addRoomMac: function(mac) {
                    if (this.newRoomMacs.indexOf(mac) == -1) {
                        this.newRoomMacs.push(mac);
                    }
                },
                removeRoomMac: function(mac) {
                    var index = this.newRoomMacs.indexOf(mac);
                    if (index != -1) {
                        this.newRoomMacs.splice(index, 1);
                    }
                },
                saveRoom: function() {
                    var self = this;
                    if(Util._isEmpty(self.roomName)) {
                        MINT.Toast({
                            message: "请输入房间名称",
                            position: 'bottom',
                            duration: 2000
                        });
                        return false;
                    };
                    console.log(Util.toGbkBytes(self.roomName));
                    var key = Util.intsToHex(Util.toGbkBytes(self.roomName));
                    console.log(JSON.stringify(key));
                    if (key.length > 6) {
                        MINT.Toast({
                            message: "房间名称过长，请小于3个中文或6个字符和数字",
                            position: 'bottom',
                            duration: 2000
                        });
                        return false;
                    }
                    MINT.Indicator.open();
                    key = key.join("").toLocaleLowerCase();
                    if (Util._isEmpty(self.roomKey)) {
                        if (self.roomExistKeys.indexOf(key) != -1) {
                            MINT.Toast({
                                message: "房间名称已存在",
                                position: 'bottom',
                                duration: 2000
                            });
                            return false;
                        } else {
                            self.roomKey = key;
                            self.setRoom(self.newRoomMacs);
                        }
                    } else {
                        self.newRoomKey = key;
                        self.delData(self.oldRoomMacs, "onDelSaveRoom");
                    }
                },
                setRoom: function(roomMacs) {
                    var self = this;
                    if (roomMacs.length > 0) {
                        MINT.Indicator.open();
                        var meshData = '{"' + MESH_MAC + '": ' + JSON.stringify(roomMacs) +
                            ',"'+DEVICE_IP+'": "' + self.$store.state.deviceIp +'","'+NO_RESPONSE+'": true,"' +
                            MESH_REQUEST + '": "' + SET_GROUP + '","isGroup": false,' +
                            '"group":' + JSON.stringify([self.roomKey]) + ', "callback": "onSaveRoom"}';
                        setTimeout(function() {
                            espmesh.requestDevicesMulticast(meshData);
                        }, 2000)
                    } else {
                        var data = {name: ROOM_LIST, content: [{key: self.roomKey,
                            value: encodeURIComponent(JSON.stringify({name: self.roomName, url: self.currentImg,
                            mac: roomMacs}))}]};
                        setTimeout(function() {
                            espmesh.saveValuesForKeysInFile(JSON.stringify(data));
                            MINT.Indicator.close();
                            self.hide();
                        }, 2000)
                    }
                },
                delData: function(roomMacs, callback) {
                    var self = this;
                    var meshData = '{"' + MESH_MAC + '": ' + JSON.stringify(roomMacs) +
                            ',"'+DEVICE_IP+'": "' + self.$store.state.deviceIp +'","'+NO_RESPONSE+'": true,"' +
                        MESH_REQUEST + '": "' + REMOVE_GROUP + '","isGroup": false, "group":'+
                        JSON.stringify([self.roomInfo.roomKey])+',"callback": '+callback+'}';
                    console.log(meshData);
                    espmesh.requestDevicesMulticast(meshData);
                },
                onDelSaveRoom: function(res) {
                    var self = this;
                    console.log(res);
                    if (res != "{}" && !Util._isEmpty(res)) {
                        var delData = {name: ROOM_LIST, keys: [self.roomKey]};
                        espmesh.removeValuesForKeysInFile(JSON.stringify(delData));
                        $.each(self.deviceList, function(i, item) {
                            var groups = item.group,
                                index = groups.indexOf(self.roomKey);
                            if (index != -1) {
                                groups.splice(index, 1);
                                item.group = groups;
                                self.deviceList.splice(i, 1, item);
                            }
                        })
                        self.$store.commit("setList", self.deviceList);
                        self.roomKey = self.newRoomKey;
                        self.setRoom(self.newRoomMacs);
                    } else {
                        MINT.Toast({
                            message: "房间编辑失败",
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                onSaveRoom: function(res) {
                    var self = this;
                    var list = this.$store.state.roomList;
                    if(res != "{}" && !Util._isEmpty(res)) {
                        var data = {name: ROOM_LIST, content: [{key: self.roomKey,
                            value: encodeURIComponent(JSON.stringify({name: self.roomName, url: self.currentImg,
                            macs: self.newRoomMacs}))}]};
                        espmesh.saveValuesForKeysInFile(JSON.stringify(data));
                        $.each(self.deviceList, function(i, item) {
                            if (self.newRoomMacs.indexOf(item.mac) != -1) {
                                var groups = item.group;
                                if (groups.indexOf(self.roomKey) == -1) {
                                    groups.push(self.roomKey);
                                    item.group = groups;
                                    self.deviceList.splice(i, 1, item);
                                }
                            }
                        });
                        self.$store.commit("setList", self.deviceList);
                        setTimeout(function() {
                            MINT.Indicator.close();
                            self.$parent.active = "";
                            setTimeout(function() {
                                self.$parent.active = self.roomKey;
                            }, 500);
                            self.hide();
                        }, 1000)
                    }
                },
            }

        });
        return AddRoom;
    });