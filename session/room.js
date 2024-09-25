const { Markup } = require('telegraf');
const db = require('../db');
const lang = require('../lang');

module.exports = async (ctx, user) => {
    const dbuser = db.collection('users');
    const userava = user.ava || '👤';

    try {
        // Fetch users in the same room except the sender
        const userInRoom = await dbuser.orderByChild('room').equalTo(user.room).once('value');
        const usersList = userInRoom.val() || {};
        
        for (let uid in usersList) {
            if (uid !== user.userid) {
                const recipient = usersList[uid];
                if (ctx.message.text) {
                    await ctx.telegram.sendMessage(recipient.userid, `${userava}: ${ctx.message.text}`);
                } else if (ctx.message.sticker) {
                    await ctx.telegram.sendSticker(recipient.userid, ctx.message.sticker.file_id);
                } else if (ctx.message.photo) {
                    await ctx.telegram.sendPhoto(recipient.userid, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.audio) {
                    await ctx.telegram.sendAudio(recipient.userid, ctx.message.audio.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.video) {
                    await ctx.telegram.sendVideo(recipient.userid, ctx.message.video.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.video_note) {
                    await ctx.telegram.sendVideoNote(recipient.userid, ctx.message.video_note.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.voice) {
                    await ctx.telegram.sendVoice(recipient.userid, ctx.message.voice.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.animation) {
                    await ctx.telegram.sendAnimation(recipient.userid, ctx.message.animation.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                } else if (ctx.message.document) {
                    await ctx.telegram.sendDocument(recipient.userid, ctx.message.document.file_id, {
                        caption: `${userava}: ${ctx.message.caption || ''}`,
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error sending message:', err);
    }
};
