define(["vue","MINT", "txt!../../pages/privacyPolicy.html" ],
    function(v, MINT, privacyPolicy) {
        var PrivacyPolicy = v.extend({
            template: privacyPolicy,
            data: function(){
                return {
                    flag: false,
                    systemLanguage: this.$store.state.systemLanguage
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.systemLanguage = self.$store.state.systemLanguage;
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                    })
                    self.flag = true;
                },
                hide: function() {
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("privacyPolicyShow");
                    this.flag = false;
                }
            }

        });

        return PrivacyPolicy;
    });