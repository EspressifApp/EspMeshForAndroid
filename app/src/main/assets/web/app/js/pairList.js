define(["vue", "MINT", "Util", "txt!../../pages/pairList.html"],
    function(v, MINT, Util, pairList) {

    var PairList = v.extend({

        template: pairList,

        data: function(){
            return {
                flag: false,
                showEdit: false,
                pairList: [],
                pairShow: false,
                deviceList: [],
                pairId: "",
                selected: "1"
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.onBackPair();
                self.deviceList = self.$store.state.deviceList;
                self.getPair();
                self.showEdit = false;
                self.pairId = "";
                self.selected = "1";
                window.onQRCodeScanned = self.onQRCodeScanned;
                window.onDelPair = self.onDelPair;
                window.onSavePair = self.onSavePair;
                window.onUpdatePair = self.onUpdatePair;
                self.flag = true;
            },
            hide: function () {
                this.$emit("pairListShow");
                this.flag = false;
            },
            editFun: function() {
                this.showEdit = true;
            },
            cancelFun: function() {
                this.showEdit = false;
            },
            onBackPair: function () {
                window.onBackPressed = this.hide;
            },
            getPair: function() {
                var self = this;
                    pairs = espmesh.loadHWDevices();
                if (!Util._isEmpty(pairs)) {
                    self.pairList = JSON.parse(pairs);
                }
                self.$store.commit("setSiteList", self.pairList);
            },
            setScanner: function(id) {
                this.pairId = id;
                espmesh.scanQRCode();
            },
            getMac: function(id) {
                var self = this, mac = "";
                $.each(self.pairList, function(i, item) {
                    var position = item.floor + "-" + item.area + "-" + parseInt(item.code);
                    if (position == id) {
                        mac = item.mac;
                        return false;
                    }
                })
                return mac;
            },
            editPair: function(mac, oldMac, position) {
                var self = this, oldFlag = false, flag = false;
                if (self._isExist(mac)) {
                    MINT.Toast({
                        message: self.$t('existMacDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + self.pairId).val(oldMac);
                    return false;
                }
                $.each(self.deviceList, function(i,item) {
                    if (item.mac == oldMac) {
                        oldFlag = true;
                        return false;
                    }
                });
                $.each(self.deviceList, function(i,item) {
                    if (item.mac == mac) {
                        flag = true;
                        return false;
                    }
                });
                if (oldFlag) {
                    self.setDevicePosition(oldMac, position, "", "", "onUpdatePair", mac);
                } else {
                    espmesh.deleteHWDevice(oldMac);
                    self.savePair(mac, oldMac, position);
                }
            },
            savePair: function(mac, oldMac, position) {
                var self = this, flag = false;
                if (Util._isEmpty(mac)) {
                    MINT.Toast({
                        message: self.$t('macDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + self.pairId).val(oldMac);
                    return false;
                }
                if (self._isExist(mac)) {
                    MINT.Toast({
                        message: self.$t('existMacDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + self.pairId).val(oldMac);
                    return false;
                }
                MINT.Indicator.open();
                $.each(self.deviceList, function(i,item) {
                    if (item.mac == mac) {
                        flag = true;
                        return false;
                    }
                })
                setTimeout(function(){
                    var positions = position.split("-");
                    if (flag) {
                        self.setDevicePosition(mac, position, "", "", "onSavePair", oldMac);

                    } else {
                        espmesh.saveHWDevice(mac, positions[2], positions[0], positions[1]);
                        MINT.Toast({
                            message: self.$t('saveSuccessDesc'),
                            position: 'bottom',
                            duration: 2000
                        });
                    }
                    var pairs = espmesh.loadHWDevices();
                    if (!Util._isEmpty(pairs)) {
                        self.pairList = JSON.parse(pairs);
                    }
                    self.onBackPair();
                    MINT.Indicator.close();
                }, 500);

            },
            delPair: function(id) {
                var self = this, flag = false,
                    mac = $("#" + id).val();
                if (!Util._isEmpty(mac)) {
                    MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle')).then(function(action) {
                        MINT.Indicator.open();
                        $.each(self.deviceList, function(i,item) {
                            if (item.mac == mac) {
                                flag = true;
                                return false;
                            }
                        })
                        setTimeout(function() {
                            if (flag) {
                                self.setDevicePosition(mac, "", self.$t('delSuccessDesc'),
                                    self.$t('delFailDesc'), "onDelPair");

                            } else {
                                espmesh.deleteHWDevice(mac);
                                MINT.Toast({
                                    message: self.$t('delSuccessDesc'),
                                    position: 'bottom',
                                    duration: 2000
                                });
                                $("#" + id).val("");
                            }
                            var pairs = espmesh.loadHWDevices();
                            if (!Util._isEmpty(pairs)) {
                                self.pairList = JSON.parse(pairs);
                            }
                            MINT.Indicator.close();
                        }, 1000);
                    });
                }

            },
            setDevicePosition: function(mac, position, suc, fail, fun, oldMac) {
                var self = this, flag = false,
                    data = '{"' + MESH_MAC + '": "' + mac + '","' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                            '"position":"' + position + '", "callback": '+fun+', "tag": {"suc": "'+suc+
                            '", "fail": "'+fail+'", "position": "'+position+'", "mac": "'+mac+'", "oldMac": "'+oldMac+'"}}';
                espmesh.requestDeviceAsync(data);
            },
            onDelPair: function(res) {
                res = JSON.parse(res);
                var result = res.result;
                var tag = res.tag;
                if (result.status_code == 0) {
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == tag.mac) {
                            item.position = tag.position;
                            self.deviceList.splice(i, 1, item);
                            return false;
                        }
                    });
                    self.$store.commit("setList", self.deviceList);
                    espmesh.deleteHWDevice(mac);
                    MINT.Toast({
                        message: self.$t('delSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + id).val("");
                } else {
                    MINT.Toast({
                        message: self.$t('delFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }

            },
            onSavePair: function(res) {
                res = JSON.parse(res);
                var result = res.result;
                var tag = res.tag;
                if (result.status_code == 0) {
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == tag.mac) {
                            item.position = tag.position;
                            self.deviceList.splice(i, 1, item);
                            return false;
                        }
                    });
                    self.$store.commit("setList", self.deviceList);
                    var positions = position.split("-");
                    espmesh.saveHWDevice(mac, positions[2], positions[0], positions[1]);
                    MINT.Toast({
                        message: self.$t('saveSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });

                } else {
                    MINT.Toast({
                        message: self.$t('saveFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + self.pairId).val(tag.oldMac);
                }
            },
            onUpdatePair: function(res) {
                res = JSON.parse(res);
                var result = res.result;
                var tag = res.tag;
                if (result.status_code == 0) {
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == tag.mac) {
                            item.position = tag.position;
                            self.deviceList.splice(i, 1, item);
                            return false;
                        }
                    });
                    self.$store.commit("setList", self.deviceList);
                    espmesh.deleteHWDevice(tag.oldMac);
                    self.savePair(tag.mac, tag.oldMac, tag.position);
                } else {
                    MINT.Toast({
                        message: self.$t('saveFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    $("#" + self.pairId).val(tag.oldMac);
                    return false;
                }
            },
            onQRCodeScanned: function(qr) {
                var self = this, flag = false, lastNum = qr.lastIndexOf(":");
                    mac = $("#" + self.pairId).val();
                self.deviceList = self.$store.state.deviceList;
                if (lastNum > -1) {
                    qr = qr.substr((lastNum+1));
                }
                if (!Util._isEmpty(mac)) {
                    $("#" + self.pairId).val(qr);
                    self.editPair(qr, mac, self.pairId);
                } else if (!Util._isEmpty(qr)) {
                    $("#" + self.pairId).val(qr);
                    self.savePair(qr, mac, self.pairId);
                };
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
        },
        components: {
        }

    });
    return PairList;
});