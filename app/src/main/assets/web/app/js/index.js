define(["vue", "MINT", "Util", "txt!../../pages/index.html", "../js/footer", "./resetDevice",
"./operateDevice", "./addGroup", "./load", "./aboutDevice", "./otaInfo", "./automation",
 "./ibeacon", "./scanDevice", "./remind", "./attr", "./setDevicePair", "./joinDevice", "./command", "./sendIP"],
    function(v, MINT, Util, index, footer, resetDevice, operateDevice, addGroup, load, aboutDevice,
        otaInfo, automation, ibeacon, scanDevice, remind, attr, setDevicePair, joinDevice, command, sendIP) {

    var Index = v.extend({

        template: index,

        data: function(){
            return {
                flag: false,
                device: "device",
                addGroupId: "device-addGroup",
                colorId: "device-color",
                temperatureId: "device-temperature",
                otaDeviceId: "ota-device-id",
                deviceList: [],
                deviceInfo: "",
                name: "",
                loadDesc: "",
                infoShow: false,
                topStatus: "",
                groupName: "",
                powerFlag: false,
                showAdd: false,
                searchName: "",
                otaMacs: [],
                commandMacs: [],
                autoId: "automation-device",
                groupList: this.$store.state.groupList,
                pairList: [],
                positionList: [],
                temporaryAddList: [],
                temporaryDelList: [],
                listMacs: [],
                wifiNum: 0,
                showScanDevice: true,
                hsb: "",
                hideTrue: false,
                loadShow: false,
                wifiFlag: false,
                indexList: [],
                loadList: [],
                loadMoreing: false,
                pullLoad: false,
            }
        },
        watch: {
           // 如果路由有变化，会再次执行该方法d
           '$route': function (to, form) {
               if (to.path == "/") {
                   this.$store.commit("setShowScanBle", true);
                   this.onBackIndex();
               }

           }
        },
        mounted: function() {
            var self = this;
            self.wifiNum = 0;
            espmesh.registerPhoneStateChange();
            self.$store.commit("setShowScanBle", true);
            setTimeout(function() {
                espmesh.hideCoverImage();
                espmesh.checkAppVersion();
                self.loadHWDevices();
                self.reload();
            }, 500)
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                if (self.deviceList.length > 0) {
                    self.$refs.remind.hide();

                    if (self.hideTrue) {
                        self.hideLoad();
                    }
                    self.positionList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (!Util._isEmpty(item.position)) {
                            self.positionList.push(item.position);
                        }
                    });

                    if (Util._isEmpty(self.searchName)) {
                        self.indexList = self.sortList(self.deviceList);
                    } else {
                        var searchList = [];
                        $.each(self.deviceList, function(i, item) {
                            if (item.name.indexOf(self.searchName) != -1 || item.position.indexOf(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        })
                        self.indexList = self.sortList(searchList);
                    }
                    setTimeout(function(){
                        var list = [];
                        var loadLen = self.loadList.length;
                        var len = self.indexList.length;
                        if (loadLen <= 20) {
                            loadLen = 20;
                        }
                        if (len > 0 ) {
                            $.each(self.indexList, function(i, item) {
                                list.push(item);
                                if (list.length == loadLen || list.length == len) {
                                    self.loadList = list;
                                    return false;
                                }
                            })
                        } else {
                            self.loadList = [];
                        }
                        if (len > loadLen) {
                            self.loadMoreing = false;
                        }
                    }, 100)
                } else {
                    self.loadList = [];
                }
            }
        },
        methods:{
            handleTopChange: function (status) {
                this.topStatus = status;
                if (this.pullLoad) {
                    $(".mint-loadmore-content").addClass("pullLoad");
                    this.topStatus = "loading";
                    this.$refs.loadmore.topStatus = "loading";
                } else {
                    $(".mint-loadmore-content").removeClass("pullLoad");
                }

            },
            loadMoreList: function() {
                var self = this,
                    total = this.indexList.length,
                    len = this.loadList.length ;
                if (total > 20) {
                    if (len < total) {
                        console.log("按需加载。。。");
                        for (var i = len; i < total; i++) {
                            this.loadList.push(this.indexList[i]);
                            if (i - len == 8) {
                                return false;
                            }
                        }
                        if (this.loadList.length == total) {
                            this.loadMoreing = true;
                        } else {
                            this.loadMoreing = false;
                        }
                    } else {
                        this.loadMoreing = true;
                    }
                } else {
                    this.loadMoreing = true;
                }
            },
            addDevice: function (event) {
                this.flag = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.device.show();
            },
            joinDevice: function (event) {
                this.flag = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.join.show();
            },
            addGroup: function () {
                var self = this;
                this.flag = false;
                if (Util._isEmpty(self.deviceList)) {
                    self.deviceList = [];
                }
                self.groupList = self.$store.state.groupList;
                MINT.MessageBox.prompt(self.$t('addGroupDesc'), self.$t('addGroupTitle'),
                    {inputValue: "", inputPlaceholder: self.$t('addGroupInput'),
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn'),
                    inputValidator: function(val) {
                                return Util.isExistGroup(self.groupList, val)
                              }, inputErrorMessage: self.$t('isExistGroupDesc')
                    }).then(function(obj) {
                        setTimeout(function() {
                            self.$refs.add.show();
                            self.groupName = obj.value;
                        }, 100)
                });

            },
            sortList: function(list) {
                var self = this, emptyList = [], arrayList = [];
                $.each(list, function(i, item) {
                    if (!Util._isEmpty(item.position)) {
                        arrayList.push(item);
                    } else {
                        emptyList.push(item);
                    }
                });
                arrayList.sort(Util.sortBySub("position"));
                emptyList.sort(Util.sortBy("name"));
                $.each(emptyList, function(i, item) {
                    arrayList.push(item);
                });
                return arrayList;
            },
            loadHWDevices: function() {
                espmesh.loadHWDevices();
            },
            setPairs: function() {
                var self = this, position = "", pairMacs = [],
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
                                espmesh.requestDeviceAsync(data);
                                self.$store.commit("setList", self.deviceList);
                                return  false;
                            }
                        });
                    }
                });
                self.loadHWDevices();
            },
            setPair: function(device) {
                var self = this, position = "", pairMacs = [],
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
                            espmesh.requestDeviceAsync(data);
                            return  false;
                        }
                    });
                }
                self.loadHWDevices();
                return device;
            },
            loadGroups: function() {
                espmesh.loadGroups();
            },
            setGroup: function() {
                var self = this, tidList = [], meshList = [], meshMacs = [], macs = [], name = "", list = [],
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
                        name = self.setName(item.tid);
                        $.each(self.deviceList, function(j, itemSub) {
                            if (item.tid == itemSub.tid) {
                                macs.push(itemSub.mac);
                            }
                        });
                        list.push({id: item.tid, name: self.getGroupName(oldGroups, item.tid, name),
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
                        list.push({id: id, name: self.getGroupName(oldGroups, id, name),
                            is_user: true, is_mesh: true, device_macs: meshMacs})
                    })
                }  else {
                    self.showScanDevice = true;
                }
                espmesh.saveGroups(JSON.stringify(list));
                self.loadGroups();
            },
            getGroupName: function(groups, id, name) {
                $.each(groups, function(i, item) {
                    if (item.id == id) {
                        name = item.name;
                        return false;
                    }
                })
                return name;
            },
            setName: function(tid) {
                var name = "";
                if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    name = "Switch_" + tid;
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    name = "Sensor_" + tid;
                } else if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    name = "Light_" + tid;
                } else {
                    name = "Other_" + tid;
                }
                return name;
            },
            getAllMacs: function () {
                var macs = [], self = this;
                $.each(self.deviceList, function(i, item){
                    macs.push(item.mac);
                });
                return macs;
            },
            linkShow: function(item) {
                if (!Util._isEmpty(item.trigger)) {
                    if (item.trigger == 1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            conReload: function() {
                var self = this;
                self.showAdd = false;
                self.hideTrue = true;
                self.$refs.remind.hide();
                self.$store.commit("setShowScanBle", true);
                if (self.deviceList.length <= 0) {
                    self.stopBleScan();
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
                        MINT.Toast({
                          message: self.$t('pullDownDesc'),
                          position: 'bottom',
                        });
                    };
                    if (self.$store.state.showScanBle) {
                        self.onBackIndex();
                    }
                }, 20000);
                setTimeout(function() {
                    self.stopBleScan();
                });
            },
            reload: function() {
                var self = this;
                setTimeout(function(){
                    if (!self.wifiFlag) {
                        self.stopBleScan();
                    }
                    self.showLoad();
                    self.$store.commit("setList", []);
                    self.loadList = [];
                    espmesh.scanDevicesAsync();
                }, 50);
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                    this.stopBleScan();
                    this.$store.commit("setShowScanBle", false);
                } else {
                    this.$store.commit("setShowScanBle", true);
                    this.onBackIndex();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.$store.commit("setShowScanBle", true);
                this.onBackIndex();
            },
            hideLoad: function () {
                this.$refs.load.hide();
                this.loadShow = false;
                this.hideTrue = false;
            },
            showLoad: function () {
                var self = this;
                setTimeout(function() {
                    self.loadShow = true;
                    self.$refs.load.hide();
                    self.$refs.load.showTrue();
                }, 100)

            },
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                this.$store.commit("setShowScanBle", false);
                setTimeout(function() {
                    if (self.deviceList.length > 0) {
                        if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                            self.deviceInfo = item;
                            self.$store.commit("setDeviceInfo", self.deviceInfo);
                            self.stopBleScan();
                            self.$refs.operate.show();
                        } else if (tid != BUTTON_SWITCH) {
                            self.deviceInfo = item;
                            self.$store.commit("setDeviceInfo", self.deviceInfo);
                            self.stopBleScan();
                            self.$refs.attr.show();
                        }
                    }
                }, 50)
            },
            showAbout: function () {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.aboutDevice.show();
            },
            showReport: function () {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.report.show();
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs.push(this.deviceInfo.mac);
                this.$store.commit("setShowScanBle", false);
                this.$refs.ota.show();
            },
            showPair: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.setDevicePair.show();
            },
            showAuto: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.auto.show();
            },
            showCommand: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs.push(self.deviceInfo.mac);
                setTimeout(function() {
                    self.$refs.command.show();
                })
            },
            showSendIp: function() {
                var self = this;
                self.infoShow = false;
                self.commandMacs = [];
                self.commandMacs.push(self.deviceInfo.mac);
                setTimeout(function() {
                    self.$refs.sendIP.show();
                })
            },
            showIbeacon: function() {
                this.infoShow = false;
                this.$store.commit("setShowScanBle", false);
                this.$refs.ibeacon.show();
            },
            showDel: function (e) {
                $("#content-info .item").removeClass("active");
                $(e.currentTarget).addClass("active");
            },
            hideDel: function (e) {
                $("#content-info .item").removeClass("active");
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getFlag: function(position) {
                var self = this, flag = false;
                if (self.positionList.indexOf(position) != self.positionList.lastIndexOf(position)) {
                    flag = true;
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
            delDevice: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
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
                        espmesh.requestDeviceAsync(data);
                    }, 1000);

                }).catch(function(err){
                    self.onBackIndex();
                });
            },
            getColor: function (characteristics, tid) {
                var self = this,
                    hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                    mode = 0, temperature = 0, brightness = 0;
                if (!Util._isEmpty(characteristics)) {
                    $.each(characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        } else if (item.cid == MODE_CID) {
                            mode = item.value;
                        } else if (item.cid == TEMPERATURE_CID) {
                            temperature = item.value;
                        } else if (item.cid == BRIGHTNESS_CID) {
                            brightness = item.value;
                        }
                    })
                }
                if (status == STATUS_ON) {
                    if (mode == MODE_CTB) {
                        rgb = self.modeFun(temperature, brightness);
                    } else {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100);
                        var v = luminance / 100;
                        if (v <= 0.4)  {
                            v *= 1.2;
                        }
                        if(v <= 0.2) {
                            v = 0.2;
                        }
                        rgb = "rgba("+Math.round(rgb.r)+", "+Math.round(rgb.g)+", "+Math.round(rgb.b)+", "+ v +")";
                    }
                }
                if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                    rgb = "#3ec2fc";
                }
                return rgb;
            },
            modeFun: function(temperature, brightness) {
                var r = 0,
                    g = 0,
                    b = 0,
                    r1 = 248,
                    g1 = 207,
                    b1 = 109,
                    r2 = 255,
                    g2 = 255,
                    b2 = 255,
                    r3 = 164,
                    g3 = 213,
                    b3 = 255;
                if (temperature < 50) {
                    var num = temperature / 50;
                    r = Math.floor((r2 - r1) * num) + r1;
                    g = Math.floor((g2 - g1) * num) + g1;
                    b = Math.floor((b2 - b1) * num) + b1;
                } else {
                    var num = (temperature - 50) / 50;
                    r = r2 - Math.floor((r2 - r3) * num);
                    g = g2 - Math.floor((g2 - g3) * num);
                    b = b2 - Math.floor((b2 - b3) * num);
                }
                return "rgba("+r+", "+g+", "+b+", 1)";
            },
            editName: function () {
                var self = this;
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
                        espmesh.requestDeviceAsync(data);
                    }, 600);
                }).catch(function(err) {
                    self.onBackIndex();
                });
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
            close: function (mac, status) {
                var self = this, meshs = [], deviceStatus = 0, position = 0;
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
                    espmesh.requestDeviceAsync(data);
                } else {
                    self.deviceList.splice(position, 0, self.deviceInfo);
                }
            },
            closeDevice: function(mac) {
                var self = this, status = 0;
                self.powerFlag = !self.powerFlag;
                status = self.powerFlag ? STATUS_ON : STATUS_OFF;
                self.close(mac, status);
            },
            operateClose: function(mac, status) {
                var self = this;
                self.close(mac, status);
                setTimeout(function() {
                    window.onBackPressed = self.hideOperate;
                })
            },
            showOperate: function (item) {
                var self = this, status = 0;
                self.stopBleScan();
                self.$store.commit("setShowScanBle", false);
                var mac = item.mac;
                $.each(self.deviceList, function(i, item) {
                    if (item.mac == mac) {
                        self.deviceInfo = item;
                        return false;
                    }
                });
                $.each(self.deviceInfo.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        status = item.value;
                        return false;
                    }
                });
                self.powerFlag = (status == STATUS_ON ? true : false)
                self.flag = false;
                self.infoShow = true;
                self.$store.commit("setDeviceInfo", self.deviceInfo);
                window.onBackPressed = self.hideOperate;
            },
            hideOperate: function () {
                this.$store.commit("setShowScanBle", true);
                this.onBackIndex();
                this.infoShow = false;
            },
            cancelOperate: function() {
                this.$store.commit("setShowScanBle", true);
                this.infoShow = false;
            },
            loadTop: function() {
                var self = this;
                self.pullLoad = true;
                self.deviceList = [];
                self.loadList = [];
                self.$store.commit("setList", self.deviceList);
                setTimeout(function() {
                    if (!self.loadShow) {
                        self.loadShow = true;
                        self.$store.commit("setShowScanBle", true);
                        self.stopBleScan();
                        self.$refs.load.hide();
                        espmesh.scanDevicesAsync();
                    } else {
                        self.pullLoad = false;
                        self.$refs.loadmore.onTopLoaded();
                    }
                    self.isLoad = false;
                }, 50);
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
            getDevices: function(macs, names) {
                var self = this, lists = [];
                if (macs.length > 0) {
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
            clearListMacs: function() {
                this.listMacs = [];
            },
            getPOrN: function(position, name) {
                var self = this, obj = name,
                    objP = self.getPosition(position);
                if (!Util._isEmpty(objP)) {
                    obj = objP;
                }
                return obj;
            },
            onDelDevice: function(res) {
                var self = this;
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
                            MINT.Toast({
                              message: self.$t('deleteFailDesc'),
                              position: 'bottom',
                              duration: 2000
                            });
                        }
                    } else {
                        MINT.Toast({
                          message: self.$t('deleteFailDesc'),
                          position: 'bottom',
                          duration: 2000
                        });
                    }

                } else {
                    MINT.Toast({
                      message: self.$t('deleteFailDesc'),
                      position: 'bottom',
                      duration: 2000
                    });
                }
                MINT.Indicator.close();
                self.onBackIndex();
            },
            onLoadHWDevices: function(res) {
                this.$store.commit("setSiteList", JSON.parse(res));
            },
            onLoadGroups: function(res) {
                this.$store.commit("setGroupList", JSON.parse(res));
            },
            onEditName: function(res) {
                var self = this;
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
                self.onBackIndex();
            },
            onDeviceFound: function (device) {
                var self = this;
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
                                var onLine = self.$t('deviceOnline'),
                                    onLineText = self.getPOrN(device.position, device.name);
                                self.showAdd = false;
                                if (!Util._isEmpty(INSTANCE_TOAST)) {
                                    INSTANCE_TOAST.close();
                                }
                                if (num > 1) {
                                    onLine = self.$t('deviceOnlineNum');
                                    onLineText = num;
                                }
                                INSTANCE_TOAST = MINT.Toast({
                                    message: onLine + ":" + onLineText,
                                    position: 'bottom',
                                });
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
            onDeviceLost: function (mac) {
                var self = this;
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
                                    offLineText = self.getPOrN(item.position, item.name);
                                if (!Util._isEmpty(INSTANCE_TOAST)) {
                                    INSTANCE_TOAST.close();
                                }
                                if (num > 1) {
                                    offLine = self.$t('deviceOfflineNum');
                                    offLineText = num;
                                }
                                INSTANCE_TOAST = MINT.Toast({
                                    message: offLine + ":" + offLineText,
                                    position: 'bottom',
                                });
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
            onDeviceStatusChanged: function (item) {
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
            startBleScan: function() {
                var self = this;
                if (self.$store.state.blueInfo) {
                    espmesh.startBleScan();
                } else {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }

            },
            stopBleScan: function() {
                clearTimeout(SCAN_DEVICE);
                espmesh.stopBleScan();
            },
            onBackIndex: function() {
                var self = this;
                clearTimeout(SCAN_DEVICE);
                window.onBluetoothStateChanged = this.onBluetoothStateChanged;
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
            },
            onWifiStateChanged: function(wifi) {
                var self = this;
                var wifiInfo = this.$store.state.wifiInfo;
                wifi = JSON.parse(wifi);
                if (wifi.connected) {
                    wifi.ssid = decodeURIComponent(wifi.ssid);
                    if (self.wifiNum != 0) {
                        clearTimeout(WIFI_TIMER);
                        WIFI_TIMER = setTimeout(function() {
                            MINT.Toast({
                                message: self.$t('wifiChangeDesc'),
                                position: 'bottom',
                                duration: 2000
                            });
                            if (!self.loadShow) {
                                self.showAdd = false;
                                self.wifiFlag = true;
                                self.loadDesc = self.$t('loading');
                                self.reload();
                            }
                        }, 3000);
                    }
                    self.wifiNum++;
                    self.$store.commit("setWifiInfo", wifi);
                }
            },
            onBluetoothStateChanged: function(blue) {
                if (!Util._isEmpty(blue)) {
                    blue = JSON.parse(blue);
                    if (blue.enable || blue.enable == "true") {
                        blue.enable = true;
                    } else {
                        blue.enable = false;
                    }
                    this.$store.commit("setBlueInfo", blue.enable);
                }
            },
            onScanBLE: function (devices) {
                var self = this,
                    scanList = [], rssiList = [], notExist = [],
                    rssiValue = self.$store.state.rssiInfo;
                if (!Util._isEmpty(devices) && self.$store.state.showScanBle && self.showScanDevice && !self.loadShow) {
                    var conScanDeviceList = self.$store.state.conScanDeviceList;
                    devices = JSON.parse(devices);
                    $.each(devices, function(i, item) {
                        if (item.rssi >= rssiValue && Util.isMesh(item.name, item.version)) {
                            rssiList.push(item);
                        }
                    })
                    if (rssiList.length > 0) {
                        var names = {};
                        $.each(devices, function(i, item) {
                            if (self.listMacs.indexOf(item.mac) == -1) {
                                notExist.push(item.mac);
                                names[item.mac] = item.name;
                                self.listMacs.push(item.mac);
                            }
                        })
                        if (Util._isEmpty(conScanDeviceList) || conScanDeviceList.length <= 0) {
                            if (notExist.length > 0) {
                                self.getDevices(notExist, names);
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
                                    self.getDevices(notExist, names);
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
            onDeviceScanned: function(devices) {
               var self = this;
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
                   MINT.Toast({
                       message: self.$t('notLoadDesc'),
                       position: 'bottom',
                   });
               }
               self.deviceList = Util.uniqeByKeys(self.deviceList, ["mac"]);
               self.loadShow = false;
               self.pullLoad = false;
               self.hideLoad();
               self.$refs.loadmore.onTopLoaded();
               self.$store.commit("setList", self.deviceList);
               setTimeout(function() {
                   if (devices.length > 0) {
                        self.setGroup()
                        self.setPairs();
                        self.clearListMacs();
                   }
                   if (self.$store.state.showScanBle) {
                       self.startBleScan();
                       self.onBackIndex();
                       self.wifiFlag = false;
                   }
               }, 1000)
               

            },
            onDeviceScanning: function(devices) {
                var self = this, macs = [];
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
            onCheckAppVersion: function(res) {
                var self = this;
                var appInfo = self.$store.state.appInfo;
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res)
                    if (res.status == 0) {
                        if (res.version > appInfo.version_code) {
                            self.$store.commit("setIsNewVersion", true);
                            self.$store.commit("setNewAppInfo", res);
                        }
                    }
                }
            },
            onAddQueueTask: function() {
            },
        },
        created: function () {
            window.onDeviceScanned = this.onDeviceScanned;
            window.onDeviceFound = this.onDeviceFound;
            window.onDeviceLost = this.onDeviceLost;
            window.onDeviceStatusChanged = this.onDeviceStatusChanged;
            window.onWifiStateChanged = this.onWifiStateChanged;
            window.onScanBLE = this.onScanBLE;
            window.onDeviceScanning = this.onDeviceScanning;
            window.onTopoScanned = this.onTopoScanned;
            window.onDelDevice = this.onDelDevice;
            window.onEditName = this.onEditName;
            window.onLoadHWDevices = this.onLoadHWDevices;
            window.onLoadGroups = this.onLoadGroups;
            window.onBluetoothStateChanged = this.onBluetoothStateChanged;
            window.onAddQueueTask = this.onAddQueueTask;
            window.onCheckAppVersion = this.onCheckAppVersion;
        },
        components: {
            "v-footer": footer,
            "v-resetDevice": resetDevice,
            "v-addGroup": addGroup,
            "v-operateDevice": operateDevice,
            "v-load": load,
            "v-aboutDevice": aboutDevice,
            "v-otaInfo": otaInfo,
            "v-automation": automation,
            "v-ibeacon": ibeacon,
            "v-scanDevice": scanDevice,
            "v-remind": remind,
            "v-attr": attr,
            "v-setDevicePair": setDevicePair,
            "v-joinDevice": joinDevice,
            "v-command": command,
            "v-sendIP": sendIP,
        }

    });

    return Index;
});
