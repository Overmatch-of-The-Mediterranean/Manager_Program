import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/views/Home.vue";
import storage from "../utils/storage";
import api from "../api";
import utils from "../utils/utils";
const routes = [
    {
        name: "home",
        path: "/",
        meta: {
            title: "首页",
        },
        component: Home,
        redirect: "/welcome",
        children: [
            {
                name: "welcome",
                path: "welcome",
                meta: {
                    title: "欢迎体验Vue3全栈课程",
                },
                component: () => import("@/views/Welcome.vue"),
            },
            // {
            //     name: "user",
            //     path: "system/user",
            //     meta: {
            //         title: "用户管理",
            //     },
            //     component: () => import("@/views/User.vue"),
            // },
            // {
            //     name: "menu",
            //     path: "system/menu",
            //     meta: {
            //         title: "用户管理",
            //     },
            //     component: () => import("@/views/Menu.vue"),
            // },
            // {
            //     name: "role",
            //     path: "system/role",
            //     meta: {
            //         title: "角色管理",
            //     },
            //     component: () => import("@/views/Role.vue"),
            // },
            // {
            //     name: "dept",
            //     path: "system/dept",
            //     meta: {
            //         title: "部门管理",
            //     },
            //     component: () => import("@/views/Dept.vue"),
            // },
        ],
    },
    {
        name: "login",
        path: "/login",
        meta: {
            title: "登录",
        },
        component: () => import("@/views/Login.vue"),
    },
    {
        name: "404",
        path: "/404",
        meta: {
            title: "404",
        },
        component: () => import("@/views/404.vue"),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

async function loadAsyncRoute() {
    const userInfo = storage.getItem("userInfo") || {};
    // console.log("userInfo1===>", userInfo);
    if (userInfo.token) {
        try {
            // console.log("api===>", api);
            let menuList = await api.getPermissionList();
            console.log("menuList111===>", menuList);
            let routes = utils.generateRoute(menuList);
            // console.log("routes111===>", routes);
            routes.map((route) => {
                let url = `./../views/${route.component}.vue`;
                route.component = () => import(url);
                router.addRoute("home", route);
            });
        } catch (error) {
            console.log(error.stack);
        }
    }
}

await loadAsyncRoute();

// 检查路由是否存在
function checkedPermission(path) {
    let hasPermission = router
        .getRoutes()
        .filter((route) => route.path == path).length;
    if (hasPermission) {
        return true;
    } else {
        return false;
    }
}

// 路由守卫
router.beforeEach((to, from, next) => {
    if (checkedPermission(to.path)) {
        next();
    } else {
        next("/404");
    }
});
export default router;
