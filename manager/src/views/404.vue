<template>
  <div class="exception">
    <img src="@/assets/images/404.jpeg" alt="">
    <el-button type="primary" class="btn-home" @click="toHome">回首页</el-button>
  </div>
</template>

<script>
export default {
    name:'exception',
    methods:{
        toHome(){
            this.$router.push('/welcome')
        }
    }
}

</script>

<style lang='scss' scoped>
.exception {
    position: relative;
    img {
        width: 100%;
        height: 100vh;
    }
    .btn-home{
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>
