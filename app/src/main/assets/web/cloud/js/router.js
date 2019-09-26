define(["../cloud/js/index", "../cloud/js/group", "../cloud/js/user"],
    function(index, group, user){
    var routes=[
        {name: "index",title: "首页",path: "/",component: index},
        {name: "group",title: "群组",path: "/group",component: group},
        {name: "user",title: "用户",path: "/user",component: user},
    ]
    return routes;
});

