define(["vue", "MINT", "txt!../../pages/login.html", "../js/register", "../js/password"],
    function(v, MINT, login, register, password) {

    var Login = v.extend({

        template: login,

        data: function(){
            return {
                username: "",
                password: "",
                title: "忘记密码",
                type: "password",
                showPwd: false,
                showBoolen: true,
            }
        },
        mounted: function() {
            window.espmesh.hideCoverImage();
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
                if (self._isEmpty(self.username)) {
                    MINT.Toast({
                        message: '请输入用户名!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.password)) {
                    MINT.Toast({
                        message: '请输入密码!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                var userInfo = {
                    username: self.username
                };
                MINT.Indicator.open();
                setTimeout(function() {
                    var res = window.espmesh.userLogin(self.username, self.password);
                    if (!self._isEmpty(res)) {
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
                                MINT.Toast({
                                    message: '登录失败!',
                                    position: 'bottom',
                                    duration: 2000
                                });
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
                    var res = window.espmesh.userGuestLogin();
                    if (!self._isEmpty(res)) {
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
                                MINT.Toast({
                                    message: '登录失败!',
                                    position: 'bottom',
                                    duration: 2000
                                });
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
                window.onBackPressed = function () {
                    MINT.Toast({
                        message: '再按一次退出程序',
                        position: 'bottom',
                        duration: 2000
                    });
                    if (startTime == 0) {
                        startTime = new Date().getTime();
                    } else {
                        if (new Date().getTime() - startTime < 2000) {
                            window.espmesh.finish();
                        } else {
                            startTime = new Date().getTime();
                        }
                    }



                }

            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
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