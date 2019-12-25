define(["vue", "MINT", "Util", "Common", "VueAwesomeSwiper", "txt!../../pages/home.html", "../js/footer", "../js/info",
    "./remind", "./blueFail", "./wifiFail", "./resetDevice", "../js/scanDevice", "../js/addGroup"],
    function(v, MINT, Util, Common, VueAwesomeSwiper, home, footer, info, remind, blueFail, wifiFail,
        resetDevice, scanDevice, addGroup) {

    var Home = v.extend({
        template: home,
        data: function(){
            return {
                device: "device",
                swiperOption: {//swiper3
                    pagination: {
                        el: '.swiper-pagination'
                    },
                    autoplay: 3000,
                    speed: 500,
                },
                pages: 1,
                pageSize: 0,
                blueEnable: false,
                isWifiConnect: false,
                flag: false,
                loadShow: false,
                showAdd: false,
                listMacs: [],
                colorId: "device-color",
                temperatureId: "device-temperature",
                addGroupId: "device-addGroup",
                selectAllId: 'select-index-id',
                importId: 'import-index-id',
                resetId: 'reset-index-id',
                sliderId: 'slider-index-id',
                searchName: "",
                groupName: "",
                positionList: [],
                deviceList: [],
                indexList: [],
                loadList: [],
                temporaryAddList: [],
                temporaryDelList: [],
                showScanDevice: true,
                hideTrue: false,
                loadMoreing: false,
                topStatus: "",
                pullLoad: false,
                isJoin: false,
                isSearch: false,
                macs: []
            }
        },
        watch: {
           // 如果路由有变化，会再次执行该方法d
           '$route': function (to, form) {
               if (to.path == "/") {
                   this.$store.commit("setShowScanBle", true);
                   if (this.deviceList.length > 0) {
                       Common.setPages(this, this.loadList, "#content-swiper");
                   }
                   this.onBackIndex();
               }

           }
        },
        mounted: function() {
            var self = this;
            self.$nextTick(function() {
                self.wifiNum = 0;
                espmesh.registerPhoneStateChange();
                self.$store.commit("setShowScanBle", true);
                self.$store.commit("setShowLoading", true);
                setTimeout(function() {
                    espmesh.hideCoverImage();
                    self.loadHWDevices();
                    Common.reload(self);
                }, 2000)
            })

        },
        computed: {
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                if (self.deviceList.length > 0) {
                    self.$refs.remind.hide();
                    if (self.hideTrue) {
                        self.hideLoad();
                    }
                    self.positionList = [];
                    $.each(self.deviceList, function(i, item) {
                        if (!Util._isEmpty(item.position)) {
                            self.positionList.push(item.position);
                        }
                    });
                    if (Util._isEmpty(self.searchName)) {
                        self.loadList = Util.sortList(self.deviceList);
                    } else {
                        var searchList = [];
                        $.each(self.deviceList, function(i, item) {
                            if (item.name.indexOf(self.searchName) != -1 || item.position.indexOf(self.searchName) != -1) {
                                searchList.push(item);
                            }
                        })
                        self.loadList = Util.sortList(searchList);
                    }
                    Common.setPages(self, self.loadList, "#content-swiper");
                    console.log(self.pages);
                    console.log(self.pageSize);
                } else {
                    self.loadList = [];
                    self.showAdd = true;
                    self.$store.commit("setTsfTime", "");
                }
                return self.loadList;
            }
        },
        methods:{
            loadTop: function() {
                var self = this;
                self.pullLoad = true;
                self.deviceList = [];
                self.loadList = [];
                self.$store.commit("setList", self.deviceList);
                setTimeout(function() {
                    if (!self.loadShow) {
                        self.loadShow = true;
                        self.$store.commit("setShowScanBle", true);
                        Common.stopBleScan();
                        Common.reload(self);
                    } else {
                        self.pullLoad = false;
                        self.$refs.loadmore.onTopLoaded();
                    }
                    self.isLoad = false;
                }, 50);
            },
            handleTopChange: function (status) {
                this.topStatus = status;
                if (this.pullLoad) {
                    $(".mint-loadmore-content").addClass("pullLoad");
                    this.topStatus = "loading";
                    this.$refs.loadmore.topStatus = "loading";
                } else {
                    $(".mint-loadmore-content").removeClass("pullLoad");
                }

            },
            showSearch: function() {
                this.isSearch = true;
            },
            hideSearch: function() {
                this.isSearch = false;
                this.searchName = "";
            },
            showPages: function(index, i) {
                return Common.showPages(this, index, i);
            },
            showLoad: function () {
                MINT.Indicator.open(this.$t('loading'));
            },
            hideLoad: function() {
                MINT.Indicator.close();
                this.loadShow = false;
                this.hideTrue = false;
            },
            // 设备单击触发的方法
            operateItem: function (item, e) {
                var self = this,
                    tid = item.tid;
                self.flag = false;
                self.$store.commit("setShowScanBle", false);
                self.$refs.scanDevice.hide();
                setTimeout(function() {
                    if (self.deviceList.length > 0) {
                        self.deviceInfo = item;
                        self.$store.commit("setDeviceInfo", self.deviceInfo);
                        Common.stopBleScan();
                        self.$refs.info.show();
                    }
                }, 50)
            },
            startBleScan: function() {
                Common.startBleScan(this);
            },
            setGroup: function() {
                Common.setGroup(this);
            },
            loadHWDevices: function() {
                Common.loadHWDevices(this)
            },
            conReload: function() {
               Common.conReload(this)
            },
            setPairs: function() {
                Common.setPairs(this);
            },
            setPair: function(device) {
                return Common.setPair(this, device);
            },
            showVideo: function() {
                espmesh.newWebView(VIDEO_URL);
            },
            clearListMacs: function() {
                this.listMacs = [];
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideAdd;
                    Common.stopBleScan();
                    this.$store.commit("setShowScanBle", false);
                } else {
                    this.$store.commit("setShowScanBle", true);
                    this.onBackIndex();
                }
            },
            hideUl: function() {
                this.flag = false;
                this.$store.commit("setShowScanBle", true);
                this.onBackIndex();
            },
            showBlueFail: function() {
                Common.showBlueFail(this);
            },
            showWifiFail: function() {
                Common.showWifiFail(this);
            },
            addDevice: function (event) {
                Common.addDevice(this);
                this.$refs.scanDevice.hide();
            },
            addGroup: function() {
                this.$refs.scanDevice.hide();
                Common.addGroup(this);
            },
            isLigth: function(tid) {
                return Common.isLigth(tid)
            },
            getStatus: function(characteristics) {
                if (!Util._isEmpty(characteristics)) {
                    return Common.getStatus(characteristics);
                }
                return false;
            },
            close: function (mac, status) {
                status = status ? 0 : 1;
                Common.close(this, mac, status)
            },
            getRssiIcon: function(rssi) {
                return Util.getWIFIRssiIcon(rssi);
            },
            getIcon: function (tid) {
                return Util.getIcon(tid);
            },
            getColor: function (characteristics, tid) {
                return Util.getColor(characteristics, tid);
            },
            getPosition: function(position) {
                return Util.getPosition(position);
            },
            showDesc: function(position) {
                var flag = false;
                if (!Util._isEmpty(position)) {
                    flag = true;
                }
                return flag;
            },
            getFlag: function(position) {
                var self = this, flag = false;
                if (self.positionList.indexOf(position) != self.positionList.lastIndexOf(position)) {
                    flag = true;
                }
                return flag;
            },
            onDeviceScanned: function(res) {
                Common.onDeviceScanned(this, res);
            },
            onDeviceScanning: function(res) {
                Common.onDeviceScanning(this, res);
            },
            onWifiStateChanged: function(wifi) {
                Common.onWifiStateChanged(this, wifi);
            },
            onBluetoothStateChanged: function(blue) {
                Common.onBluetoothStateChanged(this, blue);
            },
            onDeviceFound: function(res) {
                console.log(res);
                Common.onDeviceFound(this, res);
            },
            onDeviceLost: function(res) {
                Common.onDeviceLost(this, res);
            },
            onDeviceStatusChanged: function(res) {
                Common.onDeviceStatusChanged(this, res);
            },
            onBackIndex: function() {
                Common.onBackIndex(this);
            },
            onScanBLE: function(res) {
                Common.onScanBLE(this, res);
            }
        },
        created: function () {
             window.onWifiStateChanged = this.onWifiStateChanged;
             window.onBluetoothStateChanged = this.onBluetoothStateChanged;
             window.onDeviceScanning = this.onDeviceScanning;
             window.onDeviceScanned = this.onDeviceScanned;
             window.onScanBLE = this.onScanBLE;
             window.onDeviceFound = this.onDeviceFound;
             window.onDeviceLost = this.onDeviceLost;
             window.onDeviceStatusChanged = this.onDeviceStatusChanged;
        },
        components: {
            "v-footer": footer,
            "swiper": VueAwesomeSwiper.swiper,
            "swiperSlide": VueAwesomeSwiper.swiperSlide,
            "v-info": info,
            "v-remind": remind,
            "v-blueFail": blueFail,
            "v-wifiFail": wifiFail,
            "v-resetDevice": resetDevice,
            "v-scanDevice": scanDevice,
            "v-addGroup": addGroup
        }

    });
    return Home;
});
