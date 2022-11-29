/**
 * axios二次封装
 */
import axios from 'axios'
import config from '../config'
import router from '../router/index.js'
import { ElMessage } from 'element-plus'

const TOKEN_INVALID = '登录过期，请重新登录'
const NETWORK_ERROR = '网络请求失败'

// 创建axios实例对象，添加全局配置
const service = axios.create({
    baseURL: config.baseApi,
    timeout: 8000
})

// 请求拦截
service.interceptors.request.use((req) => {
    const headers = req.headers
    if (!headers.Authorization) headers.Authorization = 'Jack'
    return req
})

// 响应拦截
service.interceptors.response.use((res) => {
    const { code, msg, data } = res.data
    if (code === 200) {
        console.log(code);
        return data
    } else if (code === 40001) {
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

    if (config.env === 'prod') {
        service.defaults.baseURL = config.baseApi
    } else {
        service.defaults.baseURL = config.mock ? config.mockApi : config.baseApi
    }

    return service(options)
}
export default request