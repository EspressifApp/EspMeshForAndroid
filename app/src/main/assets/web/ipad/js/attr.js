define(["vue", "MINT", "Common", "txt!../../pages/attr.html"],
    function(v, MINT, Common, attr) {

    var Attr = v.extend({

        template: attr,
        data: function(){
            return {
                deviceList: [],
                deviceMacs:[],
                device: {},
                attrList: []
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
                self.deviceList = self.$store.state.deviceList;
                self.attrList = [];
                self.getAttrList();
                console.log(JSON.stringify(self.attrList));
                //$(".slider-input").slider('destroy');
            },
            initAttrSlider: function(id, name, value, perms, min, max, step) {
                return Common.initAttrSlider(this, id, name, value, perms, min, max, step)
            },
            isShowInput: function(perms) {
                return Common.isShowInput(perms)
            },
            getAttrList: function() {
               Common.getAttrList(this)
            },
            isReadable: function(perms) {
                return Common.isReadable(perms);
            },
            isWritable: function(perms) {
                return Common.isWritable(perms);
            },
            changValue: function(e, cid) {
                Common.changValue(e, cid)
            },
            resetValue: function(value, cid, e) {
                Common.resetValue(value, cid, e)
            },
            sendValue: function(e) {

                Common.sendValue(this, e);
            },
            setAttr: function(cid, value) {
                Common.setAttr(this, cid, value);
            }
        },
        components: {

        }

    });

    return Attr;
});