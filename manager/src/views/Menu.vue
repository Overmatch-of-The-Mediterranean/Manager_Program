<template>
    <div class="user-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item prop="menuName" label="菜单名称：">
                    <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item prop="menuState" label="菜单状态：">
                    <el-select v-model="queryForm.menuState">
                        <el-option label="正常" :value="1" />
                        <el-option label="停用" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getMenuList">查询</el-button>
                    <el-button @click="handleReset('form')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleCreate(1)">新增</el-button>
            </div>
            <el-table :data="menuList" row-key="_id" :tree-props="{children:'children'}">
                <el-table-column v-for="item in columns" :key="item.prop" :prop="item.prop" :label="item.label"
                    :formatter="item.formatter" :width="item.width" />
                <el-table-column label="操作" width="150">
                    <template #default="scope">
                        <el-button link type="primary" size="small" @click="handleCreate(2,scope.row)">新增</el-button>
                        <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="danger" size="small" @click="handleDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog title="用户新增" v-model="showModal">
            <el-form ref="dialogForm" :model="menuForm" label-width="100px" :rules="rules">
                <el-form-item label="父级菜单" prop="parentId">
                    <el-cascader v-model="menuForm.parentId" 
                    placeholder="请选择父级菜单" 
                    :options="menuList"
                    :props="{ checkStrictly: true, value: '_id', label: 'menuName' }" 
                    clearable 
                    style="width: 100%">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="菜单类型" prop="menuType">
                    <el-radio-group v-model="menuForm.menuType" class="ml-4">
                        <el-radio :label="1" size="large">菜单</el-radio>
                        <el-radio :label="2" size="large">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单名称" prop="menuName">
                    <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item label="菜单图标" prop="icon"  v-show="menuForm.menuType==1">
                    <el-input v-model="menuForm.icon" placeholder="请输入菜单图标" />
                </el-form-item>
                <el-form-item label="路由地址" prop="path"  v-show="menuForm.menuType==1">
                    <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
                </el-form-item>
                <el-form-item label="权限标识" prop="menuCode" v-show="menuForm.menuType==2">
                    <el-input v-model="menuForm.menuCode" placeholder="请输入路由地址" />
                </el-form-item>
                <el-form-item label="组件路径" prop="component" v-show="menuForm.menuType==1">
                    <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
                </el-form-item>
                <el-form-item label="菜单状态" prop="menuState"  v-show="menuForm.menuType==1">
                    <el-radio-group v-model="menuForm.menuState" class="ml-4">
                        <el-radio :label="1" size="large">正常</el-radio>
                        <el-radio :label="2" size="large">停用</el-radio>
                    </el-radio-group>
                    
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { objectPick } from '@vueuse/shared'
import { ElMessage } from 'element-plus'
import utils from '../utils/utils'
export default {
    name:'Menu',
    data(){
        return {
            queryForm:{
                menuState:1
            },
            menuList:[],
            showModal:false,
            action:'',
            rules:{
                menuName:[
                    {
                        required:true,
                        message:'请输入菜单名称',
                        trigger:'blur'
                    },
                    {
                        min:2,
                        max:10,
                        message:"长度在2~10之间",
                        trigger:'blur'
                    }
                ]
            },
            menuForm:{
                parentId:[null],
                menuType: 1,
                menuState: 1,
            },
            columns: [
                {
                    label: "菜单名称",
                    prop: "menuName",
                },
                {
                    label: "图标",
                    prop: "icon",
                },
                {
                    label: "菜单类型",
                    prop: "menuType",
                    formatter(row, column, value) {
                        return {
                            1: "菜单",
                            2: "按钮",
                        }[value];
                    }
                },
                {
                    label: "权限标识",
                    prop: "menuCode",
                },
                {
                    label: "路由地址",
                    prop: "path",
                },
                {
                    label: "组件路径",
                    prop: "component",
                },
                {
                    label: "菜单状态",
                    prop: "menuState",
                    formatter(row, column, value){
                        return {
                            0:'正常',
                            1:'停用'
                        }[value]
                    }
                },
                {
                    label: "创建时间",
                    prop: "createTime",
                    width: 205,
                    formatter(row, column, value) {
                        return utils.formateDate(new Date(value))
                    }
                }
            ]
        }
    },
    mounted(){
        this.getMenuList()
        
    },
    methods:{
        // 菜单列表初始化
        async getMenuList(){
            try {
                let list = await this.$api.menuList(this.queryForm)
                this.menuList = list
                console.log('==>', this.menuList);
            } catch (error) {
                throw new Error(error)
            }
                    
        },
        // 表单重置
        handleReset(form){
            this.$refs[form].resetFields()
        },
        handleCreate(type,row){
            this.action = 'add'
            this.showModal = true
            if(type==2){
                this.menuForm.parentId= [...row.parentId,row._id].filter(item=>item)
            }
        },
        // 菜单操作-提交
        handleSubmit(){
            this.$refs.dialogForm.validate(async (valid)=>{
                if(valid) {
                    let {action,menuForm} = this
                    let params = {action,...menuForm}
                    console.log('menuForm==>',menuForm);
                    let res = await this.$api.menuSubmit(params)
                    this.showModal = false
                    this.handleReset('dialogForm')
                    ElMessage.success('操作成功')
                    this.getMenuList()
                }
            })
        },
        // 编辑
        handleEdit(row){
            this.showModal = true
            this.action = 'edit',
            console.log('hhhhhhhhhhhhhhhh',row);
            this.$nextTick(() =>{
                Object.assign(this.menuForm,row)
            })
        },
        // 删除
        async handleDelete(_id){
            await this.$api.menuSubmit({_id,action:'delete'})
            this.getMenuList()
            ElMessage.success('删除成功')
        },
        // 弹窗关闭
        handleClose(){
            this.showModal = false
            this.handleReset('dialogForm')
        }
    }
}

</script>

<style lang='scss'>

</style>
