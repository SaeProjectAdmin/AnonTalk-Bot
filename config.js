require('dotenv').config();

module.exports = {
    "FIREBASE_CREDENTIALS": process.env.FIREBASE_CREDENTIALS || "./serviceAccount.json",  // Path ke file JSON service account Firebase Anda
    "DB_URL": process.env.DB_URL || "https://anontalk-id-da4ec-default-rtdb.firebaseio.com",  // URL Firebase Realtime Database Anda
    "BOT_TOKEN": process.env.BOT_TOKEN || "7379786042:AAEqQnoDy9SDRF1sDxMM9_XA6ZNGySOFmH8",
    "BOT_NAME": process.env.BOT_NAME || "randomChatTalk_bot"
}
