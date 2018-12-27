define(["../ipad/js/index", "../ipad/js/login"],
    function(index, login){
    var routes=[
        {name: "index",title: "首页",path: "/",component: index},
        {name: "login",title: "登录",path: "/login",component: login},
    ]
    return routes;
});

