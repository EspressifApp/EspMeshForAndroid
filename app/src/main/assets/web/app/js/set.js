define(["vue", "MINT", "txt!../../pages/set.html", "../js/aboutUs"],
    function(v, MINT, set, aboutUs) {

    var Set = v.extend({

        template: set,

        data: function(){
            return {
                flag: false
            }
        },
        methods:{
            show: function () {
                this.hideThis();
                this.flag = true;
            },
            hide: function () {
                this.flag = false;
                this.$emit("setShow");
            },
            showAboutUs: function () {
                this.$refs.aboutUs.show();
            },
            hideThis: function () {
                window.onBackPressed = this.hide;
            }
        },
        components: {
            "v-aboutUs": aboutUs
        }

    });
    return Set;
});