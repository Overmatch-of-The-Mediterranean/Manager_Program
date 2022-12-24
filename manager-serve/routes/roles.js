const router = require("koa-router")();
const utils = require("../utils/utils");
const Role = require("../models/roleSchema");
const { fail } = require("../utils/utils");

router.prefix("/roles");

// 获取所有角色列表
router.get("/allList", async (ctx) => {
    try {
        const list = await Role.find({}, "_id roleName");
        ctx.body = utils.success(list);
    } catch (error) {
        ctx.body = utils.fail(`查询错误：${error.stack}`);
    }
});

// 按页获取角色列表

router.get("/list", async (ctx) => {
    const { roleName } = ctx.request.query;
    const { page, skipIndex } = utils.pager(ctx.request.query);
    let params = {};
    if (roleName) params.roleName = roleName;
    try {
        const query = Role.find(params);
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await Role.countDocuments(params);
        ctx.body = utils.success({
            page: {
                ...page,
                total,
            },
            list,
        });
    } catch (error) {
        ctx.body = utils.fail(`获取角色列表失败：${error.stack}`);
    }
});

// 角色新增/编辑/删除
router.post("/operate", async (ctx) => {
    const { action, _id, roleName, remark } = ctx.request.body;
    let res, info;
    try {
        if (action == "add") {
            res = await Role.create({ roleName, remark });
            info = "添加成功";
        } else if (action == "edit") {
            if (_id) {
                let params = { roleName, remark };
                params.update = new Date();
                res = await Role.findByIdAndUpdate(_id, params);
                info = "编辑成功";
            } else {
                ctx.body = utils.fail("缺少参数params: _id");
                return;
            }
        } else {
            if (_id) {
                res = await Role.findByIdAndRemove(_id);
                info = "删除成功";
            } else {
                ctx.body = utils.fail("缺少参数params:_id");
                return;
            }
        }
        ctx.body = utils.success(info);
    } catch (error) {
        ctx.body = utils.fail(error.stack);
    }
});
// 更新权限
router.post("/update/permission", async (ctx) => {
    const { _id, permissionList } = ctx.request.body;
    try {
        let params = { permissionList, updateTime: new Date() };
        let res = await Role.findByIdAndUpdate(_id, params);
        ctx.body = utils.success("", "权限更新成功");
    } catch (error) {
        ctx.body = utils.fail(error.stack);
    }
});

module.exports = router;
