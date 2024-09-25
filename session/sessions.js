const db = require('../db');
const settings = require('../command/settings');
const lang = require('../lang');
const room = require('./room');

module.exports = async (ctx) => {
    const dbuser = db.collection('users');
    let user;

    try {
        const userSnapshot = await dbuser.child(ctx.chat.id).once('value');
        user = userSnapshot.val();

        if (user) {
            if (user.session === 'ava') {
                if (ctx.message.text) {
                    await settings.saveAva(ctx, user);
                }
            } else if (user.session === 'lang') {
                if (ctx.message.text) {
                    await settings.saveLang(ctx, user);
                }
            } else if (user.room !== '') {
                room(ctx, user);
            } else {
                await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).invalid_command);
            }
        } else {
            // Handle user not found case if necessary
            await ctx.telegram.sendMessage(ctx.chat.id, lang('en').user_not_found);
        }
    } catch (err) {
        console.error('Error processing message:', err);
    }
};
