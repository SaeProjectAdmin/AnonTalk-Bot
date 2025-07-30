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
        console.log('📦 Loading Telegraf...');
        const { Telegraf } = require('telegraf');
        console.log('✅ Telegraf loaded');
        
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
        
        // Simple start command for testing
        bot.start((ctx) => {
            console.log('📨 Received /start command from:', ctx.from.id);
            ctx.reply('🎉 Selamat datang di AnonTalk Bot!\n\nGunakan /help untuk melihat semua perintah yang tersedia.');
        });
        
        // Simple help command
        bot.help((ctx) => {
            ctx.reply('📋 Perintah yang tersedia:\n\n/start - Mulai bot\n/help - Bantuan ini\n/lang - Pilih bahasa\n/join - Masuk room\n/rooms - Lihat daftar room');
        });
        
        // Simple test command
        bot.command('test', (ctx) => {
            ctx.reply('✅ Bot berfungsi dengan baik!');
        });
        
        // Handle all messages
        bot.on('message', (ctx) => {
            console.log('📨 Received message:', ctx.message.text);
            ctx.reply('Pesan diterima: ' + ctx.message.text);
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
