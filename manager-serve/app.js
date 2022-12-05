const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const router = require('koa-router')()
const users = require('./routes/users')
const jwt = require('jsonwebtoken')
const koaJwt = require('koa-jwt')
const utils = require('./utils/utils')

// error handler
onerror(app)

require('./config/db')
// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))




// logger 
app.use(async (ctx, next) => {
    log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
    log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
    await next().catch((err)=>{
        if(err.status == '401') {
            // ctx.state = 200;
            ctx.body = utils.fail('Token认证失败',utils.CODE.AUTH_ERROR)
        }else {
            throw err
        }
    })
})

// 验证Token
app.use(koaJwt({secret:'imooc'}).unless({path:[/^\/api\/users\/login/]}))


// routes
app.use(router.routes(), router.allowedMethods()) // 全局路由
router.prefix("/api") // 一级路由
router.use(users.routes(), users.allowedMethods())  // 二级路由


// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
    log4js.error(`${err.stack}`)
});

module.exports = app
