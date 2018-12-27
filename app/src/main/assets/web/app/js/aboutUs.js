define(["vue","MINT", "txt!../../pages/aboutUs.html" ],
    function(v, MINT, aboutUs) {

        var AboutUs = v.extend({

            template: aboutUs,
            data: function(){
                return {
                    addFlag: false,
                    versionName: ""
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    this.getInfo();
                    this.addFlag = true;
                },
                hide: function () {
                    this.$emit("aboutUs");
                    this.addFlag = false;
                },
                getInfo: function() {
                    var res = espmesh.getAppInfo();
                    res = JSON.parse(res);
                    this.versionName = res.version_name;
                },
                accessUs: function () {
                    window.location.href = "https://www.espressif.com";
                }

            }

        });

        return AboutUs;
    });