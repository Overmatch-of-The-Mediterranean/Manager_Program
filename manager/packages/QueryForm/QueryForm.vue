<template>
<el-form ref="queryForm" :inline="true" :model="queryModel">
    <template v-for="(item,index) in form" :key="index">
        <FormItem :item="item" v-bind="item" v-model="queryModel[item.model]"/>
    </template>
    <!-- <el-form-item prop="userId" label="用户ID：">
        <el-input v-model="user.userId" placeholder="请输入用户ID" />
    </el-form-item>
    <el-form-item prop="userName" label="用户名称：">
        <el-input v-model="user.userName" placeholder="请输入用户名称" />
    </el-form-item>
    <el-form-item>
        <el-select v-model="user.state">
            <el-option label="所有" :value="0" />
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="2" />
            <el-option label="实习期" :value="3" />
        </el-select>
    </el-form-item> -->
    <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
    </el-form-item>
</el-form>
</template>

<script>
import { getCurrentInstance, reactive } from 'vue'
import FormItem from './FormItem.vue'
export default {
    name:'QueryForm',
    props:['modelValue','form'],
    emits:['update:modelValue'],
    components:{FormItem},
    setup(props,context){
        const { ctx } = getCurrentInstance()
        const form = props.form
        const queryModel = reactive({
            ...props.modelValue
        })
        const handleReset = ()=>{
            ctx.$refs.queryForm.resetFields()
        }
        const handleQuery = ()=>{
            // to-do
            context.emit('update:modelValue', { ...queryModel })
            context.emit('handleQuery', { ...queryModel })
            

        }
        return {
            queryModel,
            handleReset,
            handleQuery
        }
    }
}

</script>

<style lang='scss' scoped>

</style>
