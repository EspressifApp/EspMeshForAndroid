var baseobj = function(){

    var base = this;
    /*基础全局数据对象*/
    base.StateObj={
        wh:window.innerHeight
    };

    //获取参数中的信息
    base.getQuery = function(search, name) {
        if(search.indexOf('?') >= 0) search = search.substr(1);
        var params = search.match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)'));
        if(params != null && params.length > 2) return (params[2]);
        return '';
    }
    /*日期插件*/
    base.timer = (function(){
        var timerobj = {};
        /*日期插件
         id:"控制器"，
         opt:参数，默认是一周，
         selectfun：选中日期之后的回调函数
         * */
        timerobj.bindCalendar = function(id,opt,selectfun){
            var now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth(),
                date = now.getDate(),
                day = now.getDay(),
                max = new Date(now.getFullYear() + 100, now.getMonth(), now.getDate());
            diff = day === 0 ? day : day - 1,
                currWeekDays = [],
                i = 0;

            for (i; i < 7; i++) {
                currWeekDays.push(new Date(year, month, date - diff + i));
            }

            var options = {
                lang: 'zh',
                display: 'center',
                headerText: false,
                selectType: 'day',
                firstSelectDay: 1,
                defaultValue: currWeekDays,
                firstDay: 1,
                onSet:function(value,event){
                    if(selectfun){
                        selectfun(value.valueText,event);
                    }
                }
            }
            if(opt && typeof opt == "object"){
                for(var attr in opt){
                    options[attr] = opt[attr]
                }
            }
            $(id).mobiscroll().calendar(options);
        }
        /*日期格式转换
         */
        timerobj.dateFormat = function(date){
            var changeday = new Date(date);
            return {
                day: changeday.getDate(), //几号
                year: changeday.getFullYear(),
                month: changeday.getMonth(),
                weekday: changeday.getDay()  //星期几
            }
        }
        /*日期格式转换*/
        timerobj.dateformat=function(data,format){
            var o = {
                "M+" : data.getMonth()+1, //month
                "d+" : data.getDate(), //day
                "h+" : data.getHours(), //hour
                "m+" : data.getMinutes(), //minute
                "s+" : data.getSeconds(), //second
                "q+" : Math.floor((data.getMonth()+3)/3), //quarter
                "S" : data.getMilliseconds() //millisecond
            }
            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (data.getFullYear()+"").substr(4 - RegExp.$1.length));
            }

            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;

        }
        timerobj.dataweek=function(data){
            var a = new Array("日", "一", "二", "三", "四", "五", "六");
            var dT=new Date();
            if(data instanceof Date){
                dT=data

            }else{
                if(data.indexOf('-')>-1){
                    data=data.replace(/-/g,'/');
                }
                dT=new Date(data);
            }

            var week = dT.getDay();
            var str = "星期"+ a[week];
            return str;
        }
        return timerobj;
    })();

    /*layer 弹框插件*/
    base.layerobj = (function(){
        var layerobj = {};
        /*加载时间*/
        layerobj.load = function(obj){
            var options = {shade: 'background-color: rgba(0,0,0,0)',shadeClose:false ,type:2};
            if(obj && (typeof obj == "object")){
                for(var attr in obj){
                    options[attr] = obj[attr];
                }
            }

            var load = layer.open(options);
            return load;
        }
        /*关闭所有loading框*/
        layerobj.close = function(type){
            if(type){
                layer.close(type);
            }else{
                layer.closeAll();//目前是关闭所有的函数
            }
        }
        /*弹出全屏的框*/
        layerobj.popup = function(html,opt){
            var op = {
                type: 1
                ,content: html
                ,anim: 'up'
                ,style: 'position:fixed; left:0; top:0; width:100%; height:100%; border: none; -webkit-animation-duration: .5s; animation-duration: .5s;'
            };
            if(opt && (typeof opt == 'object')){
                for(var attr in opt){
                    op[attr] = opt[attr];
                }
            }
            var popup = layer.open(op);
        }
        /*提示框*/
        layerobj.alertmsg = function(con,time){
            layer.open({
                content: con || "请填写提示内容"
                ,skin: 'msg'
                ,time: parseInt(time) || 2 //2秒后自动关闭
            });
        }
        /*信息框*/
        layerobj.alertinfo = function(con,sure,successbtn){
            layer.open({
                content: con || '提示信息'
                ,btn: sure || '确定'
                ,yes:function(index){
                    if(successbtn){
                        successbtn();
                    }
                    layer.close(index);
                }
            });
        }
        /*确定框
         title:确定 内容，
         btn：两个按钮名称，务必是数组
         * */
        layerobj.confirm = function(title,btn,successbtn,cancelbtn){
            if(btn instanceof Array && btn.length == 2){
                btn = btn;
            }else{
                btn = '';
            }
            layer.open({
                content: title || "确定框"
                ,btn: btn || ['确定', '取消']
                ,yes: function(index){
                    if(successbtn){
                        successbtn();
                    }
                    layer.close(index);
                }
                ,no: function(index){
                    if(cancelbtn){
                        cancelbtn();
                    }
                    layer.close(index);
                }
            });
        }

        return layerobj;
    })();

    /*baseurl*/
    base.getJsonDataBase = function (url, params, successFn, async, requestParam) {
        var result = null;
        if (typeof params != "object") {
            alert("请传递对象格式的参数");
            return result;
        }
        //参数对象中必须包括获取数据成功后的处理方法，这个可由调用者自行处理结果表现形式，
        //该方法有一个参数（该参数为json对象，其中包括Status（获取数据状态）、Message（获取数据结果描述）以及ResultInfos（数据实体））
        if (typeof successFn != "function") {
            alert("请指定返回结果处理方法");
            return result;
        }
        var requestTemp = params ? params : {};

        var loadurl = base.layerobj.load();

        //若要实现跨域请求的超时异常被捕获，则async的值必须设置成true
        async = typeof async == "boolean" ? async : true;
        $.ajax({
            type: "post",
            url: url,
            data: requestTemp,
            // dataType: "json",
            error: function (err, status, stext) {

                base.layerobj.close(loadurl);
                var res = (err.responseText ? err.responseText : (err.statusText == "timeout" ? "请求数据超时" : err.statusText));
                console.log("error:" + res);
                data = { Status: 0, Message: "error:" + res };
                //返回的结果在此规定，必须包含Status和Message等属性
                successFn(data, requestParam);
            },
            timeout: 30000,//超过25秒
            async: async,
            success: function (result) {
                //console.log(result)
                base.layerobj.close(loadurl);
                if (params.isShowStrData) {
                    alert(result);
                }
                var data = null;
                if (typeof result == "string" && result != "") {
                    try {
                        result = result.replace(/NaN/, "null").replace(/@X/g, "0").replace(/@x/g, "0").replace(/[uU]000a/g,'');

                        data = $.parseJSON(result);//将结果字符串转换成json对象
                    } catch (ex) {

                        try{
                            data = eval(result);
                        }catch(e){
                            try{
                                data = eval("("+result+")");
                            }catch(e){
                                data=result
                            }
                            // console.log(data)
                        }
                    }
                }
                else if (typeof result == "object") {
                    data = result;//若返回的结果为对象时直接使用
                }

                //返回的结果在此规定，必须包含Status和Message等属性
                successFn(data, requestParam);
            }
        });
    };


    /*mima jiekou*/
    base.getJsonData = function (urlAddr,params, successFn,async,requestParam) {
        var url = "http://10.13.0.54:8080/thkq/services2"+urlAddr;
        //var url = 'http://10.13.0.54:8080/thkq/services2/pwdreset/systeminfo';
        return base.getJsonDataBase(url, params, successFn, async, requestParam);
    };


    /*
     设置数插件
     data:数据；
     con：数新增节点；
     scuess:点击事件；
     option：配置节点
     * */
    base.treeobj = function(id,data,con,scuess,option){

        mytree = new dTree('mytree');

        /*配置mytree 基本信息*/
        mytree.config = {
            target:'',
            folderLinks:true,//文件夹可被链接 布尔值
            useSelection : true, //节点选择可被高亮 布尔值
            useCookies:true, //数可以使用cookie记住状态 布尔值
            useLines:true, // 是否使用连接线 布尔值
            useIcons:true, // 是否使用图表 布尔值
            useStatusText:false,// 用节点名替代显示在状态栏的节点url 布尔值
            closeSameLevel:false, //统计节点只有一个处于打开状态  布尔值
            inOrder:false //加速父节点数的显示
        }

        //判断数据
        if(data && (data instanceof Array)){}else{
            base.layerobj.alertmsg("请回传正确格式的数据");
            return;
        };
        //新增节点的判断
        var addcon = {
            root:{
                id:"",
                pid:-1,
                name:"",
                url:'',
                target:"",
                icon:"",
                iconOpen:"",
                open:""
            },
            child:{
                id:"",
                pid:-1,
                name:"",
                url:'javascript:',
                target:"",
                icon:"",
                iconOpen:"",
                open:""
            }
        };

        /*遍历对象*/
        function traverse(old,news){
            for(var attr in news){
                if(typeof (news[attr]) == 'object'){
                    traverse(old[attr], news[attr])
                }else{
                    old[attr] = news[attr];
                }
            }
        };

        if(con && (typeof con == 'object')){
            traverse(addcon,con);
        }else{
            base.layerobj.alertmsg("请回传正确格式的内容");
            return;
        };
        /*配置信息 option 可以不设置*/
        if(option && (typeof option == 'object')){
            for(var attr in option){
                mytree.config[attr] = option[attr];
            }
        };

        //设置根节点
        mytree.add(addcon.root.id,addcon.root.pid,addcon.root.name,addcon.root.url,addcon.root.target,addcon.root.icon,addcon.root.iconOpen,addcon.root.open)
        //解析数据
        var datacon = addcon.child;
        for(var i=0; i<data.length;i++){
            //console.log(datacon)
            mytree.add(data[i][datacon.id],data[i][datacon.pid],data[i][datacon.name],datacon.url,datacon.target ,datacon.icon,datacon.iconOpen,datacon.open);
        };
        //点击事件

        if(scuess){
            scuess(mytree);
        };
        document.getElementById(id).innerHTML = mytree;

    };


    /*判断终端和内核类型类型
     * browser：判断的内容
     */

    base.browser = function(browser){
        var u = navigator.userAgent, app = navigator.appVersion;
        console.log(u)
        var op = {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
        var flag = op[browser];
        return flag;
    }
    return base;

}(document,window)
