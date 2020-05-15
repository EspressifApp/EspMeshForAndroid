define(["vue", "MINT", "Util", "txt!../../pages/set.html", "../js/aboutUs", "../js/newVersion"],
    function(v, MINT, Util, set, aboutUs, newVersion) {

    var Set = v.extend({

        template: set,

        data: function(){
            return {
                flag: false,
                isNewVersion: false,
                time: 0,
                rootMac: "",
                playRelease: true
            }
        },
        computed: {
            newVersion: function() {
                this.isNewVersion = this.$store.state.isNewVersion;
                return this.isNewVersion;
            },
            delayTime: function() {
                return this.$store.state.delayTime;
            }
        },
        methods:{
            show: function () {
                this.hideThis();
                var appInfo = this.$store.state.appInfo;
                if (appInfo.play_release) {
                    this.playRelease = false;
                }
                window.onCheckAppVersion = this.onCheckAppVersion;
                window.onGetTsfTime = this.onGetTsfTime;
                this.flag = true;
            },
            hide: function () {
                this.flag = false;
                MINT.Indicator.close();
                this.$emit("setShow");
            },
            showDelay: function() {
                var self= this;
                MINT.MessageBox.prompt(self.$t("enterDelay"), self.$t("delaySet"),
                    {inputValue: this.time, inputType: 'number',
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(obj)  {
                    var deviceList = self.$store.state.deviceList, rootMac = "";
                    if (deviceList.length == 0) {
                        Util.toast(MINT, self.$t('saveFailDesc'));
                        return false;
                    }
                    self.time = parseInt(obj.value);
                    MINT.Indicator.open();
                    $.each(deviceList, function(i, item) {
                        if (item.layer == 1) {
                            rootMac = item.mac;
                            return false;
                        }
                    })
                    var data = '{"' + MESH_MAC + '": "' + rootMac +
                            '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + GET_TSF_TIME + '"' +
                            ',"callback": "onGetTsfTime"}}';
                    setTimeout(function() {
                        espmesh.requestDevice(data);
                    }, 1000)
                });
            },
            newVersionShow: function() {
                if (this.isNewVersion) {
                    this.$refs.newVersion.show();
                } else {
                    MINT.Indicator.open();
                    setTimeout(function() {
                        espmesh.checkAppVersion();
                    }, 1000);
                }
            },
            showAboutUs: function () {
                this.$refs.aboutUs.show();
            },
            hideThis: function () {
                window.onBackPressed = this.hide;
            },
            updateApp: function() {
            },
            onGetTsfTime: function(res) {
                MINT.Indicator.close();
                if (!Util._isEmpty(res) && res != "{}") {
                    res = JSON.parse(res);
                    console.log(this.time);
                    this.$store.commit("setDelayTime", this.time);
                    this.$store.commit("setTsfTime", new Date().getTime() * 1000 - parseInt(res.result.tsf_time));
                    Util.toast(MINT, this.$t('saveSuccessDesc'));
                } else {
                    this.time = this.$store.state.delayTime;
                    Util.toast(MINT, this.$t('saveFailDesc'));
                }
            },
            onCheckAppVersion: function(res) {
                var self = this;
                var appInfo = self.$store.state.appInfo;
                MINT.Indicator.close();
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res)
                    if (res.status == 0) {
                        if (res.version > appInfo.version_code) {
                            self.$store.commit("setIsNewVersion", true);
                            self.$store.commit("setNewAppInfo", res);
                            if (self.flag) {
                                self.$refs.newVersion.show();
                            }
                        }
                    }
                }
            },

        },
        components: {
            "v-aboutUs": aboutUs,
            "v-newVersion": newVersion
        }
    });
    return Set;
});