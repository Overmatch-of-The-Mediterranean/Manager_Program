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
            <el-button type="primary" @click="handleApply">申请休假</el-button>
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
                    <el-button link type="primary" size="small" @click="handleDetail(scope.row)">查看</el-button>
                    <el-button 
                        link 
                        type="danger" 
                        size="small" 
                        @click="handleDelete(scope.row._id)"
                        v-if="[1,2].includes(scope.row.applyState)"
                    >作废</el-button>
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
    <el-dialog title="申请休假" v-model="showModal" >
        <el-form 
            ref="dialogForm" 
            :rules="rules" 
            :model="leaveForm"
            label-width="120px"
            >
            <el-form-item label="休假类型" prop="applyType" required>
                <el-select v-model="leaveForm.applyType">
                    <el-option :value="1" label="事假"></el-option>
                    <el-option :value="2" label="调休"></el-option>
                    <el-option :value="3" label="年假"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="休假时间" required>
                <el-row>
                    <el-col :span="8">
                        <el-form-item prop="startTime">
                            <el-date-picker 
                                v-model="leaveForm.startTime" 
                                type="date"
                                placeholder="请选择开始日期"
                                @change="(val)=>handleDateChange('startTime',val)"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="1"> —— </el-col>
                    <el-col :span="8">
                        <el-form-item prop="endTime">
                            <el-date-picker 
                                v-model="leaveForm.endTime" 
                                type="date"
                                placeholder="请选择结束日期"
                                @change="(val)=>handleDateChange('endTime',val)"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="休假时长" prop="leaveTime" required>
                {{ leaveForm.leaveTime }}
            </el-form-item>
            <el-form-item label="休假原因" prop="reasons" required>
                <el-input 
                    type="textarea"
                    placeholder="请输入请假原因"
                    v-model="leaveForm.reasons"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="handleSubmit">确 定</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog title="审批详情" v-model="showDetailModal"  destroy-on-close>
        <el-steps :active="detail.applyState > 2 ? 3 : detail.applyState" align-center>
            <el-step title="待审批" />
            <el-step title="审批中" />
            <el-step title="审批拒绝/审批通过" />
        </el-steps>
        <el-form label-width="120px" :model="detail">
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
        </el-form>
    </el-dialog>
  </div>
</template>

<script>
import utils from '../utils/utils'
import { ElMessage } from 'element-plus'
import { getCurrentInstance,reactive,ref,onMounted, toRaw} from 'vue'
export default {
    name:'Leave',
    setup(){
        const instance = getCurrentInstance()
        const { ctx } = getCurrentInstance()
        // 获取Componention API 全局属性
        const globalProperties = getCurrentInstance().appContext.config.globalProperties
        const queryForm = reactive({
            applyState: ''
        })
        const showModal = ref(false)
        const showDetailModal = ref(false)
        const detail = ref({})
        // 申请列表
        const applyList = ref([])
        const action = ref('add')
        const leaveForm = reactive({
            applyType:1,
            startTime:'',
            endTime:'',
            leaveTime:'0天',
            reasons:''
        })
        const rules = {
            applyType:[
                {
                    required:true,
                    message:'请选择请假类型',
                    trigger:'change'
                }
            ],
            startTime:[
                {
                    required:true,
                    type:'date',
                    message:'请选择开始时间',
                    trigger:'change'
                }
            ],
            endTime: [
                {
                    required: true,
                    type: 'date',
                    message: '请选择结束时间',
                    trigger: 'change'
                }
            ],
            leaveTime:[
                {
                    required:true,
                }
            ],
            reasons:[
                {
                    required:true,
                    message:'请输入请假原因',
                    trigger: ['blur','change']
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
            let params = {...pager,...queryForm}
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

        const handleApply = ()=>{
            showModal.value = true
        }
        // 关闭弹窗
        const handleClose = ()=>{
            showModal.value = false
            handleReset('dialogForm')
        }
        // 申请/编辑/作废
        const handleSubmit = ()=>{
            ctx.$refs.dialogForm.validate(async (valid)=>{
                if(valid) {
                    let params = { ...leaveForm, action: action.value }
                    try {
                        const res = await globalProperties.$api.applyOperate(params)
                        ElMessage.success('创建成功')
                        handleClose()
                        getApplyList()
                    } catch (error) {
                        ElMessage.error(error.stack)
                    }
                }
            })
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
        // 作废
        const handleDelete = async(_id)=>{
            let params = {_id,action:'delete'}
            try {
                const res = await globalProperties.$api.applyOperate(params)
                getApplyList()
                ElMessage.success('删除成功')
            } catch (error) {
                ElMessage.error(error.stack)
            }
        }
        return {
            columns,
            queryForm,
            pager,
            applyList,
            showModal,
            leaveForm,
            rules,
            showDetailModal,
            detail,
            handleReset,
            handleCurrentChange,
            getApplyList,
            handleApply,
            handleClose,
            handleSubmit,
            handleDateChange,
            handleDetail,
            handleDelete
        }
    }
}

</script>

<style lang='scss'>

</style>
