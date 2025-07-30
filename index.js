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

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Test endpoint working',
        env: process.env.NODE_ENV || 'development',
        port: port
    });
});

// Start server immediately
const server = app.listen(port, () => {
    console.log(`🌐 AnonTalk Bot server running on port ${port}`);
    console.log(`📊 Status endpoint: /status`);
    console.log(`🧪 Test endpoint: /test`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
