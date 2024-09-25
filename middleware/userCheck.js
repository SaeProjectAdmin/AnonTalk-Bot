const db = require('../db'); // Firebase DB instance
const settings = require('../command/settings');
const lang = require('../lang');

module.exports = async (ctx, callback) => {
    try {
        const dbuser = db.collection('users');
        const now = new Date();

        // Fetch the user data from Firebase based on the Telegram chat ID
        const userSnapshot = await dbuser.child(ctx.chat.id).once('value');
        const user = userSnapshot.val();

        if (!user) {
            // If the user does not exist, create a new user entry
            const user_info = {
                userid: ctx.chat.id,
                username: ctx.chat.username || '',
                first_name: ctx.chat.first_name,
                last_name: ctx.chat.last_name || '',
                ava: '',
                lang: '',
                last_update: now,
                session: 'lang',
                room: '',
                vip: 0,
                end_vip: now,
                nickname: '',
                joined_at: now
            };

            // Insert the new user information into Firebase
            await dbuser.child(ctx.chat.id).set(user_info);

            // Send a welcome message to the user
            await ctx.telegram.sendMessage(ctx.chat.id, lang('en').welcome)
                .catch(() => false);

            // Set language for the user
            settings.setLang(ctx);
        } else if (user.lang === '') {
            // If the user language is not set
            if (!ctx.message.text.startsWith('/')) {
                // Save the language if the message is not a command
                settings.saveLang(ctx, user);
            } else {
                // Prompt the user to set their language
                settings.setLang(ctx);
            }
        } else {
            // If the user exists and language is set, update the last_update and username
            await dbuser.child(ctx.chat.id).update({
                last_update: now,
                username: ctx.chat.username || ''
            });

            // Execute the callback function
            callback();
        }
        

    } catch (err) {
        console.error('Error handling user data:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred during user setup.");
    }
};
