define(["vue", "MINT", "Util", "txt!../../pages/sendIP.html"],
    function(v, MINT, Util, sendIP) {

    var SendIP = v.extend({

        template: sendIP,
        props: {
            commandMacs: {
                type: Array
            },
        },
        data: function(){
            return {
                addFlag: false,
                setIp1: "",
                setIp2: "",
                setIp3: "",
                setIp4: "",
                port: "",
                resultShow: false,
                disabledBtn: false,
                resultText: [],
            }
        },
        computed:{
            totalPage: function() {
                this.total = this.pages;
                return this.pages;
            },
            setOne:{
                get:function(){
                    return this.setIp1;
                },
                set:function(value){
                    if (value > 255) {
                        this.setIp1 = "";
                    } else {
                        this.setIp1 = value;
                    }
                }
            },
            setTwo:{
                get:function(){
                    return this.setIp2;
                },
                set:function(value){
                    if (value > 255) {
                        this.setIp2 = "";
                    } else {
                        this.setIp2 = value;
                    }
                }
            },
            setThree:{
                get:function(){
                    return this.setIp3;
                },
                set:function(value){
                    if (value > 255) {
                        this.setIp3 = "";
                    } else {
                        this.setIp3 = value;
                    }
                }
            },
            setFour:{
                get:function(){
                    return this.setIp4;
                },
                set:function(value){
                    if (value > 255) {
                        this.setIp4 = "";
                    } else {
                        this.setIp4 = value;
                    }
                }
            }
        },
        methods:{
            show: function() {
                window.onSendIP = this.onSendIP;
                window.onDelIP = this.onDelIP;
                this.resultShow = false;
                this.disabledBtn = false;
                this.setIp1 = "";
                this.setIp2 = "";
                this.setIp3 = "";
                this.setIp4 = "";
                this.port = "";
                this.resultText = [];
                window.onBackPressed = this.hide;
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
                this.$emit("sendIPShow");
            },
            delIp: function(i) {
                var self = this;
                MINT.MessageBox.confirm(self.$t('delIPDesc'), self.$t('clearBtn')).then(function(obj) {
                    var data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.commandMacs) +
                          ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                          SET_SERVER + '","operation": 0,"callback": "onDelIP"}}';
                    console.log(data);
                    MINT.Indicator.open();
                    setTimeout(function() {
                       espmesh.requestDevicesMulticast(data);
                    }, 1000);
                });
            },
            send: function() {
                var self= this;
                if (Util._isEmpty(self.setIp1) || Util._isEmpty(self.setIp2) || Util._isEmpty(self.setIp3) ||
                    Util._isEmpty(self.setIp4)) {
                    return false;
                }
                if (Util._isEmpty(self.port)) {
                    return false;
                }
                MINT.Indicator.open();
                var ip = self.setIp1 + "." + self.setIp2 + "." + self.setIp3 + "." + self.setIp4;
                var data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.commandMacs) +
                      ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","' + MESH_REQUEST + '": "' +
                      SET_SERVER + '","operation": 1,"ip":"'+ip+'","port": '+parseInt(self.port)+
                      ',"callback": "onSendIP"}}';
                console.log(data);
                setTimeout(function() {
                    espmesh.requestDevicesMulticast(data);
                }, 1000);
            },
            onSendIP: function(res) {
                MINT.Indicator.close();
                this.hide();
            },
            onDelIP: function(res) {
                console.log(res);
                MINT.Indicator.close();
                this.hide();
            }
        },
        created: function () {
        },


    });

    return SendIP;
});