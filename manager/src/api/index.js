/**
 * api管理
 */
import request from "../utils/request";
export default {
    login(params) {
        return request({
            url: "/users/login",
            method: "post",
            data: params,
            mock: false,
        });
    },
    noticeCount(params) {
        return request({
            url: "/leave/count",
            method: "get",
            data: {},
            mock: false,
        });
    },
    menuList(params) {
        return request({
            url: "/menu/list",
            method: "get",
            data: params,
            mock: false,
        });
    },
    userList(params) {
        return request({
            url: "/users/list",
            method: "get",
            data: params,
            mock: false,
        });
    },
    getPermissionList() {
        return request({
            url: "/users/getPermissionList",
            method: "get",
            data: {},
            mock: false,
        });
    },
    userDelete(params) {
        return request({
            url: "/users/delete",
            method: "post",
            data: params,
        });
    },
    roleAllList(params) {
        return request({
            url: "/roles/allList",
            method: "get",
            data: params,
            mock: false,
        });
    },
    deptList(params) {
        return request({
            url: "/dept/list",
            method: "get",
            data: params,
            mock: false,
        });
    },
    userSubmit(params) {
        return request({
            url: "/users/operate",
            method: "post",
            data: params,
            mock: false,
        });
    },
    menuSubmit(params) {
        return request({
            url: "/menu/operate",
            method: "post",
            data: params,
            mock: false,
        });
    },
    roleList(params) {
        return request({
            url: "/roles/list",
            method: "get",
            data: params,
            mock: false,
        });
    },
    roleSubmit(params) {
        return request({
            url: "/roles/operate",
            method: "post",
            data: params,
            mock: false,
        });
    },
    updatePermission(params) {
        return request({
            url: "/roles/update/permission",
            method: "post",
            data: params,
            mock: false,
        });
    },
    allUserList() {
        return request({
            url: "/users/all/list",
            method: "get",
            data: {},
            mock: false,
        });
    },
    deptSubmit(params) {
        return request({
            url: "/dept/operate",
            method: "post",
            data: params,
            mock: false,
        });
    },
    applyList(params) {
        return request({
            url: "/leave/list",
            method: "get",
            data: params,
            mock: false,
        });
    },
    applyOperate(params) {
        return request({
            url: "/leave/operate",
            method: "post",
            data: params,
            mock: false,
        });
    },
    leaveApprove(params) {
        return request({
            url: "/leave/approve",
            method: "post",
            data: params,
            mock: false,
        });
    },
};
