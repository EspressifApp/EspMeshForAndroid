define(["vue","MINT", "txt!../../pages/aboutUs.html" ],
    function(v, MINT, aboutUs) {

        var AboutUs = v.extend({

            template: aboutUs,
            data: function(){
                return {
                    addFlag: false,
                    appInfo: "",
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.appInfo = this.$store.state.appInfo;
                    this.addFlag = true;
                },
                hide: function () {
                    this.$emit("aboutUs");
                    this.addFlag = false;
                },
                accessUs: function () {
                    window.location.href = "https://www.espressif.com";
                }

            }

        });

        return AboutUs;
    });