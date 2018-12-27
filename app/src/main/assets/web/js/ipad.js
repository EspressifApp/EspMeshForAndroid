require.config({
    paths : {
        jQuery : 'jquery/jquery.min',
        IScroll: 'jquery/iscroll',
        bootstrap : 'bootstrap/bootstrap.min',
        "bootstrapSlider": 'jquery/bootstrap-slider.min',
        'jquery.ui' : 'jquery/jquery-ui.min',
        "jsPlumb" : 'jquery/jsplumb.min',
        'jquery.ui.touch-punch' : 'jquery/jquery.ui.touch-punch.min',
        "vue":"vue/vue.min",
        "vueRouter":"vue/vue-router.min",
        "Hammer" : 'jquery/hammer.min',
        //"ELEMENT":"vue/ELEMENT",
        "MINT":"vue/mint-ui",
        "Vuex":"vue/vuex.min",
        "touch":"vue/vue-touch",
        "txt":"vue/text",
        "Util":"utils",
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
require(["IScroll", "jQuery", "jsPlumb", "Hammer", "vue", "Util", "vueRouter", "MINT", "routers", "touch", "Vuex", "i18n", "zh", "en",
    "bootstrap", "jquery.ui", "jquery.ui.touch-punch"],
    function(IScroll, $, jsPlumb, Hammer, Vue, Util, VueRouter, MINT, routers, touch, Vuex, VueI18n, zh, en) {
    Vue.use(VueRouter);
    //Vue.use(ELEMENT);
    Vue.use(MINT);
    Vue.use(touch);
    Vue.use(Vuex);
    Vue.use(VueI18n);
    document.oncontextmenu=new Function("event.returnValue=false");
    document.onselectstart=new Function("event.returnValue=false");
    var router = new VueRouter({
        routes: routers
    });
    router.beforeEach(function(to, from, next) {
        var userInfo = window.espmesh.userLoadLastLogged();
        userInfo = JSON.parse(userInfo);
        if(userInfo == null || userInfo == "" || userInfo.status != 0){//如果有就直接到首页咯
            window.espmesh.userGuestLogin();
        }
        next();
    });
    var store = new Vuex.Store({
        state: {
            deviceList: [],
            groupList: [],
            mixList: [],
            deviceInfo: {},
            userName: "",
            searchName:"",
            scanDeviceList: [],
            conScanDeviceList: [],
            wifiInfo: "",
            topColor: 0,
            leftColor: 0,
            rssiInfo: -80,
            showScanBle: true,
            showLoading: true,
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
            setUserName: function(state, name){
                state.userName = name;
            },
            setDeviceInfo: function(state, info){
                state.deviceInfo = info;
            },
            setWifiInfo: function(state, info){
                state.wifiInfo = info;
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
            var res = window.espmesh.getLocale();
            res = JSON.parse(res);
            if (res.language == "zh") {
                this.$i18n.locale = "zh";
            } else {
                this.$i18n.locale = "en";
            }
        }
    });
});
