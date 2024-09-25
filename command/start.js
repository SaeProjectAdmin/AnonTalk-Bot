const db = require('../db'); // Firebase DB instance
const lang = require('../lang');

module.exports = async (ctx) => {
    try {
        // Kirim pesan panduan kepada pengguna sebelum pengecekan registrasi
        await ctx.telegram.sendMessage(ctx.chat.id, 
            `Selamat datang di bot kami! Berikut adalah cara penggunaan bot ini:

1. /help - Untuk melihat daftar perintah yang tersedia.
2. /join - Untuk bergabung dalam ruang chat.
3. /cancel - Untuk membatalkan perintah yang sedang berlangsung.
4. /settings - Untuk melihat atau mengubah pengaturan Anda.
5. /exit - Untuk keluar dari ruang chat.

Gunakan perintah ini sesuai kebutuhan Anda. Jika ada pertanyaan, ketik /help!`);

        const dbuser = db.collection('users'); // Gunakan Firestore atau sesuaikan jika Realtime Database

        // Fetch the user data from Firebase based on the Telegram chat ID
        const userSnapshot = await dbuser.doc(ctx.chat.id.toString()).get();
        const user = userSnapshot.data();

        if (user && user.lang && user.lang !== '') {
            await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).registered)
                .catch((err) => {
                    console.error('Error sending message:', err);
                });

        } else {
            // Jika user belum terdaftar atau belum mengatur bahasa
            ctx.telegram.sendMessage(ctx.chat.id, "User is not registered or language preference is missing.");
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while checking registration.");
    }
};
