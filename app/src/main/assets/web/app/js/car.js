define(["vue", "MINT", "txt!../../pages/car.html"],
    function(v, MINT, car) {

    var Car = v.extend({

        template: car,
        data: function(){
            return {
                flag: false,
                deviceList: [],
                deviceMacs:[],
                device: {},
                deviceName: "",
            }
        },
        computed: {

        },
        methods:{
            show: function () {
                var self = this;
                window.onBackPressed = self.hide;
                self.device = self.$store.state.deviceInfo;
                self.deviceList = self.$store.state.deviceList;
                self.attrList = [];
                self.deviceName = self.device.name;
                self.flag = true;

            },
            hide: function () {
                this.flag = false;
                this.$store.commit("setShowScanBle", true);
                this.$emit("carShow");
            }
        },
        components: {

        }

    });

    return Car;
});