const { Markup } = require('telegraf');
const db = require('../db');
const lang = require('../lang');

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found. Please try /start again.");
        }

        // Set session to 'ava' for direct custom input
        const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = userSnapshot.val();
        if (userData) {
            const userKey = Object.keys(userData)[0];
            await db.adminDb.ref('users').child(userKey).update({ session: 'ava' });
        }

        const currentAvatar = user.ava || '👤';
        const customMessage = {
            'Indonesia': `✏️ **Input Avatar Custom**\n\nAvatar kamu saat ini: ${currentAvatar}\n\nKirim emoji, huruf, atau angka (maksimal 2 karakter):`,
            'English': `✏️ **Custom Avatar Input**\n\nYour current avatar: ${currentAvatar}\n\nSend emoji, letters, or numbers (max 2 characters):`,
        };

        await ctx.telegram.sendMessage(ctx.chat.id, customMessage[user.lang] || customMessage['English'], {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🗑️ Remove Avatar', callback_data: 'avatar_remove' }],
                    [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                ]
            }
        });

    } catch (error) {
        console.error("Error in avatar command:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

// Handle avatar selection callback
module.exports.handleAvatarCallback = async (ctx, avatarType) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }

        if (avatarType === 'custom') {
            // Set session to 'ava' for custom input
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ session: 'ava' });
            }
            
            const customMessage = {
                'Indonesia': '✏️ **Input Avatar Custom**\n\nKirim emoji, huruf, atau angka (maksimal 2 karakter):',
                'English': '✏️ **Custom Avatar Input**\n\nSend emoji, letters, or numbers (max 2 characters):',
            };
            
            await ctx.editMessageText(customMessage[user.lang] || customMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
            
            ctx.answerCbQuery();
            
        } else if (avatarType === 'remove') {
            // Remove avatar and clear session
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ 
                    ava: '',
                    session: ''
                });
            }
            
            const removeMessage = {
                'Indonesia': '✅ **Avatar berhasil dihapus!**\n\nAvatar Anda sekarang menggunakan default.',
                'English': '✅ **Avatar removed successfully!**\n\nYour avatar is now using default.',
        
            };
            
                                     await ctx.editMessageText(removeMessage[user.lang] || removeMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
            
            ctx.answerCbQuery('Avatar removed!');
            
        } else if (avatarType === 'back') {
            // Clear session and go back to main menu
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ session: '' });
            }
            // Go back to main menu
            const menu = require('./menu');
            await menu.showMainMenu(ctx);
            ctx.answerCbQuery();
            
        } else {
            // Set selected avatar and clear session
            const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();
            if (userData) {
                const userKey = Object.keys(userData)[0];
                await db.adminDb.ref('users').child(userKey).update({ 
                    ava: avatarType,
                    session: ''
                });
            }
            
            const successMessage = {
                'Indonesia': `✅ **Avatar berhasil diubah!**\n\nAvatar baru Anda: ${avatarType}`,
                'English': `✅ **Avatar changed successfully!**\n\nYour new avatar: ${avatarType}`,
        
            };
            
                                     await ctx.editMessageText(successMessage[user.lang] || successMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
            
            ctx.answerCbQuery(`Avatar changed to ${avatarType}!`);
        }
        
    } catch (error) {
        console.error("Error handling avatar callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
}; 