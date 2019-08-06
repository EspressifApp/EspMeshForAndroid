define(["vue", "MINT", "Util", "txt!../../pages/user.html", "../js/footer", "../js/set", "../js/userinfo",
     "../js/pair", "../js/selectDevice", "../js/debug", "../js/timingList", "../js/scan", "../js/deviceIbeacon",
     "../js/blueList"],
    function(v, MINT, Util, user, footer, set, userinfo, pair, selectDevice, debug, timingList, scan, deviceIbeacon,
        blueList) {

    var User = v.extend({

        template: user,

        data: function(){
            return {
                user: "user",
                wifi: "",
            }
        },
        mounted: function() {
            this.$store.commit("setUserName", "Guest");
        },
        computed: {
            currentWifi: function () {
                var self = this;
                var wifiInfo = this.$store.state.wifiInfo;
                if (Util._isEmpty(wifiInfo)) {
                    return self.$t('no')
                } else {
                    return wifiInfo.ssid;
                }

            },
        },
        methods:{
            setFun: function () {
                this.$refs.set.show();
            },
            infoFun: function () {
                this.$refs.info.show();
            },
            ibeaconFun: function () {
                this.$refs.ibeacon.show();
            },
            scanFun: function () {
                 this.$refs.scan.show();
            },
            selectFun: function () {
                this.$refs.select.show();
            },
            pairFun: function () {
                this.$refs.pair.show();
            },
            pairListFun: function () {
                this.$refs.pairList.show();
            },
            bugFun: function () {
                this.$refs.debug.show();
            },
            blueFun: function () {
                this.$refs.blueList.show();
            },
            timingListFun: function () {
                this.$refs.timingList.show();
            },
            scanFun: function () {
                this.$refs.scan.show();
            },
            onBackUser: function() {
                var startTime = 0;
                var self = this;
                window.onBackPressed = function () {
                    MINT.Toast({
                        message: self.$t('exitProgramDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    if (startTime == 0) {
                        startTime = new Date().getTime();
                    } else {
                        if (new Date().getTime() - startTime < 2000) {
                            espmesh.finish();
                        } else {
                            startTime = new Date().getTime();
                        }
                    }
                }
            }
        },
        components: {
            "v-footer": footer,
            "v-set": set,
            "v-selectDevice": selectDevice,
            "v-userinfo": userinfo,
            "v-pair": pair,
            "v-debug": debug,
            "v-timingList": timingList,
            "v-scan": scan,
            "v-deviceIbeacon": deviceIbeacon,
            "v-blueList": blueList
        }

    });

    return User;
});