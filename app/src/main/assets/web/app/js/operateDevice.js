define(["vue","MINT", "txt!../../pages/operateDevice.html", "../js/colorPicker" ],
    function(v, MINT, operateDevice, colorPicker) {

    var OperateDevice = v.extend({

        template: operateDevice,
        props: {
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                deviceMacs: "",
                operateType: RECENT_TYPE_DEVICE,
                device: this.$store.state.deviceInfo
            }
        },
        computed: {
            deviceName: function () {
                var self = this;
                self.device = this.$store.state.deviceInfo;
                self.deviceMacs = [this.device.mac];
                return self.device.name;
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                $("#color-wrapper").removeClass("hidden").siblings().addClass("hidden");
                $("#color-wrapper-li").addClass("active").siblings().removeClass("active");
                this.addFlag = true;
                this.$refs.color.show()
            },
            hide: function () {
                this.addFlag = false;
                this.$store.commit("setShowScanBle", true);
                this.$emit("operateShow");
            }
        },
        components: {
            "v-color": colorPicker
        }

    });

    return OperateDevice;
});