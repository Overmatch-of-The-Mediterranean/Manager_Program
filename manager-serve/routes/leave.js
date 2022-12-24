const router = require("koa-router")();
const utils = require("../utils/utils");
const Leave = require("../models/leaveSchema");
const Dept = require("../models/deptSchema");

router.prefix("/leave");

// 查询获取表单
router.get("/list", async (ctx) => {
    const { applyState, type } = ctx.request.query;
    const authorization = ctx.request.headers.authorization;
    const { data } = utils.decoded(authorization);
    const { page, skipIndex } = utils.pager(ctx.request.query);
    let params = {};
    if (type == "approve") {
        if (applyState == 1 || applyState == 2) {
            params.curAuditUserName = data.userName;
            params.$or = [{ applyState: 1 }, { applyState: 2 }];
        } else if (applyState > 2) {
            // 将审批流中有他姓名的数据都找出来
            params = { "auditFlows.userId": data.userId, applyState };
        } else {
            // 所有
            params = { "auditFlows.userId": data.userId };
        }
    } else {
        params = { "applyUser.userId": data.userId };
        if (applyState) params.applyState = applyState;
    }

    try {
        const query = Leave.find(params);
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Leave.countDocuments(params);
        ctx.body = utils.success({
            page: {
                ...page,
                total,
            },
            list,
        });
    } catch (error) {
        ctx.body = utils.fail(`查询失败:${error.stack}`);
    }
});

// 休假创建/作废
router.post("/operate", async (ctx) => {
    let { _id, action, ...params } = ctx.request.body;
    const authorization = ctx.request.headers.authorization;
    const { data } = utils.decoded(authorization);
    if (action == "add") {
        // 整合单号
        let orderNo = "XJ";
        orderNo += utils.formateDate(new Date(), "yyyyMMdd");
        const total = await Leave.countDocuments();
        orderNo += total;

        // 获取当前部门id
        let id = data.deptId.pop();
        // 获取部门负责人信息
        let dept = await Dept.findById(id);
        console.log("dept===>", dept);
        // 获取其他审批部门id
        let userList = await Dept.find({
            deptName: { $in: ["人事部门", "财务部门"] },
        });
        // 整合审批流
        let auditFlows = [
            {
                userId: dept.userId,
                userName: dept.userName,
                userEmail: dept.userEmail,
            },
        ];
        let auditUsers = dept.userName;
        userList.map((item) => {
            auditFlows.push({
                userId: item.userId,
                userName: item.userName,
                userEmail: item.userEmail,
            });
            auditUsers += "," + item.userName;
        });
        params.orderNo = orderNo;
        params.curAuditUserName = dept.userName;
        params.auditFlows = auditFlows;
        params.auditUsers = auditUsers;
        params.auditLogs = [];
        params.applyUser = {
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
        };

        const res = await Leave.create(params);
        ctx.body = utils.success(res, "创建成功");
    } else {
        const res = await Leave.findByIdAndUpdate(_id, { applyState: 5 });
        ctx.body = utils.success("", "作废成功");
    }
});
// 审核通过或拒绝
router.post("/approve", async (ctx) => {
    const { _id, action, remark } = ctx.request.body;
    const authorization = ctx.request.headers.authorization;
    const { data } = utils.decoded(authorization); // 为了得到auditLogs中的userName和userId
    // 拼接参数
    let params = {};
    try {
        let doc = (await Leave.findById(_id)) || []; // 查找该条文档，方便后续编写使用auditFlows与auditLogs进行审核的逻辑
        let auditLogs = doc.auditLogs;
        if (action == "refuse") {
            params.applyState = 3;
        } else {
            // 审核通过
            if (doc.auditFlows.length == doc.auditLogs.length) {
                ctx.body = utils.success("当前申请单已处理，请勿重复提交");
            } else if (doc.auditFlows.length == doc.auditLogs.length + 1) {
                params.applyState = 4;
                params.curAuditUserName = "";
            } else if (doc.auditFlows.length > doc.auditLogs.length) {
                params.applyState = 2;
                params.curAuditUserName =
                    doc.auditFlows[doc.auditLogs.length + 1].userName;
            }
        }
        auditLogs.push({
            userName: data.userName,
            userId: data.userId,
            createTime: new Date(),
            remark,
            action: action == "refuse" ? "申请驳回" : "申请通过",
        });
        params.auditLogs = auditLogs;
        // 拼接完成后，查找该条数据并更新
        let res = await Leave.findByIdAndUpdate(_id, params);
        ctx.body = utils.success("", "处理成功");
    } catch (error) {
        ctx.body = utils.fail(`查询异常：${error.message}`);
    }
});
router.get("/count", async (ctx) => {
    const authorization = ctx.request.headers.authorization;
    const { data } = utils.decoded(authorization);
    try {
        let params = {};
        params.curAuditUserName = data.userName;
        params.$or = [{ applyState: 1 }, { applyState: 2 }];
        let total = await Leave.countDocuments(params);
        ctx.body = utils.success(total);
    } catch (error) {
        ctx.body = utils.fail(`查询异常${error.stack}`);
    }
});
module.exports = router;
