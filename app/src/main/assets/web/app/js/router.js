define(["../app/js/index", "../app/js/login", "../app/js/group", "../app/js/user", "../app/js/recent"],
    function(index, login, group, user,recent){
    var routes=[
        {name: "index",title: "首页",path: "/",component: index},
        {name: "group",title: "群组",path: "/group",component: group},
        {name: "login",title: "登录",path: "/login",component: login},
        {name: "user",title: "用户",path: "/user",component: user},
        {name: "recent",title: "最近",path: "/recent",component: recent}
    ]
    return routes;
});

