define(["vue", "MINT", "Util", "txt!../../pages/setLightPair.html"],
    function(v, MINT, Util, setLightPair) {

        var SetLightPair = v.extend({
            template: setLightPair,

            data: function(){
                return {
                    flag: false,
                    showSave: false,
                    hostUrl: "http://192.168.11.150:8080/testDemo/",
                    isExistPosition: [],
                    lightList: [],
                    roomList: [],
                    position: "",
                    deviceType: "",
                    mac: "",
                }
            },
            computed: {
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onGetLightList = self.onGetLightList;
                    window.onGetRoomList = self.onGetRoomList;
                    window.onSavePosition = self.onSavePosition;
                    window.onBackPressed = self.hide;
                    MINT.Indicator.open();
                    setTimeout(function() {
                        self.getLightList();
                        self.getRoomList();
                    }, 500)
                    self.flag = true;
                },
                hide: function () {
                    this.$emit("officeShow");
                    this.flag = false;
                },
                savePosition: function() {

                },
                getLightList: function() {
                    var data = {
                        "url": this.hostUrl + "light/list", // 必需
                        "method": "GET",
                        "callback": "onGetLightList"
                    }
                    espmesh.httpRequest(JSON.stringify(data));
                },
                getRoomList: function() {
                    var data = {
                        "url": this.hostUrl + "room/list", // 必需
                        "method":"GET",
                        "callback": "onGetRoomList"
                    }
                    espmesh.httpRequest(JSON.stringify(data));
                },
                cancelSave: function() {
                    this.showSave = false;
                },
                getSerial: function(str) {
                    return this.getSerial202(str)
                },
                getSerial202 (str) {
                    var item = constant_202
                    switch (str) {
                        case 'light-A-1': return item.SERIALNUMBER_2F_202_A1;
                        case 'light-B-1': return item.SERIALNUMBER_2F_202_B1;
                        case 'light-C-1': return item.SERIALNUMBER_2F_202_C1;
                        case 'light-C-2': return item.SERIALNUMBER_2F_202_C2;
                        case 'light-C-3': return item.SERIALNUMBER_2F_202_C3;
                        case 'light-D-1': return item.SERIALNUMBER_2F_202_D1;
                        case 'light-1': return item.SERIALNUMBER_2F_202_A2;
                        case 'light-27': return item.SERIALNUMBER_2F_202_A5;
                        case 'light-28': return item.SERIALNUMBER_2F_202_A6;
                        case 'light-29': return item.SERIALNUMBER_2F_202_A7;
                        case 'light-30': return item.SERIALNUMBER_2F_202_A8;
                        case 'light-2': return item.SERIALNUMBER_2F_202_A3;
                        case 'light-31': return item.SERIALNUMBER_2F_202_A9;
                        case 'light-32': return item.SERIALNUMBER_2F_202_A10;
                        case 'light-33': return item.SERIALNUMBER_2F_202_A11;
                        case 'light-3': return item.SERIALNUMBER_2F_202_A4;
                        case 'light-34': return item.SERIALNUMBER_2F_202_A12;
                        case 'light-35': return item.SERIALNUMBER_2F_202_A13;
                        case 'light-36': return item.SERIALNUMBER_2F_202_A14;
                        case 'light-4': return item.SERIALNUMBER_2F_202_B2;
                        case 'light-37': return item.SERIALNUMBER_2F_202_B9;
                        case 'light-5': return item.SERIALNUMBER_2F_202_B3;
                        case 'light-38': return item.SERIALNUMBER_2F_202_B10;
                        case 'light-39': return item.SERIALNUMBER_2F_202_B11;
                        case 'light-40': return item.SERIALNUMBER_2F_202_B12;
                        case 'light-41': return item.SERIALNUMBER_2F_202_B13;
                        case 'light-6': return item.SERIALNUMBER_2F_202_B4;
                        case 'light-42': return item.SERIALNUMBER_2F_202_B14;
                        case 'light-7': return item.SERIALNUMBER_2F_202_B5;
                        case 'light-43': return item.SERIALNUMBER_2F_202_B15;
                        case 'light-8': return item.SERIALNUMBER_2F_202_B6;
                        case 'light-9': return item.SERIALNUMBER_2F_202_B7;
                        case 'light-10': return item.SERIALNUMBER_2F_202_C10;
                        case 'light-11': return item.SERIALNUMBER_2F_202_C10;
                        case 'light-12': return item.SERIALNUMBER_2F_202_C11;
                        case 'light-14': return item.SERIALNUMBER_2F_202_C11;
                        case 'light-15': return item.SERIALNUMBER_2F_202_C12;
                        case 'light-16': return item.SERIALNUMBER_2F_202_C12;
                        case 'light-17': return item.SERIALNUMBER_2F_202_C13;
                        case 'light-18': return item.SERIALNUMBER_2F_202_C13;
                        case 'light-19': return item.SERIALNUMBER_2F_202_C14;
                        case 'light-20': return item.SERIALNUMBER_2F_202_C14;
                        case 'light-21': return item.SERIALNUMBER_2F_202_C15;
                        case 'light-22': return item.SERIALNUMBER_2F_202_D2;
                        case 'light-44': return item.SERIALNUMBER_2F_202_D7;
                        case 'light-23': return item.SERIALNUMBER_2F_202_D3;
                        case 'light-45': return item.SERIALNUMBER_2F_202_D8;
                        case 'light-46': return item.SERIALNUMBER_2F_202_D9;
                        case 'light-47': return item.SERIALNUMBER_2F_202_D10;
                        case 'light-24': return item.SERIALNUMBER_2F_202_D4;
                        case 'light-48': return item.SERIALNUMBER_2F_202_D11;
                        case 'light-49': return item.SERIALNUMBER_2F_202_D12;
                        case 'light-25': return item.SERIALNUMBER_2F_202_D5;
                        case 'light-26': return item.SERIALNUMBER_2F_202_D6;
                        case 'light-50': return item.SERIALNUMBER_2F_202_D13;
                        case 'light-51': return item.SERIALNUMBER_2F_202_D14;
                        case 'light-52': return item.SERIALNUMBER_2F_202_D15;
                        case 'light-53': return item.SERIALNUMBER_2F_202_D16;
                        case 'light-54': return item.SERIALNUMBER_2F_202_D17;
                        case 'light-55': return item.SERIALNUMBER_2F_202_D18;
                    }
                },
                getRoomName (id) {
                    return ""
                },
                getKeys: function(position) {
                },
                isExist: function (position) {
                    if (this.isExistPosition.indexOf(position) !== -1) {
                        return true
                    }
                    return false
                },
                editPosition: function (position, type, id) {
                    var self = this;
                    self.mac = '';
                    if (!Util._isEmpty(type) && type === 'sensor') {
                        self.mac = self.getMac(this, id);
                        self.deviceType = type;
                        self.roomId = id;
                        self.position = self.getRoomName(id);
                    } else {
                        if (self.isExistPosition.indexOf(position) !== -1) {
                            for (var i = 0; i < self.lightList.length; i++) {
                                var item = self.lightList[i];
                                if (item.position === position) {
                                  self.mac = item.mac;
                                  break
                                }
                            }
                        }
                        self.position = position;
                        self.deviceType = '';
                        self.roomId = '';
                    }
                    self.showSave = true;
                },
                savePosition () {
                    const self = this
                    if (Util._isEmpty(self.mac)) {
                        Util.toast(MINT, self.$t('请输入MAC地址'));
                        return false
                    }
                    var url = self.hostUrl + 'light/savePosition?'
                    if (self.deviceType === 'sensor') {
                        roomId = '202'
                        url = self.hostUrl + 'light/saveSensorPosition?roomId=202'
                    }
                    MINT.Indicator.open();
                    var data = {
                        url: url + "position=" + self.position + "&mac=" + self.mac + "&roomType=202",
                        method: "POST",
                        callback: "onSavePosition",
                        headers: {
                            "Content-Type":"application/x-www-form-urlencoded"
                        }
                    }
                    espmesh.httpRequest(JSON.stringify(data));
                },
                getMac( id) {
                    var roomList = self.roomList;
                    var mac = '';
                    for (var i = 0; i < self.roomList.length; i++) {
                        var item = self.roomList[i];
                        if (item.roomId === id) {
                            mac = item.mac;
                            break;
                        }
                    }
                    return mac;
                },
                getRoomName (id) {
                    const self = this;
                    var roomName = "";
                    for (var i = 0; i < self.roomList.length; i++) {
                      var item = self.roomList[i];
                      if (item.roomId === id) {
                        roomName = item.roomName;
                        break;
                      }
                    }
                    return roomName;
                },
                getSerialGroup: function(num) {
                    if (num <= 2) {
                        return constant_202.SERIALNUMBER_2F_202_C4;
                    } else if (num <= 4) {
                        return constant_202.SERIALNUMBER_2F_202_C5;
                    } else if (num <= 6) {
                        return constant_202.SERIALNUMBER_2F_202_C6;
                    } else if (num <= 8) {
                        return constant_202.SERIALNUMBER_2F_202_C7;
                    } else if (num <= 10) {
                        return constant_202.SERIALNUMBER_2F_202_C8;
                    } else if (num <= 12) {
                        return constant_202.SERIALNUMBER_2F_202_C9;
                    }
                },
                getExistPosition (list) {
                    var self= this;
                    self.isExistPosition = []
                    list.forEach(function(item) {
                        var position = item.position;
                        if (!Util._isEmpty(item.mac) && !Util._isEmpty(position) &&
                         self.isExistPosition.indexOf(position) == -1) {
                          if (item.tid >= MIN_SENSOR && item.tid < MAX_SENSOR) {
                            position = position.split('-')[1]
                          }
                          self.isExistPosition.push(position)
                        }
                    })
                },
                onGetLightList: function(res) {
                    const self = this;
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        var data = Util.Base64.decode(res.content);
                        console.log(data)
                        data = JSON.parse(data);
                        this.lightList = data.result.list;
                        this.getExistPosition(this.lightList);
                    }
                },
                onGetRoomList: function(res) {
                    const self = this;
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        var data = Util.Base64.decode(res.content);
                        console.log(data)
                        data = JSON.parse(data);
                        self.roomList = data.result.list;
                    }
                },
                onSavePosition: function(res) {
                    console.log(res)
                    var self = this;
                    MINT.Indicator.close();
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        var data = Util.Base64.decode(res.content);
                        console.log(data)
                        data = JSON.parse(data);
                        if (data.code === 200) {
                          self.lightList = data.result.list;
                          self.getExistPosition(self.lightList)
                        }
                        Util.toast(MINT, self.$t('保存成功'));
                        if (self.deviceType === 'sensor') {
                          self.getRoomList()
                        }
                        self.cancelSave()
                    } else {
                        Util.toast(MINT, self.$t('保存失败'));
                    }
                }
            },
            created: function () {
            },
            components: {
            }

        });
        return SetLightPair;
    });