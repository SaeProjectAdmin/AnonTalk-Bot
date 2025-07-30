const menu = require('./menu');
const db = require('../db');

// Callback handler for menu interactions
const handleMenuCallbacks = async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        console.log('🔘 Menu callback:', callbackData, 'from:', ctx.from.id);
        
        // Answer callback query to remove loading state
        await ctx.answerCbQuery();
        
        // Handle different menu types
        switch (callbackData) {
            // Main menu navigation
            case 'menu_main':
                await menu.showMainMenu(ctx);
                break;
                
            case 'menu_join':
                await menu.showJoinMenu(ctx);
                break;
                
            case 'menu_lang':
                await menu.showLanguageMenu(ctx);
                break;
                

                
            case 'menu_help':
                await menu.showHelpMenu(ctx);
                break;
                
            case 'menu_rooms':
                await menu.showRoomsMenu(ctx);
                break;
                
            case 'menu_avatar':
                await menu.showAvatarMenu(ctx);
                break;
                
            case 'menu_donate':
                await menu.showDonateMenu(ctx);
                break;
                
            case 'menu_stats':
                await handleStats(ctx);
                break;
                
            // Avatar callbacks
            case 'avatar_custom':
            case 'avatar_remove':
            case 'avatar_back':
                await handleAvatarCallback(ctx, callbackData.replace('avatar_', ''));
                break;
                
            // Join room callbacks
            case 'join_random_room':
                await handleRandomRoom(ctx);
                break;
                
            case 'join_gaming':
            case 'join_general':
            case 'join_education':
            case 'join_music':
            case 'join_entertainment':
            case 'join_technology':
            case 'join_sports':
            case 'join_food':
            case 'join_travel':
                await handleJoinRoom(ctx, callbackData.replace('join_', ''));
                break;
                
            // Language callbacks
            case 'lang_id':
            case 'lang_en':
            case 'lang_jw':
                await handleLanguageChange(ctx, callbackData.replace('lang_', ''));
                break;
                

                
            // Help callbacks
            case 'help_commands':
                await handleHelpCommands(ctx);
                break;
                
            case 'help_faq':
                await handleHelpFaq(ctx);
                break;
                
            case 'help_howto':
                await handleHelpHowto(ctx);
                break;
                
            case 'help_rules':
                await handleHelpRules(ctx);
                break;
                
            // Rooms callbacks
            case 'rooms_gaming':
            case 'rooms_general':
            case 'rooms_education':
            case 'rooms_music':
            case 'rooms_entertainment':
            case 'rooms_technology':
            case 'rooms_sports':
            case 'rooms_food':
            case 'rooms_travel':
                await handleRoomsList(ctx, callbackData.replace('rooms_', ''));
                break;
                
            // Settings callbacks
            case 'settings_avatar':
            case 'settings_notifications':
            case 'settings_privacy':
            case 'settings_theme':
            case 'settings_language':
            case 'settings_interface':
                await handleSettings(ctx, callbackData.replace('settings_', ''));
                break;
                
            // Donate callbacks
            case 'donate_5k':
            case 'donate_10k':
            case 'donate_25k':
            case 'donate_50k':
                await handleDonate(ctx, callbackData.replace('donate_', ''));
                break;
                
            case 'donate_custom':
                await handleDonateCustom(ctx);
                break;
                
            default:
                // Handle avatar selections
                if (callbackData.startsWith('avatar_')) {
                    const avatarType = callbackData.replace('avatar_', '');
                    await handleAvatarCallback(ctx, avatarType);
                } else {
                    await ctx.reply('❌ Menu tidak ditemukan');
                }
        }
        
    } catch (error) {
        console.error('Error in menu callback handler:', error);
        await ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
};

// Individual callback handlers
const handleStats = async (ctx) => {
    try {
        // Get real statistics from Firebase
        const stats = await db.getBotStatistics();
        
        // Format uptime
        const uptimeHours = Math.floor(stats.uptime / 3600);
        const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60);
        const uptimeText = `${uptimeHours}h ${uptimeMinutes}m`;
        
        // Format top categories
        const topCategoriesText = stats.topCategories.length > 0 
            ? stats.topCategories.map((cat, index) => 
                `${index + 1}. ${cat.icon} ${cat.category} - ${cat.count} users`
              ).join('\n')
            : 'No data available';
        
        const statsText = `📊 **Statistik AnonTalk Bot**

👥 **Users:** ${stats.totalUsers} total, ${stats.activeUsers} active
🏠 **Rooms:** ${stats.totalRooms} total, ${stats.activeRooms} active
💎 **VIP Users:** ${stats.vipUsers} users
🌍 **Languages:** 2 supported
📱 **Uptime:** ${uptimeText}
💬 **Messages:** ${stats.totalMessages} total

**Top Categories:**
${topCategoriesText}`;
        
        await ctx.editMessageText(statsText, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                ]
            }
        });
    } catch (error) {
        console.error('Error getting statistics:', error);
        await ctx.editMessageText('❌ Error loading statistics. Please try again.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                ]
            }
        });
    }
};

const handleJoinRoom = async (ctx, category) => {
    const categoryNames = {
        'gaming': 'Gaming',
        'general': 'General',
        'education': 'Education',
        'music': 'Music',
        'entertainment': 'Entertainment',
        'technology': 'Technology',
        'sports': 'Sports',
        'food': 'Food',
        'travel': 'Travel'
    };
    
    const categoryName = categoryNames[category] || category;
    
    const roomText = `🏠 **Join ${categoryName} Room**

Pilih room yang ingin Anda masuki:

**${categoryName} Rooms:**
• ${categoryName} Room 1 (12 users)
• ${categoryName} Room 2 (8 users)
• ${categoryName} Room 3 (15 users)

⚠️ **Note:** Fitur join room akan segera tersedia!`;
    
    await ctx.editMessageText(roomText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Join Menu', callback_data: 'menu_join' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleAvatarCallback = async (ctx, avatarType) => {
    try {
        const avatarCommand = require('./avatar');
        await avatarCommand.handleAvatarCallback(ctx, avatarType);
    } catch (error) {
        console.error("Error handling avatar callback:", error);
        await ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

const handleRandomRoom = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.editMessageText("❌ User not found. Please try /start again.", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
        }
        
        // Get all rooms for user's language (ignore category)
        const rooms = await db.getRoomsByLanguage(user.lang);
        
        if (rooms.length === 0) {
            return ctx.editMessageText("❌ No rooms available for your language.", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
        }
        
        // Filter available rooms (non-VIP rooms for non-VIP users, all rooms for VIP users)
        const availableRooms = rooms.filter(room => {
            if (room.vip && !isVIP) return false;
            return room.member < room.maxMember;
        });
        
        if (availableRooms.length === 0) {
            const message = isVIP ? 
                "❌ All rooms are full." : 
                "❌ All available rooms are VIP-only. Upgrade to VIP to access.";
            return ctx.editMessageText(message, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
        }
        
        // Select a random room
        const randomIndex = Math.floor(Math.random() * availableRooms.length);
        const randomRoom = availableRooms[randomIndex];
        
        // Get category info for display
        const categoryInfo = db.ROOM_CATEGORIES[randomRoom.category];
        const categoryName = categoryInfo ? (categoryInfo.name[user.lang] || categoryInfo.name['English']) : randomRoom.category;
        
        const randomText = `🎲 **Random Room Joined!**

✅ **Room:** ${randomRoom.description || `${categoryInfo?.icon || '🏠'} ${categoryName}`}
📂 **Category:** ${categoryName}
👥 **Members:** ${randomRoom.member + 1}/${randomRoom.maxMember}
${randomRoom.vip ? '👑 **VIP Room**' : ''}

🎉 **Selamat!** Anda telah bergabung dengan room acak!`;
        
        // Actually join the room (call the join function)
        const joinCommand = require('./join');
        await joinCommand(ctx);
        
        // Update the message after joining
        await ctx.editMessageText(randomText, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🎲 Join Random Room', callback_data: 'join_random_room' }],
                    [{ text: '🔙 Back to Join Menu', callback_data: 'menu_join' }],
                    [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
                ]
            }
        });
        
    } catch (error) {
        console.error("Error handling random room:", error);
        await ctx.editMessageText("❌ An error occurred while joining random room. Please try again.", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
                ]
            }
        });
    }
};

const handleLanguageChange = async (ctx, lang) => {
    const langNames = {
        'id': 'Indonesia',
        'en': 'English',
    };
    
    const langName = langNames[lang] || lang;
    
    // Save language preference to database (use full language name)
    try {
        const dbuser = db.collection('users');
        await dbuser.doc(ctx.chat.id.toString()).set({
            lang: langName, // Save full language name instead of short code
            userid: ctx.chat.id,
            username: ctx.from.username || '',
            first_name: ctx.from.first_name || '',
            last_name: ctx.from.last_name || '',
            registered_at: new Date().toISOString(),
            lastLangChange: new Date().toISOString()
        }, { merge: true });
    } catch (dbError) {
        console.log('Language save skipped:', dbError.message);
    }
    
    const langText = `🌍 **Bahasa Diubah**

✅ Bahasa berhasil diubah ke: **${langName}**

Bot akan menggunakan bahasa ${langName} untuk semua pesan selanjutnya.`;
    
    await ctx.editMessageText(langText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleVipPurchase = async (ctx, period) => {
    const prices = {
        'daily': 'Rp 5.000',
        'weekly': 'Rp 25.000',
        'monthly': 'Rp 75.000'
    };
    
    const price = prices[period] || 'Custom';
    
    const vipText = `💎 **VIP ${period.charAt(0).toUpperCase() + period.slice(1)}**

💰 **Harga:** ${price}

✨ **Fitur yang didapat:**
• Buat room pribadi
• Priority access
• Custom avatar
• Unlimited rooms
• Premium support

📞 **Untuk pembayaran, hubungi admin:**
@admin_anontalk`;
    
    await ctx.editMessageText(vipText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '💳 Bayar Sekarang', callback_data: `pay_${period}` }],
                [{ text: '🔙 Back to VIP Menu', callback_data: 'menu_vip' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleVipFeatures = async (ctx) => {
    const featuresText = `✨ **VIP Features**

🎯 **Exclusive Features:**
• 🏠 Create private rooms
• ⚡ Priority access to all rooms
• 👤 Custom avatar & nickname
• 🔢 Unlimited room joining
• 🎨 Premium themes
• 📞 Priority support
• 🎁 Monthly rewards
• 🔒 Enhanced privacy

💎 **VIP Benefits:**
• No ads
• No waiting time
• Custom room themes
• Advanced search
• Export chat history
• Priority customer support`;
    
    await ctx.editMessageText(featuresText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to VIP Menu', callback_data: 'menu_vip' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleVipPricing = async (ctx) => {
    const pricingText = `💰 **VIP Pricing**

💎 **Daily VIP:** Rp 5.000
• 24 jam akses VIP
• Semua fitur VIP

💎 **Weekly VIP:** Rp 25.000
• 7 hari akses VIP
• Semua fitur VIP
• Bonus 2 hari extra

💎 **Monthly VIP:** Rp 75.000
• 30 hari akses VIP
• Semua fitur VIP
• Bonus 7 hari extra
• Priority support

🎁 **Special Offers:**
• 3 bulan: Rp 200.000 (hemat Rp 25.000)
• 6 bulan: Rp 350.000 (hemat Rp 100.000)
• 1 tahun: Rp 600.000 (hemat Rp 300.000)`;
    
    await ctx.editMessageText(pricingText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to VIP Menu', callback_data: 'menu_vip' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleHelpCommands = async (ctx) => {
    const commandsText = `📋 **Commands AnonTalk Bot**

🎯 **Basic Commands:**
/start - Start bot
/menu - Show main menu
/help - Show help
/lang - Change language

🏠 **Room Commands:**
/join - Join room
/rooms - Show room list
/exit - Exit room
/list - Show room users

⚙️ **Settings Commands:**
/avatar - Set avatar
/settings - Open settings
/cancel - Cancel action

💎 **VIP Commands:**
/vip - VIP info
/create-room - Create private room
/donate - Donate

💝 **Other Commands:**
/stats - Show statistics
/about - About bot`;
    
    await ctx.editMessageText(commandsText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Help Menu', callback_data: 'menu_help' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleHelpFaq = async (ctx) => {
    const faqText = `❓ **FAQ AnonTalk Bot**

**Q: Bagaimana cara masuk room?**
A: Gunakan /join atau menu "Join Room"

**Q: Apakah chat benar-benar anonymous?**
A: Ya, semua chat di room bersifat anonymous

**Q: Bagaimana cara menjadi VIP?**
A: Gunakan menu "VIP Info" atau /vip

**Q: Bisa buat room sendiri?**
A: Ya, dengan fitur VIP Anda bisa buat room pribadi

**Q: Ada berapa room?**
A: Total 24 rooms aktif di 9 kategori

**Q: Bisa ganti bahasa?**
A: Ya, gunakan menu "Language" atau /lang

**Q: Ada fitur apa saja?**
A: Chat anonymous, VIP features, multi-language, media support`;
    
    await ctx.editMessageText(faqText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Help Menu', callback_data: 'menu_help' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleHelpHowto = async (ctx) => {
    const howtoText = `🎯 **Cara Menggunakan AnonTalk Bot**

**1. Mulai Bot**
• Kirim /start atau /menu
• Pilih menu yang diinginkan

**2. Join Room**
• Pilih menu "Join Room"
• Pilih kategori room
• Pilih room yang diinginkan

**3. Chat Anonymous**
• Chat di room bersifat anonymous
• Username tidak akan terlihat
• Avatar bisa diatur sendiri

**4. Ganti Bahasa**
• Pilih menu "Language"
• Pilih bahasa yang diinginkan
• Bot akan menggunakan bahasa tersebut

**5. VIP Features**
• Pilih menu "VIP Info"
• Pilih paket VIP
• Hubungi admin untuk pembayaran`;
    
    await ctx.editMessageText(howtoText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Help Menu', callback_data: 'menu_help' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleHelpRules = async (ctx) => {
    const rulesText = `🚨 **Rules AnonTalk Bot**

**✅ Yang Diperbolehkan:**
• Chat sopan dan santun
• Berbagi informasi bermanfaat
• Menghormati privacy user lain
• Menggunakan bahasa yang sopan

**❌ Yang Dilarang:**
• Spam dan flood
• Konten dewasa/18+
• Hate speech dan bullying
• Promosi berlebihan
• Share link berbahaya
• Impersonation admin

**⚠️ Sanksi:**
• Warning (3x)
• Mute (1-24 jam)
• Ban permanent

**📞 Report:**
Jika ada user melanggar, hubungi admin.`;
    
    await ctx.editMessageText(rulesText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Help Menu', callback_data: 'menu_help' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleRoomsList = async (ctx, category) => {
    const categoryNames = {
        'gaming': 'Gaming',
        'general': 'General',
        'education': 'Education',
        'music': 'Music',
        'entertainment': 'Entertainment',
        'technology': 'Technology',
        'sports': 'Sports',
        'food': 'Food',
        'travel': 'Travel'
    };
    
    const categoryName = categoryNames[category] || category;
    
    const roomsText = `🏠 **${categoryName} Rooms**

**Available Rooms:**
• ${categoryName} Room 1 (12 users)
• ${categoryName} Room 2 (8 users)
• ${categoryName} Room 3 (15 users)

**Room Features:**
• Anonymous chat
• Media sharing
• Voice messages
• File sharing
• Emoji support

**Join Room:**
Gunakan menu "Join Room" untuk masuk ke room.`;
    
    await ctx.editMessageText(roomsText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Rooms Menu', callback_data: 'menu_rooms' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleSettings = async (ctx, setting) => {
    const settingNames = {
        'avatar': 'Avatar',
        'notifications': 'Notifications',
        'privacy': 'Privacy',
        'theme': 'Theme',
        'language': 'Language',
        'interface': 'Interface'
    };
    
    const settingName = settingNames[setting] || setting;
    
    // Handle avatar setting specifically
    if (setting === 'avatar') {
        try {
            const avatarCommand = require('./avatar');
            await avatarCommand(ctx);
        } catch (error) {
            console.error('Error handling avatar setting:', error);
            await ctx.editMessageText('❌ Error loading avatar settings. Please try again.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Back to Settings Menu', callback_data: 'menu_settings' }],
                        [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
                    ]
                }
            });
        }
        return;
    }
    
    // Handle other settings (coming soon)
    const settingText = `⚙️ **${settingName} Settings**

Pengaturan ${settingName} akan segera tersedia!

**Coming Soon:**
• Custom avatar upload
• Notification preferences
• Privacy controls
• Theme selection
• Language settings
• Interface customization`;
    
    await ctx.editMessageText(settingText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Settings Menu', callback_data: 'menu_settings' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleDonate = async (ctx, amount) => {
    const amounts = {
        '5k': 'Rp 5.000',
        '10k': 'Rp 10.000',
        '25k': 'Rp 25.000',
        '50k': 'Rp 50.000'
    };
    
    const amountText = amounts[amount] || amount;
    
    const donateText = `💝 **Donasi ${amountText}**

Terima kasih atas donasi Anda!

**Metode Pembayaran:**
• DANA: 081234567890
• OVO: 081234567890
• GoPay: 081234567890
• Bank Transfer: 1234567890

**Manfaat Donasi:**
• Server maintenance
• Fitur baru
• Support 24/7
• VIP benefits

📞 **Hubungi admin untuk konfirmasi:** @admin_anontalk`;
    
    await ctx.editMessageText(donateText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Donate Menu', callback_data: 'menu_donate' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

const handleDonateCustom = async (ctx) => {
    const customText = `💝 **Custom Donation**

Kirim jumlah donasi yang Anda inginkan.

**Contoh:**
• Rp 15.000
• Rp 30.000
• Rp 100.000

**Metode Pembayaran:**
• DANA: 081234567890
• OVO: 081234567890
• GoPay: 081234567890
• Bank Transfer: 1234567890

📞 **Hubungi admin:** @admin_anontalk`;
    
    await ctx.editMessageText(customText, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Back to Donate Menu', callback_data: 'menu_donate' }],
                [{ text: '🏠 Back to Main Menu', callback_data: 'menu_main' }]
            ]
        }
    });
};

module.exports = {
    handleMenuCallbacks
}; 