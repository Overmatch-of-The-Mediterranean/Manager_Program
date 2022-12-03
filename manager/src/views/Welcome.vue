<template>
    <div class="welcome">
        <div class="content">
            <div class="sub-title">欢迎体验</div>
            <div class="title">慕课通用后台管理系统</div>
            <div class="desc">- Vue3.0+ElementPlus+Node+Mongo打造通用后台管理系统</div>
        </div>
        <div class="img"></div>
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
.welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #fff;

    .content {
        position: relative;
        bottom: 60px;
        right: 40px;
        .sub-title {
            font-size: 40px;
            line-height: 42px;
            color: #333;
        }

        .title {
            font-size: 50px;
            line-height: 62px;
            color: #409eff;
            margin: 10px 0;
        }

        .desc {
            text-align: right;
            font-size: 17px;
            color: #999;
        }
    }

    .img {
        margin-left: 105px;
        background-image: url("./../assets/images/welcome.png");
        background-repeat: no-repeat ;
        width: 391px;
        height: 468px;
    }
}
</style>
