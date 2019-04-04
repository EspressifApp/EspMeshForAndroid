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
                    return self.wifiName;
                }

            },
        },
        methods:{
            show: function() {
                var self = this;
                self.wifiInfo = this.$store.state.wifiInfo;
                window.onLoadAPs = self.onLoadAPs;
                window.onLoadMeshIds = self.onLoadMeshIds;
                self.apList = [];
                self.wifiName = self.$t('no');
                self.password = "";
                self.showNext = false;
                self.onBackAddDevice();
                self.getLoadAPs();
                self.nextInput();
                self.getMeshId();
                espmesh.stopBleScan();
                self.addFlag = true;
                self.moreObj = {};
                self.meshType = null,
                self.votePercentage = null;
                self.voteMaxCount = null;
                self.backoffRssi = null;
                self.scanMinCount = null;
                self.scanFailCount = null;
                self.monitorCount = null;
                self.rootHealing = null;
                self.rootEnable = null;
                self.fixEnable = null;
                self.capacityNum = null;
                self.maxLayer = null;
                self.maxConnect = null;
                self.assocExpire = null;
                self.beaconInterval = null;
                self.passiveScan = null;
                self.monitorDuration = null;
                self.cnxRssi = null;
                selectRssi = null;
                self.switchRssi = null;
                self.xonQsiz = null;
                self.retransmitEnable = null;
                self.dataDrop = null;
                setTimeout(function() {
                    self.configWifi();
                }, 1000);
            },
            getLoadAPs: function() {
                espmesh.loadAPs();
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
                espmesh.loadMeshIds();

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
                if (!this.$store.state.blueInfo) {
                    MINT.Toast({
                        message: self.$t('bleConDesc'),
                        position: 'bottom',
                    });
                    return false;
                }
                if (this.$store.state.systemInfo == "Android") {
                    var sdk = espmesh.getSDKInt();
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
                self.moreObj = {mesh_type: self.meshType, vote_percentage: self.votePercentage, vote_max_count: self.voteMaxCount,
                    backoff_rssi: self.backoffRssi, scan_min_count: self.scanMinCount, scan_fail_count: self.scanFailCount, monitor_ie_count: self.monitorCount,
                    root_healing_ms: self.rootHealing, root_conflicts_enable: self.rootEnable, fix_root_enable: self.fixEnable,
                    capacity_num: self.capacityNum, max_layer: self.maxLayer, max_connection: self.maxConnect,
                    assoc_expire_ms: self.assocExpire, beacon_interval_ms: self.beaconInterval, passive_scan_ms: self.passiveScan,
                    monitor_duration_ms: self.monitorDuration, cnx_rssi: self.cnxRssi, select_rssi: self.selectRssi,
                    switch_rssi: self.switchRssi, xon_qsize: self.xonQsize, retransmit_enable:self.retransmitEnable,
                    data_drop_enable: self.dataDrop};
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