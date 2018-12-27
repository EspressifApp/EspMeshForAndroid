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
                pickerShow: true,
                device: this.$store.state.deviceInfo,
                deviceList: this.$store.state.deviceList,
                leftColor: 0,
                topColor: 0
            }
        },
        methods:{
            show: function() {
                var self = this,
                    hueValue = 0, saturation = 100, luminance = 100, temperature = 0, brightness = 100;
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
            initColor: function (hsbColor, colors) {
                var self = this;
                self.leftColor = self.$store.state.leftColor;
                self.topColor = self.$store.state.topColor;
                self._initColorPicker(hsbColor, self.colorId, self.leftColor, self.topColor, true);
                self._initColorPicker(colors, self.temperatureId, self.leftColor, self.topColor, false);
            },
            pickerChange: function () {
                this.pickerShow = !this.pickerShow;
            },
            editDevice: function(hueValue, saturation, luminance) {
                var meshs = [], changeList = [],
                    rgb = Raphael.getRGB("hsb("+hueValue+","+saturation+
                        ","+luminance+")").hex,
                        macs = this.macs;
                hueValue = Math.round(parseFloat(hueValue) * 360),
                saturation = Math.round(parseFloat(saturation) * 100),
                luminance = Math.round(parseFloat(luminance) * 100);
                meshs.push({cid: HUE_CID, value: hueValue});
                meshs.push({cid: SATURATION_CID, value: saturation});
                meshs.push({cid: VALUE_CID, value: luminance});
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(macs) + ',"'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                    '"characteristics":' + JSON.stringify(meshs) + '}';
                espmesh.addQueueTask("requestDevicesMulticastAsync",data);

                $.each(this.deviceList, function(i, item){
                    if (macs.indexOf(item.mac) > -1) {
                        var doc = $("#" + item.mac);
                        doc.find(".icon-light").css("color", rgb);
                        doc.find(".luminance").text(parseFloat(luminance));
                        $("div[data-id='"+item.mac+"']").find(".icon-light").css("color", rgb);
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
                var docs = $("td.active .td-content");
                docs.find("p").find("i").css("color", rgb);
                this.deviceList = changeList;
                this.$store.commit("setList", this.deviceList);

            },
            editTemperature: function(temperature, brightness) {
                var meshs = [], changeList = [],macs = this.macs;
                temperature = parseFloat(temperature);
                if (temperature > 180) {
                    temperature = temperature - 360;
                }
                temperature = Math.round(parseFloat(Math.abs(temperature)) / 1.8 ),
                brightness = Math.round(parseFloat(brightness) * 100),
                meshs.push({cid: TEMPERATURE_CID, value: temperature});
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
                            }
                            characteristics.push(itemSub);
                        })
                        item.characteristics = characteristics;
                    }
                    changeList.push(item);
                });
                this.deviceList = changeList;
                this.$store.commit("setList", this.deviceList);

            },
            _initColorPicker: function (hsbColor, id, left, top, flag) {
                var self = this;
                $("#" + id).empty();

                Raphael(function () {
                    var cp = Raphael.colorwheel(left, top, INIT_SIZE, hsbColor,
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
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            }

        }

    });

    return ColorPicker;
});