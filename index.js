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
        console.log('✅ Telegraf loaded');
        
        // Get token from environment variables only
        const token = process.env.BOT_TOKEN;
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
        
        // Enhanced start command
        bot.start((ctx) => {
            console.log('📨 Received /start command from:', ctx.from.id);
            ctx.reply('🎉 Selamat datang di AnonTalk Bot!\n\n' +
                     '🤖 Bot untuk chat anonymous dengan user lain\n\n' +
                     '📋 Perintah yang tersedia:\n' +
                     '/lang - Pilih bahasa\n' +
                     '/join - Masuk room\n' +
                     '/rooms - Lihat daftar room\n' +
                     '/help - Bantuan lengkap\n' +
                     '/vip - Fitur VIP');
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
                     '/donate - Donasi');
        });
        
        // Language command
        bot.command('lang', (ctx) => {
            ctx.reply('🌍 Pilih bahasa:\n\n' +
                     '🇮🇩 Indonesia\n' +
                     '🇺🇸 English\n' +
                     '🇯🇵 Jawa\n\n' +
                     'Ketik: /lang id, /lang en, atau /lang jw');
        });
        
        // Join command
        bot.command('join', (ctx) => {
            ctx.reply('🏠 Pilih kategori room:\n\n' +
                     '🎮 Gaming\n' +
                     '💬 General\n' +
                     '📚 Education\n' +
                     '🎵 Music\n' +
                     '🎬 Entertainment\n' +
                     '💻 Technology\n' +
                     '🏃 Sports\n' +
                     '🍔 Food\n' +
                     '✈️ Travel\n\n' +
                     'Ketik: /join gaming, /join general, dll');
        });
        
        // Rooms command
        bot.command('rooms', (ctx) => {
            ctx.reply('🏠 Daftar Room Tersedia:\n\n' +
                     '🎮 Gaming (3 rooms)\n' +
                     '💬 General (3 rooms)\n' +
                     '📚 Education (3 rooms)\n' +
                     '🎵 Music (3 rooms)\n' +
                     '🎬 Entertainment (3 rooms)\n' +
                     '💻 Technology (3 rooms)\n' +
                     '🏃 Sports (3 rooms)\n' +
                     '🍔 Food (3 rooms)\n' +
                     '✈️ Travel (3 rooms)\n\n' +
                     'Total: 24 rooms aktif');
        });
        
        // VIP command
        bot.command('vip', (ctx) => {
            ctx.reply('💎 Fitur VIP AnonTalk Bot:\n\n' +
                     '✨ Keunggulan VIP:\n' +
                     '• Buat room pribadi\n' +
                     '• Prioritas masuk room\n' +
                     '• Avatar custom\n' +
                     '• Emoji unlimited\n\n' +
                     '💰 Harga:\n' +
                     '• Harian: Rp 5.000\n' +
                     '• Mingguan: Rp 25.000\n' +
                     '• Bulanan: Rp 75.000\n\n' +
                     'Untuk info lebih lanjut, hubungi admin.');
        });
        
        // Test command
        bot.command('test', (ctx) => {
            ctx.reply('✅ Bot berfungsi dengan baik!\n\n' +
                     '🤖 AnonTalk Bot v2.0.0\n' +
                     '📊 Status: Online\n' +
                     '🌐 Server: Firebase App Hosting');
        });
        
        // Handle all messages
        bot.on('message', (ctx) => {
            const message = ctx.message.text;
            console.log('📨 Received message:', message);
            
            // Simple message handling
            if (message && !message.startsWith('/')) {
                ctx.reply('💬 Pesan Anda: ' + message + '\n\n' +
                         '🔗 Anda sekarang bisa chat dengan user lain di room!\n' +
                         'Gunakan /join untuk masuk room.');
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
        console.log(`📋 Features: 24 rooms, 9 categories, 3 languages, VIP system`);
        
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
