const { Markup } = require('telegraf');
const db = require('../db');
const lang = require('../lang');
const mediaHandler = require('../utils/mediaHandler');

module.exports = async (ctx, user) => {
    const dbuser = db.collection('users');
    const userava = user.ava || '👤';

    try {
        // Check if user is banned
        if (user.banned) {
            const banMessage = user.lang === 'Indonesia' ? 
                '❌ Akun Anda telah diblokir karena melanggar aturan.' :
                '❌ Your account has been banned for violating rules.';
            await ctx.telegram.sendMessage(ctx.chat.id, banMessage);
            return;
        }

        // Check if user is VIP for media size limits
        const isVIP = user.vip || false;
        const isMedia = mediaHandler.isMediaMessage(ctx.message);
        
        if (isMedia) {
            const mediaType = mediaHandler.getMediaType(ctx.message);
            const sizeLimit = isVIP ? 200 * 1024 * 1024 : 50 * 1024 * 1024; // 200MB for VIP, 50MB for regular
            const isValidSize = mediaHandler.validateMediaSize(ctx.message, sizeLimit);
            
            if (!isValidSize) {
                const messages = {
                    'Indonesia': `❌ File terlalu besar. Ukuran maksimal untuk ${mediaType} adalah ${isVIP ? '200MB' : '50MB'}.`,
                    'English': `❌ File too large. Maximum size for ${mediaType} is ${isVIP ? '200MB' : '50MB'}.`,
                };
                
                await ctx.telegram.sendMessage(ctx.chat.id, messages[user.lang] || messages['English']);
                return;
            }
        }

        // Check for inappropriate content
        const messageType = mediaHandler.getMessageType ? mediaHandler.getMessageType(ctx) : 'text';
        if (mediaHandler.isInappropriateContent && mediaHandler.isInappropriateContent(ctx, messageType)) {
            await mediaHandler.handleInappropriateContent(ctx, user, messageType);
            return;
        }

        // Fetch users in the same room except the sender
        const userInRoom = await dbuser.orderByChild('room').equalTo(user.room).once('value');
        const usersList = userInRoom.val() || {};
        
        let successCount = 0;
        
        for (let uid in usersList) {
            if (uid !== user.userid) {
                const recipient = usersList[uid];
                try {
                    if (ctx.message.text) {
                        await ctx.telegram.sendMessage(recipient.userid, `${userava}: ${ctx.message.text}`);
                        successCount++;
                    } else if (ctx.message.sticker) {
                        await ctx.telegram.sendSticker(recipient.userid, ctx.message.sticker.file_id);
                        successCount++;
                    } else if (ctx.message.photo) {
                        await ctx.telegram.sendPhoto(recipient.userid, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.audio) {
                        await ctx.telegram.sendAudio(recipient.userid, ctx.message.audio.file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.video) {
                        await ctx.telegram.sendVideo(recipient.userid, ctx.message.video.file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.video_note) {
                        await ctx.telegram.sendVideoNote(recipient.userid, ctx.message.video_note.file_id);
                        successCount++;
                    } else if (ctx.message.voice) {
                        await ctx.telegram.sendVoice(recipient.userid, ctx.message.voice.file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.animation) {
                        await ctx.telegram.sendAnimation(recipient.userid, ctx.message.animation.file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.document) {
                        await ctx.telegram.sendDocument(recipient.userid, ctx.message.document.file_id, {
                            caption: `${userava}: ${ctx.message.caption || ''}`,
                        });
                        successCount++;
                    } else if (ctx.message.contact) {
                        await ctx.telegram.sendContact(recipient.userid, 
                            ctx.message.contact.phone_number,
                            ctx.message.contact.first_name,
                            {
                                last_name: ctx.message.contact.last_name,
                                caption: `${userava}: ${ctx.message.caption || ''}`
                            }
                        );
                        successCount++;
                    } else if (ctx.message.location) {
                        await ctx.telegram.sendLocation(recipient.userid, 
                            ctx.message.location.latitude,
                            ctx.message.location.longitude,
                            {
                                caption: `${userava}: ${ctx.message.caption || ''}`
                            }
                        );
                        successCount++;
                    } else if (ctx.message.venue) {
                        await ctx.telegram.sendVenue(recipient.userid,
                            ctx.message.venue.location.latitude,
                            ctx.message.venue.location.longitude,
                            ctx.message.venue.title,
                            ctx.message.venue.address,
                            {
                                caption: `${userava}: ${ctx.message.caption || ''}`
                            }
                        );
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Error sending message to ${recipient.userid}:`, error);
                }
            }
        }

        // Send confirmation to sender
        if (successCount > 0) {
            const messages = {
                'Indonesia': `✅ Pesan berhasil dikirim ke ${successCount} anggota.`,
                'English': `✅ Message sent successfully to ${successCount} members.`,

            };
            
            await ctx.telegram.sendMessage(ctx.chat.id, messages[user.lang] || messages['English']);
        } else {
            const messages = {
                'Indonesia': '✅ Pesan terkirim. Anda adalah satu-satunya anggota di room ini.',
                'English': '✅ Message sent. You are the only member in this room.',

            };
            
            await ctx.telegram.sendMessage(ctx.chat.id, messages[user.lang] || messages['English']);
        }
        
    } catch (err) {
        console.error('Error sending message:', err);
    }
};
