define(["vue", "MINT", "txt!../../pages/attr.html"],
    function(v, MINT, attr) {

    var Attr = v.extend({

        template: attr,
        data: function(){
            return {
                flag: false,
                deviceList: [],
                deviceMacs:[],
                device: {},
                deviceName: "",
                attrList: [],
                switchValue: false,
            }
        },
        computed: {

        },
        methods:{
            show: function () {
                var self = this;
                $("#attr-wrapper").empty();
                window.onBackPressed = self.hide;
                self.device = self.$store.state.deviceInfo;
                console.log(JSON.stringify(self.device));
                self.deviceList = self.$store.state.deviceList;
                self.attrList = [];
                self.getAttrList();
                //$(".slider-input").slider('destroy');
                self.deviceName = self.device.name;
                self.flag = true;

            },
            hide: function () {
                this.flag = false;
                this.$store.commit("setShowScanBle", true);
                this.$emit("attrShow");
            },
            initAttrSlider: function(id, name, value, perms, min, max, step) {
                var self = this;
                setTimeout(function() {
                    $("#" + id + name).slider({
                        step: step,
                        min: min,
                        max: max,
                        value: value,
                        slide: function(event, ui) {
                            var doc = $(this),
                                docParent = doc.parent().parent();
                            docParent.find(".icon-blue").text(ui.value);
                            docParent.find(".input-value").val(ui.value);
                        },
                        stop: function(event, ui) {
                            var doc = $(this),
                                cid = doc.attr("data-cid");
                            self.setAttr(cid, ui.value);
                        }
                    })
                    if (self.isReadable(perms) && !self.isWritable(perms)) {
                        $("#" + id + name).slider("disable");
                    }
                    $("#" + id + name).parent().parent().find(".icon-blue").text(value);
                })
                return true;
            },
            getRelay: function(cid) {
                if (this.device.tid >= MIN_RELAY && this.device.tid <= MAX_RELAY && cid == STATUS_CID) {
                    return true;
                }
                return false;
            },
            getCurValue: function(value) {
                if (value === STATUS_ON) {
                    this.switchValue =  true;
                } else {
                    this.switchValue = false
                }
            },
            changeSwitch: function() {
                var self = this;
                setTimeout(function() {
                    console.log(self.switchValue)
                    var val = self.switchValue ? 1 : 0;
                    console.log(val);
                    self.setAttr(STATUS_CID, val);
                }, 50)

            },
            isShowInput: function(perms) {
                var self = this, flag = true;
                if (self.isReadable(perms) && !self.isWritable(perms)) {
                    flag = false;
                }
                return flag;
            },
            getAttrList: function() {
                var self = this;
                $.each(self.device.characteristics, function(i, item) {
                    if (self.isReadable(item.perms) || self.isWritable(item.perms)) {
                        if (self.getRelay(item.cid)) {
                            self.getCurValue(item.value);
                        }
                        self.attrList.push(item);
                    }
                });
            },
            isReadable: function(perms) {
                return (perms & 1) == 1;
            },
            isWritable: function(perms) {
                return ((perms >> 1) & 1) == 1;
            },
            changValue: function(e, cid) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent(),
                    value = doc.val();
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            resetValue: function(value, cid, e) {
                var doc = $(e.currentTarget),
                    docParent = doc.parent().parent();
                docParent.find(".input-value").val(value);
                docParent.find(".icon-blue").text(value);
                $("#" + cid).slider("setValue", value);
            },
            sendValue: function(e) {
                var self = this,
                    doc = $(e.currentTarget),
                    docInput = $(doc).parent().parent().find(".input-value"),
                    value = docInput.val(),
                    cid = docInput.attr("data-cid");
                self.setAttr(cid, value);
            },
            setAttr: function(cid, value) {
                var self = this,
                    meshs = [],
                    characteristics = [],
                    attrFlag = false;
                $.each(self.device.characteristics, function(i, item) {
                    if (item.cid == cid) {
                        if (value != item.value) {
                            item.value = parseInt(value);
                            attrFlag = true;
                        }

                    }
                    characteristics.push(item);
                });
                if (attrFlag) {
                    self.device.characteristics = characteristics;
                    $.each(self.deviceList, function(i, item){
                        if (item.mac == self.device.mac) {
                            self.deviceList.splice(i, 1, self.device);
                            return false;
                        }
                    });
                    meshs.push({cid: parseInt(cid), value: parseInt(value)});
                    var data = '{"' + MESH_MAC + '": "' + self.device.mac +
                        '","'+DEVICE_IP+'": "'+self.$store.state.deviceIp+'","'+NO_RESPONSE+'": true,"' + MESH_REQUEST + '": "' + SET_STATUS + '",' +
                        '"characteristics":' + JSON.stringify(meshs) + '}';
                    espmesh.requestDevice(data);
                    self.$store.commit("setList", self.deviceList);
                }

            }
        },
        components: {

        }

    });

    return Attr;
});