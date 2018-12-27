define(["vue","MINT", "Util", "txt!../../pages/automation.html", "../js/automation-all", "../js/automation-btn-select"],
    function(v, MINT, Util, automation, automationAll, automationBtnSelect) {
        var Automation = v.extend({

            template: automation,
            props: {
                deviceInfo: {
                    type: Object
                },
                autoId: {
                    type: String
                }
            },
            data: function(){
                return {
                    addFlag: false,
                    deviceEvent: false,
                    btnEvent: false
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    window.onBackPressed = self.hide;
                    setTimeout(function() {
                        var tid = self.deviceInfo.tid;
                        if (tid == BUTTON_SWITCH) {
                            self.deviceEvent = false;
                            self.btnEvent = true;
                            setTimeout(function() {
                                self.$refs.autoBtnSelect.show();
                            }, 100)
                        } else {
                            self.deviceEvent = true;
                            self.btnEvent = false;
                            setTimeout(function() {
                                self.$refs.autoAll.show();
                            }, 100)

                        }
                    })
                    self.addFlag = true;
                },
                hide: function () {
                    this.addFlag = false;
                    this.eventFlag = false;
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("autoShow");
                    MINT.Indicator.close();
                },
            },
            components: {
                "v-automationAll": automationAll,
                "v-automationBtnSelect": automationBtnSelect,
            }

        });

        return Automation;
    });