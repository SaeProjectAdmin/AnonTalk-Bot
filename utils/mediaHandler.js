const db = require('../db');
const lang = require('../lang');

class MediaHandler {
    constructor() {
        this.supportedTypes = {
            text: true,
            photo: true,
            video: true,
            video_note: true,
            sticker: true,
            voice: true,
            audio: true,
            document: true,
            contact: true,
            location: true,
            venue: true
        };

        // Content filtering settings
        this.contentFilter = {
            enabled: true,
            blockAdultContent: true,
            blockViolence: true,
            blockSpam: true,
            // Keywords that might indicate inappropriate content
            adultKeywords: [
                'porn', 'sex', 'nude', 'naked', 'adult', '18+', 'xxx', 'nsfw',
                'pornografi', 'seks', 'telanjang', 'dewasa', 'mature'
            ],
            // Sticker set names that might contain inappropriate content
            blockedStickerSets: [
                'adult', 'nsfw', 'porn', 'sex', 'nude', 'mature',
                'dewasa', 'pornografi', 'seks', 'telanjang'
            ]
        };
    }

    // Check if content is inappropriate
    isInappropriateContent(ctx, messageType) {
        if (!this.contentFilter.enabled) return false;

        try {
            // Check text content
            if (ctx.message.text || ctx.message.caption) {
                const text = (ctx.message.text || ctx.message.caption || '').toLowerCase();
                if (this.containsAdultKeywords(text)) {
                    return true;
                }
            }

            // Check sticker content
            if (messageType === 'sticker' && ctx.message.sticker) {
                const stickerSetName = ctx.message.sticker.set_name?.toLowerCase() || '';
                if (this.isBlockedStickerSet(stickerSetName)) {
                    return true;
                }
            }

            // Check file names for documents
            if (messageType === 'document' && ctx.message.document) {
                const fileName = ctx.message.document.file_name?.toLowerCase() || '';
                if (this.containsAdultKeywords(fileName)) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking content appropriateness:', error);
            return false; // Allow content if check fails
        }
    }

    // Check if text contains adult keywords
    containsAdultKeywords(text) {
        const lowerText = text.toLowerCase();
        return this.contentFilter.adultKeywords.some(keyword => 
            lowerText.includes(keyword)
        );
    }

    // Check if sticker set is blocked
    isBlockedStickerSet(setName) {
        const lowerSetName = setName.toLowerCase();
        return this.contentFilter.blockedStickerSets.some(blockedSet => 
            lowerSetName.includes(blockedSet)
        );
    }

    // Handle inappropriate content
    async handleInappropriateContent(ctx, user, contentType) {
        const messages = {
            'Indonesia': {
                photo: '❌ Foto tidak pantas terdeteksi dan diblokir.',
                video: '❌ Video tidak pantas terdeteksi dan diblokir.',
                sticker: '❌ Stiker tidak pantas terdeteksi dan diblokir.',
                text: '❌ Pesan tidak pantas terdeteksi dan diblokir.',
                document: '❌ File tidak pantas terdeteksi dan diblokir.',
                general: '❌ Konten tidak pantas terdeteksi dan diblokir.'
            },
            'English': {
                photo: '❌ Inappropriate photo detected and blocked.',
                video: '❌ Inappropriate video detected and blocked.',
                sticker: '❌ Inappropriate sticker detected and blocked.',
                text: '❌ Inappropriate message detected and blocked.',
                document: '❌ Inappropriate file detected and blocked.',
                general: '❌ Inappropriate content detected and blocked.'
            }
        };

        const userLang = user.lang || 'Indonesia';
        const messageKey = contentType in messages[userLang] ? contentType : 'general';
        const blockMessage = messages[userLang][messageKey];

        // Send warning to user
        await ctx.reply(blockMessage);

        // Log the incident (optional - for moderation purposes)
        console.log(`🚫 Content blocked for user ${user.userid}: ${contentType} in room ${user.room}`);

        // Increment warning count for user (optional)
        await this.incrementWarningCount(user.userid);
    }

    // Increment warning count for user
    async incrementWarningCount(userId) {
        try {
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(userId).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                const userRef = db.adminDb.ref('users').child(userKey);
                
                const currentWarnings = userData[userKey]?.warnings || 0;
                const newWarnings = currentWarnings + 1;
                
                await userRef.update({ warnings: newWarnings });
                
                // Auto-ban after 3 warnings (optional)
                if (newWarnings >= 3) {
                    await userRef.update({ 
                        banned: true, 
                        bannedAt: new Date().toISOString(),
                        banReason: 'Multiple content violations'
                    });
                    console.log(`🚫 User ${userId} auto-banned for multiple violations`);
                }
            }
        } catch (error) {
            console.error('Error updating warning count:', error);
        }
    }

    // Handle different types of media messages
    async handleMedia(ctx, user) {
        try {
            const messageType = this.getMessageType(ctx);
            console.log(`📱 Processing media type: ${messageType} for user ${user.userid}`);
            
            // Check if content is inappropriate
            if (this.isInappropriateContent(ctx, messageType)) {
                console.log(`🚫 Inappropriate content detected for type: ${messageType}`);
                return await this.handleInappropriateContent(ctx, user, messageType);
            }
            
            if (!this.supportedTypes[messageType]) {
                console.log(`❌ Unsupported media type: ${messageType}`);
                return this.handleUnsupportedMedia(ctx, user);
            }

            console.log(`✅ Processing supported media type: ${messageType}`);
            switch (messageType) {
                case 'text':
                    return this.handleText(ctx, user);
                case 'photo':
                    return this.handlePhoto(ctx, user);
                case 'video':
                case 'video_note':
                    return this.handleVideo(ctx, user, messageType);
                case 'sticker':
                    return this.handleSticker(ctx, user);
                case 'voice':
                case 'audio':
                    return this.handleAudio(ctx, user, messageType);
                case 'document':
                    return this.handleDocument(ctx, user);
                case 'contact':
                    return this.handleContact(ctx, user);
                case 'location':
                    return this.handleLocation(ctx, user);
                case 'venue':
                    return this.handleVenue(ctx, user);
                default:
                    return this.handleUnsupportedMedia(ctx, user);
            }
        } catch (error) {
            console.error('Error handling media:', error);
            return this.handleError(ctx, user, error);
        }
    }

    getMessageType(ctx) {
        console.log(`🔍 Checking message type for message:`, {
            hasText: !!ctx.message.text,
            hasPhoto: !!ctx.message.photo,
            hasVideo: !!ctx.message.video,
            hasVideoNote: !!ctx.message.video_note,
            hasSticker: !!ctx.message.sticker,
            hasVoice: !!ctx.message.voice,
            hasAudio: !!ctx.message.audio,
            hasDocument: !!ctx.message.document,
            hasContact: !!ctx.message.contact,
            hasLocation: !!ctx.message.location,
            hasVenue: !!ctx.message.venue
        });
        
        if (ctx.message.text) return 'text';
        if (ctx.message.photo) return 'photo';
        if (ctx.message.video) return 'video';
        if (ctx.message.video_note) return 'video_note';
        if (ctx.message.sticker) return 'sticker';
        if (ctx.message.voice) return 'voice';
        if (ctx.message.audio) return 'audio';
        if (ctx.message.document) return 'document';
        if (ctx.message.contact) return 'contact';
        if (ctx.message.location) return 'location';
        if (ctx.message.venue) return 'venue';
        return 'unknown';
    }

    // Check if message is media
    isMediaMessage(message) {
        return !!(message.photo || message.video || message.video_note || 
                 message.sticker || message.voice || message.audio || 
                 message.document || message.animation);
    }

    // Get media type
    getMediaType(message) {
        if (message.photo) return 'photo';
        if (message.video) return 'video';
        if (message.video_note) return 'video_note';
        if (message.sticker) return 'sticker';
        if (message.voice) return 'voice';
        if (message.audio) return 'audio';
        if (message.document) return 'document';
        if (message.animation) return 'animation';
        return 'unknown';
    }

    // Validate media size
    validateMediaSize(message, maxSize) {
        const fileSize = message.document?.file_size || 
                        message.photo?.[message.photo.length - 1]?.file_size ||
                        message.video?.file_size ||
                        message.audio?.file_size ||
                        message.voice?.file_size ||
                        message.animation?.file_size ||
                        0;
        
        return fileSize <= maxSize;
    }

    async handleText(ctx, user) {
        // Check if user is in a room
        if (!user.room) {
            return ctx.reply(lang(user.lang).not_in_room);
        }

        // Get users in the same room
        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        
        // Send message to all users in the room
        const message = `${user.ava || '👤'}: ${ctx.message.text}`;
        
        for (const roomUser of usersInRoom) {
            try {
                await ctx.telegram.sendMessage(roomUser.userid, message);
            } catch (error) {
                console.error(`Error sending message to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handlePhoto(ctx, user) {
        console.log(`📷 Handling photo for user ${user.userid} in room ${user.room}`);
        
        if (!user.room) {
            console.log(`❌ User ${user.userid} not in room`);
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        console.log(`📷 Found ${usersInRoom.length} users in room to send photo to`);
        
        const caption = ctx.message.caption ? `${user.ava || '👤'}: ${ctx.message.caption}` : `${user.ava || '👤'}: 📷 Photo`;
        
        for (const roomUser of usersInRoom) {
            try {
                console.log(`📷 Sending photo to user ${roomUser.userid}`);
                await ctx.telegram.sendPhoto(roomUser.userid, ctx.message.photo[0].file_id, {
                    caption: caption
                });
                console.log(`✅ Photo sent successfully to user ${roomUser.userid}`);
            } catch (error) {
                console.error(`❌ Error sending photo to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleVideo(ctx, user, type) {
        console.log(`🎥 Handling ${type} for user ${user.userid} in room ${user.room}`);
        
        if (!user.room) {
            console.log(`❌ User ${user.userid} not in room`);
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        console.log(`🎥 Found ${usersInRoom.length} users in room to send ${type} to. User VIP: ${isVIP}`);
        
        // Check file size for non-VIP users
        if (!isVIP && ctx.message.video && ctx.message.video.file_size > 50 * 1024 * 1024) { // 50MB limit
            console.log(`❌ Video too large for non-VIP user: ${ctx.message.video.file_size} bytes`);
            return ctx.reply('Video too large. Upgrade to VIP for unlimited video size.');
        }

        const caption = ctx.message.caption ? `${user.ava || '👤'}: ${ctx.message.caption}` : `${user.ava || '👤'}: ${type === 'video_note' ? '🎬 Video Note' : '🎥 Video'}`;
        
        for (const roomUser of usersInRoom) {
            try {
                console.log(`🎥 Sending ${type} to user ${roomUser.userid}`);
                if (type === 'video_note') {
                    await ctx.telegram.sendVideoNote(roomUser.userid, ctx.message.video_note.file_id);
                } else {
                    await ctx.telegram.sendVideo(roomUser.userid, ctx.message.video.file_id, {
                        caption: caption
                    });
                }
                console.log(`✅ ${type} sent successfully to user ${roomUser.userid}`);
            } catch (error) {
                console.error(`❌ Error sending ${type} to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleSticker(ctx, user) {
        console.log(`😀 Handling sticker for user ${user.userid} in room ${user.room}`);
        
        if (!user.room) {
            console.log(`❌ User ${user.userid} not in room`);
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        console.log(`😀 Found ${usersInRoom.length} users in room to send sticker to`);
        
        for (const roomUser of usersInRoom) {
            try {
                console.log(`😀 Sending sticker to user ${roomUser.userid}`);
                await ctx.telegram.sendSticker(roomUser.userid, ctx.message.sticker.file_id);
                console.log(`✅ Sticker sent successfully to user ${roomUser.userid}`);
            } catch (error) {
                console.error(`❌ Error sending sticker to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleAudio(ctx, user, type) {
        console.log(`🎵 Handling ${type} for user ${user.userid} in room ${user.room}`);
        
        if (!user.room) {
            console.log(`❌ User ${user.userid} not in room`);
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        console.log(`🎵 Found ${usersInRoom.length} users in room to send ${type} to`);
        
        const caption = ctx.message.caption ? `${user.ava || '👤'}: ${ctx.message.caption}` : `${user.ava || '👤'}: ${type === 'voice' ? '🎤 Voice Message' : '🎵 Audio'}`;
        
        for (const roomUser of usersInRoom) {
            try {
                console.log(`🎵 Sending ${type} to user ${roomUser.userid}`);
                if (type === 'voice') {
                    await ctx.telegram.sendVoice(roomUser.userid, ctx.message.voice.file_id, {
                        caption: caption
                    });
                } else {
                    await ctx.telegram.sendAudio(roomUser.userid, ctx.message.audio.file_id, {
                        caption: caption
                    });
                }
                console.log(`✅ ${type} sent successfully to user ${roomUser.userid}`);
            } catch (error) {
                console.error(`❌ Error sending ${type} to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleDocument(ctx, user) {
        if (!user.room) {
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        const caption = ctx.message.caption ? `${user.ava || '👤'}: ${ctx.message.caption}` : `${user.ava || '👤'}: 📄 Document`;
        
        for (const roomUser of usersInRoom) {
            try {
                await ctx.telegram.sendDocument(roomUser.userid, ctx.message.document.file_id, {
                    caption: caption
                });
            } catch (error) {
                console.error(`Error sending document to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleContact(ctx, user) {
        if (!user.room) {
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        
        for (const roomUser of usersInRoom) {
            try {
                await ctx.telegram.sendContact(roomUser.userid, 
                    ctx.message.contact.phone_number, 
                    ctx.message.contact.first_name,
                    {
                        last_name: ctx.message.contact.last_name,
                        vcard: ctx.message.contact.vcard
                    }
                );
            } catch (error) {
                console.error(`Error sending contact to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleLocation(ctx, user) {
        if (!user.room) {
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        
        for (const roomUser of usersInRoom) {
            try {
                await ctx.telegram.sendLocation(roomUser.userid, 
                    ctx.message.location.latitude, 
                    ctx.message.location.longitude
                );
            } catch (error) {
                console.error(`Error sending location to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleVenue(ctx, user) {
        if (!user.room) {
            return ctx.reply(lang(user.lang).not_in_room);
        }

        const usersInRoom = await this.getUsersInRoom(user.room, user.userid);
        
        for (const roomUser of usersInRoom) {
            try {
                await ctx.telegram.sendVenue(roomUser.userid, 
                    ctx.message.venue.location.latitude, 
                    ctx.message.venue.location.longitude,
                    ctx.message.venue.title,
                    ctx.message.venue.address,
                    {
                        foursquare_id: ctx.message.venue.foursquare_id,
                        foursquare_type: ctx.message.venue.foursquare_type
                    }
                );
            } catch (error) {
                console.error(`Error sending venue to user ${roomUser.userid}:`, error);
            }
        }
    }

    async handleUnsupportedMedia(ctx, user) {
        return ctx.reply('This media type is not supported yet.');
    }

    async handleError(ctx, user, error) {
        console.error('Media handler error:', error);
        return ctx.reply('An error occurred while processing your message.');
    }

    async getUsersInRoom(roomId, excludeUserId) {
        try {
            console.log(`🔍 Getting users in room: ${roomId}, excluding user: ${excludeUserId}`);
            const snapshot = await db.adminDb.ref('users').orderByChild('room').equalTo(roomId).once('value');
            const data = snapshot.val();
            if (data) {
                const users = Object.values(data).filter(user => user.userid !== excludeUserId);
                console.log(`🔍 Found ${users.length} users in room ${roomId}`);
                return users;
            }
            console.log(`🔍 No users found in room ${roomId}`);
            return [];
        } catch (error) {
            console.error('❌ Error getting users in room:', error);
            return [];
        }
    }
}

module.exports = new MediaHandler(); 