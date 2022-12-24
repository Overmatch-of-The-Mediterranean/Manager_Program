<template>
    <!-- Vue2中v-model的实现 -->
  <!-- <el-input :value="value" @input="value=event.target.value"></el-input> -->

  <!-- Vue3中v-model的实现 -->
  <el-input :modelValue="userName" @update:modelValue="handleInput"></el-input>
  <el-button @click="handleSubmit">提交测试</el-button>
</template>

<script>
import { ref } from '@vue/reactivity'
export default {
    name:'VInput',
    props:['modelValue','title'],
    setup(props,context){
        let userName = ref(props.modelValue)
        const handleInput = (val)=>{
            userName.value = val
            context.emit('update:modelValue',val)
        }
        const handleSubmit = ()=>{
            context.emit('handleSubmit',userName)
        }
        return {
            userName,
            handleInput,
            handleSubmit
        }
    }
}

</script>

<style lang='scss' scoped>

</style>
