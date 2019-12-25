define(["vue", "MINT", "Util", "txt!../../pages/register.html"], function(v, MINT, Util, register) {

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
                    Util.toast(MINT, '请输入用户邮箱!');
                    return false;
                }
                if (self._isEmpty(self.username)) {
                    Util.toast(MINT, '请输入用户名称!');
                    return false;
                }
                if (self._isEmpty(self.password)) {
                    Util.toast(MINT, '请输入用户密码!');
                    return false;
                }
                if (self._isEmpty(self.repassword)) {
                    Util.toast(MINT, '请输入确认密码!');
                    return false;
                }
                if (self.repassword != self.password) {
                    Util.toast(MINT, '两次输入的密码不一致!');
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function () {
                    var res = espmesh.userRegister(self.email, self.username, self.password);
                    MINT.Indicator.close();

                    if (!self._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.status == 0) {
                            Util.toast(MINT, "注册成功");
                            self.hide();
                        } else {
                            Util.toast(MINT, "注册失败");
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