define(["vue", "txt!../../pages/footer.html"], function(v, footer) {
    var Footer = v.extend({

        template: footer,
        props: {
            current: {
                type: String
            }
        },
        data: function(){
            return {
                device: "device",
                group: "group",
                user: "user",
                recent: "recent",
                room: "room",
                association: "association",
                showFooter: true,
            }
        },
        mounted: function() {
            var self = this;
            var oHeight = $(document).height();     //获取当前窗口的高度
            $(window).resize(function () {
                if ($(document).height() >= oHeight) {
                    self.showFooter = true;
                } else {
                    self.showFooter = false;
                }
            })
        },
        methods:{
            stopScan: function() {
                setTimeout(function() {
                    clearTimeout(SCAN_DEVICE);
                });
                espmesh.stopBleScan();
            },
            startScan: function() {
                clearTimeout(SCAN_DEVICE);
                espmesh.startBleScan();
            },
            showDevice: function() {
                var self = this;
                self.startScan();
                this.$router.push({
                    path: "/"
                });
            },
            showGroup: function() {
                this.setRouter("/group");
            },
            showRoom: function() {
                this.setRouter("/room");
            },
            showUser: function() {
                this.setRouter("/user");
            },
            showRecent: function() {
                this.setRouter("/recent");
            },
            showAssociation: function() {
                this.setRouter("/association");
            },
            setRouter: function(url) {
                this.stopScan();
                this.$store.commit("setShowScanBle", false);
                this.$router.push({
                    path: url
                });
            }
        },
    });
    return Footer;
});