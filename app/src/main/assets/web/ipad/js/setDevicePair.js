define(["vue", "MINT", "Util", "txt!../../pages/setDevicePair.html"],
    function(v, MINT, Util, setDevicePair) {

    var SetDevicePair = v.extend({

        template: setDevicePair,

        data: function(){
            return {
                flag: false,
                pairList: [],
                showFloor: false,
                showArea: false,
                showEdit: false,
                floor: "4F",
                area: "A",
                serialNum: "001",
                oldFloor: "",
                oldArea: "",
                oldCode: "",
                mac: "",
                deviceInfo: "",
                deviceList: [],
                floorArray: ["1F", "2F", "3F", "4F", "5F", "6F","7F", "8F", "9F", "10F", "11F", "12F",
                    "13F", "14F", "15F", "16F"],
                areaArray: ["A", "B", "C", "D", "E", "F","G"],
                slots1:[{values: [], defaultIndex: 0}],
                slots2:[{values: [], defaultIndex: 0}],
            }
        },
        computed: {
            getDeviceInfo: function() {
                if (this.flag) {
                    this.deviceInfo = this.$store.state.deviceInfo;
                    this.initDevice();
                }
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.onBackSetPair();
                self.deviceList = self.$store.state.deviceList;
                self.deviceInfo = self.$store.state.deviceInfo;
                self.getPair();
                self.oldFloor = "";
                self.oldArea = "";
                self.oldCode = "";
                self.mac = "";
                window.onDevicePairSave = self.onDevicePairSave;
                window.onDevicePairEdit = self.onDevicePairEdit;
                self.initDevice();
                self.showFloor = false;
                self.showArea = false;
                self.flag = true;
            },
            initDevice: function() {
                var self = this;
                var position = self.deviceInfo.position;
                if (!Util._isEmpty(position)) {
                    position = position.split("-");
                    self.oldFloor = self.floor = position[0];
                    self.oldArea = self.area = position[1];
                    self.oldCode = self.serialNum = position[2];
                    self.mac = self.deviceInfo.mac;
                    self.showEdit = true;
                } else {
                    self.mac = self.deviceInfo.mac;
                    self.getLastPair(self.pairList);
                    self.showEdit = false;
                }
            },
            hide: function () {
                this.$emit("setDevicePairShow");
                MINT.Indicator.close();
                this.flag = false;
            },
            getPair: function() {
                self.pairLis = this.$store.state.siteList;
            },
            getPosition: function() {
                var self = this;
                if (self.pairList.length > 0) {
                    $.each(self.pairList, function(i, item) {
                        if (self.floorArray.indexOf(item.floor) == -1) {
                            self.floorArray.push(item.floor);
                        }
                        if (self.areaArray.indexOf(item.area) == -1) {
                            self.areaArray.push(item.area);
                        }
                    })
                }
            },
            getLastPair: function(list) {
                var self = this,
                    len = list.length;
                if (len > 0) {
                    var pair = list[len - 1];
                    self.floor = pair.floor;
                    self.area = pair.area;
                    self.serialNum = pair.code;
                    self.getNum();
                } else {
                    len = self.pairList.length;
                    if (len > 0) {
                        var pair = self.pairList[len - 1];
                        var num = pair.code.length,
                            str = "";
                        if (num > 1) {
                            for (var i = 0; i < (num - 1); i++) {
                                str +="0";
                            }
                        }
                        self.serialNum = str + "1";
                    } else {
                        self.serialNum = "001";
                    }

                }
            },
            onBackSetPair: function () {
                window.onBackPressed = this.hide;
            },
            onFloorChange: function(value) {
                this.floor = value;
                if (!this.showEdit) {
                    this.getPairByFloor(value)
                }
            },
            onAreaChange: function(value) {
                this.area = value;
                if (!this.showEdit) {
                    this.getPairByArea(value);
                }
            },
            hideFloor: function() {
                this.showFloor = false;
            },
            hideArea: function() {
                this.showArea = false;
            },
            getPairByFloor: function(floor) {
                var self = this, list = [];
                $.each(self.pairList, function(i, item) {
                    if (item.floor == floor) {
                        list.push(item);
                    }
                });
                self.getLastPair(list);
            },
            getPairByArea: function(area) {
                var self = this, list = [];
                $.each(self.pairList, function(i, item) {
                    if (item.area == area) {
                        list.push(item);
                    }
                });
                self.getLastPair(list);
            },
            savePair: function() {
                var self = this;
                if (Util._isEmpty(self.floor)) {
                    MINT.Toast({
                        message: self.$t('floorDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (Util._isEmpty(self.area)) {
                    MINT.Toast({
                        message: self.$t('areaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (Util._isEmpty(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('codeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isCodeExist(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('existCodeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function(){
                    self.setDevicePosition("onDevicePairSave");
                }, 500);
            },
            setDevicePosition: function(fun) {
                var self = this, flag = false;
                    position = self.floor + "-" + self.area + "-" + self.serialNum,
                    data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                        '"position":"' + position + '", "callback": "'+fun+'"}';
                espmesh.requestDevice(data);
            },
            getNum: function() {
                var self = this,
                    len = self.serialNum.length;
                    num = parseInt(self.serialNum);
                num++;
                if (num <= 9) {
                    var str = "";
                    if (len > 1) {
                        for (var i = 0; i < (len - 1); i++) {
                            str +="0";
                        }
                    }
                    self.serialNum = str + num;
                } else if (num <= 99) {
                    var str = "";
                    if (len > 2) {
                        for (var i = 0; i < (len - 2); i++) {
                            str +="0";
                        }
                    }
                    self.serialNum = str + num;
                } else {
                     self.serialNum = num;
                }
            },
            editPair: function() {
                var self = this;
                if (Util._isEmpty(self.floor)) {
                    MINT.Toast({
                        message: self.$t('floorDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (Util._isEmpty(self.area)) {
                    MINT.Toast({
                        message: self.$t('areaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (Util._isEmpty(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('codeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEditExist(self.serialNum) && self._isCodeExist(self.serialNum)) {
                    MINT.Toast({
                        message: self.$t('existCodeDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function(){
                    self.setDevicePosition("onDevicePairEdit");
                }, 500);
            },
            selectFloor: function() {
                this.showFloor = true;
            },
            selectArea: function() {
                this.showArea = true;
            },
            onDevicePairSave: function(res) {
                var  self = this,
                    position = self.floor + "-" + self.area + "-" + self.serialNum;
                res = JSON.parse(res).result;
                if (res.status_code == 0) {
                    self.deviceInfo.position = position;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.deviceInfo.mac) {
                            self.deviceList.splice(i, 1, self.deviceInfo);
                            return false;
                        }
                    });
                    self.$store.commit("setList", self.deviceList);
                    espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                        "floor": self.floor, "area":  self.area}]));
                    MINT.Toast({
                        message: self.$t('saveSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    self.hide();
                } else {
                    MINT.Toast({
                        message: self.$t('saveFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
                MINT.Indicator.close();

            },
            onDevicePairEdit: function(res) {
                var  self = this,
                    position = self.floor + "-" + self.area + "-" + self.serialNum;
                    console.log(res);
                res = JSON.parse(res).result;
                if (!Util._isEmpty(res) && res.status_code == 0) {
                    self.deviceInfo.position = position;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.deviceInfo.mac) {
                            self.deviceList.splice(i, 1, self.deviceInfo);
                            return false;
                        }
                    });
                    self.$store.commit("setList", self.deviceList);
                    espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                        "floor": self.floor, "area":  self.area}]));
                    MINT.Toast({
                        message: self.$t('editSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    self.hide();
                } else {
                    MINT.Toast({
                        message: self.$t('editFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
                MINT.Indicator.close();
            },
            _isCodeExist: function(code) {
                var self = this, flag = false;
                $.each(self.pairList, function(i, item) {
                    if (item.floor == self.floor && item.area == self.area && item.code == code) {
                        flag = true;
                        return false;
                    }
                })
                return flag;
            },
            _isEditExist: function(code) {
                var self = this, flag = false;
                if (self.floor != self.oldFloor || self.area != self.oldArea || code != self.oldCode) {
                    flag = true;
                }
                return flag;
            }

        },
        components: {

        }

    });
    return SetDevicePair;
});