/**
 * api管理
*/
import request from "../utils/request";
export default {
    login(params) {
        return request({
            url: '/users/login',
            method: 'post',
            data: params,
            mock:false
        })
    },
    noticeCount(params) {
        return request({
            url: '/leave/count',
            method: 'get',
            data: {},
            mock:true
        })
    },
    menuList(params) {
        return request({
            url: '/menu/list',
            method: 'get',
            data: {},
            mock:true
        })
    },
    userList(params) {
        return request({
            url: '/users/list',
            method: 'get',
            data: params
        })
    },
    userDelete(params) {
        return request({
            url: '/users/delete',
            method: 'post',
            data: params
        })
    },
    roleAllList(params) {
        return request({
            url: '/roles/allList',
            method: 'get',
            data: params,
            mock:true
        })
    },
    deptList(params) {
        return request({
            url: '/dept/list',
            method: 'get',
            data: params,
            mock:true
        })
    },
    userSubmit(params) {
        return request({
            url: '/users/operate',
            method: 'post',
            data: params,
            mock: false
        })
    }
}