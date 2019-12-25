define(["vue","MINT", "Util", "txt!../../pages/aboutDevice.html" ],
    function(v, MINT, Util, aboutDevice) {

        var AboutDevice = v.extend({

            template: aboutDevice,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false,
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.addFlag = true;
                },
                hide: function () {
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("aboutShow");
                    this.addFlag = false;
                },
                getIcon: function () {
                    var tid = this.deviceInfo.tid;
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        return "icon-light";
                    } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        return "icon-power";
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        return "icon-sensor";
                    }
                },
                getType: function () {
                    var tid = this.deviceInfo.tid,
                        type = "";
                    if (tid >= MIN_LIGHT && tid <= MAX_LIGHT) {
                        type = this.$t('light');
                    } else if (tid >= MIN_SWITCH && tid <= MAX_SWITCH) {
                        type = this.$t('switch');
                    } else if (tid >= MIN_SENSOR && tid <= MAX_SENSOR) {
                        type = this.$t('sensor');
                    }
                    return type;
                },
                getStatus: function () {
                    if (!Util._isEmpty(this.deviceInfo)) {
                        var state = this.deviceInfo.state,
                            len = state.length;
                        if (len == 0) {
                            return this.$t('offline');
                        } else if (len == 1) {
                            var status = state[0];
                            if (status == "local") {
                                return this.$t('local');
                            } else if (status == "cloud") {
                                return this.$t('cloud');
                            } else if (status == "aws") {
                                return this.$t('aws');
                            }
                        } else if (len == 2) {
                            return "内网和外网";
                        }
                    }

                },
                getColor: function () {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b",
                    characteristics = this.deviceInfo.characteristics, tid = this.deviceInfo.tid;
                    $.each(characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    })
                    if (status == STATUS_ON) {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }
                    if (tid < MIN_LIGHT || tid > MAX_LIGHT) {
                        rgb = "#3ec2fc";
                    }
                    return rgb;
                }
            }

        });
        return AboutDevice;
    });