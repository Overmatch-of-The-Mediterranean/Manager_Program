<template>
    <h1>登录页面</h1>
    <router-link :to="{ name: 'welcome' }">
        回首页
    </router-link>
    
</template>

<script>
export default {
    name:'Login',
    mounted(){
        this.$request({
            method:'get',
            url: '/login',
            data:{
                name:'jack'
            }
        }).then((res)=>{
            console.log(res);
        })
    }
}

</script>

<style lang='scss' scoped>
// .login {
//     background-color: #fff;
//     height: 100%;
// }
</style>
