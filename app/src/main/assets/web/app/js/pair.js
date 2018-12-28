define(["vue", "MINT", "Util", "txt!../../pages/pair.html", "../js/setPair" ],
    function(v, MINT, Util, pair, setPair) {

    var Pair = v.extend({

        template: pair,

        data: function(){
            return {
                flag: false,
                showAdd: false,
                pairList: [],
                pairShow: false,
                pairInfo: "",
                deviceList: [],
                total: 0,
                selected: 0,
                flagUl: false,
                deleteShow: false
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.onBackPair();
                self.deviceList = self.$store.state.deviceList;
                self.getPair();
                self.flagUl = false;
                self.deleteShow = false;
                if (self.pairList.length == 0) {
                    self.showAdd = true;
                } else {
                    self.showAdd = false;
                }
                $("#pair-wrapper span.span-radio").removeClass("active");
                self.flag = true;
                window.onSetDevicePosition = this.onSetDevicePosition;
            },
            hide: function () {
                this.$emit("pairShow");
                this.flag = false;
            },
            pairMore: function() {
                this.flagUl = !this.flagUl;
                if (this.flagUl) {
                    window.onBackPressed = this.moreFlag;
                } else {
                    this.onBackPair();
                }
            },
            moreFlag: function() {
                this.flagUl = false;
                this.onBackPair();
            },
            hideInfo: function() {
                this.pairShow = false;
                this.pairInfo = "";
                this.onBackPair();
            },
            editDevice: function() {
                this.deleteShow = true;
                this.selected = 0;
                this.flagUl = false;
                this.total = this.pairList.length;
                $("#pair-wrapper span.span-radio").removeClass("active");
                window.onBackPressed = this.calcelDevice;
            },
            calcelDevice: function() {
                this.deleteShow = false;
                this.onBackPair();
            },
            deleteDevice: function() {
                var self = this, docs = $("#pair-wrapper .item span.span-radio.active"),
                    macs = [], deviceMacs = [];
                for (var i = 0; i < docs.length; i++) {
                    macs.push($(docs[i]).attr("data-value"));
                };
                MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.calcelDevice();
                    MINT.Indicator.open();
                    $.each(self.deviceList, function(i,item) {
                        if (macs.indexOf(item.mac) != -1) {
                            deviceMacs.push(item.mac);
                        }
                    })
                    console.log(JSON.stringify(deviceMacs));
                    setTimeout(function() {
                        self.deletePair(deviceMacs.length > 0, deviceMacs, macs)
                    }, 1000);
                });
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    $("span.span-radio").removeClass("active");
                    this.selected = 0;
                } else {
                    doc.addClass("active");
                    $("span.span-radio").addClass("active");
                    this.selected = this.total;
                }

            },
            selectDevice: function (e) {
                var doc = $(e.currentTarget);
                if (doc.hasClass("active")) {
                    doc.removeClass("active");
                    this.selected -= 1;
                } else {
                    doc.addClass("active");
                    this.selected += 1;
                }
            },
            onBackPair: function () {
                this.getPair();
                window.onBackPressed = this.hide;
            },
            addPair: function () {
                var self = this;
                self.pairInfo = "";
                this.deleteShow = false;
                this.flagUl = false;
                setTimeout(function(){
                    self.$refs.setPair.show();
                });
            },
            getPair: function() {
                var self = this,
                    pairs = espmesh.loadHWDevices();
                if (!Util._isEmpty(pairs)) {
                    self.pairList = JSON.parse(pairs);
                }
                if (self.pairList.length > 0) {
                    self.showAdd = false;
                } else {
                    self.showAdd = true;
                }
                self.$store.commit("setSiteList", self.pairList);
            },
            showPairOperate: function(obj) {
                var self = this,
                    mac = obj.mac;
                self.pairInfo = "";
                if (!self.deleteShow) {
                    var pairs = espmesh.loadHWDevices();
                    if (!Util._isEmpty(pairs)) {
                        self.pairList = JSON.parse(pairs);
                    }
                    $.each(self.pairList, function(i, item) {
                        if (item.mac == mac) {
                            self.pairInfo = item;
                            return false;
                        }
                    });
                    window.onBackPressed = self.hideInfo;
                    setTimeout(function(){
                        self.pairShow = true;
                    })
                }

            },
            editPair: function() {
                this.pairShow = false;
                this.$refs.setPair.show();
            },
            delPair: function() {
                var self = this, flag = false,
                    mac = self.pairInfo.mac;
                MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('delInfoTitle'),{
                        confirmButtonText: self.$t('confirmBtn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                    self.hideInfo();
                    MINT.Indicator.open();
                    $.each(self.deviceList, function(i,item) {
                        if (item.mac == mac) {
                            flag = true;
                            return false;
                        }
                    })
                    setTimeout(function() {
                        self.deletePair(flag, [mac], [mac])
                    }, 1000);
                });
            },
            deletePair: function(flag, deviceMacs, macs) {
                var self = this;
                if (flag) {
                    self.setDevicePosition(deviceMacs, macs);
                } else {
                    espmesh.deleteHWDevices(JSON.stringify(macs));
                    self.getPair();
                    MINT.Toast({
                        message: self.$t('delSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
                MINT.Indicator.close();

                if (self.pairList.length <= 0) {
                    self.showAdd = true;
                }
            },
            setDevicePosition: function(deviceMacs, macs) {
                var self = this, flag = false,
                    data = '{"' + MESH_MAC + '": ' + JSON.stringify(deviceMacs) + ',"'+ MESH_REQUEST + '": "' +
                        SET_POSITION + '",' + '"position":"", "callback": "onSetDevicePosition", "tag": {"deviceMacs": '+
                        JSON.stringify(deviceMacs)+',"macs": '+JSON.stringify(macs)+'}}';
                console.log(data);
                espmesh.requestDevicesMulticastAsync(data);

            },
            onSetDevicePosition: function(res) {
                console.log(res);
                var self = this;
                res = JSON.parse(res);
                var result = res.result;
                var tag = res.tag;
                if (result[0].status_code == 0) {
                    $.each(self.deviceList, function(i, item){
                        if (tag.deviceMacs.indexOf(item.mac) != -1) {
                            item.position = "";
                            self.deviceList.splice(i, 1, item);
                        }
                    });
                    espmesh.deleteHWDevices(JSON.stringify(tag.macs));
                    self.getPair();
                    MINT.Toast({
                        message: self.$t('delSuccessDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                    self.$store.commit("setList", self.deviceList);
                } else {
                    MINT.Toast({
                        message: self.$t('delFailDesc'),
                        position: 'bottom',
                        duration: 2000
                    });
                }
            }
        },
        components: {
            "v-setPair": setPair,
        }

    });
    return Pair;
});