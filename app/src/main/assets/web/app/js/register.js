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
                if (Util._isEmpty(self.email)) {
                    Util.toast(MINT, self.$t('emailDesc'));
                    return false;
                }
                if (Util._isEmpty(self.username)) {
                    Util.toast(MINT, self.$t('userNameDesc'));
                    return false;
                }
                if (Util._isEmpty(self.password)) {
                    Util.toast(MINT, self.$t('passwordDesc'));
                    return false;
                }
                if (Util._isEmpty(self.repassword)) {
                    Util.toast(MINT, self.$t('rePasswordDesc'));
                    return false;
                }
                if (self.repassword != self.password) {
                    Util.toast(MINT, self.$t('differentDesc'));
                    return false;
                }
                MINT.Indicator.open();
                setTimeout(function () {
                    var res = espmesh.userRegister(self.email, self.username, self.password);
                    MINT.Indicator.close();

                    if (!Util._isEmpty(res)) {
                        res = JSON.parse(res);
                        if (res.status == 0) {
                            Util.toast(MINT, self.$t('registerSuccessDesc'));
                            self.hide();
                        } else {
                            Util.toast(MINT, self.$t('registerFailDesc'));
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
            }
        }
    });

    return Register;
});