define(["vue","MINT", "Util", "txt!../../pages/operateDevice.html", "../js/colorPicker" ],
    function(v, MINT, Util, operateDevice, colorPicker) {

    var OperateDevice = v.extend({

        template: operateDevice,
        props: {
            colorId: {
                type: String
            },
            temperatureId: {
                type: String
            },
            isDevice: {
                type: String
            },
            isRoom: {
                type: String
            }
        },
        data: function(){
            return {
                addFlag: false,
                deviceMacs: "",
                name: "",
                operateType: RECENT_TYPE_DEVICE,
                device: ""
            }
        },
        computed: {

        },
        methods:{
            show: function() {
                var self = this;
                window.onBackPressed = this.hide;
                self.device = self.$store.state.deviceInfo;
                self.name = self.device.name;
                if (!self.$parent.isDevice) {
                    self.deviceMacs = self.device.macs;
                    self.operateType = "";
                } else {
                    self.operateType = RECENT_TYPE_DEVICE;
                    self.deviceMacs = [self.device.mac];
                }
                self.addFlag = true;
                setTimeout(function() {
                    self.$refs.color.show()
                    Util.setStatusBarBLack();
                })
            },
            hide: function () {
                this.addFlag = false;
                Util.setStatusBarBlue();
                this.$store.commit("setShowScanBle", true);
                this.$emit("operateShow");
            },
        },
        components: {
            "v-color": colorPicker
        }

    });

    return OperateDevice;
});