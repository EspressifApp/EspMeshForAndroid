define(["vue", "MINT", "Util", "Common", "VueAwesomeSwiper", "txt!../../pages/group.html", "../js/footer",
    "./resetDevice", "./blueFail", "./wifiFail", "../js/groupInfo", "../js/addGroup"],
    function(v, MINT, Util, Common, VueAwesomeSwiper, group, footer, resetDevice, blueFail, wifiFail,
        groupInfo, addGroup) {

    var Group = v.extend({
        template: group,
        data: function(){
            return {
                group: "group",
                swiperOption: {//swiper3
                    pagination: {
                        el: '.swiper-pagination'
                    },
                    autoplay: 3000,
                    speed: 500,
                },
                pages: 1,
                pageSize: 0,
                addGroupId: "group-addGroup",
                infoShow: false,
                editGroupId: "edit-group-id",
                colorId: "group-color",
                temperatureId: "group-temperature",
                deviceList: this.$store.state.deviceList,
                groupList: this.$store.state.groupList,
                groupInfo: {},
                otaMacs: [],
                commandMacs: [],
                currentStatus: true,
                flag: false,
                searchName: "",
                groupName: "",
                isWifiConnect: true,
                blueEnable: true,
                isJoin: false,
                macs: [],
                selectAllId: 'select-group-id',
                importId: 'import-group-id',
                resetId: 'reset-group-id',
                sliderId: 'slider-group-id',
                isSearch: false
            }
        },
        watch: {
            // 如果路由有变化，会再次执行该方法d
            '$route': function (to, form) {
                if (to.path == "/group") {
                    Common.loadGroups(this);
                    if (this.groupList.length > 0) {
                        this.pageSize = this.$store.state.pageSize;
                        this.pages = Math.ceil(this.groupList.length / this.pageSize);
                    }
                    this.onBackGroup();
                }
            }
        },
        mounted: function() {
            Common.loadGroups(this);
            this.onBackGroup();
        },
        computed: {
            wifiEnable: function() {
                var wifiInfo = this.$store.state.wifiInfo;
                if (!Util._isEmpty(wifiInfo)) {
                    this.isWifiConnect = wifiInfo.connected;
                } else {
                    this.isWifiConnect = false;
                }
                return this.isWifiConnect;
            },
            isBlueEnable: function() {
                var blueEnable =  this.$store.state.blueInfo;
                if (!Util._isEmpty(blueEnable)) {
                    this.blueEnable = blueEnable;
                } else {
                    this.blueEnable = false;
                }
                return this.blueEnable;
            },
            list: function () {
                var self = this;
                self.deviceList = self.$store.state.deviceList;
                self.groupList = self.$store.state.groupList;
                self.pageSize = self.$store.state.pageSize;
                self.pages = Math.ceil(self.groupList.length / self.pageSize);
                console.log(self.pages);
                if (Util._isEmpty(self.searchName)) {
                    return self.groupList;
                } else {
                    var searchList = [];
                    $.each(self.groupList, function(i, item) {
                        if (item.name.indexOf(self.searchName) != -1) {
                            searchList.push(item);
                        }
                    })
                    return searchList;
                }
            }
        },
        methods:{
            showPages: function(index, i) {
                return Common.showPages(this, index, i);
            },
            addDevice: function (event) {
                Common.addDevice(this);
            },
            addGroup: function() {
                Common.addGroup(this);
            },
            showSearch: function() {
                this.isSearch = true;
            },
            hideSearch: function() {
                this.isSearch = false;
                this.searchName = "";
            },
            showBlueFail: function() {
                var self = this;
                setTimeout(function() {
                    self.$refs.blueFail.show();
                })
            },
            showWifiFail: function() {
                var self = this;
                setTimeout(function() {
                    self.$refs.wifiFail.show();
                })
            },
            getStatusByGroup: function (macs) {
               return Common.getStatusByGroup(this, macs)
            },
            isShowPower: function(macs) {
                return Common.isShowPower(this, macs);
            },
            isShowGroup: function(macs, flag) {
                return Common.isShowGroup(this, macs, flag);
            },
            isShowNo: function() {
                var self = this, num = 0;
                $.each(self.groupList, function(i, item) {
                    if (!item.is_user) {
                        num++;
                    }
                });
               return num == 0 ? true : false
            },
            getDevicesByGroup: function (macs) {
                return Common.getDevicesByGroup(this, macs)
            },
            showUl: function () {
                this.flag = !this.flag;
                if (this.flag) {
                    window.onBackPressed = this.hideUl;
                } else {
                    this.onBackGroup();
                }
            },
            hideUl: function () {
                this.flag = false;
                this.onBackGroup();
            },
            close: function(macs, status) {
                Common.closeList(this, macs, status);
            },
            operateItem: function (item, e) {
                var self = this;
                self.flag = false;
                self.groupInfo = item;
                self.$store.commit('setGroupInfo', self.groupInfo);
                setTimeout(function() {
                    self.$refs.info.show();
                }, 100)
            },
            onBackGroup: function() {
                var startTime = 0;
                var self = this;
                self.$store.commit("setShowScanBle", false);
                window.onBackPressed = function () {
                    Util.toast(MINT, self.$t('exitProgramDesc'));
                    if (startTime == 0) {
                        startTime = new Date().getTime();
                    } else {
                        if (new Date().getTime() - startTime < 2000) {
                            espmesh.finish();
                        } else {
                            startTime = new Date().getTime();
                        }
                    }
                }
            }

        },
        created: function () {
        },
        components: {
            "v-footer": footer,
            "swiper": VueAwesomeSwiper.swiper,
            "swiperSlide": VueAwesomeSwiper.swiperSlide,
            "v-resetDevice": resetDevice,
            "v-blueFail": blueFail,
            "v-wifiFail": wifiFail,
            "v-groupInfo": groupInfo,
            "v-addGroup": addGroup
        }

    });
    return Group;
});
