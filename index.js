// Load environment configuration first
const envConfig = require('./config/env');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const performanceMonitor = require('./utils/performance');
const db = require('./db');

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
app.get('/', cacheMiddleware(envConfig.CACHE_DURATION.HEALTH_CHECK), (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AnonTalk Bot is running',
        version: envConfig.APP_VERSION,
        timestamp: new Date().toISOString(),
        port: port,
        env: envConfig.NODE_ENV
    });
});

// Bot status endpoint
app.get('/status', cacheMiddleware(envConfig.CACHE_DURATION.STATUS), (req, res) => {
    res.status(200).json({
        bot: envConfig.APP_NAME,
        status: 'Active',
        version: envConfig.APP_VERSION,
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
app.get('/test', cacheMiddleware(envConfig.CACHE_DURATION.TEST), (req, res) => {
    res.status(200).json({
        message: 'Test endpoint working',
        env: envConfig.NODE_ENV,
        port: port,
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check environment
app.get('/debug', (req, res) => {
    res.status(200).json({
        botToken: envConfig.BOT_TOKEN ? 'Set' : 'Not set',
        nodeEnv: envConfig.NODE_ENV,
        port: port,
        timestamp: new Date().toISOString()
    });
});

// Performance monitoring endpoint
app.get('/performance', (req, res) => {
    res.status(200).json({
        server: envConfig.APP_NAME,
        version: envConfig.APP_VERSION,
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

// Handle custom avatar input


// Bot initialization function
async function initializeBot() {
    try {
        console.log('🤖 Starting bot initialization...');
        
        // Load environment variables
        require('dotenv').config();
        console.log('📄 Environment variables loaded');
        
        // Initialize database and create rooms
        console.log('🗄️ Initializing database...');
        const db = require('./db');
        await new Promise((resolve) => {
            db.init(() => {
                console.log('✅ Database initialized successfully');
                resolve();
            });
        });
        
        // Start auto kick scheduler (check every hour)
        setInterval(async () => {
            try {
                await db.autoKickInactiveUsers();
            } catch (error) {
                console.error('Error in auto kick scheduler:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
        
        console.log('⏰ Auto kick scheduler started (check every hour)');
        
        // Load bot dependencies
        console.log('📦 Loading dependencies...');
        const { Telegraf } = require('telegraf');
        console.log('✅ Telegraf loaded');
        
        // Get token from environment configuration
        const token = envConfig.BOT_TOKEN;
        console.log('🔑 Bot token: Loaded from config');
        
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
        
        // Join command - directly join random room
        bot.command('join', async (ctx) => {
            try {
                const joinCommand = require('./command/join');
                await joinCommand(ctx);
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
                const misc = require('./command/misc');
                await misc.rooms(ctx);
            } catch (error) {
                console.error('Error in rooms command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });
        
        // List command - show users in current room
        bot.command('list', async (ctx) => {
            try {
                const misc = require('./command/misc');
                await misc.list(ctx);
            } catch (error) {
                console.error('Error in list command:', error);
                ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
            }
        });

        // Admin commands
        bot.command('admin', async (ctx) => {
            try {
                const admin = require('./command/admin');
                if (!admin.isAdmin(ctx.from.id)) {
                    return ctx.reply('❌ Anda tidak memiliki akses admin.');
                }
                
                const adminText = `🔧 **Admin Panel**

**Content Filter Commands:**
• /filter_toggle - Toggle content filtering
• /filter_stats - View filter statistics

**User Management:**
• /warn <user_id> - View user warnings
• /ban <user_id> [reason] - Ban user
• /unban <user_id> - Unban user
• /reset_warn <user_id> - Reset user warnings

**VIP Management:**
• /setvip <user_id> <true/false> - Set VIP status
• /checkvip <user_id> - Check VIP status
• /listvip - List all VIP users
• /removevip <user_id> - Remove VIP status
• /adminhelp - Admin help

**Example:**
/warn 123456789
/ban 123456789 Spam content
/unban 123456789
/setvip 123456789 true
/checkvip 123456789`;

                await ctx.reply(adminText, { parse_mode: 'Markdown' });
            } catch (error) {
                console.error('Error in admin command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Toggle content filter
        bot.command('filter_toggle', async (ctx) => {
            try {
                const admin = require('./command/admin');
                await admin.toggleContentFilter(ctx);
            } catch (error) {
                console.error('Error in filter_toggle command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // View filter stats
        bot.command('filter_stats', async (ctx) => {
            try {
                const admin = require('./command/admin');
                await admin.viewFilterStats(ctx);
            } catch (error) {
                console.error('Error in filter_stats command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // View user warnings
        bot.command('warn', async (ctx) => {
            try {
                const admin = require('./command/admin');
                const args = ctx.message.text.split(' ');
                if (args.length < 2) {
                    return ctx.reply('❌ Usage: /warn <user_id>');
                }
                await admin.viewUserWarnings(ctx, args[1]);
            } catch (error) {
                console.error('Error in warn command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Ban user
        bot.command('ban', async (ctx) => {
            try {
                const admin = require('./command/admin');
                const args = ctx.message.text.split(' ');
                if (args.length < 2) {
                    return ctx.reply('❌ Usage: /ban <user_id> [reason]');
                }
                const reason = args.slice(2).join(' ') || 'Admin ban';
                await admin.banUser(ctx, args[1], reason);
            } catch (error) {
                console.error('Error in ban command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Unban user
        bot.command('unban', async (ctx) => {
            try {
                const admin = require('./command/admin');
                const args = ctx.message.text.split(' ');
                if (args.length < 2) {
                    return ctx.reply('❌ Usage: /unban <user_id>');
                }
                await admin.unbanUser(ctx, args[1]);
            } catch (error) {
                console.error('Error in unban command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Reset user warnings
        bot.command('reset_warn', async (ctx) => {
            try {
                const admin = require('./command/admin');
                const args = ctx.message.text.split(' ');
                if (args.length < 2) {
                    return ctx.reply('❌ Usage: /reset_warn <user_id>');
                }
                await admin.resetUserWarnings(ctx, args[1]);
            } catch (error) {
                console.error('Error in reset_warn command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });
        
        // Set VIP status
        bot.command('setvip', async (ctx) => {
            try {
                const vip = require('./command/vip');
                const args = ctx.message.text.split(' ');
                if (args.length < 3) {
                    return ctx.reply('❌ Usage: /setvip <user_id> <true/false>');
                }
                const targetUserId = args[1];
                const isVIP = args[2].toLowerCase() === 'true';
                await vip.setVIPStatus(ctx, targetUserId, isVIP);
            } catch (error) {
                console.error('Error in setvip command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Check VIP status
        bot.command('checkvip', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.checkVIP(ctx);
            } catch (error) {
                console.error('Error in checkvip command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // List all VIP users
        bot.command('listvip', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.listVIP(ctx);
            } catch (error) {
                console.error('Error in listvip command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Remove VIP status
        bot.command('removevip', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.removeVIP(ctx);
            } catch (error) {
                console.error('Error in removevip command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Admin help
        bot.command('adminhelp', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.adminHelp(ctx);
            } catch (error) {
                console.error('Error in adminhelp command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Room stats
        bot.command('roomstats', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.roomStats(ctx);
            } catch (error) {
                console.error('Error in roomstats command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // Update room count
        bot.command('updateroomcount', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.updateRoomCount(ctx);
            } catch (error) {
                console.error('Error in updateroomcount command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });

        // All room stats
        bot.command('allroomstats', async (ctx) => {
            try {
                const adminCommands = require('./command/admin-commands');
                await adminCommands.allRoomStats(ctx);
            } catch (error) {
                console.error('Error in allroomstats command:', error);
                ctx.reply('❌ Terjadi kesalahan.');
            }
        });
        
        // Test command
        bot.command('test', (ctx) => {
            ctx.reply('✅ Bot berfungsi dengan baik!\n\n' +
                     '🤖 AnonTalk Bot v2.0.0\n' +
                     '📊 Status: Online\n' +
                     '🌐 Server: Firebase App Hosting');
        });
        
        // Handle all messages with session handler
        bot.on('message', async (ctx) => {
            const message = ctx.message.text;
            const hasMedia = ctx.message.photo || ctx.message.video || ctx.message.video_note || 
                           ctx.message.sticker || ctx.message.voice || ctx.message.audio || 
                           ctx.message.document || ctx.message.contact || ctx.message.location || 
                           ctx.message.venue;
            
            console.log('📨 Received message:', message || 'Media message');
            console.log('📨 Message details:', {
                hasText: !!message,
                hasPhoto: !!ctx.message.photo,
                hasVideo: !!ctx.message.video,
                hasVideoNote: !!ctx.message.video_note,
                hasSticker: !!ctx.message.sticker,
                hasVoice: !!ctx.message.voice,
                hasAudio: !!ctx.message.audio,
                hasDocument: !!ctx.message.document,
                hasContact: !!ctx.message.contact,
                hasLocation: !!ctx.message.location,
                hasVenue: !!ctx.message.venue
            });
            
            // Skip if it's a command (only for text messages)
            if (message && message.startsWith('/')) {
                console.log('⚡ Skipping command message');
                return; // Let command handlers process it
            }
            
            // Process all messages (text and media) through session handler
            try {
                console.log('🔄 Processing message through session handler');
                const sessionHandler = require('./session/sessions');
                await sessionHandler(ctx);
            } catch (error) {
                console.error('❌ Error in session handler:', error);
                // Fallback to simple reply for text messages only
                if (message) {
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
            const webhookUrl = envConfig.WEBHOOK_URL + secretPath;
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
