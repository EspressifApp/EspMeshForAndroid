require.config({
    paths : {
        jQuery : 'jquery/jquery.min',
        "FastClick": 'jquery/fastclick',
        'jquery.ui' : 'jquery/jquery-ui.min',
        "jsPlumb" : 'jquery/jsplumb.min',
        'jquery.ui.touch-punch' : 'jquery/jquery.ui.touch-punch.min',
        "vue":"vue/vue.min",
        "vueRouter":"vue/vue-router.min",
        "Hammer" : 'jquery/hammer.min',
        //"ELEMENT":"vue/ELEMENT",
        "MINT":"vue/mint-ui",
        "ELEMENT":"vue/element",
        "Vuex":"vue/vuex.min",
        "touch":"vue/vue-touch",
        "swiper":"vue/swiper.min",
        "VueAwesomeSwiper":"vue/vue-awesome-swiper",
        "txt":"vue/text",
        "Util":"utils",
        "Common":"common",
        "routers":"../ipad/js/router",
        'i18n':'vue/vue-i18n.min',
         "zh":"../lang/zh",
         "en":"../lang/en"
    },
    shim:{
        "bootstrap" : ["jQuery"],
        "jquery.ui" : ["jQuery"],
        "jquery.ui.touch-punch" : ["jQuery", "jquery.ui"],
        'jsPlumb': {
            deps: ['jQuery', "jquery.ui"],
            exports: 'jsPlumb'
        },
        'Hammer': {
            deps: [],
            exports: 'Hammer'
        },
    }
});
require(["jQuery", "FastClick", "jsPlumb", "Hammer", "vue", "ELEMENT", "Util", "Common", "vueRouter", "MINT", "routers", "VueAwesomeSwiper", "touch", "Vuex", "i18n", "zh", "en",
    "jquery.ui", "jquery.ui.touch-punch"],
    function($, FastClick, jsPlumb, Hammer, Vue, ELEMENT, Util, Common, VueRouter, MINT, routers, VueAwesomeSwiper, touch, Vuex, VueI18n, zh, en) {
    Vue.use(VueRouter);
    Vue.use(MINT);
    Vue.use(touch);
    Vue.use(Vuex);
    Vue.use(VueI18n);
    Vue.use(VueAwesomeSwiper);
    Vue.use(ELEMENT);
    document.oncontextmenu=new Function("event.returnValue=false");
    document.onselectstart=new Function("event.returnValue=false");
    FastClick.attach(document.body);
    var router = new VueRouter({
        routes: routers
    });
    router.beforeEach(function(to, from, next) {
//        var userInfo = espmesh.userLoadLastLogged();
//        userInfo = JSON.parse(userInfo);
//        if(userInfo == null || userInfo == "" || userInfo.status != 0){//如果有就直接到首页咯
//
//        }
        next();
    });

    var store = new Vuex.Store({
        state: {
            deviceList: [],
            groupList: [],
            mixList: [],
            deviceInfo: {},
            groupInfo: {},
            userName: "",
            searchName:"",
            scanDeviceList: [],
            conScanDeviceList: [],
            ibeaconList: [],
            wifiInfo: "",
            siteList: [],
            topColor: 0,
            leftColor: 0,
            rssiInfo: -100,
            showScanBle: true,
            showLoading: true,
            deviceIp: "",
            blueInfo: false,
            eventsPositions: [],
            delayTime: 3000,
            tsfTime: 0,
            systemInfo: "",
            appInfo: "",
            newAppInfo: "",
            isNewVersion: false,
            pages: 1,
            pageSize: 0,
            winHeight: 0
        },
        mutations: {
            setList: function(state, list){
                state.deviceList = list;
            },
            setGroupList: function(state, list){
                state.groupList = list;
            },
            setRecentList: function(state, list){
                state.mixList = list;
            },
            setIbeaconList: function(state, list){
                state.ibeaconList = list;
            },
            setUserName: function(state, name){
                state.userName = name;
            },
            setDeviceInfo: function(state, info){
                state.deviceInfo = info;
            },
            setGroupInfo: function(state, info){
                state.groupInfo = info;
            },
            setSiteList: function(state, info){
                state.siteList = info;
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
            setTopColor: function(state, info){
                state.topColor = info;
            },
            setLeftColor: function(state, info){
                state.leftColor = info;
            },
            setRssi: function(state, info){
                state.rssiInfo = info;
            },
            setShowScanBle: function(state, info){
                state.showScanBle = info;
            },
            setShowLoading: function(state, info){
                state.showLoading = info;
            },
            setBlueInfo: function(state, info){
                state.blueInfo = info;
            },
            setDeviceIp: function(state, info) {
                state.deviceIp = info;
            },
            setSystemInfo: function(state, info) {
                state.systemInfo = info;
            },
            setEventsPositions: function(state, info) {
                state.eventsPositions = info;
            },
            setDelayTime: function(state, info) {
                state.delayTime = info;
            },
            setTsfTime: function(state, info) {
                state.tsfTime = info;
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
            setPages: function(state, info) {
                state.pages = info;
            },
            setPageSize: function(state, info) {
                state.pageSize = info;
            },
            setWinHeight: function(state, info) {
                state.winHeight = info;
            }
        }
    });
    var i18n = new VueI18n({
        locale: "zh",
        messages: {
            'zh': zh.m,   // 中文语言包
            'en': en.m    // 英文语言包
        }
    });
    var app = new Vue({
        el: "#ipad",
        i18n: i18n,
        store: store,
        router: router,
        mounted: function() {
            Common.registerMint(MINT, Util);
            window.onLocaleGot = this.onLocaleGot;
            window.onGetAppInfo = this.onGetAppInfo;
            var height = document.body.clientHeight - 130;
            console.log(height);
            this.$store.commit("setWinHeight", height);
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
});
