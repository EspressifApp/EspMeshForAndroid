define(["vue", "MINT", "Util", "txt!../../pages/selectDevice.html", "./automation"],
    function(v, MINT, Util, selectDevice, automation) {

    var SelectDevice = v.extend({

        template: selectDevice,

        data: function(){
            return {
                flag: false,
                autoId: "all-automation-device",
                deviceList: this.$store.state.deviceList,
                searchName: "",
                deviceInfo: ""
            }
        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = this.$store.state.deviceList;
                if (Util._isEmpty(self.searchName)) {
                    return self.deviceList;
                } else {
                    var searchList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (item.name.search(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    return searchList;
                }
            }
        },
        methods:{
            show: function() {
                this.onBackSelectDevice();
                this.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("selectDeviceShow");
            },
            focus: function (e) {
                $(e.currentTarget).parent().addClass("active");
            },
            blur: function (e) {
                $(e.currentTarget).parent().removeClass("active");
            },
            onBackSelectDevice: function () {
                window.onBackPressed = this.hide;
            },
            showAuto: function(item) {
                var self = this;
                self.deviceInfo = item;
                setTimeout(function() {
                    self.$refs.auto.show();
                }, 100)

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
            getColor: function (characteristics, tid) {
                var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
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

        },
        components: {
            "v-automation": automation
        }

    });

    return SelectDevice;
});