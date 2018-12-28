define(["vue", "MINT", "Util", "txt!../../pages/addDevice.html", "./conDevice"],
    function(v, MINT, Util, addDevice, conDevice) {

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
                meshType: "",
                votePercentage: "",
                voteMaxCount: "",
                backoffRssi: "",
                scanFailCount: "",
                monitorCount: "",
                rootHealing: "",
                rootEnable: false,
                fixEnable: false,
                capacityNum: "",
                maxLayer: "",
                maxConnect: "",
                assocExpire: "",
                beaconInterval: "",
                passiveScan: "",
                monitorDuration: "",
                cnxRssi: "",
                selectRssi: "",
                switchRssi: "",
                xonQsize: "",
                retransmitEnable: false,
                dataDrop: false,
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
                        var loadAps = espmesh.loadAPs(),  wifiFlag = true;
                        var loadSsid = "";
                        if (!Util._isEmpty(loadAps)) {
                            loadAps = JSON.parse(loadAps);
                        } else {
                            loadAps = [];
                        }
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
                    self.getMeshId();
                    self.configWifi();
                    return self.wifiName;
                }

            },
        },
        methods:{
            show: function() {
                var self = this;
                self.wifiInfo = this.$store.state.wifiInfo;
                self.wifiName = self.$t('no');
                self.password = "";
                self.showNext = false;
                self.onBackAddDevice();
                setTimeout(function() {
                    self.configWifi();
                }, 1000);
                self.nextInput();
                self.getMeshId();
                espmesh.stopBleScan();
                self.addFlag = true;
                self.moreObj = {};
                self.meshType = "",
                self.votePercentage = "";
                self.voteMaxCount = "";
                self.backoffRssi = "";
                self.scanFailCount = "";
                self.monitorCount = "";
                self.rootHealing = "";
                self.rootEnable = false;
                self.fixEnable = false;
                self.capacityNum = "";
                self.maxLayer = "";
                self.maxConnect = "";
                self.assocExpire = "";
                self.beaconInterval = "";
                self.passiveScan = "";
                self.monitorDuration = "";
                self.cnxRssi = "";
                selectRssi = "";
                self.switchRssi = "";
                self.xonQsiz = "";
                self.retransmitEnable = false;
                self.dataDrop = false;
            },
            selectMore: function() {
                this.isMore = !this.isMore;
            },
            selectType: function(num) {
                this.meshType = parseInt(num);
            },
            selectRoot: function() {
                this.rootEnable = !this.rootEnable;
            },
            selectFix: function() {
                this.fixEnable = !this.fixEnable;
            },
            selectRetransmit: function() {
                this.retransmitEnable = !this.retransmitEnable;
            },
            selectDataDrop: function() {
                this.dataDrop = !this.dataDrop;
            },
            showPassword: function () {
                this.showPwd = !this.showPwd;
                if (this.type == "password") {
                    this.type = "text";
                } else {
                    this.type = "password";
                }
            },
            nextInput: function(){
                var self = this,
                    txts = $(".form-input input");
                for(var i = 0; i < txts.length;i++){
                    var t = txts[i];
                    t.index = i;
                    t.onkeyup = function(){
                        var val = $(this).val();
                        var reg = /^[0-9a-fA-F]{1,2}$/;
                        if (reg.test(val)) {
                            if (val.length >= 2) {
                                var next = this.index + 1;
                                if(next > txts.length - 1) return;
                                txts[next].focus();
                            }
                        } else {
                            self.selectSwitch($(this).attr("data-value"));
                        }
                    }
                }
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
                var self = this,
                    meshIds = espmesh.loadMeshIds(),
                    id = espmesh.loadLastMeshId();
                self.meshArray = [];
                if (!Util._isEmpty(meshIds)) {
                    self.meshArray = JSON.parse(meshIds);
                }
                self.setMeshID(self.wifiInfo.bssid);
                if (self.meshArray.indexOf(self.wifiInfo.bssid) == -1) {
                    self.meshArray.push(self.wifiInfo.bssid);
                }
                self.slots1 = [{values: self.meshArray
                                    , defaultIndex: self.meshArray.indexOf(self.wifiInfo.bssid)}];
            },
            setMeshID: function(id) {
                var self = this;
                if (!Util._isEmpty(id)) {
                    var ids = id.split(":");
                    self.meshIdOne = ids[0];
                    self.meshIdTwo = ids[1];
                    self.meshIdThr = ids[2];
                    self.meshIdFour = ids[3];
                    self.meshIdFive = ids[4];
                    self.meshIdSex = ids[5];
                }
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
            onMeshChange: function(picker, values) {
                var self = this;
                if (!Util._isEmpty(values[0])) {
                    var ids = values[0].split(":");
                    self.meshIdOne = ids[0];
                    self.meshIdTwo = ids[1];
                    self.meshIdThr = ids[2];
                    self.meshIdFour = ids[3];
                    self.meshIdFive = ids[4];
                    self.meshIdSex = ids[5];
                }

            },
            hideMesh: function() {
                this.showMesh = false;
                window.onBackPressed = this.hide;
            },

            nextStep: function () {
                var self = this;
                var bleCon = espmesh.isBluetoothEnable();
                var sdk = espmesh.getSDKInt();

                if (!bleCon) {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (sdk >= 23) {
                    var locationCon = espmesh.isLocationEnable();
                    if (!locationCon) {
                        MINT.Toast({
                            message: self.$t('locationConDesc'),
                            position: 'bottom',
                        });
                        return false;
                    }
                }
                if (self.wifiName == self.$t('no')) {
                    MINT.Toast({
                        message: self.$t('wifiNoDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (Util._isEmpty(self.meshIdOne) || Util._isEmpty(self.meshIdTwo) || Util._isEmpty(self.meshIdThr) ||
                    Util._isEmpty(self.meshIdFour) || Util._isEmpty(self.meshIdFive) || Util._isEmpty(self.meshIdSex)) {
                    MINT.Toast({
                        message: self.$t('meshIdDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                self.meshId = self.meshIdOne + ":" + self.meshIdTwo + ":" + self.meshIdThr + ":" + self.meshIdFour +
                    ":" + self.meshIdFive + ":" + self.meshIdSex;
                self.moreObj = {meshType: self.meshType, votePercentage: self.votePercentage, voteMaxCount: self.voteMaxCount,
                    backoffRssi: self.backoffRssi, scanFailCount: self.scanFailCount, monitorCount: self.monitorCount,
                    rootHealing: self.rootHealing, rootEnable: self.rootEnable, fixEnable: self.fixEnable,
                    capacityNum: self.capacityNum, maxLayer: self.maxLayer, maxConnect: self.maxConnect,
                    assocExpire: self.assocExpire, beaconInterval: self.beaconInterval, passiveScan: self.passiveScan,
                    monitorDuration: self.monitorDuration, cnxRssi: self.cnxRssi, selectRssi: self.selectRssi,
                    switchRssi: self.switchRssi, xonQsize: self.xonQsize, retransmitEnable:self.retransmitEnable,
                    dataDrop: self.dataDrop};
                if(self.showNext) {
                     MINT.MessageBox.confirm(self.$t('wifiConfirmDesc'), self.$t('configNet'),{
                            confirmButtonText: self.$t('carryOn'), cancelButtonText: self.$t('cancelBtn')}).then(function(action) {
                        self.$refs.con.show();
                    });
                } else {
                    self.$refs.con.show();
                }
            },
            configWifi: function () {
                var self = this;
                if (self.wifiInfo.frequency) {
                    var frequency = self.wifiInfo.frequency;
                    if (frequency > 4900 && frequency < 5900) {
                        MINT.Toast({
                            message: self.$t('wifiDesc'),
                            position: 'bottom',
                        });
                        self.showNext = true;
                    } else {
                        self.showNext = false;
                    }
                } else {
                    self.showNext = false;
                }
            },
        },
        components: {
            "v-conDevice": conDevice,
        }

    });

    return AddDevice;
});