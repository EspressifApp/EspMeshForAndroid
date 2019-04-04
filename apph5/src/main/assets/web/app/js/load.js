define(["vue", "Util", "txt!../../pages/load.html"],
    function(v, Util, load) {

    var Load = v.extend({

        template: load,
        props: {
            loadDesc: {
                type: String
            }
        },
        data: function(){
            return {
                show: false,
                loadTitle: this.$t('loading')
            }
        },
        methods:{
            showTrue: function () {
                if (!Util._isEmpty(this.loadDesc)) {
                    this.loadTitle = this.loadDesc;
                } else {
                    this.loadTitle = this.$t('loading');
                }
                this.show = true;
            },
            hide: function () {
                this.show = false;
            }
        }

    });
    return Load;
});