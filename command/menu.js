const db = require('../db');
const lang = require('../lang');

// Menu keyboard configurations
const menuKeyboards = {
    // Main menu
    main: {
        inline_keyboard: [
            [
                { text: '🏠 Join Room', callback_data: 'menu_join' },
                { text: '🌍 Language', callback_data: 'menu_lang' }
            ],
            [
                { text: '👤 Avatar', callback_data: 'menu_avatar' },
                { text: '📋 Help', callback_data: 'menu_help' }
            ],
            [
                { text: '🏆 Rooms List', callback_data: 'menu_rooms' },
                { text: '📊 Stats', callback_data: 'menu_stats' }
            ]
        ]
    },

    // Join room menu
    join: {
        inline_keyboard: [
            [
                { text: '🎲 Join Room Acak / Random Room', callback_data: 'join_random_room' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    },

    // Language menu
    language: {
        inline_keyboard: [
            [
                { text: '🇮🇩 Indonesia', callback_data: 'lang_id' },
                { text: '🇺🇸 English', callback_data: 'lang_en' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    },



    // Help menu
    help: {
        inline_keyboard: [
            [
                { text: '📋 Commands', callback_data: 'help_commands' },
                { text: '❓ FAQ', callback_data: 'help_faq' }
            ],
            [
                { text: '🎯 How to Use', callback_data: 'help_howto' },
                { text: '🚨 Rules', callback_data: 'help_rules' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    },

    // Rooms list menu
    rooms: {
        inline_keyboard: [
            [
                { text: '🎮 Gaming (3 rooms)', callback_data: 'rooms_gaming' },
                { text: '💬 General (3 rooms)', callback_data: 'rooms_general' }
            ],
            [
                { text: '📚 Education (3 rooms)', callback_data: 'rooms_education' },
                { text: '🎵 Music (3 rooms)', callback_data: 'rooms_music' }
            ],
            [
                { text: '🎬 Entertainment (3 rooms)', callback_data: 'rooms_entertainment' },
                { text: '💻 Technology (3 rooms)', callback_data: 'rooms_technology' }
            ],
            [
                { text: '🏃 Sports (3 rooms)', callback_data: 'rooms_sports' },
                { text: '🍔 Food (3 rooms)', callback_data: 'rooms_food' }
            ],
            [
                { text: '✈️ Travel (3 rooms)', callback_data: 'rooms_travel' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    },

    // Settings menu
    settings: {
        inline_keyboard: [
            [
                { text: '👤 Avatar', callback_data: 'settings_avatar' },
                { text: '🔔 Notifications', callback_data: 'settings_notifications' }
            ],
            [
                { text: '🔒 Privacy', callback_data: 'settings_privacy' },
                { text: '🎨 Theme', callback_data: 'settings_theme' }
            ],
            [
                { text: '🌍 Language', callback_data: 'settings_language' },
                { text: '📱 Interface', callback_data: 'settings_interface' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    },

    // Donate menu
    donate: {
        inline_keyboard: [
            [
                { text: '💝 Donate 5K', callback_data: 'donate_5k' },
                { text: '💝 Donate 10K', callback_data: 'donate_10k' }
            ],
            [
                { text: '💝 Donate 25K', callback_data: 'donate_25k' },
                { text: '💝 Donate 50K', callback_data: 'donate_50k' }
            ],
            [
                { text: '💝 Custom Amount', callback_data: 'donate_custom' }
            ],
            [
                { text: '🔙 Back to Menu', callback_data: 'menu_main' }
            ]
        ]
    }
};

// Menu text content
const menuTexts = {
    main: `🎉 **Selamat datang di AnonTalk Bot!**

🤖 Bot untuk chat anonymous dengan user lain
📱 Pilih menu di bawah ini:`,
    
    join: `🏠 **Join Room**

🎲 **Join Room Acak / Random Room**

Klik tombol di bawah untuk langsung bergabung dengan room acak yang tersedia.

**Fitur:**
• Otomatis pilih room yang tersedia
• Berdasarkan bahasa Anda
• Prioritas untuk VIP users
• Room dengan user aktif`,
    
    language: `🌍 **Pilih Bahasa**

Pilih bahasa yang Anda inginkan:
• 🇮🇩 Indonesia
• 🇺🇸 English`,
    
    vip: `💎 **VIP Features**

✨ **Keunggulan VIP:**
• Buat room pribadi
• Priority access
• Custom avatar
• Unlimited rooms
• Premium support

💰 **Harga:**
• Daily: Rp 5.000
• Weekly: Rp 25.000
• Monthly: Rp 75.000`,
    
    help: `📋 **Bantuan AnonTalk Bot**

Pilih jenis bantuan yang Anda butuhkan:
• 📋 Commands - Daftar perintah
• ❓ FAQ - Pertanyaan umum
• 🎯 How to Use - Cara menggunakan
• 🚨 Rules - Aturan penggunaan`,
    
    rooms: `🏠 **Daftar Room Tersedia**

Total: **24 rooms aktif** tersedia untuk Anda

**Room Tersedia:**
Semua room ditampilkan berdasarkan jumlah user aktif (terbanyak di atas)

Gunakan /rooms untuk melihat daftar lengkap room dengan jumlah user aktif.`,
    
    settings: `⚙️ **Pengaturan AnonTalk Bot**

Pilih pengaturan yang ingin Anda ubah:
• 👤 Avatar - Set avatar Anda
• 🔔 Notifications - Pengaturan notifikasi
• 🔒 Privacy - Privasi dan keamanan
• 🎨 Theme - Tema tampilan
• 🌍 Language - Bahasa interface
• 📱 Interface - Tampilan menu`,
    
    donate: `💝 **Donasi AnonTalk Bot**

Bantu kami mengembangkan bot ini dengan donasi:

**Pilihan Donasi:**
• 💝 Donate 5K - Rp 5.000
• 💝 Donate 10K - Rp 10.000
• 💝 Donate 25K - Rp 25.000
• 💝 Donate 50K - Rp 50.000
• 💝 Custom Amount - Jumlah custom

**Manfaat Donasi:**
• Server maintenance
• Fitur baru
• Support 24/7
• VIP benefits`
};

// Menu handler function
const handleMenu = async (ctx, menuType) => {
    try {
        const keyboard = menuKeyboards[menuType];
        const text = menuTexts[menuType];
        
        if (!keyboard || !text) {
            return ctx.reply('❌ Menu tidak ditemukan');
        }
        
        // If it's a callback query, edit the message
        if (ctx.callbackQuery) {
            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } else {
            // If it's a command, send new message
            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
        
    } catch (error) {
        console.error('Error in menu handler:', error);
        ctx.reply('❌ Terjadi kesalahan saat menampilkan menu');
    }
};

// Auto-register user with Indonesian as default language
const autoRegisterUser = async (ctx) => {
    try {
        // Check if user already exists
        const existingUser = await db.getUserByChatId(ctx.chat.id);
        
        // If user doesn't exist, register them with Indonesian as default
        if (!existingUser) {
            const newUser = {
                userid: ctx.chat.id,
                username: ctx.from.username || '',
                first_name: ctx.from.first_name || '',
                last_name: ctx.from.last_name || '',
                lang: 'Indonesia', // Default to Indonesian
                ava: '👤', // Default avatar
                registered_at: new Date().toISOString(),
                last_activity: new Date().toISOString()
            };
            
            await db.collection('users').push(newUser);
            console.log(`✅ Auto-registered user ${ctx.chat.id} with Indonesian language`);
        }
    } catch (error) {
        console.error('Error auto-registering user:', error);
    }
};

// Export menu functions
module.exports = {
    menuKeyboards,
    menuTexts,
    handleMenu,
    autoRegisterUser,
    
    // Individual menu handlers
    showMainMenu: async (ctx) => {
        await autoRegisterUser(ctx);
        return handleMenu(ctx, 'main');
    },
    showJoinMenu: async (ctx) => {
        try {
            const joinCommand = require('./join');
            await joinCommand(ctx);
        } catch (error) {
            console.error('Error showing join menu:', error);
            ctx.reply('❌ Terjadi kesalahan saat menampilkan menu join');
        }
    },
    showLanguageMenu: (ctx) => handleMenu(ctx, 'language'),
    showVipMenu: (ctx) => handleMenu(ctx, 'vip'),
    showHelpMenu: (ctx) => handleMenu(ctx, 'help'),
    showRoomsMenu: (ctx) => handleMenu(ctx, 'rooms'),
    showAvatarMenu: async (ctx) => {
        try {
            const avatarCommand = require('./avatar');
            await avatarCommand(ctx);
        } catch (error) {
            console.error('Error showing avatar menu:', error);
            ctx.reply('❌ Terjadi kesalahan saat menampilkan menu avatar');
        }
    },
    showDonateMenu: (ctx) => handleMenu(ctx, 'donate')
}; 