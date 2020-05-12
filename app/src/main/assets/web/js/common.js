define(function(){
    var that = "";
    var MINT = "";
    var Util = "";
    var Common = {
        registerMint: function(mint, util) {
            MINT = mint;
            Util = util
        },
        // 设置分页
        setPages: function(self, list, id) {
            var height = self.$store.state.winHeight;
            var num = Math.floor((height / 90)) * 3;
            if (parseInt(num) == 0) {
                num = 9;
            }
            self.pageSize = num;
            var pages = Math.ceil(list.length / num);
            if (pages == 0) {
                pages = 1;
            }
            console.log(pages)
            self.pages = pages;
            self.$store.commit("setPages", pages)
            self.$store.commit("setPageSize", num)
        },
        showPages: function(self, index, i) {
            if ((index < self.pageSize * i && (i > 1 && index >= self.pageSize * (i - 1))) ||
                (index < self.pageSize * i && (i == 1 && index >= self.pageSize * (i - 1)))) {
                return true;
            }
            if (self.pageSize == 0) {
                return true;
            }
            return false;
        },
        // 判断设备是否为mesh 灯
        isLigth: function (tid) {
            if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                return true;
            } else {
                return false;
            }
        },
        // 判断设备是否为传感器
        isSensor: function (tid, characteristics) {
            if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                var temperature = false, humidity = false, luminance = false;
                if (!Util._isEmpty(characteristics)) {
                    $.each(characteristics, function(i, item) {
                        if (item.cid == SENSOR_TEMPERATURE_CID && item.name == SENSOR_TEMPERATURE_NAME) {
                            temperature = true;
                        } else if (item.cid == SENSOR_HUMIDITY_CID && item.name == SENSOR_HUMIDITY_NAME) {
                            humidity = true;
                        } else if (item.cid == SENSOR_LUMINANCE_CID && item.name == SENSOR_LUMINANCE_NAME) {
                            luminance = true;
                        }
                    });
                }
                if (temperature && humidity && luminance) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        //
        getSensorTemperature: function(characteristics) {
            var temperature = 0;
            if (!Util._isEmpty(characteristics)) {
                $.each(characteristics, function(i, item) {
                    if (item.cid == SENSOR_TEMPERATURE_CID && item.name == SENSOR_TEMPERATURE_NAME) {
                        temperature = item.value;
                    }
                });
            }
            return temperature;
        },
        getSensorHumidity: function(characteristics) {
            var humidity = 0;
            if (!Util._isEmpty(characteristics)) {
                $.each(characteristics, function(i, item) {
                    if (item.cid == SENSOR_HUMIDITY_CID && item.name == SENSOR_HUMIDITY_NAME) {
                        humidity = item.value;
                        return false;
                    }
                });
            }
            return humidity;
        },
        getSensorLuminance: function(characteristics) {
            var luminance = 0;
            if (!Util._isEmpty(characteristics)) {
                $.each(characteristics, function(i, item) {
                    if (item.cid == SENSOR_LUMINANCE_CID && item.name == SENSOR_LUMINANCE_NAME) {
                        luminance = item.value;
                        return false;
                    }
                });
            }
            return luminance;
        },
        conReload: function(self) {
            var currentThis = this;
            self.showAdd = false;
            self.hideTrue = true;
            self.$refs.remind.hide();
            self.$store.commit("setShowScanBle", true);
            if (self.deviceList.length <= 0) {
                currentThis.stopBleScan();
                self.loadDesc = self.$t('loadCon');
                if (!self.loadShow) {
                    self.showLoad();
                    setTimeout(function() {
                        self.loadShow = false;
                    }, 110);

                }
            }
            setTimeout(function() {
                self.hideLoad();
                if (self.deviceList.length <= 0) {
                    Util.toast(MINT, self.$t('pullDownDesc'))
                };
                if (self.$store.state.showScanBle) {
                    self.onBackIndex();
                }
            }, 20000);
            setTimeout(function() {
                currentThis.stopBleScan();
            });
        },
        // 扫描已配网的设备信息
        reload: function(self) {
            that = self
            var currThis = this;
            setTimeout(function(){
                if (!self.wifiFlag) {
                    currThis.stopBleScan();
                }
                self.showLoad();
                self.$store.commit("setList", []);
                self.loadList = [];
                espmesh.scanDevicesAsync();
            }, 50);
        },
        onDeviceScanned: function(self, devices) {
           var currThis = this;
           self.deviceList = self.$store.state.deviceList;
           if (!Util._isEmpty(devices)) {
               devices = JSON.parse(devices);
               if(devices.length > 0) {
                   self.showAdd = false;
                   var macs = [];
                   $.each(self.deviceList, function(i, item){
                       if (macs.indexOf(item.mac) == -1) {
                           macs.push(item.mac);
                       }
                   })
                   var flag = true;
                   $.each(devices, function(j, item) {
                       if (macs.indexOf(item.mac) == -1) {
                           devices.push(item);
                       }
                   });
                   self.deviceList = devices;
               }
           }
           if (self.deviceList.length <= 0) {
               self.showAdd = true;
               Util.toast(MINT, self.$t('notLoadDesc'))
           }
           self.deviceList = Util.uniqeByKeys(self.deviceList, ["mac"]);
           self.loadShow = false;
           self.pullLoad = false;
           self.hideLoad();
           self.$store.commit("setList", self.deviceList);
           setTimeout(function() {
               if (devices.length > 0) {
                    self.setGroup()
                    self.setPairs();
                    self.listMacs = [];
               }
               if (self.$store.state.showScanBle) {
                   self.startBleScan();
                   self.onBackIndex(self);
                   self.wifiFlag = false;
               }
           }, 1000)
           self.$refs.loadmore.onTopLoaded();

        },
        // 扫描已配网设备过程中的回调
        onDeviceScanning: function(self, devices) {
            var macs = [];
            if (!Util._isEmpty(devices)) {
                devices = JSON.parse(devices);
                self.deviceList = self.$store.state.deviceList;
                $.each(self.deviceList, function(i,item){
                    macs.push(item.mac);
                });
                $.each(devices, function(i, item) {
                    if (macs.indexOf(item.mac) < 0) {
                        self.deviceList.push(item);
                    }
                });
                if (self.deviceList.length > 0) {
                    self.$store.commit("setDeviceIp", self.deviceList[0].host);
                }
           }
           self.$store.commit("setList", self.deviceList);
        },
        onDeviceFound: function (self, device) {
            if (Util._isEmpty(self.deviceList)) {
                self.deviceList = [];
            }
            if (!Util._isEmpty(device) && !self.loadShow) {
                device = JSON.parse(device);
                var isExist = true;
                if (self.temporaryAddList.length == 0) {
                    setTimeout(function() {
                        var num = self.temporaryAddList.length,
                            macs = [];
                        if (num != 0) {
                            if (!Util._isEmpty(device.position)) {
                                device.position = ''
                            }
                            var onLine = self.$t('deviceOnline'),
                                onLineText = Util.getPOrN(device.position, device.name);
                            self.showAdd = false;
                            if (!Util._isEmpty(INSTANCE_TOAST)) {
                                INSTANCE_TOAST.close();
                            }
                            if (num > 1) {
                                onLine = self.$t('deviceOnlineNum');
                                onLineText = num;
                            }
                            INSTANCE_TOAST = Util.toast(MINT, onLine + ":" + onLineText)
                            self.deviceList = self.$store.state.deviceList;
                            $.each(self.deviceList, function(i, item) {
                                macs.push(item.mac);
                            })
                            $.each(self.temporaryAddList, function(i, item) {
                                if (macs.indexOf(item.macs) == -1) {
                                    self.deviceList.push(item);
                                }
                            })
                            self.deviceList = Util.uniqeByKeys(self.deviceList, ["mac"]);
                            if (self.deviceList.length > 0) {
                                self.$store.commit("setDeviceIp", self.deviceList[0].host);
                            }
                            self.$store.commit("setList", self.deviceList);
                            self.temporaryAddList = [];
                            self.clearListMacs();
                            self.setGroup();
                        }
                    }, 4000);
                }
                $.each(self.deviceList, function(i, item) {
                    if (item.mac == device.mac) {
                        isExist = false;
                    }
                });
                if (isExist) {
                    device = self.setPair(device);
                    self.temporaryAddList.push(device);
                }
            }

        },
        onDeviceLost: function (self, mac) {
            if (!Util._isEmpty(mac) && !self.loadShow) {
                if (self.temporaryDelList.length == 0) {
                    setTimeout(function() {
                        var num = self.temporaryDelList.length;
                        if (num != 0) {
                            var item = {};
                            for (var i = self.deviceList.length - 1; i >= 0; i--) {
                                var obj = self.deviceList[i];
                                if (self.temporaryDelList.indexOf(obj.mac) != -1) {
                                    item = obj;
                                    self.deviceList.splice(i, 1);
                                }
                            }
                            if (self.deviceList.length <= 0) {
                                self.showAdd = true;
                            }
                            var offLine = self.$t('deviceOffline'),
                                offLineText = Util.getPOrN(item.position, item.name);
                            if (!Util._isEmpty(INSTANCE_TOAST)) {
                                INSTANCE_TOAST.close();
                            }
                            if (num > 1) {
                                offLine = self.$t('deviceOfflineNum');
                                offLineText = num;
                            }
                            INSTANCE_TOAST = Util.toast(MINT, offLine + ":" + offLineText)
                            self.$store.commit("setList", self.deviceList);
                            self.temporaryDelList = [];
                            self.setGroup();
                        }
                    }, 3000);
                }
                self.temporaryDelList.push(mac);
                self.clearListMacs();
            }
        },
        onDeviceStatusChanged: function (self, item) {
            var self = this,
                hueValue = 0,
                saturation = 0,
                luminance = 0;
            if (!Util._isEmpty(item)) {
                item = JSON.parse(item);
                var mac = item.mac,
                    characteristics = item.characteristics;
                $.each(self.deviceList, function(i, itemSub) {
                    if (itemSub.mac == mac) {
                        self.deviceList.splice(i, 1);
                        itemSub.characteristics = characteristics;
                        self.deviceList.push(itemSub);
                        return false;
                    }
                })
                self.$store.commit("setList", self.deviceList);
            }
        },
        // 获取设备状态
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
        // 关闭/打开电灯
        close: function (self, mac, status) {
            var meshs = [], deviceStatus = 0, position = 0;
            $.each(self.deviceList, function(i, item){
                if (item.mac == mac) {
                    self.deviceList.splice(i, 1);
                    position = i;
                    self.deviceInfo = item;
                    return false;
                }
            });
            var characteristics = [];
            $.each(self.deviceInfo.characteristics, function(i, item) {
                if (item.cid == STATUS_CID) {
                    deviceStatus = item.value;
                    item.value = parseInt(status);
                }
                characteristics.push(item);
            });
            if (!deviceStatus == status) {
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                    '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                self.deviceInfo.characteristics = characteristics;
                self.deviceList.splice(position, 0, self.deviceInfo);
                espmesh.requestDevice(data);
            } else {
                self.deviceList.splice(position, 0, self.deviceInfo);
            }
        },
        closeList: function(self, macs, status) {
            var meshs = [];
            self.currentStatus = status;
            status = status ? 0 : 1;
            meshs.push({cid: STATUS_CID, value: parseInt(status)});
            var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                '"characteristics":' + JSON.stringify(meshs) + '}';
            espmesh.addQueueTask(JSON.stringify({"method":"requestDevicesMulticast","argument": data}));
            this.changeDevice(self, macs, status);
        },
        changeDevice: function (self, macs, status) {
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
        //修改设备名称
        editName: function (self) {
            self.cancelOperate();
            MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editNameDesc'),
                {inputValue: self.deviceInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                inputValidator:function(v){if (Util.stringToBytes(v).length > 32){return false} {}},
                inputErrorMessage: self.$t('longDesc'),
                confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj) {
                self.deviceInfo.name = obj.value;
                var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                    '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + RENAME_DEVICE + '",' +
                    '"name":' + JSON.stringify(obj.value) + ',"callback": "onEditName"}';
                setTimeout(function(){
                    espmesh.requestDevice(data);
                }, 600);
            }).catch(function(err) {
                window.onBackPressed = self.hide;
            });
        },
        // 修改名称回调
        onEditName: function(self, res) {
            res = JSON.parse(res);
            if (res.result.status_code == 0) {
                $.each(self.deviceList, function(i, item){
                    if (item.mac == self.deviceInfo.mac) {
                        self.deviceList.splice(i, 1, self.deviceInfo);
                        return false;
                    }
                });
            }
            self.$store.commit("setList", self.deviceList);
        },
        editGroupName: function (self) {
            var currThis = this;
            if (self.groupInfo.is_user) {
                Util.toast(MINT, self.$t('prohibitEditDesc'))
            } else{
                MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('editGroupTitle'),
                    {inputValue: self.groupInfo.name, inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                    self.groupInfo.name = obj.value;
                    espmesh.saveGroups(JSON.stringify([self.groupInfo]));
                    currThis.changeStore(self);
                    self.groupList.push(self.groupInfo);
                    self.$store.commit("setGroupList", self.groupList);
                });
            }
        },
        changeStore: function (self) {
            $.each(self.groupList, function(i, item) {
                if (item.id == self.groupInfo.id) {
                    self.groupList.splice(i, 1);
                    return false;
                }
            });
        },
        delDevice: function (self) {
            MINT.MessageBox.confirm(self.$t('deleteDeviceDesc'), self.$t('reconfigure'),{
                confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                self.cancelOperate();
                MINT.Indicator.open();
                setTimeout(function() {
                    var mac = self.deviceInfo.mac;
                    var data = '{"' + MESH_MAC + '": "' + mac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                            DEVICE_DELAY + '": ' + DELAY_TIME + ',"callback": "onDelDevice", "tag": { "mac": "'+
                                    mac +'"}}';
                    espmesh.requestDevice(data);
                }, 1000);

            }).catch(function(err){
                window.onBackPressed = self.hide;
            });
        },
        onDelDevice: function(self, res) {
            if (!Util._isEmpty(res)) {
                res = JSON.parse(res);
                if (!Util._isEmpty(res.result)) {
                    if (!Util._isEmpty(res.result.status_code) && res.result.status_code == 0) {
                        espmesh.removeDevicesForMacs(JSON.stringify([res.tag.mac]));
                        $.each(self.deviceList, function(i, item) {
                            if (item.mac == res.tag.mac) {
                                self.deviceList.splice(i, 1);
                                return false;
                            }
                        })
                        self.$store.commit("setList", self.deviceList);
                    } else {
                        Util.toast(MINT, self.$t('deleteFailDesc'))
                    }
                } else {
                    Util.toast(MINT, self.$t('deleteFailDesc'))
                }

            } else {
                Util.toast(MINT, self.$t('deleteFailDesc'))
            }
            MINT.Indicator.close();
            window.onBackPressed = self.hide;
        },
        dissolutionGroup: function (self, e) {
            var currThis = this;
            if (self.groupInfo.is_user) {
                Util.toast(MINT, self.$t('prohibitDelDesc'))
            } else {
                self.hideOperate();
                MINT.MessageBox.confirm(self.$t('delGroupDesc'), self.$t('delGroupTitle'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    espmesh.deleteGroup(self.groupInfo.id + "");
                    currThis.changeStore(self);
                    self.$store.commit("setGroupList", self.groupList);
                });
            }
        },
        delGroupDevices: function (self, e) {
            MINT.MessageBox.confirm(self.$t('deleteGroupDeviceDesc'), self.$t('reconfigure'),{
                confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                MINT.Indicator.open();
                setTimeout(function() {
                    var macs = self.groupInfo.device_macs;
                    var devices = [];
                    $.each(self.deviceList, function(i, item) {
                        if (macs.indexOf(item.mac) < 0) {
                            devices.push(item);
                        }
                    })
                    self.deviceList = devices;
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                        DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                    espmesh.requestDevicesMulticast(data);
                    espmesh.removeDevicesForMacs(JSON.stringify(macs));
                    MINT.Indicator.close();
                    self.$store.commit("setList", self.deviceList);
                }, 1000);
            });
        },
        //获取设备类型
        getType: function (self, tid) {
            if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                return self.$t('light');
            } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                return self.$t('switch');
            } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                return self.$t('sensor');
            } else {
                return self.$t('other');
            }
        },
        // 获取设备网络类型
        getNetwork: function (self) {
            var state = self.deviceInfo.state;
            if (state) {
                var len = state.length;
                if (len == 0) {
                    return self.$t('offline');
                } else if (len == 1) {
                    var status = state[0];
                    if (status == "local") {
                        return self.$t('local');
                    } else if (status == "cloud") {
                        return self.$t('cloud');
                    }
                } else if (len == 2) {
                    return "内网和外网";
                }
            }

        },
        //设置群组
        setGroup: function(self) {
            var tidList = [], meshList = [], meshMacs = [], macs = [], name = "", list = [],
                 oldGroups = self.$store.state.groupList;
            $.each(oldGroups, function(i, item) {
                if (item.is_mesh) {
                    item.device_macs = [];
                    espmesh.saveGroups(JSON.stringify([item]));
                }
            })
            $.each(self.deviceList, function(i, item) {
                macs = [];
                if (tidList.indexOf(item.tid) == -1 && !Util._isEmpty(item.tid)) {
                    tidList.push(item.tid);
                    name = Util.setGroupName(item.tid);
                    $.each(self.deviceList, function(j, itemSub) {
                        if (item.tid == itemSub.tid) {
                            macs.push(itemSub.mac);
                        }
                    });
                    list.push({id: item.tid, name: Util.getGroupName(oldGroups, item.tid, name),
                        is_user: true, is_mesh: false, device_macs: macs});
                }

                if (item.mesh_id) {
                    if (meshList.indexOf(item.mesh_id) == -1) {
                        meshList.push(item.mesh_id);
                    }

                }
            });
            if (meshList.length > 1) {
                self.showScanDevice = false;
                $.each(meshList, function(i, item) {
                    meshMacs = [];
                    $.each(self.deviceList, function(j, itemSub) {
                        if (item == itemSub.mesh_id) {
                            meshMacs.push(itemSub.mac);
                        }
                    });
                    var id = parseInt(item, 16),
                         name = "mesh_id(" + item + ")";
                    if (id == 0) {
                        id = parseInt("111111111111", 16);
                    }
                    list.push({id: id, name: Util.getGroupName(oldGroups, id, name),
                        is_user: true, is_mesh: true, device_macs: meshMacs})
                })
            }  else {
                self.showScanDevice = true;
            }
            espmesh.saveGroups(JSON.stringify(list));
            this.loadGroups(self);
        },
        // 加载群组
        loadGroups: function(self) {
            that = self;
            window.onLoadGroups = this.onLoadGroups;
            espmesh.loadGroups();
        },
        // 加载群组结果回调
        onLoadGroups: function(res) {
            that.$store.commit("setGroupList", JSON.parse(res));
        },
        setPair: function(self, device) {
            var position = "", pairMacs = [],
            pairs = self.$store.state.siteList;
            $.each(pairs, function(i, item) {
                pairMacs.push(item.mac);
            });
            if (!Util._isEmpty(device.position)) {
                position = device.position.split("-");
                espmesh.saveHWDevices(JSON.stringify([{"mac": device.mac, "code": position[2],
                    "floor": position[0], "area":  position[1]}]));

            } else {
                $.each(pairs, function(i, item) {
                    if (item.mac == device.mac) {
                        device.position = item.floor + "-" + item.area + "-" + item.code;
                        var data = '{"' + MESH_MAC + '": "' + device.mac +
                                '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                '"position":"' + device.position + '"}';
                        espmesh.requestDevice(data);
                        return  false;
                    }
                });
            }
            self.loadHWDevices();
            return device;
        },
        setPairs: function(self) {
            var position = "", pairMacs = [],
            pairs = self.$store.state.siteList;
            $.each(pairs, function(i, item) {
                pairMacs.push(item.mac);
            });
            $.each(self.deviceList, function(i, item) {
                if (!Util._isEmpty(item.position)) {
                    position = item.position.split("-");
                    espmesh.saveHWDevices(JSON.stringify([{"mac": item.mac, "code": position[2],
                        "floor": position[0], "area":  position[1]}]));
                } else {
                    $.each(pairs, function(j, itemSub) {
                        if (itemSub.mac == item.mac) {
                            item.position = itemSub.floor + "-" + itemSub.area + "-" + itemSub.code;
                            self.deviceList.splice(i, 1, item);
                            var data = '{"' + MESH_MAC + '": "' + item.mac +
                                    '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_POSITION + '",' +
                                    '"position":"' + item.position + '"}';
                            espmesh.requestDevice(data);
                            self.$store.commit("setList", self.deviceList);
                            return  false;
                        }
                    });
                }
            });
            self.loadHWDevices();
        },
        // 加载配置的位置信息
        loadHWDevices: function(self) {
            that = self;
            window.onLoadHWDevices = this.onLoadHWDevices;
            espmesh.loadHWDevices();
        },
        // 加载配置的位置信息回调
        onLoadHWDevices: function(res) {
            that.$store.commit("setSiteList", JSON.parse(res));
        },
        //开启蓝牙扫描附近需要配网的设备
        startBleScan: function(self, model) {
            if (self.$store.state.blueInfo) {
                if (model == 2) {
                    espmesh.startBleScan(JSON.stringify({"settings":{"scan_mode":2}}));
                } else {
                    espmesh.startBleScan()
                }
            } else {
                Util.toast(MINT, self.$t('bleConDesc'));
            }
        },
        //停止蓝牙扫描
        stopBleScan: function() {
            clearTimeout(SCAN_DEVICE);
            espmesh.stopBleScan();
        },
        // 返回首页
        onBackIndex: function(self) {
            clearTimeout(SCAN_DEVICE);
            self.blueEnable =  self.$store.state.blueInfo;
            window.onBluetoothStateChanged = self.onBluetoothStateChanged;
            if (self.$store.state.showScanBle) {
                window.onScanBLE = self.onScanBLE;
                window.onDeviceFound = self.onDeviceFound;
                window.onDeviceLost = self.onDeviceLost;
                setTimeout(function() {
                    self.$store.commit("setConScanDeviceList", []);
                }, 60000);
                SCAN_DEVICE = setTimeout(function() {
                    self.startBleScan();
                }, 10000);
            }

            var startTime = 0;
            window.onBackPressed = function () {
                Util.toast(MINT, self.$t('exitProgramDesc'))
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
        },
        getDevices: function(self, macs, names) {
            var lists = [];
            if (!Util._isEmpty(macs) && macs.length > 0) {
                var staMacs = Util.staMacForBleMacs(macs);
                $.each(self.deviceList, function(i, item) {
                    var mac = item.mac;
                    var bleMac = Util.bleMacForStaMac(mac);
                    if (staMacs.indexOf(mac) < 0) {
                        lists.push(item);
                    } else {
//                            if (names[bleMac] && names[bleMac] == item.name) {
//                                lists.push(item);
//                            }
                    }
                });
                self.deviceList = lists;
                self.$store.commit("setList", self.deviceList);
            }
        },
        // 首页蓝牙扫描回调
        onScanBLE: function (self, devices) {
            var scanList = [], rssiList = [], notExist = [],
                rssiValue = self.$store.state.rssiInfo, ibeaconList = [];
            if (!Util._isEmpty(devices) && self.$store.state.showScanBle && self.showScanDevice && !self.loadShow) {
                var conScanDeviceList = self.$store.state.conScanDeviceList;
                devices = JSON.parse(devices);
                devices = Util.blueNameDecode(self, devices);
                $.each(devices, function(i, item) {
                    if (item.rssi >= rssiValue && Util.isMesh(item.name, item.version, item.beacon)) {
                        rssiList.push(item);
                    } else if (Util.isBeacon(item.name, item.version, item.beacon)) {
                        ibeaconList.push(item);
                    }
                })
                self.$store.commit("setIbeaconList", ibeaconList);
                if (rssiList.length > 0) {
                    var names = {};
                    $.each(rssiList, function(i, item) {
                        if (self.listMacs.indexOf(item.mac) == -1) {
                            notExist.push(item.mac);
                            names[item.mac] = item.name;
                            self.listMacs.push(item.mac);
                        }
                    })
                    if (Util._isEmpty(conScanDeviceList) || conScanDeviceList.length <= 0) {
                        if (notExist.length > 0) {
                            this.getDevices(self, notExist, names);
                        }
                        var len = self.deviceList.length;
                        if (len > 0) {
                            self.showAdd = false;
                            self.$refs.remind.hide();
                            self.$refs.scanDevice.show();
                            self.$refs.scanDevice.onBackReset();
                        } else {
                            self.showAdd = true;
                            self.$refs.scanDevice.hideThis();
                            self.$refs.remind.show();
                        }
                        self.$store.commit("setScanDeviceList", rssiList);

                    } else {
                        $.each(rssiList, function(i, item) {
                            if (conScanDeviceList.indexOf(item.bssid) <= -1) {
                                scanList.push(item);
                            }
                        });
                        if (scanList.length > 0) {
                            if (notExist.length > 0) {
                                this.getDevices(self, notExist, names);
                            }
                            var len = self.deviceList.length;
                            if (len > 0) {
                                self.showAdd = false;
                                self.$refs.remind.hide();
                                self.$refs.scanDevice.show();
                            } else {
                                self.showAdd = true;
                                self.$refs.scanDevice.hideParent();
                                self.$refs.remind.show();
                            }
                            self.$store.commit("setScanDeviceList", rssiList);
                        }
                    }
                }
            }
        },
        // 监听wifi发生变化的回调方法
        onWifiStateChanged: function(self, wifi) {
            var currThis = this;
            var wifiInfo = self.$store.state.wifiInfo;
            wifi = JSON.parse(wifi);
            if (wifi.connected) {
                self.isWifiConnect = wifi.connected;
                if (wifi.encode) {
                    wifi.ssid = Util.Base64.decode(wifi.ssid);
                }
                if (wifi.ssid == wifiInfo.ssid) {
                    return false;
                }
                if (self.wifiNum != 0) {
                    clearTimeout(WIFI_TIMER);
                    WIFI_TIMER = setTimeout(function() {
                        Util.toast(MINT, self.$t('wifiChangeDesc'));
                        if (!self.loadShow) {
                            self.showAdd = false;
                            self.wifiFlag = true;
                            self.loadDesc = self.$t('loading');
                            currThis.reload(self);
                        }
                    }, 3000);
                }
                self.wifiNum++;
                self.$store.commit("setWifiInfo", wifi);
            } else {
                self.isWifiConnect = false;
                self.$store.commit("setWifiInfo", "");
            }
        },
        // 监听蓝牙状态发生变化的回调方法
        onBluetoothStateChanged: function(self, blue) {
            if (!Util._isEmpty(blue)) {
                blue = JSON.parse(blue);
                if (blue.enable || blue.enable == "true") {
                    blue.enable = true;
                } else {
                    blue.enable = false;
                }
                self.$store.commit("setBlueInfo", blue.enable);
                self.blueEnable =  blue.enable;
            }
        },
        // 判断群组当前状态
        getStatusByGroup: function(self, macs) {
            var statusFlag = false;
            if (!Util._isEmpty(macs) && macs.length > 0) {
                self.deviceList = self.$store.state.deviceList;
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
        // 根据设备类型判断是否显示开关
        isShowPower: function(self, macs) {
            var flag = false;
            if (!Util._isEmpty(macs) && macs.length > 0) {
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
        // 群组是否显示
        isShowGroup: function(self, macs, flag) {
            var countFlag = false;
            if (!Util._isEmpty(macs) && macs.length > 0) {
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
                        countFlag = true;
                        return false;
                    }
                });
            }
            if (!flag) {
                countFlag = true;
            }
            return countFlag;
        },
        //获取群组里当前在线的设备数量
        getDevicesByGroup: function (self, macs) {
            var count = 0;
            if (!Util._isEmpty(macs) && macs.length > 0) {
                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
                        count++;
                    }
                });
            }
            return count;
        },
        //添加设备
        addDevice: function (self) {
            self.flag = false;
            if (!self.isWifiConnect) {
                self.showWifiFail();
                return false;
            }
            if (!self.blueEnable) {
                self.showBlueFail();
                return false;
            }
            self.$store.commit("setShowScanBle", false);
            self.$refs.device.show();
        },
        // 添加群组
        addGroup: function(self) {
            self.flag = false;
            if (Util._isEmpty(self.deviceList)) {
                self.deviceList = [];
            }
            var groupList = self.$store.state.groupList;
            MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn'),
                inputValidator: function(val) {
                            return Util.isExistGroup(groupList, val)
                          }, inputErrorMessage: self.$t('isExistGroupDesc')
                }).then(function(obj) {
                    self.groupName = obj.value;
                    setTimeout(function() {
                        self.$refs.groupAdd.show();
                    }, 100)
            });
        },
        // 显示蓝牙未连接
        showBlueFail: function(self) {
            self.$store.commit("setShowScanBle", false);
            this.stopBleScan();
            setTimeout(function() {
                self.$refs.blueFail.show();
            })

        },
        // 显示WIFI未连接
        showWifiFail: function(self) {
            self.$store.commit("setShowScanBle", false);
            this.stopBleScan();
            setTimeout(function() {
                self.$refs.wifiFail.show();
            })
        },
        //初始化设备扫描页面的参数、变量--蓝牙扫描列表界面
        initBlueShow: function(self) {
            window.onLoadMacs = self.onLoadMacs;
            if (self.$store.state.systemInfo != "Android") {
                self.systemInfo = false;
            }
            self.getLoadMacs();
            self.getPair();
            self.scanDeviceList = [];
            self.isSelectedMacs = [];
            self.$store.commit("setScanDeviceList", []);
            self.selected = self.count = self.scanDeviceList.length;
            self.rssiValue = self.$store.state.rssiInfo;
            self.searchReset =  "";
            self.showFilter = false;
            self.showHeight = false;
            self.flagUl = false;
            self.showFooterInfo = true;
            self.blueEnable = self.$store.state.blueInfo;
            self.showBlue = false;
            self.initResetSlider();
            setTimeout(function() {
                self.onBackReset();
                window.onBluetoothStateChanged = self.onBluetoothStateChanged;
                $("#" + self.selectAllId).addClass("active");
            });
            self.addFlag = true;
            var oHeight = $(document).height();     //获取当前窗口的高度
            $(window).resize(function () {
                if ($(document).height() >= oHeight) {
                    self.showFooterInfo = true;
                } else {
                    self.showFooterInfo = false;
                }
            })
        },
        // 初始化信号滑动条
        initResetSlider: function(self) {
            setTimeout(function() {
                $("#" + self.sliderId).slider({
                    range: "min",
                    step: 1,
                    min: self.rssiMin,
                    max: self.rssiMax,
                    value: self.rssiValue,
                    slide: function(event, ui) {
                        self.rssiValue = ui.value;
                        self.$store.commit("setRssi", self.rssiValue);
                    },
                    stop: function(event, ui) {
                        self.rssiValue = ui.value;
                        self.$store.commit("setRssi", self.rssiValue);
                    }
                })
            })
        },
        // 获取配网时收藏的设备信息
        getLoadMacs: function() {
            espmesh.loadMacs();
        },
        //  获保存配网时收藏的设备信息
        saveScanMac: function(self, mac) {
            var index = self.scanMacs.indexOf(mac);
            if (index > -1) {
                espmesh.deleteMac(mac);
                self.scanMacs.splice(index, 1);
            } else {
                espmesh.saveMac(mac);
                self.scanMacs.push(mac);
            }
            this.getLoadMacs();
        },
        // 设置扫描到的蓝牙设备信息
        setScanList: function(self, devices) {
            $.each(devices, function(i, item) {
                var name = item.name;
                if(Util.isMesh(name, item.version, item.beacon)) {
                    var flag = true,
                        obj = Util.assemblyObject(item, self);
                    $.each(self.scanDeviceList, function(j, itemSub) {
                        if (item.mac == itemSub.mac) {
                            if (item.rssi >= self.rssiValue) {
                                self.scanDeviceList.splice(j, 1, obj);
                            }
                            flag = false;
                            return false;
                        }
                    })
                    if (flag && !Util._isEmpty(obj)) {
                        self.scanDeviceList.push(obj);
                    }
                }
            })
            self.$store.commit("setScanDeviceList", self.scanDeviceList);
        },
        // 蓝牙扫描设备回调
        onConScanBLE: function(self, devices) {
            devices = JSON.parse(devices);
            devices = Util.blueNameDecode(self, devices);
            self.setScanList(devices);
            if (self.$refs.import.importFlag) {
                self.$refs.import.onBackImport();
            } else {
                if (self.showDesc) {
                    window.onBackPressed = self.hideDescInfo;
                } else if (self.showBlue) {
                    window.onBackPressed = self.$refs.blueFail.hide;
                } else {
                    window.onBackPressed = self.hide;
                }
            }
        },
        // 单选, 获取选择的设备Mac
        selectMac: function(self, mac) {
            var num = self.isSelectedMacs.indexOf(mac);
            if (num == -1) {
                self.isSelectedMacs.push(mac);
            } else {
                self.isSelectedMacs.splice(num, 1);
            }
            self.selected = self.isSelectedMacs.length;
        },
        // 判断是否选中
        isSelected: function(list, mac) {
            var flag = false;
            if (list.indexOf(mac) != -1) {
                flag = true;
            }
            return flag;
        },
        // 全选/全不选
        selectAllDevice: function (self, list, e) {
            var doc = $(e.currentTarget).find("span.span-radio")[0];
            if ($(doc).hasClass("active")) {
                self.selected = 0;
                self.isSelectedMacs = [];
            } else {
                self.selected = self.count;
                var allMacs = [];
                $.each(list, function(i, item) {
                    allMacs.push(item.mac);
                })
                self.isSelectedMacs = allMacs;
            }
        },
        // 将选择的设备加入现有网络
        conDevice: function(self, selected) {
            if (selected > 0) {
                this.stopBleScan();
                MINT.Indicator.open();
                setTimeout(function(){
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + ADD_DEVICE + '","'+
                        'whitelist": '+JSON.stringify(self.isSelectedMacs)+'}';
                    console.log(data)
                    Util.requestDevicesMulticast(data);
                    self.$store.commit("setScanDeviceList", []);
                    MINT.Indicator.close();
                    self.hide();
                }, 1000);
                self.$store.commit("setConScanDeviceList", self.isSelectedMacs);
            }
        },
        // 跳转网络配置界面
        jumpNetwork: function(self) {
            var flag = false;
            this.stopBleScan();
            var macs = self.isSelectedMacs, list = [];
            $.each(self.scanDeviceList, function(i, item) {
                if (macs.indexOf(item.mac) != -1) {
                    list.push(item);
                    if (!item.only_beacon) {
                        flag = true;
                    }
                }
            });
            if (flag) {
                self.$store.commit("setScanDeviceList", list);
                self.$refs.device.show();
            } else {
                Util.toast(MINT, self.$t('noConfigDesc'))
            }
        },
        // 初始化网络配置界面的参数、变量
        initNetworkShow: function(self) {
            self.wifiInfo = self.$store.state.wifiInfo;
            window.onLoadAPs = self.onLoadAPs;
            window.onLoadMeshIds = self.onLoadMeshIds;
            self.apList = [];
            self.wifiName = self.$t('no');
            self.password = "";
            self.showNext = false;
            self.onBackAddDevice();
            self.getLoadAPs();
            self.nextInput();
            self.getMeshId();
            this.stopBleScan();
            self.addFlag = true;
            self.isMore = false;
            self.moreObj = {};
            self.meshType = null;
            self.customData = null;
            self.votePercentage = null;
            self.voteMaxCount = null;
            self.backoffRssi = null;
            self.scanMinCount = null;
            self.scanFailCount = null;
            self.monitorCount = null;
            self.rootHealing = null;
            self.rootEnable = null;
            self.fixEnable = null;
            self.capacityNum = null;
            self.maxLayer = null;
            self.maxConnect = null;
            self.assocExpire = null;
            self.beaconInterval = null;
            self.passiveScan = null;
            self.monitorDuration = null;
            self.cnxRssi = null;
            selectRssi = null;
            self.switchRssi = null;
            self.xonQsiz = null;
            self.retransmitEnable = null;
            self.dataDrop = null;
            self.meshPwd = null;
            this.selected = "2";
            setTimeout(function() {
                self.configWifi();
            }, 1000);
        },
        // 是否明文显示密码
        showPassword: function (self) {
            self.showPwd = !self.showPwd;
            if (self.type == "password") {
                self.type = "text";
            } else {
                self.type = "password";
            }
        },
        // 根据分号分割路由的BSSID
        splitMeshId: function(self, id) {
            if (!Util._isEmpty(id)) {
                var ids = id.split(":");
                self.meshIdOne = ids[0];
                self.meshIdTwo = ids[1];
                self.meshIdThr = ids[2];
                self.meshIdFour = ids[3];
                self.meshIdFive = ids[4];
                self.meshIdSex = ids[5];
            }
        },
        // 自动切换到下一个输入框
        nextInput: function(self){
            var txts = $(".form-input input");
            for(var i = 0; i < txts.length;i++){
                var t = txts[i];
                t.index = i;
                t.onkeyup = function(){
                    var val = $(this).val();
                    var reg = /^[0-9a-fA-F]{1,2}$/;
                    if (reg.test(val)) {
                        if (val.length >= 2) {
                            var next = this.index + 1;
                            if(next > txts.length - 1) return;
                            txts[next].focus();
                        }
                    } else {
                        self.selectSwitch($(this).attr("data-value"));
                    }
                }
            }
        },
        // 开始配网
        startWifi: function (self) {
            if (!self.$store.state.blueInfo) {
                Util.toast(MINT, self.$t('bleConDesc'));
                return false;
            }
            if (self.$store.state.systemInfo == "Android") {
                var sdk = espmesh.getSDKInt();
                if (sdk >= 23) {
                    var locationCon = espmesh.isLocationEnable();
                    if (!locationCon) {
                        Util.toast(MINT, self.$t('locationConDesc'));
                        return false;
                    }
                }
            }
            if (self.wifiName == self.$t('no')) {
                Util.toast(MINT, self.$t('wifiNoDesc'));
                return false;
            }
            if (Util._isEmpty(self.meshIdOne) || Util._isEmpty(self.meshIdTwo) || Util._isEmpty(self.meshIdThr) ||
                Util._isEmpty(self.meshIdFour) || Util._isEmpty(self.meshIdFive) || Util._isEmpty(self.meshIdSex)) {
                Util.toast(MINT, self.$t('meshIdDesc'));
                return false;
            }
            if (parseInt(self.meshIdOne) == 0 && parseInt(self.meshIdTwo) == 0 && parseInt(self.meshIdThr) == 0 &&
                parseInt(self.meshIdFour) == 0 && parseInt(self.meshIdFive) == 0 &&
                parseInt(self.meshIdSex) == 0) {
                self.meshId = "11:11:11:11:11:11";
            } else {
                self.meshId = self.meshIdOne + ":" + self.meshIdTwo + ":" + self.meshIdThr + ":" + self.meshIdFour +
                    ":" + self.meshIdFive + ":" + self.meshIdSex;
            }
            self.moreObj = {custom_data: self.customData, mesh_password: self.meshPwd, mesh_type: self.meshType, vote_percentage: self.votePercentage, vote_max_count: self.voteMaxCount,
                backoff_rssi: self.backoffRssi, scan_min_count: self.scanMinCount, scan_fail_count: self.scanFailCount, monitor_ie_count: self.monitorCount,
                root_healing_ms: self.rootHealing, root_conflicts_enable: self.rootEnable, fix_root_enable: self.fixEnable,
                capacity_num: self.capacityNum, max_layer: self.maxLayer, max_connection: self.maxConnect,
                assoc_expire_ms: self.assocExpire, beacon_interval_ms: self.beaconInterval, passive_scan_ms: self.passiveScan,
                monitor_duration_ms: self.monitorDuration, cnx_rssi: self.cnxRssi, select_rssi: self.selectRssi,
                switch_rssi: self.switchRssi, xon_qsize: self.xonQsize, retransmit_enable:self.retransmitEnable,
                data_drop_enable: self.dataDrop};
            if(self.showNext) {
                MINT.MessageBox.confirm(self.$t('wifiConfirmDesc'), self.$t('configNet'),{
                    confirmButtonText: self.$t('carryOn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.$refs.con.show();
                });
            } else {
                self.$refs.con.show();
            }
        },
        // 启动配网
        conWifi: function (self) {
            var scanDeviceList = self.$store.state.scanDeviceList,
                scanMacs = [], rssi = -1000, rssiMac = "", version = -1;
            this.startBleScan(self, 2);
            self.setTimer();
            self.success = true;
            self.title = self.$t('connetDeviceTitle');
            self.desc = self.$t('connetDeviceDesc');
            setTimeout(function () {
                espmesh.stopBleScan();
                if (self.rssiList.length != 0) {
                    $.each(scanDeviceList, function (i, item) {
                        scanMacs.push(item.bssid);
                    });
                    $.each(self.rssiList, function (i, item) {
                        var itemRssi = item.rssi;
                        if (itemRssi != 0 && itemRssi > rssi && scanMacs.indexOf(item.bssid) != -1 &&
                            !item.only_beacon) {
                            rssi = itemRssi;
                            rssiMac = item.mac;
                            version = item.version
                        }
                    })
                    if (Util._isEmpty(rssiMac)) {
                        self.setFail(self.$t('farDeviceDesc'));
                        return false;
                    }
                    var data = {
                        "ble_addr": rssiMac, "ssid": self.wifiName, "password": self.password,
                        "white_list": scanMacs, "bssid": self.wifiInfo.bssid, "mesh_id": Util.convert(self.meshId),
                        "version": version
                    };
                    data = Object.assign(data, self.moreObj)
                    console.log(JSON.stringify(scanMacs));
                    espmesh.saveMeshId(self.meshId);
                    espmesh.startConfigureBlufi(JSON.stringify(data));
                } else {
                    self.setFail(self.$t('farDeviceDesc'));
                }
            }, 5000);
        },
        // 配网进度和结果
        onConfigureProgress: function(self, config) {
            config = JSON.parse(config);
            if (config.code < 400 && config.code > 300) {
                if (config.progress >= self.value) {
                    self.value = config.progress;
                }
                if (self.textList.indexOf(config.message) < 0) {
                    self.textList.push(config.message);
                }
                window.onConfigureProgress = self.onConfigureProgress;
            } else if (config.code == 300) {
                self.value = config.progress;
                if (self.textList.indexOf(config.message) < 0) {
                    self.textList.push(config.message);
                }
                self.desc = self.$t('connetSuccessDesc');
                this.stopBleScan();
                espmesh.clearBleCache();
                self.$store.commit("setScanDeviceList", []);
                self.count = 0;
                setTimeout(function() {
                    self.hide();
                    self.$parent.hideParent();
                }, 1000);
            } else {
                if (config.code == -20) {
                    self.setFail(config.message);
                } else if (config.code == 1) {
                    self.setFail(self.$t('conRouteFailDesc'));
                } else if (config.code == 16) {
                    self.setFail(self.$t('pwdFailDesc'));
                } else if (config.code == 17) {
                    self.setFail("AP not found");
                } else if (config.code == 18) {
                    self.setFail("AP forbid");
                } else if (config.code == 19) {
                    self.setFail("Configure data error");
                } else if (self.count < 3) {
                    self.count++;
                    var timeoutID = setTimeout(function() {
                        self.conWifi();
                    }, 2000);
                    self.configTimeoutId = timeoutID;
                } else {
                    self.setFail(config.message);
                }

            }
        },
        // 配网失败提示
        setFail: function(self, msg) {
            espmesh.stopBleScan();
            espmesh.stopConfigureBlufi();
            self.success = false;
            self.title = self.$t('connetFailDesc');
            self.desc = msg;
            self.value = 0;
            self.count = 0;
            self.textList = [];
            window.onConfigureProgress = self.onConfigureProgress;
        },
        // 设置定时
        setTimer: function(self) {
            self.timerId = setInterval(function() {
                if (!self.addFlag) {
                    clearInterval(self.timerId);
                }
                if (self.value < 5) {
                    self.value += 1;
                } else {
                    clearInterval(self.timerId);
                }
            }, 1000)
        },
        //保存群组
        saveGroup: function(self) {
            MINT.Indicator.open();
            setTimeout(function() {
                var obj = {name: self.name, is_user: false, is_mesh: false, device_macs: self.isSelectedMacs};
                espmesh.saveGroups(JSON.stringify([obj]));
                espmesh.loadGroups();
                self.hide();
                MINT.Indicator.close();
                self.$router.push({
                    path: "/group"
                });
            }, 1000)
        },
        /*除了灯以外的设备属性修改公用方法*/
        //初始化横向进度选择
        initAttrSlider: function(self, id, name, value, perms, min, max, step) {
            var self = this;
            setTimeout(function() {
                $("#" + id + name).slider({
                    step: step,
                    min: min,
                    max: max,
                    value: value,
                    slide: function(event, ui) {
                        var doc = $(this),
                            docParent = doc.parent().parent();
                        docParent.find(".icon-blue").text(ui.value);
                        docParent.find(".input-value").val(ui.value);
                    },
                    stop: function(event, ui) {
                        var doc = $(this),
                            cid = doc.attr("data-cid");
                        self.setAttr(cid, ui.value);
                    }
                })
                if (self.isReadable(perms) && !self.isWritable(perms)) {
                    $("#" + id + name).slider("disable");
                }
                $("#" + id + name).parent().parent().find(".icon-blue").text(value);
            })
            return true;
        },
        // 根据属性时候可读可写来判断是否显示输入框
        isShowInput: function(perms) {
            if (this.isReadable(perms) && !this.isWritable(perms)) {
                return false;
            }
            return true;
        },
        // 获取属性集合
        getAttrList: function(self) {
            var currentThis = this;
            $.each(self.device.characteristics, function(i, item) {
                if (currentThis.isReadable(item.perms) || currentThis.isWritable(item.perms)) {
                    self.attrList.push(item);
                }
            });
        },
        isReadable: function(perms) {
            return (perms & 1) == 1;
        },
        isWritable: function(perms) {
            return ((perms >> 1) & 1) == 1;
        },
        // 改变值
        changValue: function(e, cid) {
            var doc = $(e.currentTarget),
                docParent = doc.parent().parent(),
                value = doc.val();
            docParent.find(".icon-blue").text(value);
            $("#" + cid).slider("setValue", value);
        },
        // 重置
        resetValue: function(value, cid, e) {
            var doc = $(e.currentTarget),
                docParent = doc.parent().parent();
            docParent.find(".input-value").val(value);
            docParent.find(".icon-blue").text(value);
            $("#" + cid).slider("setValue", value);
        },
        // 修改值
        sendValue: function(self, e) {
            var doc = $(e.currentTarget),
                docInput = $(doc).parent().parent().find(".input-value"),
                value = docInput.val(),
                cid = docInput.attr("data-cid");
            self.setAttr(cid, value);
        },
        // 修改设备的值
        setAttr: function(self, cid, value) {
            var meshs = [],
                characteristics = [],
                attrFlag = false;
            $.each(self.device.characteristics, function(i, item) {
                if (item.cid == cid) {
                    if (value != item.value) {
                        item.value = parseInt(value);
                        attrFlag = true;
                    }

                }
                characteristics.push(item);
            });
            if (attrFlag) {
                self.device.characteristics = characteristics;
                $.each(self.deviceList, function(i, item){
                    if (item.mac == self.device.mac) {
                        self.deviceList.splice(i, 1, self.device);
                        return false;
                    }
                });
                meshs.push({cid: parseInt(cid), value: parseInt(value)});
                var data = '{"' + MESH_MAC + '": "' + self.device.mac +
                    '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.requestDevice(data);
                self.$store.commit("setList", self.deviceList);
            }

        }

    }
    return Common;
})