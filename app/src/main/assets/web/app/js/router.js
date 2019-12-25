define(["../app/js/index", "../app/js/login", "../app/js/group", "../app/js/user", "../app/js/room"],
    function(index, login, group, user, recent, room){
    var routes=[
        {name: "index",title: "首页",path: "/",component: index},
        {name: "group",title: "群组",path: "/group",component: group},
        {name: "login",title: "登录",path: "/login",component: login},
        {name: "user",title: "用户",path: "/user",component: user},
        {name: "room",title: "房间",path: "/room",component: room}
    ]
    return routes;
});

