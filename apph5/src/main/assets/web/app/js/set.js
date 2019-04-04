define(["vue", "MINT", "Util", "txt!../../pages/set.html", "../js/aboutUs", "../js/newVersion"],
    function(v, MINT, Util, set, aboutUs, newVersion) {

    var Set = v.extend({

        template: set,

        data: function(){
            return {
                flag: false,
                isNewVersion: false,
            }
        },
        computed: {
            newVersion: function() {
                this.isNewVersion = this.$store.state.isNewVersion;
                return this.isNewVersion;
            }
        },
        methods:{
            show: function () {
                this.hideThis();
                window.onCheckAppVersion = this.onCheckAppVersion;

                this.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("setShow");
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