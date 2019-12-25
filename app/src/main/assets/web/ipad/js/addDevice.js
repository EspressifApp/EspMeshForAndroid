define(["vue", "MINT", "Common", "Util", "txt!../../pages/addDevice.html", "./conDevice"],
    function(v, MINT, Common, Util, addDevice, conDevice) {

    var AddDevice = v.extend({

        template: addDevice,

        data: function(){
            return {
                addFlag: false,
                type: "password",
                showPwd: false,
                showNext: false,
                wifiInfo: this.$store.state.wifiInfo,
                wifiName: this.$t('no'),
                apList: [],
                meshId: "",
                showMesh: false,
                meshIdOne: "",
                meshIdTwo: "",
                meshIdThr: "",
                meshIdFour: "",
                meshIdFive: "",
                meshIdSex: "",
                meshArray: [],
                password: "",
                slots1:[{values: [], defaultIndex: 0}],
                isMore: false,
                moreObj: {},
                customData: null,
                meshType: "",
                votePercentage: null,
                voteMaxCount: null,
                backoffRssi: null,
                scanMinCount: null,
                scanFailCount: null,
                monitorCount: null,
                rootHealing: null,
                rootEnable: null,
                fixEnable: null,
                capacityNum: null,
                maxLayer: null,
                maxConnect: null,
                assocExpire: null,
                beaconInterval: null,
                passiveScan: null,
                monitorDuration: null,
                cnxRssi: null,
                selectRssi: null,
                switchRssi: null,
                xonQsize: null,
                retransmitEnable: null,
                dataDrop: null,
                meshPwd: null,
                selected: "2"
            }
        },
        computed: {
            icon: function () {
                return this.showPwd ? 'icon-eye' : "icon-eye-off";
            },
            currentWifi: function () {
                var self = this;
                self.wifiInfo = this.$store.state.wifiInfo;
                if (self.addFlag) {
                    if (Util._isEmpty(self.wifiInfo)) {
                        self.wifiName = self.$t('no');
                        self.password = "";
                    } else {
                        var loadAps = self.apList,  wifiFlag = true;
                        var loadSsid = "";
                        if (loadAps.length > 0) {
                            $.each(loadAps, function (i, item) {
                                if (item.ssid == self.wifiInfo.ssid) {
                                    self.wifiName = item.ssid;
                                    self.password = item.password;
                                    wifiFlag = false;
                                    return false;
                                }
                            })
                        }
                        if (wifiFlag) {
                            self.wifiName = self.wifiInfo.ssid;
                            self.password = ""
                        }
                    };
                    //self.getMeshId();
                    self.configWifi();
//                    return self.wifiName;
                }

            },
        },
        methods:{
            show: function() {
                Common.initNetworkShow(this);
            },
            getLoadAPs: function() {
                espmesh.loadAPs();
            },
            selectMore: function() {
                this.isMore = !this.isMore;
            },
            selectType: function(num) {
                if (!this.moreEnable) {
                    num = parseInt(num);
                    if (this.meshTyp == num) {
                        this.meshTyp = ""
                    } else {
                        this.meshType = num;
                    }
                }
            },
            selectRoot: function() {
                if (!this.moreEnable) {
                    this.rootEnable = !this.rootEnable;
                }
            },
            selectFix: function() {
                if (!this.moreEnable) {
                    this.fixEnable = !this.fixEnable;
                }
            },
            selectRetransmit: function() {
                if (!this.moreEnable) {
                    this.retransmitEnable = !this.retransmitEnable;
                }
            },
            selectDataDrop: function() {
                if (!this.moreEnable) {
                    this.dataDrop = !this.dataDrop;
                }
            },
            showPassword: function () {
                Common.showPassword(this);
            },
            nextInput: function(){
                Common.nextInput(this);
            },
            selectSwitch: function(val) {
                var self = this;
                switch(val) {
                    case "1": self.meshIdOne = ""; break;
                    case "2": self.meshIdTwo = ""; break;
                    case "3": self.meshIdThr = ""; break;
                    case "4": self.meshIdFour = ""; break;
                    case "5": self.meshIdFive = ""; break;
                    case "6": self.meshIdSex = ""; break;
                    default: break;
                }

            },
            getMeshId: function() {
                espmesh.loadMeshIds();

            },
            setMeshID: function(id) {
                Common.splitMeshId(this, id);
            },

            hideParent: function () {
                this.$emit("addDeviceShow");
                this.addFlag = false;
                this.$parent.hideParent();
            },
            hide: function () {
                this.$emit("addDeviceShow");
                this.addFlag = false;
            },
            onBackAddDevice: function() {
                window.onBackPressed = this.hide;
            },
            selectMesh: function() {
                this.showMesh = true;
                window.onBackPressed = this.hideMesh;
            },
            onMeshChange: function() {
                var self = this;
                var values = this.$refs.picker.getValues()[0];
                Common.splitMeshId(this, values);
                self.hideMesh();
            },
            hideMesh: function() {
                this.showMesh = false;
                window.onBackPressed = this.hide;
            },
            nextStep: function () {
                Common.startWifi(this);
            },
            configWifi: function () {
                var self = this;
                if (self.wifiInfo.frequency) {
                    var frequency = self.wifiInfo.frequency;
                    if (frequency > 4900 && frequency < 5900) {
                        Util.toast(MINT, self.$t('wifiDesc'));
                        self.showNext = true;
                    } else {
                        self.showNext = false;
                    }
                } else {
                    self.showNext = false;
                }
            },
            onLoadAPs: function(res) {
                if (!Util._isEmpty(res)) {
                    this.apList = JSON.parse(res)
                }
            },
            onLoadMeshIds: function(res) {
                var self = this,
                    id = "";
                self.meshArray = [];
                if (!Util._isEmpty(res)) {
                    self.meshArray = JSON.parse(res);
                    if (self.meshArray.length > 0) {
                        id = self.meshArray[0]
                    }
                }
                self.setMeshID(self.wifiInfo.bssid);
                if (self.meshArray.indexOf(self.wifiInfo.bssid) == -1) {
                    self.meshArray.push(self.wifiInfo.bssid);
                }
                self.slots1 = [{values: self.meshArray
                                    , defaultIndex: self.meshArray.indexOf(self.wifiInfo.bssid)}];
            }
        },
        components: {
            "v-conDevice": conDevice,
        }

    });

    return AddDevice;
});