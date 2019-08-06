define(["vue","MINT", "Util", "txt!../../pages/ibeaconInfo.html"],
    function(v, MINT, Util, ibeaconInfo) {

        var IbeaconInfo = v.extend({

            template: ibeaconInfo,
            props: {
                deviceInfo: {
                    type: Object
                },
                ibeaconInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    addFlag: false
                }
            },
            methods:{
                show: function() {
                    window.onBackPressed = this.hide;
                    console.log(JSON.stringify(this.ibeaconInfo));
                    window.onSetIbeaconInfo = this.onSetIbeaconInfo;
                    this.addFlag = true;
                },
                hide: function () {
                    this.addFlag = false;
                    this.$emit("ibeanInfoShow");
                },
                setIbeacon: function() {
                    var self = this;
                    MINT.Indicator.open();
                    var data = '{"' + MESH_MAC + '": "' + self.deviceInfo.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' + SET_IBEACON +
                        '","name": "'+self.ibeaconInfo.name+'","uuid": "'+self.ibeaconInfo.uuid+'","major":'+
                        self.ibeaconInfo.major+',"minor":'+self.ibeaconInfo.minor+',"power":'+
                        self.ibeaconInfo.power+', "callback": "onSetIbeaconInfo"}';
                    setTimeout(function() {
                         espmesh.requestDevice(data);

                    }, 1000);

                },
                getColor: function () {
                    var hueValue = 0, saturation = 0, luminance = 0, status = 0, rgb = "#6b6b6b";
                    $.each(this.deviceInfo.characteristics, function(i, item) {
                        if (item.cid == HUE_CID) {
                            hueValue = item.value;
                        }else if (item.cid == SATURATION_CID) {
                            saturation = item.value;
                        }else if (item.cid == VALUE_CID) {
                            luminance = item.value;
                        } else if (item.cid == STATUS_CID) {
                            status = item.value;
                        }
                    })
                    if (status == STATUS_ON) {
                        rgb = Raphael.hsb2rgb(hueValue / 360, saturation / 100, luminance / 100).hex;
                    }
                    return rgb;
                },
                onSetIbeaconInfo: function(res) {
                    var self = this;
                    if (!Util._isEmpty(res)) {
                         res = JSON.parse(res).result;
                         if (res.status_code == 0) {
                             MINT.Toast({
                                 message: self.$t('editSuccessDesc'),
                                 position: 'bottom',
                             });
                             setTimeout(function() {
                                 self.hide();
                             }, 1000);
                         } else {
                             MINT.Toast({
                                 message: self.$t('editFailDesc'),
                                 position: 'bottom',
                             });
                         }
                     }
                     MINT.Indicator.close();
               },
            },


        });

        return IbeaconInfo;
    });