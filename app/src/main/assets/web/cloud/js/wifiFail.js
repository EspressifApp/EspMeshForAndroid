define(["vue","MINT", "txt!../../pages/wifiFail.html" ],
    function(v, MINT, wifiFail) {

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
                    espmesh.gotoSystemSettings("wifi");
                },
                setLocation: function() {
                     espmesh.gotoSystemSettings("location");
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("wifiFailShow");
                }
            }

        });

        return WifiFail;
    });