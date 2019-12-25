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
                isLogin: false,
            }
        },
        computed: {
            newVersion: function() {
                this.isNewVersion = this.$store.state.isNewVersion;
                return this.isNewVersion;
            },
            delayTime: function() {
                this.time = this.$store.state.delayTime
                return this.time;
            }
        },
        methods:{
            show: function () {
                this.hideThis();
                window.onCheckAppVersion = this.onCheckAppVersion;
                window.onGetTsfTime = this.onGetTsfTime;
                this.isLogin = this.$store.state.isLogin;
                this.flag = true;
            },
            hide: function () {
                this.flag = false;
                MINT.Indicator.close();
                this.$emit("setShow");
            },
            logout: function() {
                var self = this;
                MINT.MessageBox.confirm("退出登录后, 将无法获取到云端的设备，是否退出？", "系统提示",{
                    confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    espmesh.userLogout();
                    self.$store.commit("setUserInfo", "");
                    self.$store.commit("setIsLogin", false);
                    self.isLogin = false;
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
                console.log(res);
                if (!Util._isEmpty(res) && res != "{}") {
                    res = JSON.parse(res);

                    this.$store.commit("setTsfTime", new Date().getTime() * 1000 - parseInt(res.result.tsf_time));
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
