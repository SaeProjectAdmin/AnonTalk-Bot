require('dotenv').config();
const fs = require('fs');

module.exports = {
    FIREBASE_CREDENTIALS: JSON.parse(fs.readFileSync(process.env.FIREBASE_CREDENTIALS || './serviceAccount.json', 'utf8')), // Memuat serviceAccount.json sebagai object
    DB_URL: process.env.DB_URL || "",
    BOT_TOKEN: process.env.BOT_TOKEN || "",
    BOT_NAME: process.env.BOT_NAME || "default_bot_name"
};
