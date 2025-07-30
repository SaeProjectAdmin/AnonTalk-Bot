const { Markup } = require('telegraf');
const db = require('../db');
const lang = require('../lang');

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found. Please try /start again.");
        }

        // Create inline keyboard with popular avatars
        const keyboard = [
            // Emoji avatars
            [
                { text: '😀', callback_data: 'avatar_😀' },
                { text: '😎', callback_data: 'avatar_😎' },
                { text: '🤖', callback_data: 'avatar_🤖' },
                { text: '👻', callback_data: 'avatar_👻' }
            ],
            [
                { text: '🎮', callback_data: 'avatar_🎮' },
                { text: '🎵', callback_data: 'avatar_🎵' },
                { text: '🍕', callback_data: 'avatar_🍕' },
                { text: '⚽', callback_data: 'avatar_⚽' }
            ],
            [
                { text: '💻', callback_data: 'avatar_💻' },
                { text: '🎨', callback_data: 'avatar_🎨' },
                { text: '🌟', callback_data: 'avatar_🌟' },
                { text: '🔥', callback_data: 'avatar_🔥' }
            ],
            // Letter avatars
            [
                { text: 'A', callback_data: 'avatar_A' },
                { text: 'B', callback_data: 'avatar_B' },
                { text: 'C', callback_data: 'avatar_C' },
                { text: 'D', callback_data: 'avatar_D' }
            ],
            [
                { text: 'AB', callback_data: 'avatar_AB' },
                { text: 'CD', callback_data: 'avatar_CD' },
                { text: 'XY', callback_data: 'avatar_XY' },
                { text: 'ZZ', callback_data: 'avatar_ZZ' }
            ],
            // Number avatars
            [
                { text: '1', callback_data: 'avatar_1' },
                { text: '2', callback_data: 'avatar_2' },
                { text: '3', callback_data: 'avatar_3' },
                { text: '4', callback_data: 'avatar_4' }
            ],
            [
                { text: '12', callback_data: 'avatar_12' },
                { text: '34', callback_data: 'avatar_34' },
                { text: '56', callback_data: 'avatar_56' },
                { text: '99', callback_data: 'avatar_99' }
            ],
            // Action buttons
            [
                { text: '✏️ Custom Input', callback_data: 'avatar_custom' },
                { text: '🗑️ Remove Avatar', callback_data: 'avatar_remove' }
            ]
        ];

        const currentAvatar = user.ava || '👤';
        const avatarMessage = lang(user.lang, currentAvatar).current_ava;

        await ctx.telegram.sendMessage(ctx.chat.id, avatarMessage, {
            reply_markup: {
                inline_keyboard: keyboard
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
            await db.collection('users').child(ctx.chat.id).update({ session: 'ava' });
            
            const customMessage = {
                'Indonesia': '✏️ **Input Avatar Custom**\n\nKirim emoji, huruf, atau angka (maksimal 2 karakter):',
                'English': '✏️ **Custom Avatar Input**\n\nSend emoji, letters, or numbers (max 2 characters):',
            };
            
            await ctx.editMessageText(customMessage[user.lang] || customMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Avatar Menu', callback_data: 'avatar_back' }]
                    ]
                }
            });
            
            ctx.answerCbQuery();
            
        } else if (avatarType === 'remove') {
            // Remove avatar and clear session
            await db.collection('users').child(ctx.chat.id).update({ 
                ava: '',
                session: ''
            });
            
            const removeMessage = {
                'Indonesia': '✅ **Avatar berhasil dihapus!**\n\nAvatar Anda sekarang menggunakan default.',
                'English': '✅ **Avatar removed successfully!**\n\nYour avatar is now using default.',
        
            };
            
            await ctx.editMessageText(removeMessage[user.lang] || removeMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Avatar Menu', callback_data: 'avatar_back' }]
                    ]
                }
            });
            
            ctx.answerCbQuery('Avatar removed!');
            
        } else if (avatarType === 'back') {
            // Clear session and go back to avatar menu
            await db.collection('users').child(ctx.chat.id).update({ session: '' });
            const avatarCommand = require('./avatar');
            await avatarCommand(ctx);
            ctx.answerCbQuery();
            
        } else {
            // Set selected avatar and clear session
            await db.collection('users').child(ctx.chat.id).update({ 
                ava: avatarType,
                session: ''
            });
            
            const successMessage = {
                'Indonesia': `✅ **Avatar berhasil diubah!**\n\nAvatar baru Anda: ${avatarType}`,
                'English': `✅ **Avatar changed successfully!**\n\nYour new avatar: ${avatarType}`,
        
            };
            
            await ctx.editMessageText(successMessage[user.lang] || successMessage['English'], {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Avatar Menu', callback_data: 'avatar_back' }]
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