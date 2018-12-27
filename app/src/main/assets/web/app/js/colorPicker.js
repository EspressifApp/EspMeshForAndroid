define(["vue","MINT", "txt!../../pages/colorPicker.html"], function(v, MINT, colorPicker) {

    var ColorPicker = v.extend({
        template: colorPicker,
        props: {
            colorType: {
                type: String
            },
            macs: {
                type: Array
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
                initSize: 260,
                pickerShow: true,
                device: this.$store.state.deviceInfo,
                deviceList: this.$store.state.deviceList
            }
        },
        methods:{
            show: function() {
                var self = this,
                    hueValue = 0, saturation = 100, luminance = 100, temperature = 0, brightness = 10;
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
                var hsbColor = "hsb("+hueValue / 360+","+saturation / 100+","+luminance / 100+")";
                self.initColor(hsbColor, [temperature, brightness]);
            },
            hide: function() {
                this.$emit("colorShow");
            },
            initColor: function (hsbColor, colors) {
                var doc = $(document),
                    width = doc.width();
                this._initColorPicker(hsbColor, this.colorId,(width - this.initSize) / 2, 80, true);
                this._initColorPicker(colors, this.temperatureId,(width - this.initSize) / 2, 80, false);
            },
            pickerChange: function () {
                this.pickerShow = !this.pickerShow;
            },
            editDevice: function(hueValue, saturation, luminance) {
                var self = this, meshs = [], changeList = [],
                    rgb = Raphael.getRGB("hsb("+hueValue+","+saturation+
                        ","+luminance+")").hex,
                    macs = this.macs;
                hueValue = Math.round(parseFloat(hueValue) * 360);
                saturation = Math.round(parseFloat(saturation) * 100);
                luminance = Math.round(parseFloat(luminance) * 100);
                if (luminance != 0) {
                    meshs.push({cid: HUE_CID, value: hueValue});
                    meshs.push({cid: SATURATION_CID, value: saturation});
                }
                meshs.push({cid: VALUE_CID, value: luminance});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask("requestDevicesMulticastAsync",data);

                $.each(this.deviceList, function(i, item){
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
                            } else if (itemSub.cid == MODE_CID) {
                                itemSub.value = parseInt(MODE_HSV);
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

            },
            editTemperature: function(temperature, brightness) {
                var self = this, meshs = [], changeList = [],macs = this.macs;
                temperature = parseFloat(temperature);
                if (temperature > 180) {
                    temperature = temperature - 360;
                }
                temperature = Math.round(parseFloat(Math.abs(temperature)) / 1.8 );
                brightness = Math.round(parseFloat(brightness) * 100);
                if (brightness != 0) {
                    meshs.push({cid: TEMPERATURE_CID, value: temperature});
                }
                meshs.push({cid: BRIGHTNESS_CID, value: brightness});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask("requestDevicesMulticastAsync",data);
                $.each(this.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var characteristics = [];
                        $.each(item.characteristics, function(j, itemSub) {
                            if (itemSub.cid == TEMPERATURE_CID) {
                                itemSub.value = parseInt(temperature);
                            }else if (itemSub.cid == BRIGHTNESS_CID) {
                                itemSub.value = parseInt(brightness);
                            } else if (itemSub.cid == STATUS_CID) {
                                itemSub.value = parseInt(STATUS_ON);
                            } else if (itemSub.cid == MODE_CID) {
                                itemSub.value = parseInt(MODE_CTB);
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
            },
            _initColorPicker: function (hsbColor, id, left, top, flag) {
                var self = this;
                $("#" + id).empty();
                Raphael(function () {
                    var cp = Raphael.colorwheel(left, top, self.initSize, hsbColor,
                        document.getElementById(id), 100, 60, flag),
                        clr = hsbColor, h = 0, s = 0, l = 0, t = 0, b = 0, isChange = false;;
                    var onchange = function (item) {
                        return function (clr) {
                            clr = Raphael.color(clr, self.pickerShow);
                            clr=Raphael.rgb2hsb(clr.r, clr.g, clr.b);
                            h = clr.h;
                            s = clr.s;
                            l = Math.abs(clr.b);
                            t = cp.getHSTH();
                            b = cp.getB();
                            isChange = true;
                        };
                    };
                    cp.onchange = onchange(cp);
                    $(document).on("touchend", "#"+id, function () {
                        if (isChange) {
                            if (self.pickerShow) {
                                self.editDevice(h, s, l);
                            } else {
                                self.editTemperature(t, b);
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