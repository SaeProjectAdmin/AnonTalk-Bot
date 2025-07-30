const { Telegraf } = require('telegraf');
const userCheck = require('./middleware/userCheck');
const db = require('./db');
const cfg = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const commands = require('./command/commands');
const userSession = require('./session/sessions');

const token = cfg.BOT_TOKEN;
const bot = new Telegraf(token);
const app = express();

const port = process.env.PORT || 4000;
const secretPath = '/' + token;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).json('Welcome, your app is working well');
});

app.listen(port, () => console.log(`Server ready on port ${port}.`));

db.init(() => {
    // Bot middleware
    bot.use(async (ctx, next) => {
        await userCheck(ctx, next);
    });

    // Bot commands
    bot.start((ctx) => commands.start(ctx));
    bot.command('avatar', (ctx) => commands.settings.setAva(ctx));
    bot.command('lang', (ctx) => commands.settings.setLang(ctx));
    bot.command('cancel', (ctx) => commands.cancel(ctx));
    bot.command('join', (ctx) => commands.join(ctx));
    bot.command('exit', (ctx) => commands.exit(ctx));
    bot.command('rooms', (ctx) => commands.rooms(ctx));
    bot.command('list', (ctx) => commands.list(ctx));
    bot.command('donate', (ctx) => commands.donate(ctx));
    bot.command('help', (ctx) => commands.help(ctx));
    bot.command('vip', (ctx) => commands.vip(ctx));
    bot.command('create-room', (ctx) => commands.createRoom(ctx));
    bot.on('message', (ctx) => userSession(ctx));

    // Bot webhook setup
    bot.launch();
    app.use(bot.webhookCallback(secretPath));
    
    // Log when app is ready
    console.log(`Referral app listening on port ${port}!`);
});

module.exports = app;
