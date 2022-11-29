<template>
    <div class="welcome">
        <div>欢迎页面</div>
        <el-button type="primary" @click="toLogin">请登录</el-button>
    </div>

</template>

<script>
export default {
    name:'Welcome',
    methods:{
        toLogin(){
            this.$router.push('/login')
        }
    }
}

</script>

<style lang='scss' scoped>

</style>
