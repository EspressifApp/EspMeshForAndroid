define(["vue","MINT", "Util", "txt!../../pages/colorPicker.html"], function(v, MINT, Util, colorPicker) {

    var ColorPicker = v.extend({
        template: colorPicker,
        props: {
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            },
            colorType: {
                type: String
            },
            macs: {
                type: Array
            },
            isRoom: {
                type: String
            }
        },
        data: function(){
            return {
                initSize: 240,
                showColor: false,
                pickerShow: true,
                device: this.$store.state.deviceInfo,
                deviceList: this.$store.state.deviceList,
                currentHue: 360,
                currentSaturation: 100,
                currentLuminance: 100,
                currentTemperature: 50,
                currentBrightness: 70,
                boxShadow: "none",
                borderColor: "",
                currentStatus: false
            }
        },
        computed: {
            computedWarmCold: function() {
                if (this.showColor && !this.pickerShow) {
                    this.initWarmCold(this.currentTemperature, this.currentBrightness);
                }
            },
            computedRgb: function() {
                if (this.showColor && this.pickerShow) {
                    this.boxShadow = "none";
                    this.setBordeColor(this.currentHue / 360, this.currentSaturation / 100, 1, this.currentLuminance / 100);
                }
            },
            getStatus: function() {

            }
        },
        methods:{
            show: function() {
                var self = this,
                    hueValue = 0, saturation = 0, luminance = 100, temperature = 0, brightness = 100;
                self.deviceList = self.$store.state.deviceList;
                 if (self.colorType == RECENT_TYPE_DEVICE) {
                     self.device = self.$store.state.deviceInfo;
                     $.each(self.device.characteristics, function(i, item) {
                         if (item.cid == HUE_CID) {
                             hueValue = item.value;
                         }else if (item.cid == SATURATION_CID) {
                             saturation = item.value;
                         }else if (item.cid == VALUE_CID) {
                             luminance = item.value;
                         }else if (item.cid == TEMPERATURE_CID) {
                             temperature = item.value;
                         }else if (item.cid == BRIGHTNESS_CID) {
                             brightness = item.value;
                         }
                     })

                 };
                var h = hueValue / 360,
                    s = saturation / 100,
                    b = luminance / 100,
                    hsbColor = "hsb("+h+","+s+","+b+")";
                self.currentHue = hueValue;
                self.currentSaturation = saturation;
                self.currentLuminance = luminance;
                self.currentTemperature = temperature;
                self.currentBrightness = brightness;
                self.setBordeColor(h, s, 1, b);
                self.initColor(hsbColor);
                self.initAttrSlider(self.colorId + "luminance", self.currentLuminance);
                self.initAttrSlider(self.colorId + "saturation", self.currentSaturation);
                self.initAttrSlider(self.colorId + "temperature", self.currentTemperature);
                self.initAttrSlider(self.colorId + "brightness", self.currentBrightness);
                setTimeout(function() {
                    self.showColor = true;
                    self.getDeviceStatus();
                })
            },
            getDeviceStatus: function () {
                var self = this;
                self.currentStatus = false;
                if (!Util._isEmpty(self.macs) && self.macs.length > 0) {
                    $.each(self.deviceList, function(i, item) {
                        if (self.macs.indexOf(item.mac) > -1) {
                            $.each(item.characteristics, function(j, itemSub) {
                                if (itemSub.cid == STATUS_CID) {
                                    if (itemSub.value == STATUS_ON) {
                                        self.currentStatus = true;
                                        return false;
                                    }
                                }
                            });
                            if (self.currentStatus) {
                                return false;
                            }
                        }
                    });
                }
                console.log(self.currentStatus);
            },
            hide: function() {
                this.$emit("colorShow");
            },
            hideColor: function() {
                this.showColor = false;
            },
            initWarmCold: function(currentTemperature, currentBrightness) {
                var r1 = 248,
                    g1 = 207,
                    b1 = 109,
                    r2 = 255,
                    g2 = 255,
                    b2 = 255,
                    r3 = 164,
                    g3 = 213,
                    b3 = 255,
                    r = 0,
                    g = 0,
                    b = 0;
                if(currentTemperature <= 50) {
                    var percentage = currentTemperature / 100 * 2;
                    r = Math.floor((r2 - r1) * percentage) + r1;
                    g = Math.floor((g2 - g1) * percentage) + g1;
                    b = Math.floor((b2 - b1) * percentage) + b1;
                } else {
                    var percentage = (currentTemperature - 50) / 100 * 2;
                    r = r2 - Math.floor((r2 - r3) * percentage);
                    g = g2 - Math.floor((g2 - g3) * percentage);
                    b = b2 - Math.floor((b2 - b3) * percentage);
                }
                this.borderColor = "rgba(" + r + "," + g + "," + b + "," + (currentBrightness / 100) + ")";
                this.boxShadow = "0px 0px " + (currentBrightness * 1.1) +"px " + this.borderColor;
            },
            initAttrSlider: function(id, value) {
                var self = this;
                setTimeout(function() {
                    $("#" + id).slider({
                        range: "min",
                        step: 1,
                        min: 0,
                        max: 100,
                        value: value,
                        slide: function(event, ui) {
                            var type = $(this).attr("data-type");
                            self.changValue(type, ui.value);
                        },
                        stop: function(event, ui) {
                            var type = $(this).attr("data-type");
                            self.changRange(type);
                        }
                    })
                })
                return true;
            },
            initColor: function (hsbColor) {
                var doc = $(document),
                    width = doc.width(),
                    height = doc.height();
                if (height <= 520) {
                    this.initSize = height * 0.31;
                } else {
                    this.initSize = height * 0.345;
                    }
                if (this.initSize > 240) {
                    this.initSize = 240;
                }
                this._initColorPicker(hsbColor, this.colorId,(width - this.initSize) / 2, 80, true);
            },
            showPicker: function () {
                if (this.currentStatus) {
                    this.pickerShow = true;
                    this.setBordeColor(this.currentHue / 360, this.currentSaturation / 100, 1, this.currentLuminance / 100);
                }
            },
            hidePicker: function () {
                if (this.currentStatus) {
                    this.pickerShow = false;
                    this.initWarmCold(this.currentTemperature, this.currentBrightness);
                }
            },
            changValue: function(type, value) {
                var self = this;
                switch(type) {
                    case "luminance": self.currentLuminance = value; break;
                    case "saturation": self.currentSaturation = value; break;
                    case "brightness": self.currentBrightness = value; break;
                    case "temperature": self.currentTemperature = value; break;
                    default: break;
                }
            },
            changRange: function(type) {
                var self = this;
                switch(type) {
                    case "luminance": self.editDeviceL(self.currentLuminance); break;
                    case "saturation": self.editDeviceS(self.currentSaturation); break;
                    case "brightness": self.editDeviceB(self.currentBrightness); break;
                    case "temperature": self.editDeviceT(self.currentTemperature); break;
                    default: break;
                }
            },
            editDeviceH: function(hueValue) {
                hueValue = Math.round(parseFloat(hueValue) * 360);
                this.editDevice(HUE_CID, hueValue);
            },
            editDeviceWhite: function() {
                if (!this.currentStatus) {
                    this.close();
                } else {
                    this.editDeviceS(0);
                    this.currentSaturation = 0;
                    $("#" + this.colorId + "saturation").slider("value", 0);
                }

            },
            editDeviceS: function(saturation) {
                this.editDevice(SATURATION_CID, saturation);
            },
            editDeviceL: function(luminance) {
                this.editDevice(VALUE_CID, luminance);
            },
            editDeviceT: function(temperature) {
                this.editDevice(TEMPERATURE_CID, temperature);
            },
            editDeviceB: function(brightness) {
                this.editDevice(BRIGHTNESS_CID, brightness);
            },
            close: function () {
                var status = 0;
                if(!this.currentStatus) {
                    status = 1;
                }
                this.editDevice(STATUS_CID, parseInt(status));
            },
            editDevice: function(cid, value) {
                var self = this, meshs = [], changeList = [],
                    macs = this.macs;
                meshs.push({cid: cid, value: value});
                if (cid == HUE_CID) {
                    meshs.push({cid: SATURATION_CID, value: 100});
                    self.currentSaturation = 100;
                    $("#" + self.colorId + "saturation").slider( "value", 100);
                }
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',';
                if (self.isRoom) {
                    data += '"' + MESH_GROUP + '": ' + JSON.stringify([self.$store.state.deviceInfo.roomKey]) +
                    ',"isGroup": true,';
                }
                data += '"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' +
                    MESH_REQUEST + '": "' + SET_STATUS + '",' + '"characteristics":' + JSON.stringify(meshs) + '}';
                console.log(data);
                espmesh.addQueueTask(JSON.stringify({"method":"requestDevicesMulticast","argument": data}));
                this.setDeviceStatus(cid, value);
                if (cid == HUE_CID) {
                    this.setDeviceStatus(SATURATION_CID, 100);
                }
                setTimeout(function() {
                    window.onBackPressed = self.hide;
                });
            },
            setDeviceStatus: function(cid, value) {
                var self = this, changeList = [];
                $.each(self.deviceList, function(i, item){
                    if (self.macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(j, itemSub) {
                            if (itemSub.cid == cid) {
                                itemSub.value = parseInt(value);
                            }
                            characteristics.push(itemSub);
                        })
                        item.characteristics = characteristics;
                    }
                    changeList.push(item);
                });
                self.deviceList = changeList;
                if (cid == STATUS_CID) {
                    self.getDeviceStatus();
                }
                self.$store.commit("setList", self.deviceList);
            },
            setBordeColor: function(h, s, b, p) {
                var rgb = Raphael.getRGB("hsb("+h+","+s+","+b+")");
                this.borderColor = "rgba(" + Math.floor(rgb.r) + ", " + Math.floor(rgb.g) + ", " + Math.floor(rgb.b) + ", " + p + ")";
            },
            _initColorPicker: function (hsbColor, id, left, top, flag) {
                var self = this;
                $("#" + id).empty();
                Raphael(function () {
                    var cp = Raphael.colorwheel(left, top, self.initSize, hsbColor,
                        document.getElementById(id), 130, 60, flag),
                        clr = hsbColor, h = 0, s = 0, l = 0, t = 0, b = 0, isChange = false;;
                    var onchange = function (item) {
                        return function (clr) {
                            clr = Raphael.color(clr, self.pickerShow);
                            clr=Raphael.rgb2hsb(clr.r, clr.g, clr.b);
                            h = clr.h;
                            isChange = true;
                            self.currentHue = h * 360;
                        };
                    };
                    cp.onchange = onchange(cp);
                    $(document).on("touchend", "#"+id, function () {
                        if (isChange) {
                            if (self.pickerShow) {
                                self.editDeviceH(h);
                            }
                            isChange = false;
                        }

                    });
                });
            }
        }

    });

    return ColorPicker;
});