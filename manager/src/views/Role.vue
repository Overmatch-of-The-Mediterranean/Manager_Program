<template>
    <div class="role-manage">
        <div class="query-form">
            <el-form ref="form" :inline="true" :model="queryForm">
                <el-form-item prop="roleName" label="角色名称：">
                    <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getRoleList">查询</el-button>
                    <el-button @click="handleReset('form')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-table">
            <div class="action">
                <el-button type="primary" @click="handleCreate">创建</el-button>
            </div>
            <el-table :data="roleList">
                <el-table-column v-for="item in columns" 
                :key="item.prop" 
                :prop="item.prop" 
                :label="item.label"
                :formatter="item.formatter" :width="item.width" />
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button link type="primary" size="small" @click="handleOpenPermission(scope.row)">权限设置</el-button>
                        <el-button link type="danger" size="small" @click="handleDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-pagination 
            class="pagination" 
            background 
            layout="prev, pager, next" 
            :page-size="pager.pageSize"
            @current-change="handleCurrentChange" 
            :total="pager.total" />
        <el-dialog title="用户新增" v-model="showModal">
            <el-form ref="dialogForm" :model="roleForm" label-width="100px" :rules="rules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input 
                        type="textarea" :rows="2" 
                        v-model="roleForm.icon" 
                        placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit">确 定</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 权限 -->
        <el-dialog title="权限设置" v-model="showPermission">
            <el-form   label-width="100px" >
                <el-form-item label="角色名称">
                    {{curRoleName}}
                </el-form-item>
                <el-form-item label="选择权限">
                    <el-tree 
                        ref="tree"
                        :data="menuList" 
                         default-expand-all
                        show-checkbox 
                        node-key="_id" 
                        :props="{label:'menuName'}" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="this.showPermission = false">取 消</el-button>
                    <el-button type="primary" @click="handlePermission">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import utils from '../utils/utils'
export default {
    name:'Role',
    data(){
        return {
            queryForm:{
                roleName:''
            },
            showModal:false,
            action:'',
            roleList:[],
            curRoleName:'',
            curRoleId:'',
            menuList:[],
            showPermission:false,
            actionMap:{},
            rules:{
               roleName:[
                {
                    required:true,
                    message:'请输入角色名称',
                    trigger:'blur'
                }
               ]
            },
            roleForm:{
            },
            // 初始化分页结构
            pager:{
                pageNum: 1,
                pageSize: 10,
                total: 0
            },
            columns: [
                {
                    label: "角色名称",
                    prop: "roleName",
                },
                {
                    label: "备注",
                    prop: "remark",
                },
                {
                    label: "权限列表",
                    prop: "permissionList",
                    width:360,
                    formatter:(row,column,value)=>{
                        let names = []
                        let list = value.halfCheckedKeys||[]
                        list.map(key=>{
                            let name = this.actionMap[key]
                            if (key && name) names.push(name)
                        })
                        return names.join(',')
                    }
                },
                {
                    label: "更新时间",
                    prop: "updateTime",
                    formatter(row, column, value) {
                        return utils.formateDate(new Date(value));
                    },
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
        this.getRoleList()
        this.getMenuList()
    },
    methods:{
        // 角色列表初始化
        async getRoleList(){
            try {
                let { list, page } = await this.$api.roleList({
                    ...this.queryForm,
                    ...this.pager
                })
                this.roleList = list
                this.pager.total = page.total
            } catch (error) {
                throw new Error(error)
            }
                    
        },
        async getMenuList() {
            try {
                let list = await this.$api.menuList()
                this.menuList = list
                this.getActionMap(list)
            } catch (error) {
                throw new Error(error)
            }

        },
        // 表单重置
        handleReset(form){
            this.$refs[form].resetFields()
        },
        handleCreate(){
            this.action = 'add'
            this.showModal = true
        },
        // 角色操作-提交
        handleSubmit(){
            this.$refs.dialogForm.validate( async(valid)=>{
                if(valid) {
                    const {action,roleForm} = this
                    let params = {action,...roleForm}
                    const res =  await this.$api.roleSubmit(params)
                    if(res) {
                        this.showModal = false
                        this.getRoleList()
                        ElMessage.success('操作成功')
                        this.handleReset('dialogForm')
                    }
                }
            })            
        },
        // 编辑
        handleEdit(row){
            this.action = 'edit'
            this.showModal = true
            this.$nextTick(()=>{
                this.roleForm = {
                    _id: row._id,
                    roleName: row.roleName,
                    remark: row.remark,
                };
            })
        },
        // 删除
        async handleDelete(_id){
            await this.$api.roleSubmit({_id,action:'delete'})
            this.getRoleList()
            ElMessage.success('删除成功')
        },
        // 弹窗关闭
        handleClose(){
            this.showModal = false
            this.handleReset('dialogForm')
        },
        // 权限设置打开
        handleOpenPermission(row){
            this.showPermission = true
            this.curRoleName = row.roleName
            this.curRoleId = row._id
            const { checkedKeys } = row.permissionList
            setTimeout(()=>{
                this.$refs.tree.setCheckedKeys(checkedKeys)
            })
            
        },

        // 权限设置
        async handlePermission(){
            let nodes = this.$refs.tree.getCheckedNodes()
            let halfKeys = this.$refs.tree.getHalfCheckedKeys();
            let checkedKeys = []
            let parentKeys = []

            nodes.map(item=>{
                if(!item.children) {
                    checkedKeys.push(item._id)
                }else {
                    parentKeys.push(item._id)
                }
            })
            let params = {
                _id:this.curRoleId,
                permissionList:{
                    checkedKeys,
                    halfCheckedKeys: parentKeys.concat(halfKeys),
                }
            }
            await this.$api.updatePermission(params)
            this.showPermission = false
            ElMessage.success('设置成功')
            this.getRoleList()
        },
        // 递归遍历得到角色权限
        getActionMap(list){
            let actionMap = {}
            const deep = (arr)=>{
                while(arr.length) {
                    let item = arr.pop()
                    if(item.children && item.action) {
                        actionMap[item._id] = item.menuName
                    }
                    if(item.children && !item.action) {
                        deep(item.children)
                    }
                    
                }
            }
            deep(JSON.parse(JSON.stringify(list)))
            this.actionMap = actionMap
        },
        // 分页器切换
        handleCurrentChange(current){
            this.pager.pageNum = current
            this.getRoleList()
        }
    }
}

</script>

<style lang='scss'>

</style>
