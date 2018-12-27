define(["vue", "txt!../../pages/remind.html"],
    function(v, remind) {

    var Remind = v.extend({

        template: remind,

        data: function(){
            return {
                addFlag: false
            }
        },
        methods:{
            show: function() {
                this.addFlag = true;
            },
            hide: function () {
                this.addFlag = false;
            },
            addClick: function () {
                this.addFlag = false;
                this.$parent.addDevice();
            }
        }


    });
    return Remind;
});