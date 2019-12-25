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
                newAppInfo: "",
                appDesc: [],
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
                this.newAppInfo = this.$store.state.newAppInfo;
                this.title = this.$t('newVersionTitle');
                this.btnTitle = this.$t('updateVersionTitle');
                this.appDesc = [];
                this.flag = true;
                var notes = "";
                if (this.$store.state.systemInfo != "Android") {
                    notes = this.newAppInfo.notes
                } else {
                    notes = Util.Base64.decode(this.newAppInfo.notes);
                }
                if (notes.indexOf("\n") != -1) {
                    this.appDesc = notes.split("\n");
                } else {
                    this.appDesc.push(notes);
                }
                if (this.newAppInfo.total_size > 0) {
                    this.totalSize = this.calculateKb(this.newAppInfo.total_size );
                } else {
                     this.totalSize = "??";
                }

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
                espmesh.appVersionUpdate(JSON.stringify({"name": this.newAppInfo.name, "version": this.newAppInfo.version,
                    url: this.newAppInfo.url, total_size: this.newAppInfo.total_size}));
                this.isStart = true;
                if (this.$store.state.systemInfo != "Android") {
                    this.hide();
                }
            },
            onBackReset: function () {
                window.onBackPressed = this.hide;
            },
            calculateKb: function(size) {
                return (size / 1024 / 1024).toFixed(2)
            },
            onApkDownloading: function(res) {
                if (!Util._isEmpty(res)) {
                    res = JSON.parse(res);
                    this.totalSize = this.calculateKb(res.total_size);
                    this.downloadSize = this.calculateKb(res.download_size);
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
