define(["vue", "MINT", "Util", "txt!../../pages/login.html", "../js/register", "../js/password"],
    function(v, MINT, Util, login, register, password) {

    var Login = v.extend({

        template: login,

        data: function(){
            return {
                username: "",
                password: "",
                title: this.$t('forgot'),
                type: "password",
                showPwd: false,
                showBoolen: true,
            }
        },
        mounted: function() {
            setTimeout(function() {
                espmesh.hideCoverImage();
            }, 1000);
            $(document).ready(function () {
             　　$('div.wrapper').height($('body')[0].clientHeight);
            });
            this.onBackLogin();
        },
        computed: {
            icon: function () {
                return this.showPwd ? 'icon-eye' : "icon-eye-off";
            },
        },
        methods:{
            login: function () {
                var self = this;
                if (Util._isEmpty(self.username)) {
                    Util.toast(MINT, self.$t('emailDesc'));
                    return false;
                }
                if (Util._isEmpty(self.password)) {
                    Util.toast(MINT, self.$t('passwordDesc'));
                    return false;
                }
                var userInfo = {
                    username: self.username
                };
                MINT.Indicator.open();
                setTimeout(function() {
                    var res = espmesh.userLogin(self.username, self.password);
                    if (!Util._isEmpty(res)) {
                        setTimeout(function(){
                            MINT.Indicator.close();
                            res = JSON.parse(res);
                            if (res.status == 0) {
                                self.$store.commit("setUserName", self.username);
                                var redirect = decodeURIComponent(self.$route.query.redirect || '/');
                                self.$router.push({//你需要接受路由的参数再跳转
                                    path: redirect
                                });
                            } else {
                                Util.toast(MINT, self.$t('loginFailDesc'));
                            }
                        }, 1000);

                    } else {
                        MINT.Indicator.close();
                    }
                }, 100)

            },
            showPassword: function () {
                this.showPwd = !this.showPwd;
                if (this.type == "password") {
                    this.type = "text";
                } else {
                    this.type = "password";
                }
            },
            guestLogin: function () {
                var self = this;
                MINT.Indicator.open();
                setTimeout(function() {
                    var res = espmesh.userGuestLogin();
                    if (!Util._isEmpty(res)) {
                        setTimeout(function(){
                            MINT.Indicator.close();
                            res = JSON.parse(res);
                            if (res.status == 0) {
                                self.$store.commit("setUserName", res.username);
                                var redirect = decodeURIComponent(self.$route.query.redirect || '/');
                                self.$router.push({//你需要接受路由的参数再跳转
                                    path: redirect
                                });
                            } else {
                                Util.toast(MINT, self.$t('loginFailDesc'));

                            }
                        }, 1000);

                    } else {
                        MINT.Indicator.close();
                    }
                }, 100)
            },
            signup: function () {
                this.$refs.reg.show();
            },
            forgetPwd: function () {
                this.$refs.pwd.show();
            },
            onBackLogin: function() {
                var startTime = 0;
                var self = this;
                window.onBackPressed = function () {
                    Util.toast(MINT, self.$t('exitProgramDesc'))
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
            "v-register": register,
            "v-password": password
        }

    });

    return Login;
});