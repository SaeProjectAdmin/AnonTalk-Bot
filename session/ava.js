const { Markup } = require('telegraf');
const db = require('../db'); // Firebase DB instance
const lang = require('../lang');

module.exports = async (ctx, user) => {
    try {
        const dbuser = db.collection('users');

        if (ctx.message.text.length <= 2) {
            // Update user's avatar and reset the session
            await dbuser.child(ctx.chat.id).update({ ava: ctx.message.text, session: '' });

            // Send confirmation message to the user
            await ctx.telegram.sendMessage(
                ctx.chat.id,
                lang(user.lang, ctx.message.text).change_ava,
                Markup.removeKeyboard()
            ).catch(() => false);

            if (user.room !== '') {
                // Notify others in the room of the avatar change
                const userInRoomSnapshot = await dbuser.orderByChild('room').equalTo(user.room).once('value');
                const userInRoom = userInRoomSnapshot.val();

                for (const key in userInRoom) {
                    if (userInRoom[key].userid !== user.userid) {
                        await ctx.telegram.sendMessage(
                            userInRoom[key].userid,
                            lang(userInRoom[key].lang, user.ava || 'Botak', ctx.message.text).other_change_ava
                        ).catch(() => false);
                    }
                }
            }

        } else if (ctx.message.text === '/drop') {
            // Set user's avatar to default ('Botak') and reset the session
            await dbuser.child(ctx.chat.id).update({ ava: '', session: '' });

            // Send confirmation message to the user
            await ctx.telegram.sendMessage(
                ctx.chat.id,
                lang(user.lang, ctx.message.text).to_botak,
                Markup.removeKeyboard()
            ).catch(() => false);

            if (user.room !== '') {
                // Notify others in the room of the avatar reset
                const userInRoomSnapshot = await dbuser.orderByChild('room').equalTo(user.room).once('value');
                const userInRoom = userInRoomSnapshot.val();

                for (const key in userInRoom) {
                    if (userInRoom[key].userid !== user.userid) {
                        await ctx.telegram.sendMessage(
                            userInRoom[key].userid,
                            lang(userInRoom[key].lang, user.ava || 'Botak').other_to_botak
                        ).catch(() => false);
                    }
                }
            }

        } else {
            // Send error message for invalid avatar input
            await ctx.telegram.sendMessage(
                ctx.chat.id,
                lang(user.lang, ctx.message.text).invalid_ava,
                Markup.removeKeyboard()
            ).catch(() => false);
        }
    } catch (err) {
        console.error('Error processing avatar change:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while updating your avatar.");
    }
};
