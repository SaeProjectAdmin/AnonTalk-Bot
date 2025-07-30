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

// Configure port for Firebase hosting
const port = process.env.PORT || 8080;
const secretPath = '/' + token;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint for Firebase hosting
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AnonTalk Bot is running',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Bot status endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        bot: 'AnonTalk Bot',
        status: 'Active',
        version: '2.0.0',
        features: [
            '24 Rooms across 9 categories',
            '3 Languages (Indonesia, English, Jawa)',
            'VIP System with priority features',
            'Enhanced media support',
            'Inline keyboard navigation'
        ],
        uptime: process.uptime()
    });
});

// Initialize database and start bot
db.init(() => {
    console.log('🗄️ Database initialized successfully');
    
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
    
    // Handle callback queries for inline keyboards
    bot.action(/join_category_(.+)/, async (ctx) => {
        try {
            const category = ctx.match[1];
            const joinCommand = require('./command/join');
            await joinCommand.handleCategoryCallback(ctx, category);
        } catch (error) {
            console.error("Error handling category callback:", error);
            ctx.answerCbQuery("An error occurred. Please try again.");
        }
    });

    bot.action(/join_room_(.+)/, async (ctx) => {
        try {
            const roomId = ctx.match[1];
            const joinCommand = require('./command/join');
            await joinCommand.handleRoomCallback(ctx, roomId);
        } catch (error) {
            console.error("Error handling room callback:", error);
            ctx.answerCbQuery("An error occurred. Please try again.");
        }
    });

    bot.action('join_categories', async (ctx) => {
        try {
            const joinCommand = require('./command/join');
            await joinCommand.handleBackToCategories(ctx);
        } catch (error) {
            console.error("Error handling back to categories:", error);
            ctx.answerCbQuery("An error occurred. Please try again.");
        }
    });

    bot.action(/lang_(.+)/, async (ctx) => {
        try {
            const selectedLang = ctx.match[1];
            const settings = require('./command/settings');
            await settings.handleLanguageCallback(ctx, `lang_${selectedLang}`);
        } catch (error) {
            console.error("Error handling language callback:", error);
            ctx.answerCbQuery("An error occurred. Please try again.");
        }
    });

    // Handle VIP-related commands
    bot.command('vip-stats', async (ctx) => {
        try {
            const vipCommand = require('./command/vip');
            await vipCommand.showVIPStats(ctx);
        } catch (error) {
            console.error("Error in vip-stats command:", error);
            ctx.reply("An error occurred. Please try again.");
        }
    });

    // Enhanced create-room command
    bot.command('create-room', async (ctx) => {
        try {
            const args = ctx.message.text.split(' ');
            const roomName = args.slice(1).join(' ');
            
            if (!roomName) {
                return ctx.reply('Usage: /create-room <room_name>');
            }
            
            const vipCommand = require('./command/vip');
            await vipCommand.createVIPRoom(ctx, roomName);
        } catch (error) {
            console.error("Error in create-room command:", error);
            ctx.reply("An error occurred. Please try again.");
        }
    });

    // Handle regular messages
    bot.on('message', (ctx) => userSession(ctx));

    // Global error handler
    bot.catch((err, ctx) => {
        console.error(`Error for ${ctx.updateType}:`, err);
        try {
            ctx.reply('An error occurred. Please try again later.');
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    });

    // Start bot based on environment
    if (process.env.NODE_ENV === 'production') {
        // Production: Use webhook for Firebase hosting
        console.log('🚀 Starting bot in production mode with webhook...');
        
        // Set webhook
        const webhookUrl = process.env.WEBHOOK_URL || `https://${process.env.FIREBASE_PROJECT_ID}.web.app${secretPath}`;
        
        bot.telegram.setWebhook(webhookUrl).then(() => {
            console.log(`✅ Webhook set to: ${webhookUrl}`);
        }).catch((error) => {
            console.error('❌ Error setting webhook:', error);
        });
        
        // Use webhook callback
        app.use(bot.webhookCallback(secretPath));
        
        // Start server
        app.listen(port, () => {
            console.log(`🌐 AnonTalk Bot server running on port ${port}`);
            console.log(`🤖 Bot webhook endpoint: ${secretPath}`);
            console.log(`📊 Status endpoint: /status`);
        });
    } else {
        // Development: Use polling
        console.log('🔧 Starting bot in development mode with polling...');
        bot.launch();
        
        // Start server for development
        app.listen(port, () => {
            console.log(`🌐 AnonTalk Bot development server running on port ${port}`);
            console.log(`📊 Status endpoint: /status`);
        });
    }
    
    console.log(`🎉 AnonTalk Bot v2.0.0 is ready!`);
    console.log(`📋 Features: 24 rooms, 9 categories, 3 languages, VIP system`);
    
    // Graceful shutdown
    process.once('SIGINT', () => {
        console.log('🛑 Shutting down bot...');
        bot.stop('SIGINT');
        db.close();
    });
    
    process.once('SIGTERM', () => {
        console.log('🛑 Shutting down bot...');
        bot.stop('SIGTERM');
        db.close();
    });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
