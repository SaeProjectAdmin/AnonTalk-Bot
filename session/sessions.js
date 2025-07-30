const db = require('../db');
const settings = require('../command/settings');
const lang = require('../lang');
const room = require('./room');
const mediaHandler = require('../utils/mediaHandler');

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            await ctx.telegram.sendMessage(ctx.chat.id, "User not found. Please try /start again.");
            return;
        }

        // Handle different session states
        if (user.session === 'ava') {
            if (ctx.message.text) {
                await settings.saveAva(ctx, user);
            } else {
                await ctx.telegram.sendMessage(ctx.chat.id, "Please send an emoji for your avatar.");
            }
        } else if (user.session === 'lang') {
            if (ctx.message.text) {
                await settings.saveLang(ctx, user);
            } else {
                await ctx.telegram.sendMessage(ctx.chat.id, "Please select a language using the buttons above.");
            }
        } else if (user.room !== '') {
            // User is in a room, update activity and handle media messages
            await db.updateUserActivity(ctx.chat.id, user.room);
            await mediaHandler.handleMedia(ctx, user);
        } else {
            // User is not in a room, show invalid command message
            await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).invalid_command);
        }
    } catch (err) {
        console.error('Error processing message:', err);
        try {
            await ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
};
