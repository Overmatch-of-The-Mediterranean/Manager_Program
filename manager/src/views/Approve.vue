<template>
  <div class="user-manage">
    <div class="query-form">
        <el-form ref="form" :inline="true" :model="queryForm">
            <el-form-item label="审批状态：" prop="applyState">
                <el-select v-model="queryForm.applyState">
                    <el-option value="" label="所有"/>
                    <el-option :value="1" label="待审批"/>
                    <el-option :value="2" label="审批中"/>
                    <el-option :value="3" label="审批拒绝"/>
                    <el-option :value="4" label="审批通过"/>
                    <el-option :value="5" label="作废"/>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getApplyList">查询</el-button>
                <el-button @click="handleReset('form')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
    <div class="base-table">
        <div class="action">
        </div>
        <el-table :data="applyList">
        
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
                    <el-button 
                        link type="primary" 
                        size="small" 
                        @click="handleDetail(scope.row)"
                        v-if="scope.row.curAuditUserName==userInfo.userName && [1,2].includes(scope.row.applyState)" 
                    >审核</el-button>
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
    <el-dialog title="审批详情" v-model="showDetailModal"  destroy-on-close>
        <el-form 
            ref="dialogForm" 
            label-width="120px" 
            :model="auditForm"
            :rules="rules"
            >
            <el-form-item label="申请人：">
                {{detail.applyUser.userName}}
            </el-form-item>
            <el-form-item label="休假类型：">
                {{detail.applyTypeName}}
            </el-form-item>
            <el-form-item label="休假时间：">
                {{detail.time}}
            </el-form-item>
            <el-form-item label="休假时长：">
                {{detail.leaveTime}}
            </el-form-item>
            <el-form-item label="休假原因：">
                {{detail.reasons}}
            </el-form-item>
            <el-form-item label="审批状态：">
                {{detail.applyStateName}}
            </el-form-item>
            <el-form-item label="审批人：">
                {{ detail.curAuditUserName }}
            </el-form-item>
            <el-form-item label="审批备注：" prop="remark">
                <el-input v-model="auditForm.remark" placeholder="请输入审批备注"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleApprove('pass')" type="primary">审核通过</el-button>
                <el-button @click="handleApprove('refuse')" type="danger">驳 回</el-button>
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
    name:'Approve',
    setup(){
        const instance = getCurrentInstance()
        const { ctx } = getCurrentInstance()
        // 获取Componention API 全局属性
        const globalProperties = getCurrentInstance().appContext.config.globalProperties
        const queryForm = reactive({
            applyState: 1
        })
        const showDetailModal = ref(false)
        // 获取登录用户的信息
        const userInfo = globalProperties.$store.state.userInfo
        const detail = ref({})
        // 申请列表
        const applyList = ref([])
        const action = ref('add')
        const auditForm = reactive({
            remark:''
        })
        const rules = {
            remark:[
                {
                    required:true,
                    message:'请输入审批备注',
                    trigger:'change'
                }
            ]
        }
        // 初始化动态表格-格式
        const columns = reactive([
            {
                label: "单号",
                prop: "orderNo",
            },
            {
                label: "申请人",
                prop: "orderNo",
                formatter(row){
                    return row.applyUser.userName
                }
            },
            {
                label: "休假时间",
                prop: "",
                formatter(row){
                    return(
                        utils.formateDate(new Date(row.startTime), 'yyyy-MM-dd') + utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
                    )
                }
            },
            {
                label: "休假时长",
                prop: "leaveTime",
            },
            {
                label: "休假类型",
                prop: "applyType",
                formatter(row, column, value){
                    return {
                        1: "事假",
                        2: "调休",
                        3: "年假"
                    }[value]
                }
            },
            {
                label: "申请状态",
                prop: "applyState",
                formatter(row, column,value) {
                    return {
                        1: '待审批',
                        2: '审批中',
                        3: '审批拒绝',
                        4: '审批通过',
                        5: '作废'
                    }[value]
                }
            },
            {
                label:'休假原因',
                prop:'reasons'
            },
            {
                label: "申请时间",
                prop: "createTime",
                width:205,
                formatter(row,column,value){
                    return utils.formateDate(new Date(value))
                }
            },
            {
                label: "审批人",
                prop: "auditUsers",
            },
            {
                label: "当前审批人",
                prop: "curAuditUserName",
            }
        ])
        // 初始化分页结构
        const pager = {
            pageNum:1,
            pageSize:10,
            total:0
        }
        onMounted(()=>{
            getApplyList()
        })
        const getApplyList = async()=>{
            let params = {...pager,...queryForm,type:'approve'}
            const {list,page } = await globalProperties.$api.applyList(params)
            applyList.value = list
            pager.total = page.total

        }
        // 重置查询列表
        const handleReset = (form)=>{
            ctx.$refs[form].resetFields()
        }
        // 分页跳转事件
        const handleCurrentChange = (CurrentPage)=>{
            pager.pageNum = CurrentPage
            // getUserList()
        }

        // 关闭弹窗
        const handleClose = ()=>{
            showDetailModal.value = false
            handleReset('dialogForm')
        }
        // 检验日期选择是否合法
        const handleDateChange = (key,val)=>{
            const {startTime,endTime} = leaveForm
            if(!startTime || !endTime) return
            if(startTime>endTime) {
                ElMessage.error('开始日期不能晚于结束日期')
                leaveForm.leaveTime = '0天'
                setTimeout(()=>{
                    leaveForm[key] = ''
                },0)
            }else {
                leaveForm.leaveTime = (endTime - startTime)/(60*60*24*1000) + 1 + '天'
            }
        }
        // 查看弹窗的信息处理
        const handleDetail = (row)=>{
            showDetailModal.value = true
            let data = {...row}
            data.applyTypeName = {
                0:'事假',
                1:'调休',
                2:'年假'
            }[data.applyType]
            data.time = utils.formateDate(new Date(row.startTime), 'yyyy-MM-dd') + ' 至 ' + utils.formateDate(new Date(row.endTime), "yyyy-MM-dd")
            data.applyStateName = {
                1: '待审批',
                2: '审批中',
                3: '审批拒绝',
                4: '审批通过',
                5: '作废'
            }[data.applyState]
            detail.value = data
        }
        // 审核通过或拒绝
        const handleApprove = (action)=>{
            ctx.$refs.dialogForm.validate(async(valid)=>{
                if(valid) {
                    let params = { remark: auditForm.remark, action, _id: detail.value._id}
                    let res = await globalProperties.$api.leaveApprove(params)
                    handleClose()
                    ElMessage.success('处理成功')
                    getApplyList()
                    console.log('ctx=====>',ctx);
                    globalProperties.$store.commit('saveNoticeCount', globalProperties.$store.state.noticeCount-1)
                }else {
                    ElMessage.error('处理失败')
                }
            })
        }
        return {
            columns,
            queryForm,
            pager,
            applyList,
            auditForm,
            rules,
            showDetailModal,
            detail,
            userInfo,
            handleReset,
            handleCurrentChange,
            getApplyList,
            handleClose,
            handleDateChange,
            handleDetail,
            handleApprove
        }
    }
}

</script>

<style lang='scss'>

</style>
