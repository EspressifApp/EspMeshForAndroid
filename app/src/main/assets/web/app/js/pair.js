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
                searchName: "",
                pairInfo: "",
                deviceList: [],
                total: 0,
                selected: 0,
                flagUl: false,
                isSelectedMacs: [],
                deleteShow: false
            }
        },
        computed: {
            list: function() {
                var self = this;
                if (self.flag) {
                    var list = [];
                    var pairList = self.$store.state.siteList;
                    if (Util._isEmpty(self.searchName)) {
                        $.each(pairList, function(i, item) {
                            var position = item.floor + "-" + item.area + "-" + item.code;
                            item.position = position;
                            list.push(item);
                        })
                        list = self.sortList(list);
                    } else {
                        var searchList = [];
                        $.each(pairList, function(i, item) {
                            var position = item.floor + "-" + item.area + "-" + item.code;
                            item.position = position;
                            if (item.mac.indexOf(self.searchName) != -1 || position.indexOf(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        })
                        list = self.sortList(searchList);
                    }
                    if (pairList.length > 0) {
                        self.showAdd = false;
                    } else {
                        self.showAdd = true;
                    }
                    self.pairList = list;
                }
            }
        },
        methods:{
            show: function () {
                var self = this;
                self.isSelectedMacs = [];
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
            sortList: function(list) {
                var self = this, emptyList = [], arrayList = [];
                $.each(list, function(i, item) {
                    if (!Util._isEmpty(item.position)) {
                        arrayList.push(item);
                    } else {
                        emptyList.push(item);
                    }
                });
                arrayList.sort(Util.sortBySub("position"));
                emptyList.sort(Util.sortBy("mac"));
                $.each(emptyList, function(i, item) {
                    arrayList.push(item);
                });
                return arrayList;
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
                if (macs.length > 0) {
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
                } else {
                    Util.toast(MINT, self.$t('selectPairDesc'));
                }

            },
            selectMac: function(mac) {
                if (this.deleteShow) {
                    var num = this.isSelectedMacs.indexOf(mac);
                    if (num == -1) {
                        this.isSelectedMacs.push(mac);
                    } else {
                        this.isSelectedMacs.splice(num, 1);
                    }
                    this.selected = this.isSelectedMacs.length;
                }
            },
            isSelected: function(mac) {
                var self = this,
                    flag = false;
                if (self.isSelectedMacs.indexOf(mac) != -1) {
                    flag = true;
                }
                return flag;
            },
            selectAllDevice: function (e) {
                var doc = $(e.currentTarget).find("span.span-radio")[0];
                if ($(doc).hasClass("active")) {
                    $(doc).removeClass("active");
                    this.selected = 0;
                    this.isSelectedMacs = [];
                } else {
                    $(doc).addClass("active");
                    this.selected = this.total;
                    var allMacs = [];
                    $.each(this.pairList, function(i, item) {
                        allMacs.push(item.mac);
                    })
                    this.isSelectedMacs = allMacs;
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
                espmesh.loadHWDevices();
            },
            showPairOperate: function(obj) {
                var self = this,
                    mac = obj.mac;
                self.pairInfo = "";
                if (!self.deleteShow) {
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
                    Util.toast(MINT, self.$t('delSuccessDesc'))
                }
                MINT.Indicator.close();

                if (self.pairList.length <= 0) {
                    self.showAdd = true;
                }
            },
            setDevicePosition: function(deviceMacs, macs) {
                var self = this, flag = false,
                    data = '{"' + MESH_MAC + '": ' + JSON.stringify(deviceMacs) +
                        ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+ MESH_REQUEST + '": "' +
                        SET_POSITION + '",' + '"position":"", "callback": "onSetDevicePosition", "tag": {"deviceMacs": '+
                        JSON.stringify(deviceMacs)+',"macs": '+JSON.stringify(macs)+'}}';
                console.log(data);
                espmesh.requestDevicesMulticast(data);

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
                    Util.toast(MINT, self.$t('delSuccessDesc'));
                    self.$store.commit("setList", self.deviceList);
                } else {
                    Util.toast(MINT, self.$t('delFailDesc'));
                }
            }
        },
        components: {
            "v-setPair": setPair,
        }

    });
    return Pair;
});