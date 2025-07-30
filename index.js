const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint for Firebase hosting
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AnonTalk Bot is running',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        port: port,
        env: process.env.NODE_ENV || 'development'
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
        uptime: process.uptime(),
        port: port
    });
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Test endpoint working',
        env: process.env.NODE_ENV || 'development',
        port: port,
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check environment
app.get('/debug', (req, res) => {
    res.status(200).json({
        botToken: process.env.BOT_TOKEN ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV || 'development',
        port: port,
        timestamp: new Date().toISOString()
    });
});

// Start server immediately for Cloud Run readiness
console.log(`🚀 Starting server on port ${port}...`);
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📊 Health check: /`);
    console.log(`📈 Status: /status`);
    console.log(`🧪 Test: /test`);
    console.log(`🐛 Debug: /debug`);
    
    // Initialize bot after server is ready
    setTimeout(() => {
        initializeBot();
    }, 1000);
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

// Bot initialization function
async function initializeBot() {
    try {
        console.log('🤖 Starting bot initialization...');
        
        // Load environment variables
        require('dotenv').config();
        console.log('📄 Environment variables loaded');
        
        // Load bot dependencies
        console.log('📦 Loading dependencies...');
        const { Telegraf } = require('telegraf');
        const userCheck = require('./middleware/userCheck');
        const db = require('./db');
        const commands = require('./command/commands');
        const userSession = require('./session/sessions');
        console.log('✅ Dependencies loaded');
        
        // Use hardcoded token for testing
        const token = process.env.BOT_TOKEN || '8044181903:AAEHhxOSIaETpn0Wp2zTYf3_QBX0KTi2hy0';
        console.log('🔑 Bot token:', token ? 'Set' : 'Not set');
        
        if (!token || token === "your_telegram_bot_token_here") {
            console.error("❌ BOT_TOKEN is not set. Please set your Telegram bot token in the .env file.");
            console.log("⚠️ Bot will not start, but server is running for health checks");
            return;
        }
        
        console.log('🤖 Creating bot instance...');
        const bot = new Telegraf(token);
        const secretPath = '/' + token;
        
        console.log('🤖 Bot instance created');
        
        // Initialize database
        console.log('🗄️ Initializing database...');
        await new Promise((resolve, reject) => {
            db.init(() => {
                console.log('✅ Database initialized successfully');
                resolve();
            });
        });
        
        // Bot middleware
        bot.use(async (ctx, next) => {
            await userCheck(ctx, next);
        });
        
        console.log('🔧 Setting up bot commands...');
        
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
        bot.command('create-room', async (ctx) => {
            try {
                const args = ctx.message.text.split(' ');
                const roomName = args.slice(1).join(' ');
                if (!roomName) return ctx.reply('Usage: /create-room <room_name>');
                const vipCommand = require('./command/vip');
                await vipCommand.createVIPRoom(ctx, roomName);
            } catch (error) {
                console.error("Error in create-room command:", error);
                ctx.reply("An error occurred. Please try again.");
            }
        });
        
        // Callback handlers
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
        
        bot.command('vip-stats', async (ctx) => {
            try {
                const vipCommand = require('./command/vip');
                await vipCommand.showVIPStats(ctx);
            } catch (error) {
                console.error("Error in vip-stats command:", error);
                ctx.reply("An error occurred. Please try again.");
            }
        });
        
        // Session handler
        bot.on('message', (ctx) => userSession(ctx));
        
        // Bot error handling
        bot.catch((err, ctx) => {
            console.error(`❌ Bot error for ${ctx.updateType}:`, err);
            try {
                ctx.reply('An error occurred. Please try again later.');
            } catch (replyError) {
                console.error('Error sending error message:', replyError);
            }
        });
        
        console.log('🔧 Setting up webhook...');
        
        // Attach webhook handler
        if (process.env.NODE_ENV === 'production') {
            console.log('🌐 Production mode - using webhook');
            app.use(bot.webhookCallback(secretPath));
            console.log(`🤖 Webhook endpoint ready at ${secretPath}`);
            
            // Set webhook
            const webhookUrl = process.env.WEBHOOK_URL || `https://anontalk-app--anontalk-bot-5f3f1.asia-east1.hosted.app${secretPath}`;
            console.log('🔗 Setting webhook to:', webhookUrl);
            
            try {
                await bot.telegram.setWebhook(webhookUrl);
                console.log(`✅ Webhook set successfully`);
            } catch (error) {
                console.error('❌ Error setting webhook:', error);
            }
        } else {
            console.log('🔧 Development mode - using polling');
            bot.launch();
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
        
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error);
        console.log('⚠️ Bot initialization failed, but server is still running for health checks');
    }
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
