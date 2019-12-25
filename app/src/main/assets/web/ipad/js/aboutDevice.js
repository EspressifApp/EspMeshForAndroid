define(["vue","MINT", "Common", "Util", "txt!../../pages/aboutDevice.html" ],
    function(v, MINT, Common, Util, aboutDevice) {

        var AboutDevice = v.extend({
            template: aboutDevice,
            props: {
                deviceInfo: {
                    type: Object
                }
            },
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
                hide: function () {
                    this.$emit("aboutShow");
                    this.flag = false;
                },
                getIcon: function () {
                    return Util.getIcon(this.deviceInfo.tid)
                },
                getType: function () {
                    return Common.getType(this, this.deviceInfo.tid)
                },
                getNetwork: function () {
                    return Common.getNetwork(this)
                },
                getColor: function () {
                    return Util.getColor(this.deviceInfo.characteristics, this.deviceInfo.tid);
                }
            }

        });
        return AboutDevice;
    });