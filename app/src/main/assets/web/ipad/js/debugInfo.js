define(["vue", "MINT", "txt!../../pages/debugInfo.html"],
    function(v, MINT, debugInfo) {

        var DebugInfo = v.extend({

            template: debugInfo,
            props: {
                debug: {
                    type: Object
                }
            },
            data: function(){
                return {
                    flag: false,
                    infoList: [],
                }
            },
            methods:{
                show: function () {
                    var self = this;
                    self.hideThis();
                    self.infoList = [];
                    self.getInfo();
                    self.flag = true;
                },
                hide: function () {
                    this.flag = false;
                    this.$emit("debugInfoShow");
                },
                hideThis: function () {
                    window.onBackPressed = this.hide;
                },
                getInfo: function() {
                    var self = this;
                    for (var i in self.debug) {
                        self.infoList.push({key: i, value: self.debug[i]});
                    }
                }
            },
            components: {

            }

        });
        return DebugInfo;
    });