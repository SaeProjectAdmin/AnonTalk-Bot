const { Telegraf } = require('telegraf');
const userCheck = require('./middleware/userCheck');
const db = require('./db'),
    cfg = require('./config'),
    express = require('express'),
    bodyParser = require("body-parser"),
    commands = require('./command/commands'),
    userSession = require('./session/sessions')

const token = cfg.BOT_TOKEN
const bot = new Telegraf(token)
const app = express();

const port = 5354
const secretPath = '/' + token
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.get("/", function (request, resolve) {
    resolve.end('Service is running.')
});

db.init(() => {
    bot.use(async (ctx, next) => {
        userCheck(ctx, next)
    })
    bot.start((ctx) => commands.start(ctx))
    bot.command('avatar', (ctx) => commands.settings.setAva(ctx))
    bot.command('lang', (ctx) => commands.settings.setLang(ctx))
    bot.command('cancel', (ctx) => commands.cancel(ctx))
    bot.command('join', (ctx)=>commands.join(ctx))
    bot.command('exit', (ctx)=>commands.exit(ctx))
    bot.command('rooms', (ctx)=>commands.rooms(ctx))
    bot.command('list', (ctx)=>commands.list(ctx))
    bot.command('donate', (ctx)=>commands.donate(ctx))
    bot.command('help', (ctx)=>commands.help(ctx))
    bot.on('message', (ctx) => userSession(ctx))
    bot.launch()
    app.use(bot.webhookCallback(secretPath))
    app.listen(process.env.PORT || port, () => {
        console.log(`Refferal app listening on port ${process.env.PORT || port}!`)
    })
})
