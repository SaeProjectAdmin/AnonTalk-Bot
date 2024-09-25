const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = async (ctx) => {
    try {
        // Get the user from the 'users' collection by userid
        const userSnapshot = await db.collection('users')
            .orderByChild('userid')
            .equalTo(ctx.chat.id)
            .once('value');

        const userData = userSnapshot.val(); // Fetch user data

        if (!userData) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        const userIdKey = Object.keys(userData)[0]; // Firebase returns an object, get the first key
        const user = userData[userIdKey]; // Extract the user data

        // Send the 'help' message in the user's preferred language
        await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).help).catch(() => false);
    } catch (err) {
        console.error("Error fetching user or sending message:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};
