const menu = require('./menu');
const db = require('../db');

// Auto menu handler - shows menu automatically
const autoMenuHandler = async (ctx) => {
    try {
        console.log('📱 Auto menu triggered for:', ctx.from.id);
        
        // Show main menu automatically
        await menu.showMainMenu(ctx);
        
        // Log auto menu usage
        try {
            const dbuser = db.collection('users');
            await dbuser.doc(ctx.chat.id.toString()).set({
                autoMenuUse: new Date().toISOString(),
                username: ctx.from.username || 'anonymous',
                lastActivity: new Date().toISOString()
            }, { merge: true });
        } catch (dbError) {
            console.log('Auto menu logging skipped:', dbError.message);
        }
        
    } catch (err) {
        console.error('Error in auto menu handler:', err);
        ctx.reply('❌ Terjadi kesalahan saat menampilkan menu. Silakan coba lagi.');
    }
};

// Smart menu handler - shows context-aware menu
const smartMenuHandler = async (ctx) => {
    try {
        const message = ctx.message.text.toLowerCase();
        console.log('🧠 Smart menu for message:', message);
        
        // Determine which menu to show based on message content
        if (message.includes('room') || message.includes('join') || message.includes('masuk')) {
            await menu.showJoinMenu(ctx);
        } else if (message.includes('bahasa') || message.includes('language') || message.includes('lang')) {
            await menu.showLanguageMenu(ctx);
        } else if (message.includes('vip') || message.includes('premium')) {
            await menu.showVipMenu(ctx);
        } else if (message.includes('bantuan') || message.includes('help') || message.includes('tolong')) {
            await menu.showHelpMenu(ctx);
        } else if (message.includes('daftar') || message.includes('list') || message.includes('rooms')) {
            await menu.showRoomsMenu(ctx);
        } else if (message.includes('pengaturan') || message.includes('settings') || message.includes('set')) {
            await menu.showSettingsMenu(ctx);
        } else if (message.includes('donasi') || message.includes('donate') || message.includes('dana')) {
            await menu.showDonateMenu(ctx);
        } else {
            // Default to main menu
            await menu.showMainMenu(ctx);
        }
        
    } catch (err) {
        console.error('Error in smart menu handler:', err);
        ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
};

// Quick menu handler - shows quick access buttons
const quickMenuHandler = async (ctx) => {
    try {
        const quickKeyboard = {
            inline_keyboard: [
                [
                    { text: '🏠 Join', callback_data: 'menu_join' },
                    { text: '💎 VIP', callback_data: 'menu_vip' },
                    { text: '📋 Help', callback_data: 'menu_help' }
                ],
                [
                    { text: '🌍 Lang', callback_data: 'menu_lang' },
                    { text: '⚙️ Settings', callback_data: 'menu_settings' },
                    { text: '💰 Donate', callback_data: 'menu_donate' }
                ]
            ]
        };
        
        await ctx.reply('⚡ **Quick Menu**\n\nPilih aksi cepat:', {
            parse_mode: 'Markdown',
            reply_markup: quickKeyboard
        });
        
    } catch (err) {
        console.error('Error in quick menu handler:', err);
        ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
};

// Welcome menu handler - shows welcome message with menu
const welcomeMenuHandler = async (ctx) => {
    try {
        const welcomeText = `🎉 **Selamat datang di AnonTalk Bot!**

🤖 Bot untuk chat anonymous dengan user lain
📱 Pilih menu di bawah ini untuk memulai:`;
        
        const welcomeKeyboard = {
            inline_keyboard: [
                [
                    { text: '🏠 Join Room', callback_data: 'menu_join' },
                    { text: '🌍 Language', callback_data: 'menu_lang' }
                ],
                [
                    { text: '💎 VIP Info', callback_data: 'menu_vip' },
                    { text: '📋 Help', callback_data: 'menu_help' }
                ],
                [
                    { text: '🏆 Rooms List', callback_data: 'menu_rooms' },
                    { text: '⚙️ Settings', callback_data: 'menu_settings' }
                ],
                [
                    { text: '💰 Donate', callback_data: 'menu_donate' },
                    { text: '📊 Stats', callback_data: 'menu_stats' }
                ]
            ]
        };
        
        await ctx.reply(welcomeText, {
            parse_mode: 'Markdown',
            reply_markup: welcomeKeyboard
        });
        
    } catch (err) {
        console.error('Error in welcome menu handler:', err);
        ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
};

module.exports = {
    autoMenuHandler,
    smartMenuHandler,
    quickMenuHandler,
    welcomeMenuHandler
}; 