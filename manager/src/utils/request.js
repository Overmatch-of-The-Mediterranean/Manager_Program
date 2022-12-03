/**
 * axios二次封装
 */
import axios from 'axios'
import config from '../config'
import router from '../router/index.js'
import { ElMessage } from 'element-plus'
import storage from './storage'

const TOKEN_INVALID = 'Token认证失败，请重新登录'
const NETWORK_ERROR = '网络请求失败！'

// 创建axios实例对象，添加全局配置
const service = axios.create({
    baseURL: config.baseApi,
    timeout: 8000
})

// 请求拦截
service.interceptors.request.use((req) => {
    const headers = req.headers
    const {token} = storage.getItem('userInfo')
    if (!headers.Authorization) headers.Authorization = 'Jack '+ token
    return req
})

// 响应拦截
service.interceptors.response.use((res) => {
    const { code, msg, data } = res.data
    if (code === 200) {
        return data
    } else if (code === 50001) {
        ElMessage.error(TOKEN_INVALID)
        setTimeout(() => {
            router.push('/login')
        }, 1500);
        return Promise.reject(TOKEN_INVALID)
    } else {
        ElMessage.error(msg || NETWORK_ERROR)
        return Promise.reject(msg || NETWORK_ERROR)
    }
})
function request(options) {
    options.method = options.method || 'get'
    if (options.method.toLowerCase() === 'get') {
        options.params = options.data
    }

    // 是否有局部的mock使用
    if (typeof options.mock != 'undefined') {
        config.mock = options.mock
    }

    if (config.env === 'prod') {
        service.defaults.baseURL = config.baseApi
    } else {
        service.defaults.baseURL = config.mock ? config.mockApi : config.baseApi
    }

    return service(options)
}
['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
    request[item] = (url, data, options) => {
        return request({
            url,
            data,
            method: item,
            ...options
        })
    }
})
export default request