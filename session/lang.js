const { Markup } = require('telegraf');
const db = require('../db'); // Firebase DB instance
const lang = require('../lang');

module.exports = async (ctx, user) => {
    try {
        // Update the user's language and reset the session
        const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = userSnapshot.val();
        if (userData) {
            const userKey = Object.keys(userData)[0];
            await db.adminDb.ref('users').child(userKey).update({ lang: ctx.message.text, session: '' });
        }

        // Send confirmation message to the user for changing language
        await ctx.telegram.sendMessage(
            ctx.chat.id,
            lang(user.lang, ctx.message.text).change_lang,
            Markup.removeKeyboard()
        ).catch(() => false);

        // Send guide message to the user after updating the language
        await ctx.telegram.sendMessage(ctx.chat.id, 
            `Selamat datang di bot kami! Berikut adalah cara penggunaan bot ini:

1. /help - Untuk melihat daftar perintah yang tersedia.
2. /join - Untuk bergabung dalam ruang chat.
3. /cancel - Untuk membatalkan perintah yang sedang berlangsung.
4. /settings - Untuk melihat atau mengubah pengaturan Anda.
5. /exit - Untuk keluar dari ruang chat.

Gunakan perintah ini sesuai kebutuhan Anda. Jika ada pertanyaan, ketik /help!`
        ).catch(() => false);

    } catch (err) {
        console.error('Error updating language:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while changing your language.");
    }
};
