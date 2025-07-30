const { Markup } = require('telegraf');
const db = require('../db'); // Firebase DB instance
const lang = require('../lang');

module.exports = async (ctx, user) => {
    const userava = user.ava || '👤';

    try {
        const input = ctx.message.text;
        const maxLength = 2; // Maximum 2 characters

        // Function to validate emoji or letters
        const isValidAvatar = (text) => {
            // Check if it's a single emoji (Unicode emoji)
            const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]|[\u{200D}]|[\u{23}]|[\u{2A}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]|[\u{1F300}-\u{1F321}]|[\u{1F324}-\u{1F393}]|[\u{1F396}-\u{1F397}]|[\u{1F399}-\u{1F39B}]|[\u{1F39E}-\u{1F3F0}]|[\u{1F3F3}-\u{1F3F5}]|[\u{1F3F7}-\u{1F3FA}]|[\u{1F400}-\u{1F4FD}]|[\u{1F4FF}-\u{1F53D}]|[\u{1F549}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|[\u{1F56F}-\u{1F570}]|[\u{1F573}-\u{1F57A}]|[\u{1F587}]|[\u{1F58A}-\u{1F58D}]|[\u{1F590}]|[\u{1F595}-\u{1F596}]|[\u{1F5A4}-\u{1F5A5}]|[\u{1F5A8}]|[\u{1F5B1}-\u{1F5B2}]|[\u{1F5BC}]|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5DC}-\u{1F5DE}]|[\u{1F5E1}]|[\u{1F5E3}]|[\u{1F5E8}]|[\u{1F5EF}]|[\u{1F5F3}]|[\u{1F5FA}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6CB}-\u{1F6D2}]|[\u{1F6E0}-\u{1F6E5}]|[\u{1F6E9}]|[\u{1F6EB}-\u{1F6EC}]|[\u{1F6F0}]|[\u{1F6F3}-\u{1F6F9}]|[\u{1F910}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F970}]|[\u{1F973}-\u{1F976}]|[\u{1F97A}]|[\u{1F97C}-\u{1F9A2}]|[\u{1F9B0}-\u{1F9B9}]|[\u{1F9C0}-\u{1F9C2}]|[\u{1F9D0}-\u{1F9FF}]/u;
            
            // Check if it's letters (A-Z, a-z) or numbers (0-9)
            const letterNumberRegex = /^[A-Za-z0-9]{1,2}$/;
            
            // Check if it's a single emoji or valid letters/numbers
            return emojiRegex.test(text) || letterNumberRegex.test(text);
        };

        if (input === '/drop') {
            // Set user's avatar to default and reset the session
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ ava: '', session: '' });
            }

            // Send confirmation message to the user
            await ctx.telegram.sendMessage(
                ctx.chat.id,
                lang(user.lang).to_botak,
                Markup.removeKeyboard()
            ).catch(() => false);

            // Don't send notifications to room members when removing avatar
            // This prevents the avatar removal from appearing as a chat message

        } else if (input.length <= maxLength && isValidAvatar(input)) {
            // Update user's avatar and reset the session
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ ava: input, session: '' });
            }

            // Send confirmation message to the user
            let confirmMessage = lang(user.lang, input).change_ava;

            await ctx.telegram.sendMessage(
                ctx.chat.id,
                confirmMessage,
                Markup.removeKeyboard()
            ).catch(() => false);

            // Don't send notifications to room members when changing avatar
            // This prevents the avatar change from appearing as a chat message

        } else {
            // Send error message for invalid avatar input
            const errorMessages = {
                'Indonesia': `❌ Avatar tidak valid!\n\n✅ **Yang diperbolehkan:**\n• Emoji (contoh: 😀 🎮 🍕)\n• Huruf (contoh: A, AB, a, ab)\n• Angka (contoh: 1, 12)\n• Maksimal 2 karakter\n\n❌ **Yang tidak diperbolehkan:**\n• Simbol khusus (@#$%)\n• Lebih dari 2 karakter\n• Spasi atau karakter kosong`,
                'English': `❌ Invalid avatar!\n\n✅ **Allowed:**\n• Emoji (example: 😀 🎮 🍕)\n• Letters (example: A, AB, a, ab)\n• Numbers (example: 1, 12)\n• Maximum 2 characters\n\n❌ **Not allowed:**\n• Special symbols (@#$%)\n• More than 2 characters\n• Spaces or empty characters`,

            };

            const errorMessage = errorMessages[user.lang] || errorMessages['English'];

            await ctx.telegram.sendMessage(
                ctx.chat.id,
                errorMessage,
                Markup.removeKeyboard()
            ).catch(() => false);
        }
    } catch (err) {
        console.error('Error processing avatar change:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while updating your avatar.");
    }
};
