define(["vue", "MINT", "Util", "txt!../../pages/newVersion.html"],
    function(v, MINT, Util, newVersion) {

    var NewVersion = v.extend({

        template: newVersion,

        data: function(){
            return {
                flag: false,
                isStart: false,
                isFail: false,
                totalSize: 0,
                downloadSize: 0,
                progressSize: 0,
                title: this.$t('newVersionTitle'),
                btnTitle: this.$t('updateVersionTitle'),
            }
        },
        computed: {

        },
        methods:{
            show: function() {
                this.onBackReset();
                this.isStart = false;
                this.isFail = false;
                this.totalSize = 0;
                this.downloadSize = 0;
                this.progressSize = 0;
                this.title = this.$t('newVersionTitle');
                this.btnTitle = this.$t('updateVersionTitle');
                this.flag = true;
                window.onApkDownloading = this.onApkDownloading;
                window.onApkDownloadResult = this.onApkDownloadResult;
            },
            hide: function () {
                this.flag = false;
                this.$emit("newVersionShow");
            },
            hideParent: function () {
                this.addFlag = false;
                this.$emit("newVersionShow");
            },
            appVersionUpdate: function() {
                this.title = this.$t('newVersionTitle');
                this.isFail = false;
                var newAppInfo = this.$store.state.newAppInfo;
                espmesh.appVersionUpdate(JSON.stringify({"name": newAppInfo.name, "version": newAppInfo.version}));
                this.isStart = true;
                if (this.$store.state.systemInfo != "Android") {
                    this.hide();
                }
            },
            onBackReset: function () {
                window.onBackPressed = this.hide;
            },
            onApkDownloading: function(res) {
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    this.totalSize = (res.total_size / 1024 / 1024).toFixed(2);
                    this.downloadSize = (res.download_size / 1024 / 1024).toFixed(2);
                    console.log(this.totalSize);
                    console.log(this.downloadSize);
                    this.progressSize = (this.downloadSize / this.totalSize * 100).toFixed(0);
                    console.log(this.progressSize);
                }
            },
            onApkDownloadResult: function(res) {
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    if (res.result) {
                        this.progressSize = 100;
                        this.hide();
                    } else {
                        this.isFail = true;
                        this.isStart = false;
                        this.title = this.$t('upgradePartFailDesc');
                        this.btnTitle = this.$t('retryBtn');
                    }

                }
            }
        }
    });

    return NewVersion;
});