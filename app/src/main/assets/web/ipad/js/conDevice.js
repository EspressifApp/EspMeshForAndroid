define(["vue", "MINT", "Common", "Util", "txt!../../pages/conDevice.html"], function(v, MINT, Common, Util, conDevice) {

    var ConDevice = v.extend({

        template: conDevice,
        props: {
            meshId: {
                type: String
            },
            wifiName: {
                type: String
            },
            password: {
                type: String
            },
            moreObj: {
                type: Object
            }
        },
        data: function(){
            return {
                addFlag: false,
                value: 0,
                title: this.$t('connetDeviceTitle'),
                desc: this.$t('connetDeviceDesc'),
                textList: [],
                rssiList: [],
                wifiInfo: {},
                count: 0,
                success: true,
                timerId: "",
            }
        },
        methods:{
            show: function() {
                window.onBackPressed = this.hide;
                window.onConfigureProgress = this.onConfigureProgress;
                window.onScanBLE = this.onConScanBLE;
                Common.stopBleScan();
                this.wifiInfo = this.$store.state.wifiInfo;
                console.log(JSON.stringify(this.wifiInfo));
                this.addFlag = true;
                this.value = 0;
                this.count = 0;
                this.textList = [];
                this.rssiList = [];
                this.conWifi();
            },
            hide: function () {
                this.addFlag = false;
                Common.stopBleScan();
                espmesh.stopConfigureBlufi();
                this.$emit("conShow");
            },
            conWifi: function () {
                Common.conWifi(this);
            },
            setTimer: function() {
                Common.setTimer(this);
            },
            onConScanBLE: function (devices) {
                var self = this, list = [];
                devices = JSON.parse(devices);
                $.each(devices, function(i, item) {
                    var name = item.name;
                    if (self.$store.state.systemInfo == "Android") {
                        name = Util.Base64.decode(name);
                    }
                    if (Util.isMesh(name, item.version, item.beacon)) {
                        list.push(item);
                    }
                })
                self.rssiList = list;
            },
            onConfigureProgress: function(config) {
                Common.onConfigureProgress(this, config);
            },
            setFail: function(msg) {
                Common.setFail(this, msg);
            }
        }
    });

    return ConDevice;
});