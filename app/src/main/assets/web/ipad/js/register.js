define(["vue", "MINT", "txt!../../pages/register.html"], function(v, MINT, register) {

    var Register = v.extend({

        template: register,

        data: function(){
            return {
                email: "",
                username: "",
                password: "",
                repassword: "",
                regShow: false
            }
        },
        methods:{
            register: function () {
                var self = this;
                if (self._isEmpty(self.email)) {
                    MINT.Toast({
                        message: '请输入用户邮箱!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.username)) {
                    MINT.Toast({
                        message: '请输入用户名称!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.password)) {
                    MINT.Toast({
                        message: '请输入用户密码!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self._isEmpty(self.repassword)) {
                    MINT.Toast({
                        message: '请输入确认密码!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                if (self.repassword != self.password) {
                    MINT.Toast({
                        message: '两次输入的密码不一致!',
                        position: 'bottom',
                        duration: 2000
                    });
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function () {
                    var res = window.espmesh.userRegister(self.email, self.username, self.password);
                    MINT.Indicator.close();

                    if (!self._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.status == 0) {
                            MINT.Toast({
                                message: "注册成功",
                                position: 'bottom',
                                duration: 2000
                            });
                            self.hide();
                        } else {
                            MINT.Toast({
                                message: "注册失败",
                                position: 'bottom',
                                duration: 2000
                            });

                        }
                    }

                }, 100);


            },
            show: function () {
                 window.onBackPressed = this.hide;
                this.regShow = true;
            },
            hide: function () {
                this.regShow = false;
                this.$emit("regShow");
            },
            _isEmpty: function (str) {
                if (str === "" || str === null || str === undefined ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    });

    return Register;
});