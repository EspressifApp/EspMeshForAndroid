define(["vue", "MINT", "Util", "txt!../../pages/command.html"],
    function(v, MINT, Util, command) {

    var Command = v.extend({

        template: command,
        props: {
            commandMacs: {
                type: Array
            },
        },
        data: function(){
            return {
                addFlag: false,
                requestList:[{key: "request", value: null}],
                chartShow: false,
                commandShow: false,
                loadSelectList:[],
                jsonStr: "",
                selectValue: "",
                resultShow: false,
                disabledBtn: false,
                resultText: [],
                radioValue: "true"
            }
        },
        computed: {
            getCommand: function() {
                var self = this;
                if (self.addFlag) {
                    var deviceList = self.$store.state.deviceList;
                    if (deviceList.length == 0) {
                        self.hide();
                    }
                    var json = "{"
                    $.each(self.requestList, function(i, item) {
                        json += '"'+item.key + '":' + item.value;
                        if (i < (self.requestList.length - 1)) {
                            json += ',';
                        }
                    })
                    json += "}";
                    self.jsonStr = json;
                    return json;
                }

            }
        },
        methods:{
            show: function() {
                this.requestList = [{key: "request", value: null}];
                this.chartShow = false;
                this.commandShow = false;
                this.loadSelectList = [];
                this.jsonStr = "";
                this.selectValue = "";
                this.resultShow = false;
                this.disabledBtn = false;
                this.resultText = [];
                window.onBackPressed = this.hide;
                this.getLoadSelect();
                this.addFlag = true;
                window.onSend = this.onSend;
            },
            hide: function () {
                this.addFlag = false;
                espmesh.stopBleScan();
                this.$emit("commandShow");
            },
            addVal: function() {
                this.requestList.push({key: "newKey", value: null})
            },
            keyFocus: function (i) {
                var self = this;
                if (self.requestList[i].key == "newKey") {
                    self.requestList[i].key = "";
                }
            },
            valueFocus: function (i) {
                var self = this;
                if (self.requestList[i].value == null) {
                    self.requestList[i].value = "";
                }
            },
            keyBlur: function(i) {
                var self = this;
                if (self.requestList[i].key == "") {
                    self.requestList[i].key = "newKey";
                }
            },
            valueBlur: function(i) {
                var self = this;
                if (self.requestList[i].value == "") {
                    self.requestList[i].value = null;
                }
            },
            delVal: function(i) {
                var self = this;
                MINT.MessageBox.confirm("确定要删除吗", "删除").then(function(obj) {
                    self.requestList.splice(i, 1);
                });
            },
            loadSelect: function() {
                var self= this,
                    loadCommands = espmesh.loadPrefAllV(COMMAND_LIST_FILE);
                self.loadSelectList = [];
                if (!Util._isEmpty(loadCommands)) {
                    loadCommands = JSON.parse(loadCommands);
                    for(var i in loadCommands) {
                        self.loadSelectList.push(i);
                    }
                    self.commandShow = !self.commandShow;
                    self.selectValue = self.jsonStr;
                }

            },
            getLoadSelect: function() {
                var self= this,
                    loadCommands = espmesh.loadPrefAllV(COMMAND_LIST_FILE);
                self.loadSelectList = [];
                if (!Util._isEmpty(loadCommands)) {
                    loadCommands = JSON.parse(loadCommands);
                    for(var i in loadCommands) {
                        self.loadSelectList.push(i);
                    }
                    var num = self.loadSelectList.length - 1;
                    if (num > -1) {
                        self.requestList = [];
                        var obj = JSON.parse(self.loadSelectList[num]);
                        for (var i in obj) {
                            self.requestList.push({key: i, value: JSON.stringify(obj[i])});
                        }
                    }
                }
            },
            checkRadio: function() {
                var self = this;
                setTimeout(function(){
                    self.requestList = [];
                    var obj = JSON.parse(self.selectValue);
                    for (var i in obj) {
                        self.requestList.push({key: i, value: JSON.stringify(obj[i])});
                    }
                }, 100)
                this.resultShow = false;
                this.commandShow = false;
            },
            send: function() {
                var self = this, data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.commandMacs)
                    + ',', json = "", list = [];
                if (self.radioValue == "false") {
                     data += '"' + NO_RESPONSE + '": true,';
                }
                if (!Util._isEmpty(INSTANCE_TOAST)) {
                    INSTANCE_TOAST.close();
                }
                $.each(self.requestList, function(i, item) {
                    if (!Util._isEmpty(item.value)) {
                        json += '"'+item.key + '":' + item.value + ',';
                        list.push(item);
                    }
                })
                if (list.length > 0) {
                    self.requestList = list;
                } else {
                    self.requestList = [{key: "request", value: null}];
                }
                var len = json.length;
                if (len > 2) {
                    json = json.substr(0, len-1);
                }
                if (!Util._isEmpty(json)) {
                    data += json + ', "callback": "onSend", "tag": {' + json + '}}';
                    console.log(data);
                    if (Util.isJSON(data)) {
                        MINT.Indicator.open();
                        setTimeout(function() {
                            espmesh.requestDevicesMulticastAsync(data);
                        }, 1000)
                    } else {
                        INSTANCE_TOAST = MINT.Toast({
                            message: self.$t('jsonDesc'),
                            position: 'bottom',
                        });
                    }

                } else {
                    INSTANCE_TOAST = MINT.Toast({
                        message: self.$t('jsonDesc'),
                        position: 'bottom',
                    });
                }

            },
            onSend: function(res) {
                var self = this;
                console.log(res);
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    self.resultText = res.result;
                    espmesh.savePrefKV(COMMAND_LIST_FILE, JSON.stringify(res.tag), "");
                }
                MINT.Indicator.close();
                self.resultShow = true;
                window.onBackPressed = this.hide;
            }

        },
        created: function () {
        },


    });

    return Command;
});