define(["vue","MINT", "txt!../../pages/guide.html" ],
    function(v, MINT, guide) {
        var Guide = v.extend({
            template: guide,
            data: function(){
                return {
                    flag: false,
                    isGuideContent: false,
                    guide: {},
                    guideTitle: this.$t('guideTitle'),
                    problem: this.$t('problem'),
                    step: this.$t('step'),
                    guideList: this.$t('guideList')
                }
            },
            methods:{
                show: function() {
                    var self = this;
                    self.guideTitle = self.$t('guideTitle');
                    self.problem = self.$t('problem');
                    self.step = self.$t('step');
                    self.guideList = self.$t('guideList');
                    setTimeout(function() {
                        window.onBackPressed = self.hide;
                    })
                    self.flag = true;
                },
                hide: function() {
                    this.hideGuideContent();
                    this.$store.commit("setShowScanBle", true);
                    this.$emit("guideShow");
                    this.flag = false;
                },
                showGuideContent: function(item) {
                    this.isGuideContent = true;
                    this.guide = item;
                    this.guideTitle = item.name;
                },
                hideGuideContent: function(item) {
                    this.isGuideContent = false;
                    this.guideTitle = this.$t('guideTitle');
                    this.guide = {};
                },
                openBrowser: function() {
                    espmesh.openBrowser(SHOP_URL);
                    window.onBackPressed = this.hide;
                },
                addDevice: function() {
                    this.flag = false;
                    this.hideGuideContent();
                    this.$parent.addDevice();
                },

            }

        });

        return Guide;
    });