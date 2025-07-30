const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const performanceMonitor = require('./utils/performance');

const app = express();
const port = process.env.PORT || 8080;

// Enable compression for all responses
app.use(compression());

// Performance monitoring middleware
app.use(performanceMonitor.trackRequest.bind(performanceMonitor));

// Cache middleware for static responses
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        res.set('Cache-Control', `public, max-age=${duration}`);
        next();
    };
};

// Security middleware to block access to sensitive files
app.use((req, res, next) => {
    const url = req.url.toLowerCase();
    
    // Block access to sensitive files and directories
    const sensitivePatterns = [
        '/.git/',
        '/.env',
        '/serviceaccount.json',
        '/serviceaccount',
        '/config.json',
        '/package.json',
        '/package-lock.json',
        '/node_modules/',
        '/.vscode/',
        '/.idea/',
        '/.firebaserc',
        '/firebase.json',
        '/database.rules.json',
        '/storage.rules'
    ];
    
    for (const pattern of sensitivePatterns) {
        if (url.includes(pattern)) {
            console.warn(`🚫 Blocked access to sensitive file: ${req.url}`);
            return res.status(404).json({ error: 'Not found' });
        }
    }
    
    next();
});

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint for Firebase hosting
app.get('/', cacheMiddleware(60), (req, res) => {
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
app.get('/status', cacheMiddleware(300), (req, res) => {
    res.status(200).json({
        bot: 'AnonTalk Bot',
        status: 'Active',
        version: '2.0.0',
        features: [
            '16 Rooms across 8 categories',
            '2 Languages (Indonesia, English)',
            'VIP System with priority features',
            'Enhanced media support',
            'Inline keyboard navigation'
        ],
        uptime: process.uptime(),
        port: port
    });
});

// Test endpoint for debugging
app.get('/test', cacheMiddleware(60), (req, res) => {
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

// Performance monitoring endpoint
app.get('/performance', (req, res) => {
    res.status(200).json({
        server: 'AnonTalk Bot',
        version: '2.0.0',
        performance: performanceMonitor.getMetrics(),
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
    console.log(`📊 Performance: /performance`);
    
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
        console.log('✅ Telegraf loaded');
        
        // Use hardcoded token for now since environment variables not working in App Hosting
        const token = '8044181903:AAEHhxOSIaETpn0Wp2zTYf3_QBX0KTi2hy0';
        console.log('🔑 Bot token: Using hardcoded token');
        
        if (!token || token === "your_telegram_bot_token_here") {
            console.error("❌ BOT_TOKEN is not set. Please set your Telegram bot token in the .env file.");
            console.log("⚠️ Bot will not start, but server is running for health checks");
            return;
        }
        
        console.log('🤖 Creating bot instance...');
        const bot = new Telegraf(token);
        const secretPath = '/' + token;
        
        console.log('🤖 Bot instance created');
        
        // Lazy load menu modules for better performance
        let menuCommand, menuCallbacks, menu, autoMenu;
        
        // Enhanced start command with menu
        bot.start(async (ctx) => {
            try {
                if (!menuCommand) menuCommand = require('./command/menu-command');
                if (!menuCallbacks) menuCallbacks = require('./command/menu-callbacks');
                if (!menu) menu = require('./command/menu');
                
                const startCommand = require('./command/start');
                await startCommand(ctx);
            } catch (error) {
                console.error('Error in start command:', error);
                ctx.reply('An error occurred. Please try again.');
            }
        });
        
        // Lazy load auto menu handlers
        const loadAutoMenu = () => {
            if (!autoMenu) autoMenu = require('./command/auto-menu');
            return autoMenu;
        };
        
        // Menu commands
        bot.command('menu', (ctx) => {
            if (!menuCommand) menuCommand = require('./command/menu-command');
            return menuCommand(ctx);
        });
        bot.command('auto', (ctx) => {
            const autoMenu = loadAutoMenu();
            return autoMenu.autoMenuHandler(ctx);
        });
        bot.command('quick', (ctx) => {
            const autoMenu = loadAutoMenu();
            return autoMenu.quickMenuHandler(ctx);
        });
        bot.command('welcome', (ctx) => {
            const autoMenu = loadAutoMenu();
            return autoMenu.welcomeMenuHandler(ctx);
        });
        
        // Menu callback handlers using the new menu system
        bot.action(/^menu_/, async (ctx) => {
            try {
                if (!menuCallbacks) menuCallbacks = require('./command/menu-callbacks');
                await menuCallbacks.handleMenuCallbacks(ctx);
            } catch (error) {
                console.error('Error in menu callback:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Handle all other callbacks using the new menu system
        bot.action(/^(join_|lang_|vip_|help_|settings_|rooms_|donate_|pay_|avatar_)/, async (ctx) => {
            try {
                if (!menuCallbacks) menuCallbacks = require('./command/menu-callbacks');
                await menuCallbacks.handleMenuCallbacks(ctx);
            } catch (error) {
                console.error('Error in callback handler:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Help command
        bot.help((ctx) => {
            ctx.reply('📋 Perintah AnonTalk Bot:\n\n' +
                     '🎯 Dasar:\n' +
                     '/start - Mulai bot\n' +
                     '/help - Bantuan ini\n' +
                     '/lang - Pilih bahasa\n\n' +
                     '🏠 Room:\n' +
                     '/join - Masuk room\n' +
                     '/rooms - Lihat daftar room\n' +
                     '/exit - Keluar dari room\n' +
                     '/list - Lihat user di room\n\n' +
                     '⚙️ Settings:\n' +
                     '/avatar - Set avatar\n' +
                     '/cancel - Batalkan aksi\n\n' +
                     '💎 VIP:\n' +
                     '/vip - Info VIP\n' +
                     '/create-room - Buat room VIP\n\n' +
                     '💝 Lainnya:\n' +
                     '/donate - Donasi\n\n' +
                     '🌐 Default Language: Indonesia');
        });
        
        // Language command
        bot.command('lang', async (ctx) => {
            try {
                if (!menu) menu = require('./command/menu');
                await menu.showLanguageMenu(ctx);
            } catch (error) {
                console.error('Error in lang command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Join command
        bot.command('join', async (ctx) => {
            try {
                if (!menu) menu = require('./command/menu');
                await menu.showJoinMenu(ctx);
            } catch (error) {
                console.error('Error in join command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Avatar command
        bot.command('avatar', async (ctx) => {
            try {
                const avatarCommand = require('./command/avatar');
                await avatarCommand(ctx);
            } catch (error) {
                console.error('Error in avatar command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Exit command
        bot.command('exit', async (ctx) => {
            try {
                const exitCommand = require('./command/exit');
                await exitCommand(ctx);
            } catch (error) {
                console.error('Error in exit command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // Rooms command
        bot.command('rooms', async (ctx) => {
            try {
                if (!menu) menu = require('./command/menu');
                await menu.showRoomsMenu(ctx);
            } catch (error) {
                console.error('Error in rooms command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        

        
        // Test command
        bot.command('test', (ctx) => {
            ctx.reply('✅ Bot berfungsi dengan baik!\n\n' +
                     '🤖 AnonTalk Bot v2.0.0\n' +
                     '📊 Status: Online\n' +
                     '🌐 Server: Firebase App Hosting');
        });
        
        // Handle all messages with smart menu
        bot.on('message', async (ctx) => {
            const message = ctx.message.text;
            console.log('📨 Received message:', message);
            
            // Skip if it's a command
            if (message && !message.startsWith('/')) {
                try {
                    // Use smart menu handler for non-command messages
                    const autoMenu = loadAutoMenu();
                    await autoMenu.smartMenuHandler(ctx);
                } catch (error) {
                    console.error('Error in smart menu:', error);
                    // Fallback to simple reply
                    ctx.reply('💬 Pesan Anda: ' + message + '\n\n' +
                             '🔗 Anda sekarang bisa chat dengan user lain di room!\n' +
                             'Gunakan /menu untuk melihat menu lengkap.');
                }
            }
        });
        
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
        console.log(`📋 Features: 16 rooms, 8 categories, 2 languages, VIP system`);
        
        // Graceful shutdown
        process.once('SIGINT', () => {
            console.log('🛑 Shutting down bot...');
            bot.stop('SIGINT');
        });
        
        process.once('SIGTERM', () => {
            console.log('🛑 Shutting down bot...');
            bot.stop('SIGTERM');
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
