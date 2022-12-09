const router = require("koa-router")();
const User = require("../models/userSchema");
const Counter = require("../models/counterSchema");
const utils = require("../utils/utils");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
router.prefix("/users");

// 登录路由
router.post("/login", async (ctx) => {
    try {
        const { userName, userPwd } = ctx.request.body;
        /**
         * 返回数据库指定字段，有三种方式
         * 1. 'userId userName userEmail state role deptId roleList'
         * 2. {userId:1,_id:0}
         * 3. select('userId')
         */
        const userInfo = await User.findOne(
            {
                userName,
                userPwd,
            },
            "userId userName userEmail state role deptId roleList"
        );

        if (userInfo) {
            const data = userInfo._doc;
            const token = jwt.sign(
                {
                    data,
                },
                "imooc",
                { expiresIn: "1h" }
            );
            data.token = token;
            ctx.body = utils.success(data);
        } else {
            ctx.body = utils.fail("账号或密码不正确");
        }
    } catch (error) {
        ctx.body = utils.fail(error.msg);
    }
});
// 获取全部用户
router.get("/all/list", async (ctx) => {
    try {
        let res = await User.find({}, "userId userName userEmail");
        ctx.body = utils.success(res);
    } catch (error) {
        ctx.body = utils.fail(error.stack);
    }
});
// 查询获取用户列表
router.get("/list", async (ctx) => {
    const { userName, userId, state } = ctx.request.query;
    const { page, skipIndex } = utils.pager(ctx.request.query);
    let params = {};
    if (userName) params.userName = userName;
    if (userId) params.userId = userId;
    if (state && state != "0") params.state = state;
    try {
        const query = User.find(params, { _id: 0, userPwd: 0 });
        const list = await query.skip(skipIndex).limit(page.pageSize);
        const total = await User.countDocuments(params);
        ctx.body = utils.success({
            page: {
                ...page,
                total,
            },
            list,
        });
    } catch (error) {
        utils.fail(`查询异常${error.stack}`);
    }
});

// 删除用户
router.post("/delete", async (ctx) => {
    const { userIds } = ctx.request.body;

    const res = await User.updateMany(
        {
            userId: {
                $in: userIds,
            },
        },
        {
            state: 2,
        }
    );
    if (res.matchedCount) {
        ctx.body = utils.success(res, `成功删除${res.matchedCount}条`);
        return;
    }
});
// 新增或编辑
router.post("/operate", async (ctx) => {
    const {
        userId,
        userName,
        userEmail,
        mobile,
        job,
        state,
        roleList,
        deptId,
        action,
    } = ctx.request.body;
    // 新增，编辑共用一个接口，通过action的值来判断是新增还是编辑操作
    if (action == "add") {
        if (!userName || !userEmail || !mobile || !deptId) {
            ctx.body = utils.fail("参数错误", utils.CODE.PARAM_ERROR);
            return;
        }
        // 检查创建的用户是否重复
        const res = await User.findOne(
            { $or: [{ userName }, { userEmail }] },
            "_id userName userEmall"
        );
        if (res) {
            ctx.body = utils.fail(
                `系统监测到有重复用户${userName}-${userEmail}`
            );
            return;
        }
        // 不重复，继续创建新用户
        const doc = await Counter.findOneAndUpdate(
            { _id: "userId" },
            { $inc: { sequence_value: 1 } },
            { new: true }
        );
        try {
            const user = new User({
                userId: doc.sequence_value,
                userName,
                userPwd: md5("123456"),
                userEmail,
                role: 1,
                mobile,
                job,
                state,
                roleList,
                deptId,
            });
            user.save();
            ctx.body = utils.success({}, "用户创建成功");
        } catch (error) {
            ctx.body = utils.fail(error.stack, "用户创建失败");
        }
    } else {
        // 编辑操作
        if (!mobile || !deptId) {
            ctx.body = utils.fail("请将必须项填写完整");
            return;
        }
        try {
            const res = await User.findOneAndUpdate(
                { userId },
                { mobile, job, state, roleList, deptId, action }
            );
            ctx.body = utils.success({}, "更新成功");
        } catch (error) {
            console.log(error.stack, "更新失败");
        }
    }
});
module.exports = router;
