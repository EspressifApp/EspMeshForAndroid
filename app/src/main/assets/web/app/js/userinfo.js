define(["vue", "MINT", "txt!../../pages/userinfo.html", "../js/password" ],
    function(v, MINT, userinfo, password) {

    var Userinfo = v.extend({

        template: userinfo,

        data: function(){
            return {
                flag: false,
                title: this.$t('editPwd')
            }
        },
        methods:{
            show: function () {
                this.onBackUserInfo();
                this.flag = true;
            },
            hide: function () {
                this.$emit("userInfoShow");
                this.flag = false;
            },
            onBackUserInfo: function () {
                window.onBackPressed = this.hide;
            },
            changPwd: function () {
                this.$refs.pwd.show();
            },
            logout: function () {
                var self = this;
                MINT.MessageBox.confirm(self.$t('logoutDesc'), "",{
                   confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    espmesh.userLogout();
                    self.$router.push({
                        path: "/login"
                    });
                });

            },
        },
        components: {
            "v-password": password,

        }

    });
    return Userinfo;
});