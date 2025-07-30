// Environment configuration for Firebase App Hosting
// This file contains environment variables that will be available in production

const config = {
    // Bot Configuration
    BOT_TOKEN: '8044181903:AAEHhxOSIaETpn0Wp2zTYf3_QBX0KTi2hy0',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'production',
    
    // Webhook URL
    WEBHOOK_URL: 'https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app',
    
    // Firebase Configuration
    FIREBASE_PROJECT_ID: 'anontalk-bot-5f3f1',
    
    // App Configuration
    APP_NAME: 'AnonTalk Bot',
    APP_VERSION: '2.0.0',
    
    // Performance Configuration
    CACHE_DURATION: {
        HEALTH_CHECK: 60,
        STATUS: 300,
        TEST: 60
    },
    
    // Security Configuration
    SENSITIVE_PATTERNS: [
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
    ]
};

// Export configuration
module.exports = config;

// Also set as environment variables for compatibility
Object.keys(config).forEach(key => {
    if (!process.env[key]) {
        process.env[key] = config[key];
    }
}); 