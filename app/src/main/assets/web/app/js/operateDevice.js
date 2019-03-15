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
            },
            getStatus: function() {
                var self = this, status = 0;
                if (!Util._isEmpty(self.device.characteristics)) {
                    var characteristics = self.device.characteristics;
                    $.each(characteristics, function(i, item) {
                        if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    });
                }
                return (status == STATUS_ON ? true : false);
            },
            close: function (status) {
                var self = this, meshs = [], deviceStatus = 0, position = 0,
                    deviceList = this.$store.state.deviceList,
                    mac = self.device.mac;
                $.each(deviceList, function(i, item){
                    if (item.mac == mac) {
                        deviceList.splice(i, 1);
                        position = i;
                        self.device = item;
                        return false;
                    }
                });
                var characteristics = [];
                $.each(self.device.characteristics, function(i, item) {
                    if (item.cid == STATUS_CID) {
                        deviceStatus = item.value;
                        item.value = parseInt(status);
                    }
                    characteristics.push(item);
                });
                if (!deviceStatus == status) {
                    meshs.push({cid: STATUS_CID, value: parseInt(status)});
                    var data = '{"' + MESH_MAC + '": "' + mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';

                    self.device.characteristics = characteristics;
                    deviceList.splice(position, 0, self.device);
                    espmesh.requestDeviceAsync(data);
                    self.$store.commit("setList", deviceList);
                } else {
                    deviceList.splice(position, 0, self.device);
                    self.$store.commit("setList", deviceList);
                }
            },
        },
        components: {
            "v-color": colorPicker
        }

    });

    return OperateDevice;
});