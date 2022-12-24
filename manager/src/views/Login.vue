<template>
    <div class="login-wrapper">
        <div class="modal">
            <el-form ref="userForm" :model="user" status-icon :rules="rules">
                <div class="title">
                    火星
                </div>
                <el-form-item prop="userName">
                    <el-input type="text" :prefix-icon="Avatar" v-model="user.userName"/>
                </el-form-item>
                <el-form-item prop="userPwd">
                    <el-input type="password" :prefix-icon="Lock" v-model="user.userPwd"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="btn-login" @click="toLogin">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { Avatar, Lock } from "@element-plus/icons-vue";
import storage from '../utils/storage'
import utils from "../utils/utils";
export default {
    name:'Login',
    data(){
        return {
            user:{
                userName:'',
                userPwd:''
            },
            rules:{
                userName:[
                    {
                        required:true,message:'请输入用户名',trigger:'blur'
                    }
                ],
                userPwd: [
                    {
                        required: true, message: '请输入密码', trigger: 'blur'
                    }
                ]
            }
        }
    },
    methods:{
        toLogin() {
            this.$refs.userForm.validate((valid) => {
                if (valid) {
                    this.$api.login(this.user).then(async res => {
                        console.log(res);
                        this.$store.commit('saveUserInfo', res)
                        await this.loadAsyncRoute()
                        this.$router.push('/welcome')
                    })
                } else {
                    return false
                }
            })
        },
        async loadAsyncRoute() {
            const userInfo = storage.getItem("userInfo") || {};
            if (userInfo.token) {
                try {
                    // console.log("api===>", api);
                    let menuList = await this.$api.getPermissionList();
                    // console.log('api===>',this.$api);
                    // console.log("menuList111===>", menuList);
                    let routes = utils.generateRoute(menuList);
                    // console.log("routes111===>", routes);
                    routes.map((route) => {
                        let url = `./../views/${route.component}.vue`;
                        route.component = () => import(url);
                        this.$router.addRoute("home", route);
                    });
                } catch (error) {
                    console.log(error.stack);
                }
            }
        },
        
    },
    setup(){
        return {
            Avatar, Lock 
        }
    }
}

</script>

<style lang='scss' scoped>
.login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f9fcff;
    width: 100vw;
    height: 100vh;

    .modal {
        width: 500px;
        padding: 50px;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0px 0px 10px 3px #c7c9cb4d;

        .title {
            font-size: 50px;
            line-height: 1.5;
            text-align: center;
            margin-bottom: 30px;
        }

        .btn-login {
            width: 100%;
        }
    }
}
</style>
