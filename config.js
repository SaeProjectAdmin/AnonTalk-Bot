require('dotenv').config();  // Memuat environment variables dari file .env
const fs = require('fs');

// Jika menggunakan environment variable untuk path service account, atau fallback ke path default
const firebaseCredentialsPath = process.env.FIREBASE_CREDENTIALS || "./path/to/default/serviceAccount.json";
let firebaseCredentials;

try {
    // Coba memuat file service account jika path tersedia
    firebaseCredentials = JSON.parse(fs.readFileSync(firebaseCredentialsPath, 'utf8'));
} catch (err) {
    console.error("Failed to load Firebase credentials:", err);
    process.exit(1);  // Keluar jika gagal memuat kredensial Firebase
}

module.exports = {
    FIREBASE_CREDENTIALS: firebaseCredentials,
    DB_URL: process.env.DB_URL || "",  // Pastikan DB_URL ada di .env
    BOT_TOKEN: process.env.BOT_TOKEN || "",  // Pastikan BOT_TOKEN ada di .env
    BOT_NAME: process.env.BOT_NAME || "default_bot_name"  // BOT_NAME bisa memiliki default
};
