<template>
  <div class="user-manage">
    <div class="query-form">
        <el-form ref="form" :inline="true" :model="user">
            <el-form-item prop="userId" label="用户ID：">
                <el-input v-model="user.userId" placeholder="请输入用户ID"/>
            </el-form-item>
            <el-form-item prop="userName" label="用户名称：">
                <el-input v-model="user.userName" placeholder="请输入用户名称"/>
            </el-form-item>
            <el-form-item>
                <el-select  v-model="user.state">
                    <el-option label="所有" :value="0" />
                    <el-option label="在职" :value="1" />
                    <el-option label="离职" :value="2" />
                    <el-option label="实习期" :value="3" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button @click="handleReset('form')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
    <div class="base-table">
        <div class="action">
            <el-button type="primary" @click="handleCreate">新增</el-button>
            <el-button type="danger" @click="handlePatchDelete">批量删除</el-button>
        </div>
        <el-table 
        :data="userList"  
        @selection-change="handleSelectionChange">
        
            <el-table-column type="selection" width="55"/> 
            <el-table-column 
            v-for="item in columns" 
            :key="item.prop" 
            :prop="item.prop" 
            :label="item.label"
            :formatter="item.formatter"
            :width="item.width" 
            />
            <el-table-column label="操作" width="120">
                <template #default="scope">
                    <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination 
        class="pagination" 
        background 
        layout="prev, pager, next" 
        :page-size="pager.pageSize"
        @current-change="handleCurrentChange"
        :total="pager.total" />
    </div>
    <el-dialog title="用户新增" v-model="showModal">
        <el-form ref="dialogForm" :model="userForm" label-width="100px" :rules="rules">
            <el-form-item label="用户名" prop="userName">
                <el-input v-model="userForm.userName" :disabled="action == 'edit'" placeholder="请输入用户名称" />
            </el-form-item>
            <el-form-item label="邮箱" prop="userEmail">
                <el-input v-model="userForm.userEmail" :disabled="action == 'edit'" placeholder="请输入用户邮箱">
                    <template #append>@imooc.com</template>
                </el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="岗位" prop="job">
                <el-input v-model="userForm.job" placeholder="请输入岗位" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
                <el-select v-model="userForm.state">
                    <el-option :value="1" label="在职"></el-option>
                    <el-option :value="2" label="离职"></el-option>
                    <el-option :value="3" label="试用期"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="系统角色" prop="roleList">
                <el-select v-model="userForm.roleList" placeholder="请选择用户系统角色" multiple style="width: 100%">
                    <el-option v-for="role in roleList" :key="role._id" :label="role.roleName"
                        :value="role._id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="部门" prop="deptId">
                <el-cascader v-model="userForm.deptId" placeholder="请选择所属部门" :options="deptList"
                    :props="{ checkStrictly: true, value: '_id', label: 'deptName' }" clearable
                    style="width: 100%"></el-cascader>
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
import utils from '../utils/utils'
import { ElMessage } from 'element-plus'
import { getCurrentInstance,reactive,ref,onMounted, toRaw} from 'vue'
export default {
    name:'User',
    setup(){
        const instance = getCurrentInstance()
        const { ctx } = getCurrentInstance()
        // 获取Componention API 全局属性
        const globalProperties = getCurrentInstance().appContext.config.globalProperties
        // 初始化用户状态
        const user = reactive({
            state:0
        })
        const checkedUserIds = ref([])
        // 初始化列表
        const userList = ref([])
        // 控制弹窗显示
        const showModal = ref(false)
        // 角色列表
        const roleList = ref({})
        // 部门列表
        const deptList = ref({})
        // 添加或编辑
        const action = ref('add')
        const userForm = reactive({
            userName:'',
            action:'',
            userEmail:'',
            state:3
        })
        
        // 表单验证规则
        const rules = reactive({
            userName:[
                {
                    required:true,
                    message:'请输入用户名称',
                    trigger:'blur'
                }
            ],
            userEmail: [
                {
                    required: true,
                    message: '请输入用户邮箱',
                    trigger: 'blur'
                }
            ],
            mobile: [
                {
                    required: true,
                    message: "请输入手机号",
                    trigger: "blur",
                },
                {
                    pattern: /1[3-9]\d{9}/,
                    message: '请输入正确手机号格式',
                    trigger: 'blur'
                }
            ],
            deptId: [
                {
                    required: true,
                    message: "请选择部门",
                    trigger: "blur",
                },
            ],
        })
        // 初始化动态表格-格式
        const columns = reactive([
            {
                label: "用户ID",
                prop: "userId",
            },
            {
                label: "用户名",
                prop: "userName",
            },
            {
                label: "用户邮箱",
                prop: "userEmail",
            },
            {
                label: "用户角色",
                prop: "role",
                formatter(row, column, value){
                    return {
                        0:'管理员',
                        1:'普通用户'
                    }[value]
                }
            },
            {
                label: "状态",
                prop: "state",
                formatter(row, column,value) {
                    return {
                        1: '在职',
                        2: '离职',
                        3:'实习期'
                    }[value]
                }
            },
            {
                label: "注册时间",
                prop: "createTime",
                width:205,
                formatter(row,column,value){
                    return utils.formateDate(new Date(value))
                }
            },
            {
                label: "最后登录时间",
                prop: "lastLoginTime",
                width: 205,
                formatter(row, column, value) {
                    return utils.formateDate(new Date(value))
                }
            }
        ])
        // 初始化分页结构
        const pager = {
            pageNum:1,
            pageSize:10,
            total:0
        }
        // 初始化接口调用
        onMounted(()=>{
            getUserList()
            getRoleAllList()
            getDeptList()
        })

        // 获取用户列表
        const getUserList = async ()=>{
            let params = {...user,...pager}
            try {
                const { list, page } = await globalProperties.$api.userList(params)
                userList.value = list
                pager.total = page.total
            } catch (error) {
                console.log(error);
            }
                
        }
        // 查询事件，获取符合条件的用户列表
        const handleQuery = ()=>{
            getUserList()
        }
        // 重置查询列表
        const handleReset = (form)=>{
            ctx.$refs[form].resetFields()
        }
        // 分页跳转事件
        const handleCurrentChange = (CurrentPage)=>{
            pager.pageNum = CurrentPage
            getUserList()
        }

        // 单条用户删除
        const handleDelete = async (row)=>{
            await globalProperties.$api.userDelete({
                userIds:[row.userId]
            })
            ElMessage.success('删除成功')
            getUserList()
        }

        // 多条用户删除
        const  handlePatchDelete = async ()=>{
            if(checkedUserIds.value.length===0){
                ElMessage.error('请选择用户')
                return
            }
            const res = await globalProperties.$api.userDelete({
                userIds: checkedUserIds.value
            })
            if (res.matchedCount >0) {
                ElMessage.success('删除成功')
                getUserList()
            }else {
                ElMessage.error('删除失败')
            }
            
           
        }

        // 得到选中用户的id，list是选中用户的数据所组成的对象
        const handleSelectionChange = async(list)=>{
            let arr = []
            list.map(item=>{
                arr.push(item.userId)
            })
            checkedUserIds.value = arr
        }
        // 显示弹窗
        const handleCreate = ()=>{
            action.value='add'
            showModal.value=true
        }
        // 关闭弹窗
        const handleClose = ()=>{
            showModal.value = false
            handleReset('dialogForm')
        }
        // 获取角色列表
        const getRoleAllList = async ()=>{
            roleList.value = await globalProperties.$api.roleAllList()
        }
        // 获取部门列表
        const getDeptList = async ()=>{
            deptList.value = await globalProperties.$api.deptList()
        }
        // 新增/编辑用户提交
        const handleSubmit = ()=>{
            ctx.$refs.dialogForm.validate(async (valid)=>{
                if(valid) {
                    let params = toRaw(userForm)
                    params.userEmail +='@imooc.com'
                    params.action = action.value
                    let res = await globalProperties.$api.userSubmit(params)
                    showModal.value = false
                    ElMessage.success('用户创建成功')
                    handleReset('dialogForm')
                    getUserList()
                }
            })
        }
        // 用户编辑
        const handleEdit = (row)=>{
            action.value = 'edit'
            showModal.value = true
            ctx.$nextTick(()=>{
                Object.assign(userForm, row)
            })
        }
        return {
            user, 
            userList, 
            columns, 
            pager,
            checkedUserIds,
            showModal,
            userForm,
            roleList,
            deptList,
            rules,
            action,
            getUserList, 
            handleQuery, 
            handleReset,
            handleCurrentChange,
            handleDelete,
            handlePatchDelete,
            handleSelectionChange,
            handleCreate,
            getRoleAllList,
            getDeptList,
            handleClose,
            handleSubmit,
            handleEdit
        }
    }
}

</script>

<style lang='scss'>

</style>
