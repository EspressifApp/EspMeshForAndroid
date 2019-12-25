define(["vue","MINT", "Util",  "txt!../../pages/blueFail.html" ],
    function(v, MINT, Util,  blueFail) {

        var BlueFail = v.extend({

            template: blueFail,
            data: function(){
                return {
                    flag: false,
                    systemInfo: true
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    if (this.$store.state.systemInfo != "Android") {
                        this.systemInfo = false;
                    }
                    this.flag = true;
                },
                setBluetooth: function() {
                    Util.gotoSystemSettings("bluetooth");
                },
                setLocation: function() {
                    Util.gotoSystemSettings("location");
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("blueFailShow");
                }
            }

        });

        return BlueFail;
    });