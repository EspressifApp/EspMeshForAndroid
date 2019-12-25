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
                        json += '"'+item.key + '":' + self.checkRate(item.value);
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
                window.onGetLoadSelect = this.onGetLoadSelect;
                window.onSend = this.onSend;
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
                MINT.MessageBox.confirm(self.$t('delInfoDesc'), self.$t('deleteBtn')).then(function(obj) {
                    self.requestList.splice(i, 1);
                });
            },
            loadSelect: function() {
                var self= this;
                self.commandShow = !self.commandShow;
                if (self.loadSelectList.length > 0) {
                    self.selectValue = self.jsonStr;
                }

            },
            getLoadSelect: function() {
                espmesh.loadAllValuesInFile(JSON.stringify({name: COMMAND_LIST_FILE, callback: "onGetLoadSelect"}));
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
            checkRate: function (str) {
              var re = /^[0-9]+.?[0-9]*$/;
              if (!Util._isEmpty(str)) {
                if (!re.test(str) && str.indexOf("[") == -1 && str.indexOf("{") == -1) {
                  if (str.indexOf('"') == -1) {
                    str = '"' + str + '"'
                  }
              　}
              }
              return str
            },
            send: function() {
                var self = this, data = '{"' + MESH_MAC + '": ' + JSON.stringify(self.commandMacs)
                    + ',"'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'",', json = "", list = [];
                if (self.radioValue == "false") {
                     data += '"' + NO_RESPONSE + '": true,';
                }
                if (!Util._isEmpty(INSTANCE_TOAST)) {
                    INSTANCE_TOAST.close();
                }
                $.each(self.requestList, function(i, item) {
                    if (!Util._isEmpty(item.value)) {
                        json += '"'+item.key + '":' + self.checkRate(item.value) + ',';
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
                            espmesh.requestDevicesMulticast(data);
                        }, 1000)
                    } else {
                        INSTANCE_TOAST = Util.toast(MINT, self.$t('jsonDesc'));
                    }

                } else {
                    INSTANCE_TOAST = Util.toast(MINT, self.$t('jsonDesc'));
                }

            },
            onSend: function(res) {
                var self = this;
                console.log(res);
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    self.resultText = res.result;
                    espmesh.saveValuesForKeysInFile(JSON.stringify({"name": COMMAND_LIST_FILE,
                        "content": [{key: encodeURIComponent(JSON.stringify(res.tag)), value: ""}]}))
                }
                MINT.Indicator.close();
                self.resultShow = true;
                self.getLoadSelect();
                window.onBackPressed = this.hide;
            },
            onGetLoadSelect: function(res) {
                var self = this;
                console.log(res);
                self.loadSelectList = [];
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.name == COMMAND_LIST_FILE) {
                        var content = res.content;
                        var lastKey = "";

                        for(var i in content) {
                            console.log(i);
                            self.loadSelectList.push(decodeURIComponent(i));
                        }
                        var num = self.loadSelectList.length - 1;
                        if (self.loadSelectList.length > 0) {
                            self.requestList = [];
                            if (!Util._isEmpty(res.latest_key)) {
                                lastKey = JSON.parse(decodeURIComponent(res.latest_key));
                                for (var i in lastKey) {
                                    self.requestList.push({key: i, value: JSON.stringify(lastKey[i])});
                                }
                            }

                        }
                    }

                }
            }

        },
        created: function () {
        },


    });

    return Command;
});