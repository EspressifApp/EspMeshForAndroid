define(["vue", "MINT", "Common", "Util", "txt!../../pages/pair.html"],
    function(v, MINT, Common, Util, pair) {

        var Pair = v.extend({

            template: pair,

            data: function(){
                return {
                    flag: false,
                    showAdd: false,
                    showEdit: false,
                    pairList: [],
                    floorArray: ["1F", "2F", "3F", "4F", "5F", "6F","7F", "8F", "9F", "10F", "11F", "12F",
                        "13F", "14F", "15F", "16F"],
                    areaArray: ["A", "B", "C", "D", "E", "F","G"],
                    title: "添加",
                    floor: "4F",
                    area: "A",
                    serialNum: "001",
                    mac: "",
                    oldFloor: "",
                    oldArea: "",
                    oldCode: "",
                    oldMac: "",
                    searchName: "",
                    pairInfo: {},
                    deviceList: [],
                    selectMac: ""
                }
            },
            computed: {
                list: function() {
                    var self = this;
                    if (self.flag) {
                        var list = [];
                        var pairList = self.$store.state.siteList;
                        self.pairList = pairList;
                        if (Util._isEmpty(self.searchName)) {
                            $.each(pairList, function(i, item) {
                                var position = item.floor + "-" + item.area + "-" + item.code;
                                item.position = position;
                                list.push(item);
                            })
                            list = Util.sortList(list);
                        } else {
                            var searchList = [];
                            $.each(pairList, function(i, item) {
                                var position = item.floor + "-" + item.area + "-" + item.code;
                                item.position = position;
                                if (item.mac.indexOf(self.searchName) != -1 || position.indexOf(self.searchName) != -1) {
                                    searchList.push(item);
                                }
                            })
                            list = Util.sortList(searchList);
                        }
                        if (pairList.length > 0) {
                            self.showAdd = false;
                        } else {
                            self.showAdd = true;
                        }
                    }
                    return list;
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.onBackPair();
                    self.title = "添加";
                    self.floor = "4F";
                    self.area = "A";
                    self.serialNum = "001";
                    self.mac = "";
                    self.searchName = "";
                    self.pairInfo = {};
                    self.deviceList = self.$store.state.deviceList;
                    self.pairList = self.$store.state.siteList;
                    self.showEdit = false;
                    self.getPair();
                    if (self.pairList.length == 0) {
                        self.showAdd = true;
                    } else {
                        self.showAdd = false;
                    }
                    setTimeout(function() {
                        Util.setStatusBarWhite();
                    }, 200)
                    self.flag = true;
                    window.onSetDevicePosition = this.onSetDevicePosition;
                    window.onQRCodeScanned = this.onQRCodeScanned;
                },
                hide: function () {
                    Util.setStatusBarBlue();
                    MINT.Indicator.close();
                    this.$emit("pairShow");
                    this.flag = false;
                },
                hideInfo: function() {
                    this.pairShow = false;
                    this.pairInfo = "";
                    this.onBackPair();
                },
                removeNode: function() {
                    Common.removeNode('el-select-dropdown')
                },
                selectDevice (item) {
                    var self = this;
                    self.pairInfo = item;
                    self.selectMac = item.mac;
                    self.showEdit = true;
                    self.oldFloor = self.floor = item.floor;
                    self.oldArea = self.area = item.area;
                    self.oldCode = self.serialNum = item.code;
                    self.oldMac = self.mac = item.mac;
                    self.title = "编辑";
                },
                setScanner: function() {
                    espmesh.scanQRCode();
                },
                onQRCodeScanned: function(qr) {
                    var self = this, lastNum = qr.lastIndexOf(":");
                    if (lastNum > -1) {
                        qr = qr.substr((lastNum+1));
                    }
                    if (!Util._isEmpty(qr)) {
                        self.mac = qr;
                    };
                },
                deleteDevice: function(mac) {
                    var macs = [this.pairInfo.mac];
                    if (macs.length > 0) {
                        MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle'),{
                            confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            self.calcelDevice();
                            MINT.Indicator.open();
                            $.each(self.deviceList, function(i,item) {
                                if (macs.indexOf(item.mac) != -1) {
                                    deviceMacs.push(item.mac);
                                }
                            })
                            console.log(JSON.stringify(deviceMacs));
                            setTimeout(function() {
                                self.deletePair(deviceMacs.length > 0, deviceMacs, macs)
                            }, 1000);
                        });
                    } else {
                        MINT.Toast({
                            message: self.$t('selectPairDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }

                },
                onBackPair: function () {
                    this.getPair();
                    window.onBackPressed = this.hide;
                },
                addPair: function () {
                    var self = this;
                    self.pairInfo = {};
                    self.selectMac = "";
                    self.showEdit = false;
                    self.title = "添加";
                    self.getLastPair(self.pairList);
                },
                onFloorChange: function(value) {
                    if (!this.showEdit) {
                        this.getPairByFloor(value)
                    }
                },
                onAreaChange: function(value) {
                    if (!this.showEdit) {
                        this.getPairByArea(value);
                    }
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
                getLastPair: function(list) {
                    var self = this,
                        len = list.length;
                    console.log(list.length);
                    if (len > 0) {
                        var pair = list[len - 1];
                        self.floor = pair.floor;
                        self.area = pair.area;
                        self.serialNum = pair.code;
                        self.mac = "";
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
                getPair: function() {
                    espmesh.loadHWDevices();
                },
                editPair: function() {
                    this.pairShow = false;
                    this.$refs.setPair.show();
                },
                delPair: function() {
                    var self = this, flag = false,
                        mac = self.pairInfo.mac;
                    MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        self.hideInfo();
                        MINT.Indicator.open();
                        $.each(self.deviceList, function(i,item) {
                            if (item.mac == mac) {
                                flag = true;
                                return false;
                            }
                        })
                        setTimeout(function() {
                            self.deletePair(flag, [mac], [mac])
                        }, 1000);
                    });
                },
                deletePair: function(flag, deviceMacs, macs) {
                    var self = this;
                    if (flag) {
                        self.setDevicePosition(deviceMacs, macs);
                    } else {
                        espmesh.deleteHWDevices(JSON.stringify(macs));
                        self.getPair();
                        MINT.Toast({
                            message: self.$t('delSuccessDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                    MINT.Indicator.close();

                    if (self.pairList.length <= 0) {
                        self.showAdd = true;
                    }
                },
                savePair: function() {
                    var self = this, flag = false;
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
                    if (Util._isEmpty(self.mac)) {
                        MINT.Toast({
                            message: self.$t('macDesc'),
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
                    self.mac = self.mac.toLowerCase();
                    if (self._isExist(self.mac)) {
                        MINT.Toast({
                            message: self.$t('existMacDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        return false;
                    }
                    MINT.Indicator.open();
                    $.each(self.deviceList, function(i,item) {
                        if (item.mac == self.mac) {
                            flag = true;
                            return false;
                        }
                    });

                    setTimeout(function(){
                        if (flag) {
                            self.setDevicePosition(self.$t('saveSuccessDesc'), self.$t('saveFailDesc'), "onSetPairPosition");
                        } else {
                            espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                                "floor": self.floor, "area":  self.area}]));
                            MINT.Toast({
                                message: self.$t('saveSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.mac = "";
                            self.getNum();
                        }
                        espmesh.loadHWDevices();
                        MINT.Indicator.close();
                    }, 500);

                },
                setPositionNull: function() {
                    var self = this,
                        data = '{"' + MESH_MAC + '": "' + self.oldMac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                            '"position": "", "callback": "onSetNull"}';
                    console.log(data);
                    espmesh.requestDevice(data);
                },
                setDevicePosition: function(suc, fail, fun) {
                    var self = this, flag = false,
                        position = self.floor + "-" + self.area + "-" + self.serialNum,
                        data = '{"' + MESH_MAC + '": "' + self.mac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                            '"position":"' + position + '", "callback": "'+fun+'", "tag": {"suc": "'+
                            suc+'", "fail": "'+fail+'"}}';
                    espmesh.requestDevice(data);
                },
                onSetPairPosition: function(res) {
                    var self = this;
                    res = JSON.parse(res);
                    var result = res.result;
                    var tag = res.tag;
                    if (result.status_code == 0) {
                        var position = self.floor + "-" + self.area + "-" + self.serialNum;
                        $.each(self.deviceList, function(i, item){
                            if (item.mac == self.mac) {
                                item.position = position;
                                self.deviceList.splice(i, 1, item);
                                return false;
                            }
                        });
                        espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                            "floor": self.floor, "area":  self.area}]));
                        MINT.Toast({
                            message: tag.suc,
                            position: 'bottom',
                            duration: 2000
                        });
                        self.mac = "";
                        self.getNum();
                        self.$store.commit("setList", self.deviceList);
                    } else {
                        MINT.Toast({
                            message: tag.fail,
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                setDevicePosition: function(deviceMacs, macs) {
                    var self = this, flag = false,
                        data = '{"' + MESH_MAC + '": ' + JSON.stringify(deviceMacs) +
                            ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+ MESH_REQUEST + '": "' +
                            SET_POSITION + '",' + '"position":"", "callback": "onSetDevicePosition", "tag": {"deviceMacs": '+
                            JSON.stringify(deviceMacs)+',"macs": '+JSON.stringify(macs)+'}}';
                    console.log(data);
                    espmesh.requestDevicesMulticast(data);

                },
                onSetDevicePosition: function(res) {
                    console.log(res);
                    var self = this;
                    res = JSON.parse(res);
                    var result = res.result;
                    var tag = res.tag;
                    if (result[0].status_code == 0) {
                        $.each(self.deviceList, function(i, item){
                            if (tag.deviceMacs.indexOf(item.mac) != -1) {
                                item.position = "";
                                self.deviceList.splice(i, 1, item);
                            }
                        });
                        espmesh.deleteHWDevices(JSON.stringify(tag.macs));
                        self.getPair();
                        MINT.Toast({
                            message: self.$t('delSuccessDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                        self.$store.commit("setList", self.deviceList);
                    } else {
                        MINT.Toast({
                            message: self.$t('delFailDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                },
                _isExist: function(mac) {
                    var self = this, flag = false;
                    $.each(self.pairList, function(i, item) {
                        if (item.mac == mac) {
                            flag = true;
                            return false;
                        }
                    })
                    return flag;
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
                },
                getNum: function() {
                    var self = this,
                        len = self.serialNum.length,
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
                    var self = this, flag = false;
                    $.each(self.deviceList, function(i,item) {
                        if (item.mac == self.pairInfo.mac) {
                            flag = true;
                            return false;
                        }
                    })
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
                    setTimeout(function() {
                        console.log(self.oldMac);
                        if (!Util._isEmpty(self.oldMac)) {
                            self.oldMac = self.oldMac.toLowerCase();
                            if (self.oldMac != self.mac) {
                                var isFlag = false;
                                $.each(self.deviceList, function(i,item) {
                                    if (item.mac == self.oldMac) {
                                        isFlag = true;
                                        return false;
                                    }
                                });
                                self.setPositionNull();
                            }
                        }
                        if (flag) {
                            self.setDevicePosition(self.$t('editSuccessDesc'), self.$t('editFailDesc'), "onEditPair");
                        } else {
                            espmesh.deleteHWDevices(JSON.stringify([self.pairInfo.mac]));
                            espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                                "floor": self.floor, "area":  self.area}]));
                            MINT.Toast({
                                message: self.$t('editSuccessDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            self.hide();
                        }
                        MINT.Indicator.close();
                    }, 500);

                },
                onSetNull: function(res) {
                    var self = this;
                    res = JSON.parse(res);
                    if (res.result.status_code == 0) {
                        $.each(self.deviceList, function(i, item){
                            if (item.mac == self.oldMac) {
                                item.position = "";
                                self.deviceList.splice(i, 1, item);
                                return false;
                            }
                        });
                        self.$store.commit("setList", self.deviceList);
                    }
                },
                onEditPair: function(res) {
                    var self = this;
                    res = JSON.parse(res);
                    var result = res.result;
                    var tag = res.tag;
                    if (result.status_code == 0) {
                        var position = self.floor + "-" + self.area + "-" + self.serialNum;
                        $.each(self.deviceList, function(i, item){
                            if (item.mac == self.mac) {
                                item.position = position;
                                self.deviceList.splice(i, 1, item);
                                return false;
                            }
                        });
                        espmesh.deleteHWDevices(JSON.stringify([self.pairInfo.mac]));
                        espmesh.saveHWDevices(JSON.stringify([{"mac": self.mac, "code": self.serialNum,
                            "floor": self.floor, "area":  self.area}]));
                        MINT.Toast({
                            message: tag.suc,
                            position: 'bottom',
                            duration: 2000
                        });
                        self.$store.commit("setList", self.deviceList);
                        self.hide();
                    } else {
                        MINT.Toast({
                            message: tag.fail,
                            position: 'bottom',
                            duration: 2000
                        });
                    }

                }
            },
            components: {
            }

        });
        return Pair;
    });