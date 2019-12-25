define(["../ipad/js/home", "../ipad/js/group", "../ipad/js/user", "../ipad/js/login", "../ipad/js/association"],
    function(home, group, user, login, association){
    var routes=[
        {name: "home",title: "首页",path: "/",component: home},
        {name: "group",title: "群组",path: "/group",component: group},
        {name: "user",title: "用户",path: "/user",component: user},
        {name: "login",title: "登录",path: "/login",component: login},
        {name: "association",title: "关联",path: "/association",component: association}
    ]
    return routes;
});
