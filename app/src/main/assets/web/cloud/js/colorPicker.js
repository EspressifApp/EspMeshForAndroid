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
                currentStatus: false,
                lightMode: 1,
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
                self.device = self.$store.state.deviceInfo;
                var characteristics = self.device.characteristics;
                if (!Util._isEmpty(characteristics)) {
                    var hsv = characteristics["HSVColor"];
                    hueValue = hsv.value["Hue"];
                    saturation = hsv.value["Saturation"];
                    luminance = hsv.value["Value"];
                    temperature = characteristics["ColorTemperature"].value;
                    temperature = parseInt((temperature - 2000) / 50);
                    brightness = characteristics["Brightness"].value;
                    self.lightMode = characteristics["LightMode"].value;
                    if (self.lightMode == 1) {
                        self.pickerShow = true;
                    } else {
                        self.pickerShow = false;
                    }
                }


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
                        if (self.macs.indexOf(item.iotId) > -1) {
                            var characteristics = item.characteristics;
                            var status = characteristics["LightSwitch"].value;
                            if (status == STATUS_ON) {
                                self.currentStatus = true;
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
                            //self.changRange(type);
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
                    this.editDevice({"LightMode": 1});
                    this.setBordeColor(this.currentHue / 360, this.currentSaturation / 100, 1, this.currentLuminance / 100);
                }
            },
            hidePicker: function () {
                if (this.currentStatus) {
                    this.pickerShow = false;
                    this.initWarmCold(this.currentTemperature, this.currentBrightness);
                    this.editDevice({"LightMode": 0});
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
            editDeviceH: function() {
                this.editDeviceHsv()
            },
            editDeviceWhite: function() {
                if (!this.currentStatus) {
                    this.close();
                } else {
                    this.currentSaturation = 0;
                    this.editDeviceS();
                    $("#" + this.colorId + "saturation").slider("value", 0);
                }

            },
            editDeviceS: function(saturation) {
                this.editDeviceHsv();
            },
            editDeviceL: function(luminance) {
                this.editDeviceHsv();
            },
            editDeviceHsv: function() {
                var self = this;
                var data = {
                    "HSVColor":{
                        "Hue":  Math.round(self.currentHue),
                        "Saturation": self.currentSaturation,
                        "Value": self.currentLuminance
                    }
                }
                self.editDevice(data);
            },
            editDeviceT: function(temperature) {
                var data = {
                    "ColorTemperature": this.currentTemperature * 50 + 2000
                }
                this.editDevice(data);
            },
            editDeviceB: function(brightness) {
                var data = {
                    "Brightness": this.currentBrightness
                }
                this.editDevice(data);
            },
            close: function () {
                var status = 0;
                if(!this.currentStatus) {
                    status = 1;
                }
                var data = {
                    "LightSwitch": status
                }
                this.editDevice(data)
            },
            editDevice: function(data) {
                var self = this;
                console.log(JSON.stringify(data));
                console.log(JSON.stringify(self.macs));
                aliyun.setAliDeviceProperties(JSON.stringify({"iotId":self.macs,"properties":data}));
                self.setDeviceStatus(data);
                setTimeout(function() {
                    window.onBackPressed = self.hide;
                });
            },
            setDeviceStatus: function(data) {
                if (Util.setAliDeviceStatus(this, this.macs, data)) {
                    this.getDeviceStatus();
                }
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
//                            if (self.pickerShow) {
//                                self.editDeviceH(h);
//                            }
                        };
                    };
                    cp.onchange = onchange(cp);
                    $(document).on("touchend", "#"+id, function () {
                        if (isChange) {
                            if (self.pickerShow) {
                                self.currentSaturation = 100;
                                $("#" + self.colorId + "saturation").slider("value", 100);
                                self.editDeviceH();
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