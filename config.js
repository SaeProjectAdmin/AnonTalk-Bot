require('dotenv').config();
const fs = require('fs');

module.exports = {
    // Firebase configuration
    FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS ? 
        JSON.parse(process.env.FIREBASE_CREDENTIALS) : 
        (() => {
            try {
                return JSON.parse(fs.readFileSync(process.env.FIREBASE_CREDENTIALS_PATH || './serviceAccount.json', 'utf8'));
            } catch (error) {
                console.log('⚠️ serviceAccount.json not found, using default Firebase config');
                return null;
            }
        })(),
    
    // Database configuration
    DB_URL: process.env.DB_URL || "https://anontalk-bot-5f3f1.firebaseio.com",
    
    // Bot configuration
    BOT_TOKEN: process.env.BOT_TOKEN || "",
    BOT_NAME: process.env.BOT_NAME || "AnonTalk Bot",
    
    // Environment configuration
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 8080,
    
    // Webhook configuration
    WEBHOOK_URL: process.env.WEBHOOK_URL || "",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "anontalk-bot-5f3f1",
    

};
