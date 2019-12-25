define(["vue","MINT", "Util", "txt!../../pages/operateDevice.html", "./colorPicker" ],
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
                self.device = self.$store.state.deviceCloudInfo;
                console.log(JSON.stringify(self.$store.state.deviceCloudInfo));
                self.deviceMacs = [self.device.iotId];
                self.name = self.device.deviceName;
                console.log();
                setTimeout(function () {
                    self.$refs.colorCloud.show()
                    Util.setStatusBarBlack();
                })
                self.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                Util.setStatusBarBlue();
                this.$store.commit("setShowScanBle", true);
                this.$emit("operateCloudShow");
            },
        },
        components: {
            "v-colorCloud": colorPicker
        }

    });

    return OperateDevice;
});