define(["vue", "MINT", "Util", "txt!../../pages/tm.html"],
    function(v, MINT, Util, tm) {

    var Tm = v.extend({

        template: tm,

        data: function(){
            return {
                flag: false,
                isBind: false,
                contentType: {"accountType":"TAOBAO"},
            }
        },
        computed: {

        },
        methods:{
            show: function () {
                var self = this;
                MINT.Indicator.open();
                window.onGetAliUserId = self.onGetAliUserId;
                window.onAliUserUnbindId = self.onAliUserUnbindId;
                window.onAliUserBindTaobaoId = self.onAliUserBindTaobaoId;
                self.flag = true;
                setTimeout(function() {
                    console.log("start");
                    self.getAliUserId();
                }, 1000)
            },
            hide: function () {
                this.flag = false;
                MINT.Indicator.close();
                this.$emit("setShow");
            },
            getAliUserId: function() {
                aliyun.getAliUserId(JSON.stringify(this.contentType));
            },
            aliUserUnbindId: function() {
                var self = this;
                MINT.Indicator.open();
                setTimeout(function() {
                    aliyun.aliUserUnbindId(JSON.stringify(self.contentType));
                }, 1000)
            },
            aliUserBindTaobaoId: function() {
                aliyun.aliUserBindTaobaoId();
            },
            onAliUserBindTaobaoId: function() {
                console.log(res);
                var flag = true;
                if (!Util._isEmpty(res) && res != '{}') {
                    res = JSON.parse(res);
                    if (res.code === 200) {
                        if (!Util._isEmpty(res.data)) {
                            flag = false;
                            this.isBind = true;
                            MINT.Toast({
                                message: "绑定成功",
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                    }
                }
                if (flag) {
                    this.isBind = false;
                    MINT.Toast({
                        message: "绑定失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
            onGetAliUserId: function(res) {
                console.log(res);
                MINT.Indicator.close();
                var flag = true;
                if (!Util._isEmpty(res) && res != '{}') {
                    res = JSON.parse(res);
                    if (res.code === 200) {
                        if (!Util._isEmpty(res.data)) {
                            flag = false;
                            this.isBind = true;
                        }
                    }
                }
                if (flag) {
                    this.isBind = false;
                }
            },
            onAliUserUnbindId: function() {
                MINT.Indicator.close();
                var flag = true;
                if (!Util._isEmpty(res) && res != '{}') {
                    res = JSON.parse(res);
                    if (res.code === 200) {
                        if (!Util._isEmpty(res.data)) {
                            this.isBind = false;
                            MINT.Toast({
                                message: "解绑成功",
                                position: 'bottom',
                                duration: 2000
                            });
                        }
                    }
                }
                if (flag) {
                    MINT.Toast({
                        message: "解绑失败",
                        position: 'bottom',
                        duration: 2000
                    });
                }
            },
        },
        components: {
        }
    });
    return Tm;
});
