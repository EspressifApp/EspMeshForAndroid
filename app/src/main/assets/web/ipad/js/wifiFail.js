define(["vue","MINT", "Util", "txt!../../pages/wifiFail.html" ],
    function(v, MINT, Util, wifiFail) {

        var WifiFail = v.extend({

            template: wifiFail,
            data: function(){
                return {
                    flag: false,
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.flag = true;
                },
                setWifi: function() {
                    Util.gotoSystemSettings("wifi");
                },
                setLocation: function() {
                    Util.gotoSystemSettings("location");
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("wifiFailShow");
                }
            }

        });

        return WifiFail;
    });