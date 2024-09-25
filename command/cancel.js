const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language file/module
const { Markup } = require('telegraf'); // Telegraf Markup for keyboard removal

module.exports = async (ctx) => {
    const dbUserRef = db.collection('users'); // Assuming Firebase 'users' collection

    try {
        // Fetch user data from Firebase based on chat ID
        const snapshot = await dbUserRef.orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = snapshot.val(); // Fetch user data

        if (!userData) {
            // Handle case where no user is found
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.", Markup.removeKeyboard());
        }

        const userIdKey = Object.keys(userData)[0]; // Firebase returns an object, need to grab the first key
        const user = userData[userIdKey]; // Retrieve user data

        if (user.session !== '') {
            // Clear user session
            await dbUserRef.child(userIdKey).update({ session: '' });

            // Send cancellation message
            await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).cancel, Markup.removeKeyboard());
        } else {
            // Send invalid cancellation message if session is already empty
            await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).invalid_cancel, Markup.removeKeyboard());
        }
    } catch (err) {
        console.error("Error handling cancellation:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred, please try again.", Markup.removeKeyboard());
    }
};
