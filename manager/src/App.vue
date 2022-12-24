<template>
    <router-view></router-view>
    <!-- v-model可以进行多个数据的绑定,默认名字是modelValue -->
    <v-input v-model:modelValue="userName" v-model:title="title" @handleSubmit="handleSubmit"></v-input>
</template>

<script>
import VInput from './components/VInput.vue'
import { ref } from '@vue/reactivity'
export default {
    name:'App',
    components:{VInput},
    setup(){
        let userName = ref('jack')
        let title = ref('Vue3')
        const handleSubmit = (value)=>{
            console.log('接收数据',value);
            console.log('当前对象',userName);
        }
        return {
            userName,
            title,
            handleSubmit
        }
    }
}
</script>

<style lang="scss">
@import './assets/style/reset.css';
@import './assets/style/index.scss';
</style>
