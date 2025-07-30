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
            console.log(`🏠 User ${user.userid} is in room ${user.room}, processing media`);
            await db.updateUserActivity(ctx.chat.id, user.room);
            await mediaHandler.handleMedia(ctx, user);
        } else {
            // User is not in a room
            const hasMedia = ctx.message.photo || ctx.message.video || ctx.message.video_note || 
                           ctx.message.sticker || ctx.message.voice || ctx.message.audio || 
                           ctx.message.document || ctx.message.contact || ctx.message.location || 
                           ctx.message.venue;
            
            console.log(`🚫 User ${user.userid} not in room. Has media: ${hasMedia}`);
            
            if (hasMedia) {
                // Handle media even if not in room (will show "not in room" message)
                console.log(`📱 Processing media for user not in room`);
                await mediaHandler.handleMedia(ctx, user);
            } else if (ctx.message.text) {
                // Show invalid command message only for text messages
                console.log(`💬 Showing invalid command message for text`);
                await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).invalid_command);
            }
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
