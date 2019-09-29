define(["vue", "MINT", "Util", "txt!../../pages/blueConnect.html"],
    function(v, MINT, Util, blueConnect) {

        var BlueConnect = v.extend({
            template: blueConnect,
            props: {
                blueInfo: {
                    type: Object
                }
            },
            data: function(){
                return {
                    flag: false,
                    customData: "",
                    colorList: ["#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#8000ff"],
                    currentRgb: ""
                }
            },
            computed: {

            },
            methods:{
                show: function () {
                    var self = this;
                    self.customData = "";
                    self.currentRgb = "";
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                    });
                    self.flag = true;
                },
                selectColor: function(item) {
                    var self = this;
                    if (self.currentRgb == item) {
                        self.currentRgb = "";
                    } else {
                        self.currentRgb = item;
                        var meshs = [];
                        meshs.push({cid: HUE_CID, value: this.getHue(item)});
                        meshs.push({cid: SATURATION_CID, value: 100});
                        self.customData = '{"type":"json","value":{"header":{"group":["010000000000"]},"body":{"request":"set_status",'
                            +'"characteristics":'+JSON.stringify(meshs)+'}}}';
                        setTimeout(function() {
                            self.postData();
                        })
                    }
                },
                selectSwitch: function(status) {
                    var self = this;
                    self.currentRgb = "";
                    self.customData = '{"type":"json","value":{"header":{"group":["010000000000"]},"body":{"request":"set_status",'
                        +'"characteristics":[{"cid":0,"value":'+parseInt(status)+'}]}}}';
                    setTimeout(function() {
                        self.postData();
                    })
                },
                postData: function() {
                    var self = this;
                    MINT.Indicator.open();
                    setTimeout(function() {
                        console.log(self.customData);
                        MINT.Indicator.close();
                        if (Util.isJSON(self.customData)) {
                            espmesh.postDataToMeshBLEDevice(self.customData);
                        } else {
                            INSTANCE_TOAST = MINT.Toast({
                                message: self.$t('jsonDesc'),
                                position: 'bottom',
                            });
                        }
                    }, 1000)
                },
                hide: function () {
                    this.flag = false;
                    MINT.Indicator.close();
                    espmesh.disconnectMeshBLEDevice();
                    this.$emit("blueConnectShow");
                },
                getHue: function(color) {
                    switch(color){
                        case "#ff0000":
                            return 0;
                            break;
                        case "#ff8000":
                            return 30;
                            break;
                        case "#ffff00":
                            return 60;
                            break;
                        case "#00ff00":
                            return 120;
                            break;
                        case "#00ffff":
                            return 180;
                            break;
                        case "#0000ff":
                            return 240;
                            break;
                        case "#8000ff":
                            return 270;
                            break;
                        default:
                            return 191;
                            break;
                    }
                },
            },
            components: {
            }

        });
        return BlueConnect;
    });