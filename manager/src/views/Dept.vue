<template>
  <div class="dept-manage">
    <div class="query-form">
        <el-form ref="queryForm" :inline="true" :model="queryForm">
            <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="queryForm.deptName" placeholder="请输入部门名称"/>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="this.getDeptList">查询</el-button>
                <el-button @click="handleReset('queryForm')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
    <div class="base-table">
        <div class="action">
            <el-button type="primary" @click="handleCreate">创建</el-button>
        </div>
        <el-table :data="deptList" row-key="_id" :tree-props="{children:'children'}">
            <el-table-column 
                v-for="item in columns"
                :key="item.prop"
                v-bind="item"
            />
            <el-table-column label="操作">
                <template #default="scope">
                   <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                   <el-button type="danger" @click="handleDelete(scope.row._id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog 
        v-model="showModel"
        :title="action=='add'? '创建部门':'编辑部门'">
        <el-form :model="deptForm" label-width="100px" ref="dialogForm">
            <el-form-item label="上级部门：" prop="parentId">
                <el-cascader 
                    placeholder="请选择上级部门"
                    v-model="deptForm.parentId"
                    :options="deptList" 
                    :props="{checkStrictly:true,value:'_id',label:'deptName'}" 
                    clearable
                    :show-all-levels="true"
                    />
            </el-form-item>
            <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="deptForm.deptName" placeholder="请输入部门名称"></el-input>
            </el-form-item>
            <el-form-item label="负责人" prop="user">
                <el-select v-model="deptForm.user" @change="handleUser">
                    <el-option 
                    v-for="item in userList" 
                    :key="item.userId" 
                    :label="item.userName" 
                    :value="`${item.userId}/${item.userName}/${item.userEmail}`"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="负责人邮箱" prop="userEmail">
                <el-input v-model="deptForm.userEmail" placeholder="请输入负责人邮箱" disabled></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button @click="handleSubmit" type="primary">确定</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import utils from '../utils/utils'
export default {
    name:'Dept',
    data(){
        return {
            queryForm:{
                deptName:''
            },
            deptList:[],
            action:'add',
            showModel:false,
            deptForm:{
                parentId:[null]
            },
            userList:{},
            rules:{
                parentId:[
                    {
                        required:true,
                        message:'请选择上级部门',
                        trigger:'blur'
                    }
                ],
                deptName: [
                    {
                        required: true,
                        message: '请输入部门名称',
                        trigger: 'blur'
                    }
                ],
                user: [
                    {
                        required: true,
                        message: '请选择负责人',
                        trigger: 'blur'
                    }
                ]
            },
            columns:[
                {
                    label:'部门名称',
                    prop:'deptName'
                },
                {
                    label:'负责人',
                    prop:'userName'
                },
                {
                    label: "更新时间",
                    prop: "updateTime",
                    formatter(row,column,value){
                        return utils.formateDate(new Date(value))
                    }
                },
                {
                    label: "创建时间",
                    prop: "createTime",
                    formatter(row, column, value){
                    return utils.formateDate(new Date(value))
                }
                }
            ]
        }
    },
    mounted(){
        this.getDeptList()
        this.getUserList()
    },
    methods:{
        async getDeptList(){
            let list = await this.$api.deptList(this.queryForm )
            this.deptList = list
        },
        async getUserList(){
            let list = await this.$api.allUserList()
            this.userList = list
        },
        handleReset(form){
            this.$refs[form].resetFields()
        },
        handleCreate(){
            this.action = 'add'
            this.showModel = true
        },
        handleEdit(row){
            this.action = 'edit'
            this.showModel = true
            this.$nextTick(()=>{
                Object.assign(this.deptForm, row, { user: `${row.userId}/${row.userName}/${row.userEmail}` })
            })
        },
        async handleDelete(id){
            this.action = 'delete'
            await this.$api.deptSubmit({action:this.action,_id:id})
            ElMessage.success('删除成功')
            this.getDeptList()
        },
        handleClose(){
            this.showModel = false
            this.handleReset('dialogForm')
        },
        handleSubmit(){
            this.$refs.dialogForm.validate(async(valid)=>{
                if(valid) {
                    let params = {...this.deptForm,action:this.action}
                    await this.$api.deptSubmit(params)
                    ElMessage.success('操作成功')
                    this.handleClose()
                    this.getDeptList()
                }
            })
        },
        // 用来自动映射邮箱
        handleUser(val){
            const [ userId, userName, userEmail ] = val.split('/')
            Object.assign(this.deptForm, { userId, userName, userEmail })
        }
    }
}

</script>

<style lang='scss' scoped>

</style>
