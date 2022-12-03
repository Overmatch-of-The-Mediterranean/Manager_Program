import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/views/Home.vue'

const routes = [
    {
        name: 'home',
        path: '/',
        meta: {
            title: '首页'
        },
        component: Home,
        redirect: '/welcome',
        children: [
            {
                name: 'welcome',
                path: 'welcome',
                meta: {
                    title: '欢迎体验Vue3全栈课程'
                },
                component: () => import('@/views/Welcome.vue')
            },
            {
                name: 'user',
                path: 'user',
                meta: {
                    title: '用户管理'
                },
                children:[
                    {
                        name: 'info',
                        path: 'info',
                        meta: {
                        title: '信息详情'
                },
                component: () => import('@/views/Welcome.vue')
            }
                ],
                component: () => import('@/views/Welcome.vue')
            }
        ]
    },
    {
        name: 'login',
        path: '/login',
        meta: {
            title: '登录'
        },
        component: () => import('@/views/Login.vue')
    }

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router