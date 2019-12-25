require.config({
    paths : {
        jQuery : 'jquery/jquery.min',
        IScroll: 'jquery/iscroll',
        "FastClick": 'jquery/fastclick',
        "vue":"vue/vue.min",
        "vueRouter":"vue/vue-router.min",
        'jquery.ui' : 'jquery/jquery-ui.min',
        'jquery.ui.touch-punch' : 'jquery/jquery.ui.touch-punch.min',
        //"ELEMENT":"vue/ELEMENT",
        "MINT":"vue/mint-ui",
        "Vuex":"vue/vuex.min",
        "touch":"vue/vue-touch",
        "txt":"vue/text",
        'layer':'vue/layer',
        "routers":"../aws/js/router",
        "i18n":"vue/vue-i18n.min",
        "Util":"utils",
        "zh":"../lang/zh",
        "en":"../lang/en"
    },
    shim:{
        'layer':['jQuery'],
        'base':['jQuery','layer'],
        "jquery.ui" : ["jQuery"],
        "jquery.ui.touch-punch" : ["jQuery", "jquery.ui"],
    }
});
require(["IScroll", "jQuery", "FastClick", "vue", "vueRouter", "MINT", "Util", "routers", "touch", "Vuex", "i18n", "zh", "en", "jquery.ui", "jquery.ui.touch-punch"],
    function(IScroll, $, FastClick, Vue, VueRouter, MINT, Util, routers, touch, Vuex, VueI18n, zh, en) {
        Vue.use(VueRouter);
        //Vue.use(ELEMENT);
        Vue.use(MINT);
        Vue.use(Vuex);
        Vue.use(VueI18n);
        document.oncontextmenu=new Function("event.returnValue=false");
        document.onselectstart=new Function("event.returnValue=false");
        FastClick.attach(document.body);
        var router = new VueRouter({
            routes: routers
        });

        router.beforeEach(function(to, from, next) {

//        userInfo = JSON.parse(userInfo);
//        if(userInfo == null || userInfo == "" || userInfo.status != 0){//如果有就直接到首页咯
//            espmesh.userGuestLogin();
//        }
            next();
        });
        var store = new Vuex.Store({
            state: {
                deviceList: [],
                aliDeviceList: [],
                groupList: [],
                roomList: [],
                mixList: [],
                deviceInfo: "",
                deviceCloudInfo: "",
                userInfo: "",
                searchName:"",
                scanDeviceList: [],
                conScanDeviceList: [],
                siteList: [],
                wifiInfo: "",
                blueInfo: false,
                rssiInfo: -100,
                showScanBle: true,
                deviceIp: "",
                systemInfo: "",
                appInfo: "",
                newAppInfo: "",
                isNewVersion: false,
                delayTime: 0,
                tsfTime: 0,
                isLogin: false,
            },
            mutations: {
                setList: function(state, list){
                    state.deviceList = list;
                },
                setAliDeviceList: function(state, list){
                    state.aliDeviceList = list;
                },
                setGroupList: function(state, list){
                    state.groupList = list;
                },
                setRoomList: function(state, list){
                    state.roomList = list;
                },
                setRecentList: function(state, list){
                    state.mixList = list;
                },
                setUserInfo: function(state, name){
                    state.userInfo = name;
                },
                setDeviceInfo: function(state, info){
                    state.deviceInfo = info;
                },
                setDeviceCloudInfo: function(state, info){
                    state.deviceCloudInfo = info;
                },
                setWifiInfo: function(state, info){
                    state.wifiInfo = info;
                },
                setBlueInfo: function(state, info){
                    state.blueInfo = info;
                },
                setScanDeviceList: function(state, info){
                    state.scanDeviceList = info;
                },
                setConScanDeviceList: function(state, info){
                    state.conScanDeviceList = info;
                },
                setSiteList: function(state, info){
                    state.siteList = info;
                },
                setRssi: function(state, info){
                    state.rssiInfo = info;
                },
                setShowScanBle: function(state, info){
                    state.showScanBle = info;
                },
                setDeviceIp: function(state, info) {
                    state.deviceIp = info;
                },
                setSystemInfo: function(state, info) {
                    state.systemInfo = info;
                },
                setAppInfo: function(state, info) {
                    state.appInfo = info;
                },
                setNewAppInfo: function(state, info) {
                    state.newAppInfo = info;
                },
                setIsNewVersion: function(state, info) {
                    state.isNewVersion = info;
                },
                setDelayTime: function(state, info) {
                    state.delayTime = info;
                },
                setTsfTime: function(state, info) {
                    state.tsfTime = info;
                },
                setIsLogin: function(state, info) {
                    state.isLogin = info;
                }
            }
        });
        var i18n = new VueI18n({
            locale: "zh",
            messages: {
                'zh': zh.m,   // 中文语言包
                'en': en.m    // 英文语言包
            }
        })
        var app = new Vue({
            el: "#app",
            i18n: i18n,
            store: store,
            router: router,
            mounted: function() {
                window.onLocaleGot = this.onLocaleGot;
                window.onGetAppInfo = this.onGetAppInfo;
                espmesh.getLocale();
                espmesh.getAppInfo();
            },
            methods: {
                onLocaleGot: function(res) {
                    res = JSON.parse(res);
                    if (res.language == "zh") {
                        this.$i18n.locale = "zh";
                    } else {
                        this.$i18n.locale = "en";
                    }
                    this.$store.commit("setSystemInfo", res.os);
                },
                onGetAppInfo: function(res) {
                    console.log(res);
                    this.$store.commit("setAppInfo", JSON.parse(res));
                },
            }
        });
        touch.VueTouch.setVue(Vue);
    });
