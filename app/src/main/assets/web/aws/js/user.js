define(["vue", "MINT", "Util", "txt!../../pages/user.html", "../js/footer", "../js/set", "../js/userinfo",
        "../js/debug", "../js/selectDevice", "../js/tm"],
    function(v, MINT, Util, user, footer, set, userinfo, debug, selectDevice, tm) {

        var User = v.extend({

            template: user,

            data: function(){
                return {
                    user: "user",
                    wifi: "",
                    otaList: [],
                    userInfo: ""
                }
            },
            watch: {
                // 如果路由有变化，会再次执行该方法d
                '$route': function (to, form) {
                    if (to.path == "/user") {
                        if (this.$store.state.isLogin) {
                            this.getAliOTAUpgradeDeviceList();
                        }
                    }

                }
            },
            mounted: function() {
                this.$store.commit("setUserName", "Guest");
                this.$nextTick(function(){
                    console.log("user");
                    window.onBackUser = this.onBackUser;
                    this.getAliOTAUpgradeDeviceList();
                })
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
                currentUser: function() {
                    this.userInfo = this.$store.state.userInfo;
                    console.log("登录信息" + this.userInfo);
                    return this.userInfo != "" ? this.userInfo.userName : "未登录" ;
                }
            },
            methods:{
                login: function() {
                    var self = this;
                    if(self.$store.state.isLogin) {
                        MINT.MessageBox.confirm("您的账户已登录，确定退出重新登录吗？", "系统提示",{
                            confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                            aws.awsUserLogout();
                            self.$store.commit("setUserInfo", "");
                            self.$store.commit("setIsLogin", false);
                            aws.awsUserLogin();
                        });
                    } else {
                        aws.awsUserLogin();
                    }
                },
                getAliOTAUpgradeDeviceList: function() {
                    window.onGetAliOTAUpgradeDeviceList = this.onGetAliOTAUpgradeDeviceList;
                    aliyun.getAliOTAUpgradeDeviceList();
                },
                changeLocal: function() {
                    espmesh.mainPageLoad("app");
                },
                setFun: function () {
                    this.$refs.set.show();
                },
                infoFun: function () {
                    this.$refs.info.show();
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
                },
                onGetAliOTAUpgradeDeviceList: function(res) {
                    console.log(res);
                    var self = this;
                    MINT.Indicator.close();
                    self.otaList = [];
                    var iotIds = [];
                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.code == 200) {
                            if (res.data.length > 0) {
                                res.data.forEach(function(item) {
                                    if (item.status == 1 && iotIds.indexOf(item.iotId) == -1) {
                                        iotIds.push(item.iotId);
                                        self.otaList.push(item);
                                    }
                                })
                            }
                        }

                    }
                }
            },
            components: {
                "v-footer": footer,
                "v-set": set,
                "v-userinfo": userinfo,
                "v-debug": debug,
                "v-selectDevice": selectDevice,
                "v-tm": tm
            }

        });

        return User;
    });
