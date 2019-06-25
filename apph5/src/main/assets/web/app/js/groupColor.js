define(["vue", "MINT", "Util", "txt!../../pages/groupColor.html", "../js/colorPicker", "../js/groupInfo",
    "../js/otaInfo", "../js/joinMesh", "./command"],
    function(v, MINT, Util, groupColor, colorPicker, groupInfo, otaInfo, joinMesh, command) {

    var GroupColor = v.extend({

        template: groupColor,
        props: {
            group: {
                type: String
            },
            lightId: {
                type: String
            },
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            }

        },
        data: function(){
            return {
                showFlag: false,
                infoShow: false,
                sceneList: [
                   {name: this.$t('read'), icon: "icon-read", h: "34", s: "96", b: "99"},
                   {name: this.$t('athletics'), icon: "icon-ball", h: "222", s: "57", b: "91"},
                   {name: this.$t('dinner'), icon: "icon-rice", h: "176", s: "55", b: "77"},
                   {name: this.$t('sleep'), icon: "icon-moon", h: "273", s: "61", b: "76"},
                   {name: this.$t('thinking'), icon: "icon-thinking", h: "155", s: "72", b: "74"},
                   {name: this.$t('work'), icon: "icon-work", h: "99", s: "73", b: "70"},
                   {name: this.$t('recreation'), icon: "icon-film", h: "48", s: "95", b: "99"},
                   {name: this.$t('alarm'), icon: "icon-alarm", h: "344", s: "81", b: "96"},
                   {name: this.$t('love'), icon: "icon-love", h: "357", s: "60", b: "99"},
                ],
                showSet: false,
                showColor: false,
                editColorId: "edit-color-id",
                otaGroupColorId: "ota-group-color-id",
                joinMeshColor:"join-mesh-color",
                joinSliderColor: "join-slider-color",
                colorSelectedAllId: "color-selected-id",
                otaMacs: [],
                commandColorMacs: [],
                operateType: RECENT_TYPE_GROUP,
                operateCurrent: 0,
                deviceList: [],
                groupMacs: [],
                groupDevices: [],
                total: 0,
                selected: 0,
                groupList: [],
                attrList: [],
                isSelectedMacs: [],
            }
        },
        computed: {
            colorList: function(){
                var self = this;
                self.groupDevices = [];
                if (self.showFlag) {
                    self.deviceList = self.$store.state.deviceList;
                    self.groupList = self.$store.state.groupList;
                    $.each(self.groupList, function(i, item) {
                        if (item.id == self.group.id) {
                            self.group = item;
                        }
                    });
                    self.getGroupDevices();
                }
                if ($("#" + self.colorSelectedAllId).hasClass("active")) {
                    var allMacs = [];
                    $.each(self.groupDevices, function(i, item) {
                        allMacs.push(item.mac);
                    })
                    self.isSelectedMacs = allMacs;
                }
                setTimeout(function() {
                    var docs = $("#" + self.lightId + " .item span.span-radio.active");
                    self.selected = docs.length;
                });
                self.total = self.groupDevices.length;
                return self.groupDevices;
            }

        },
        methods:{
            show: function() {
                var self = this;
                self.onBackGroupColor();
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
                self.getGroupDevices();
                self.isSelectedMacs = [];
                $("#" +self.colorSelectedAllId).addClass("active");
                self.isShowSet();
                $(".slider-input").slider('destroy');
                self.showFlag = true;
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
                $.each(emptyList, function(i, item) {
                    arrayList.push(item);
                });
                return arrayList;
            },
            hide: function () {
                this.$emit("groupColorShow");
                this.showFlag = false;
                this.$refs.color.hideColor();
            },
            showDesc: function(position) {
                var flag = false;
                if (!Util._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            isShowSet: function() {
                var self = this,
                    macs = self.group.device_macs,
                    isFlag = true;

                $.each(self.deviceList, function(i, item) {
                    if (macs.indexOf(item.mac) != -1) {
                        var id = item.tid;
                        if (id >= MIN_LIGHT &&  id <= MAX_LIGHT) {
                            isFlag = false;
                            return false;
                        }
                    }
                });
                if (isFlag) {
                    self.attrList = [];
                    self.getAttrList();
                    self.showSet = true;
                    self.operateCurrent = 3;
                    self.showColor = false;
                } else {
                    self.showSet = false;
                    self.operateCurrent = 0;
                    self.showColor = true;
                }
            },
            onBackGroupColor: function () {
                window.onBackPressed = this.hide;
            },
            showOperate: function () {
                window.onBackPressed = this.hideOperate;
                this.infoShow = true;
            },
            showOta: function () {
                this.infoShow = false;
                this.otaMacs = [];
                this.otaMacs = this.getMacs();
                if (this.otaMacs.length == 0) {
                    MINT.Toast({
                        message: self.$t('deviceOtaDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                this.$refs.ota.show();
            },
            showCommand: function () {
                var self = this;
                self.infoShow = false;
                self.commandColorMacs = [];
                self.commandColorMacs = self.getMacs();
                if (self.commandColorMacs.length == 0) {
                    return false;
                }
                setTimeout(function() {
                    self.$refs.command.show();
                })
            },
            hideOperate: function () {
                window.onBackPressed = this.hide;
                this.infoShow = false;
            },
            getGroupDevices: function() {
                var self = this,
                    macs = self.group.device_macs;
                self.groupDevices = [];
                $.each(self.deviceList, function(i, item) {
                    if(macs.indexOf(item.mac) > -1) {
                        self.groupDevices.push(item);
                    }
                });
                self.groupDevices = self.sortList(self.groupDevices);
                self.total = self.selected = self.groupDevices.length;
            },
            addSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num == -1) {
                    this.isSelectedMacs.push(mac);
                }
            },
            delSelectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num != -1) {
                    this.isSelectedMacs.splice(num, 1);
                }
            },
            selectMac: function(mac) {
                var num = this.isSelectedMacs.indexOf(mac);
                if (num == -1) {
                    this.isSelectedMacs.push(mac);
                } else {
                    this.isSelectedMacs.splice(num, 1);
                }
                this.selected = this.isSelectedMacs.length;
            },
            isSelected: function(mac) {
                var self = this,
                    flag = false;
                if (self.isSelectedMacs.indexOf(mac) != -1) {
                    flag = true;
                }
                return flag;
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget).find("span.span-radio")[0];
                if ($(doc).hasClass("active")) {
                    $(doc).removeClass("active");
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    $(doc).addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.total;
                    var allMacs = [];
                    $.each(this.groupDevices, function(i, item) {
                        allMacs.push(item.mac);
                    })
                    this.isSelectedMacs = allMacs;
                }

            },
            getMacs: function() {
                var docs = $("#"+ this.lightId + " .item span.span-radio.active"),
                    macs = [];
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                console.log(JSON.stringify(macs));
                return macs;
            },
            groupInfo: function () {
                this.hideOperate();
                this.$refs.info.show();
            },
            getIcon: function (tid) {
                if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                    return "icon-light";
                } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                    return "icon-power";
                } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                    return "icon-sensor";
                }
            },
            getGroupColor: function (characteristics, tid) {
                var self = this,
                    hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                    mode = 0, temperature = 0, brightness = 0;
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
                if (status == STATUS_ON) {
                    if (mode == MODE_CTB) {
                        rgb = Util.modeFun(temperature, brightness);
                    } else {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }

                }
                if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                    rgb = "#3ec2fc";
                }
                return rgb;
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

            getPosition: function(position) {
                return Util.getPosition(position);
            },
            getStatusByGroup: function (macs) {
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
            editName: function () {
                var self = this;
                if (self.group.is_user) {
                    MINT.Toast({
                        message: self.$t('prohibitEditDesc'),
                        position: 'middle',
                    });
                } else{
                    self.hideOperate();
                    MINT.MessageBox.prompt(self.$t('editNameInput'), self.$t('addGroupTitle'),
                        {inputValue: self.group.name, inputPlaceholder: self.$t('addGroupInput'),
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                        self.group.name = obj.value;
                        espmesh.saveGroups(JSON.stringify([self.group]));
                        self.changeStore();
                        self.groupList.push(self.group);
                        self.$store.commit("setGroupList", self.groupList);
                    });
                }
            },
            dissolutionGroup: function (e) {
                var self = this,
                    doc = $(e.currentTarget);
                if (self.group.is_user) {
                    MINT.Toast({
                        message: self.$t('prohibitDelDesc'),
                        position: 'middle',
                    });
                } else {
                    MINT.MessageBox.confirm(self.$t('delGroupDesc'), self.$t('delGroupTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        self.hideOperate();
                        espmesh.deleteGroup(self.group.id);
                        self.changeStore();
                        self.$store.commit("setGroupList", self.groupList);
                        var list = self.$store.state.mixList;
                        $.each(list, function(i, item) {
                            if (item.type == RECENT_TYPE_GROUP) {
                                if (item.obj.id == self.group.id) {
                                    list.splice(i, 1);
                                    return false;
                                }
                            }
                        })
                        self.$store.commit("setRecentList", list);
                        self.hideOperate();
                        self.hide();
                    });
                }
            },
            delDevices: function (e) {
                var doc = $(e.currentTarget),
                    self = this;
                MINT.MessageBox.confirm(self.$t('deleteGroupDeviceDesc'), self.$t('reconfigure'),{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideOperate();
                    MINT.Indicator.open();
                    setTimeout(function() {
                        var macs = self.getMacs();
                        var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'", "'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + RESET_DEVICE + '","' +
                                        DEVICE_DELAY + '": ' + DELAY_TIME + '}';
                        espmesh.requestDevicesMulticast(data);
                        espmesh.removeDevicesForMacs(JSON.stringify(macs));
                        var devices = [];
                        $.each(self.deviceList, function(i, item) {
                            if (macs.indexOf(item.mac) < 0) {
                                devices.push(item);
                            }
                        })
                        MINT.Indicator.close();
                        self.hideOperate();
                        self.hide();
                        self.deviceList = devices;
                        self.$store.commit("setList", self.deviceList);
                    }, 1000);
                });
            },
            close: function (status) {
                var self = this, meshs = [],
                    macs = self.getMacs();
                self.currentStatus = (status == STATUS_ON ? true : false);
                meshs.push({cid: STATUS_CID, value: parseInt(status)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                           '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.requestDevicesMulticast(data);
                self.changeDevice(macs, status);
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
            changeStore: function () {
                var self = this;
                $.each(self.groupList, function(i, item) {
                    if (item.id == self.group.id) {
                        self.groupList.splice(i, 1);
                        return false;
                    }
                });

            },
            operate: function (id, e) {
                var self = this;
                self.groupMacs = self.getMacs();
                if (id == 1) {
                    setTimeout(function() {
                        self.$refs.color.show();
                    }, 200)
                }
                self.operateCurrent = id;
            },
            getColor: function (h, s, b) {
                return Raphael.getRGB("hsb(" + h / 360 + "," + s / 100 + "," + b / 100 + ")").hex;
            },
            initAttrSlider: function(id, value, perms, min, max, step) {
                var self = this;
                setTimeout(function() {
                   $("#" + id).slider({
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
                   });
                   if (self.isReadable(perms) && !self.isWritable(perms)) {
                       $("#" + id).slider("disable");
                   }
                    $("#" + id).parent().parent().find(".icon-blue").text(value);
                })

                return true;
            },
            isShowInput: function(perms) {
                var self = this, flag = true;
                if (self.isReadable(perms) && !self.isWritable(perms)) {
                    flag = false;
                }
                return flag;
            },
            getAttrList: function() {
                var self = this;
                if (self.groupDevices.length > 0) {
                    $.each(self.groupDevices[0].characteristics, function(i, item) {
                        if (self.isReadable(item.perms) || self.isWritable(item.perms)) {
                            self.attrList.push(item);
                        }
                    });
                }
            },
            isReadable: function(perms) {
                return (perms & 1) == 1;
            },
            isWritable: function(perms) {
                return ((perms >> 1) & 1) == 1;
            },
            changValue: function(e, cid) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent(),
                    value = doc.val();
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            resetValue: function(value, cid, e) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent();
                docParent.find(".input-value").val(value);
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            sendValue: function(e) {
                var self = this,
                    doc = $(e.currentTarget),
                    docInput = $(doc).parent().parent().find(".input-value"),
                    value = docInput.val(),
                    cid = docInput.attr("data-cid");
                self.setAttr(cid, value);
            },
            setAttr: function(cid, value) {
                var self = this,
                    meshs = [],
                    characteristics = [],
                    attrFlag = false,
                    macs = self.getMacs();
                $.each(self.groupDevices, function(i, item) {
                    if (macs.indexOf(item.mac) > -1) {
                        $.each(item.characteristics, function(j, itemSub) {
                            if (itemSub.cid == cid) {
                                itemSub.value = parseInt(value);
                                item.characteristics.splice(j, 1, itemSub);
                                return false;
                            }
                        })
                        self.groupDevices.splice(i, 1, item);
                    }

                });
                $.each(self.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        $.each(self.groupDevices, function(j, itemSub){
                            if (item.mac == itemSub.mac) {
                                self.deviceList.splice(i, 1, itemSub);
                            }
                        })
                    }
                });
                meshs.push({cid: parseInt(cid), value: parseInt(value)});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.requestDevicesMulticast(data);
                self.$store.commit("setList", self.deviceList);

            },
            setScene: function(hueValue, saturation, luminance) {
                var self = this, meshs = [], changeList = [],
                    rgb = Raphael.getRGB("hsb("+hueValue+","+saturation+
                        ","+luminance+")").hex,
                        macs = self.getMacs();
                hueValue = Math.round(parseFloat(hueValue)),
                saturation = Math.round(parseFloat(saturation)),
                luminance = Math.round(parseFloat(luminance));
                meshs.push({cid: HUE_CID, value: hueValue});
                meshs.push({cid: SATURATION_CID, value: saturation});
                meshs.push({cid: VALUE_CID, value: luminance});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask(JSON.stringify({"method":"requestDevicesMulticast","argument": data}));
                console.log(self.deviceList.length);
                $.each(self.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(j, itemSub) {
                            if (itemSub.cid == HUE_CID) {
                                itemSub.value = parseInt(hueValue);
                            }else if (itemSub.cid == SATURATION_CID) {
                                itemSub.value = parseInt(saturation);
                            }else if (itemSub.cid == VALUE_CID) {
                                itemSub.value = parseInt(luminance);
                            } else if (itemSub.cid == STATUS_CID) {
                                itemSub.value = parseInt(STATUS_ON);
                            }
                            characteristics.push(itemSub);
                        })
                        item.characteristics = characteristics;
                    }
                    changeList.push(item);
                });

                self.deviceList = changeList;
                self.$store.commit("setList", self.deviceList);
                setTimeout(function() {
                    window.onBackPressed = self.hide;
                });
            }
        },
        components: {
            "v-groupInfo": groupInfo,
            "v-color": colorPicker,
            "v-otaInfo": otaInfo,
            "v-joinMesh": joinMesh,
            "v-command": command
        }

    });

    return GroupColor;
});