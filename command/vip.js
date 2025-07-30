const db = require('../db');
const lang = require('../lang');

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            await ctx.reply('User not found. Please try /start again.');
            return;
        }

        if (!user.lang || user.lang === '') {
            await ctx.reply('Please set your language first with /lang command.');
            return;
        }

        const isVIP = await db.isUserVIP(ctx.chat.id);
        const userLang = user.lang;

        if (isVIP) {
            await showVIPFeatures(ctx, userLang);
        } else {
            await showVIPInfo(ctx, userLang);
        }
    } catch (error) {
        console.error("Error in VIP command:", error);
        await ctx.reply("An error occurred. Please try again.");
    }
};

const showVIPFeatures = async (ctx, userLang) => {
    const messages = {
        'Indonesia': {
            title: '👑 Fitur VIP Anda\n\n',
            features: '✨ Fitur VIP Aktif:\n• 🏠 Room pribadi eksklusif\n• 👤 Avatar tanpa batas karakter\n• ⚡ Prioritas join room\n• 🎨 Fitur chat lanjutan\n• 🎯 Dukungan prioritas\n• 📊 Statistik chat pribadi\n• 🔒 Room VIP khusus\n• 🎬 Kirim video tanpa batas\n• 🏗️ Buat room custom\n\n',
            rooms: '🏠 Room VIP yang Tersedia:\n• /join - Pilih kategori room\n• 👑 Room VIP untuk setiap bahasa\n• ⚡ Prioritas saat room penuh\n• 📈 Kapasitas 30 anggota (vs 20 regular)\n\n',
            commands: '🛠️ Perintah VIP:\n• /join - Join room dengan kategori\n• /create-room <nama> - Buat room custom\n• /avatar <teks> - Set avatar tanpa batas\n• /vip-stats - Lihat statistik VIP\n• /rooms - Lihat semua room\n\n',
            status: '💎 Status: VIP Aktif\n⏰ Berlaku: Selamanya\n\n',
            thanks: '🙏 Terima kasih telah mendukung AnonTalk Bot!'
        },
        'English': {
            title: '👑 Your VIP Features\n\n',
            features: '✨ Active VIP Features:\n• 🏠 Exclusive private rooms\n• 👤 Unlimited avatar characters\n• ⚡ Priority room joining\n• 🎨 Advanced chat features\n• 🎯 Priority support\n• 📊 Private chat statistics\n• 🔒 VIP-only rooms\n• 🎬 Send videos without limits\n• 🏗️ Create custom rooms\n\n',
            rooms: '🏠 Available VIP Rooms:\n• /join - Choose room category\n• 👑 VIP rooms for each language\n• ⚡ Priority when rooms are full\n• 📈 30 member capacity (vs 20 regular)\n\n',
            commands: '🛠️ VIP Commands:\n• /join - Join rooms by category\n• /create-room <name> - Create custom room\n• /avatar <text> - Set unlimited avatar\n• /vip-stats - View VIP statistics\n• /rooms - View all rooms\n\n',
            status: '💎 Status: VIP Active\n⏰ Valid: Forever\n\n',
            thanks: '🙏 Thank you for supporting AnonTalk Bot!'
        },

    };

    const message = messages[userLang] || messages['English'];
    const fullMessage = message.title + message.features + message.rooms + message.commands + message.status + message.thanks;
    
    await ctx.reply(fullMessage);
};

const showVIPInfo = async (ctx, userLang) => {
    const messages = {
        'Indonesia': {
            title: '👑 Fitur VIP AnonTalk Bot\n\n',
            features: '✨ Fitur VIP:\n• 🏠 Room pribadi eksklusif\n• 👤 Avatar tanpa batas karakter\n• ⚡ Prioritas join room\n• 🎨 Fitur chat lanjutan\n• 🎯 Dukungan prioritas\n• 📊 Statistik chat pribadi\n• 🔒 Room VIP khusus\n• 🎬 Kirim video tanpa batas\n• 🏗️ Buat room custom\n\n',
            benefits: '💎 Keuntungan VIP:\n• Akses ke room VIP eksklusif\n• Avatar tanpa batas karakter\n• Prioritas saat join room penuh\n• Fitur chat yang lebih canggih\n• Dukungan pelanggan prioritas\n• Statistik penggunaan pribadi\n• Room dengan kapasitas lebih besar\n• Kirim video tanpa batas ukuran\n• Buat room custom pribadi\n\n',
            plans: '💰 Paket VIP (Rupiah):\n\n📅 Harian: Rp 5.000\n• Akses VIP 24 jam\n• Semua fitur VIP\n\n📅 Mingguan: Rp 25.000\n• Akses VIP 7 hari\n• Semua fitur VIP\n• Diskon 28%\n\n📅 Bulanan: Rp 75.000\n• Akses VIP 30 hari\n• Semua fitur VIP\n• Diskon 50%\n• Prioritas tertinggi\n\n',
            how_to: '💎 Cara mendapatkan VIP:\nGunakan /donate untuk memilih paket dan melakukan pembayaran.\n\n',
            current_status: '❌ Status: Bukan VIP\n💡 Upgrade ke VIP untuk fitur eksklusif!'
        },
        'English': {
            title: '👑 AnonTalk Bot VIP Features\n\n',
            features: '✨ VIP Features:\n• 🏠 Exclusive private rooms\n• 👤 Unlimited avatar characters\n• ⚡ Priority room joining\n• 🎨 Advanced chat features\n• 🎯 Priority support\n• 📊 Private chat statistics\n• 🔒 VIP-only rooms\n• 🎬 Send videos without limits\n• 🏗️ Create custom rooms\n\n',
            benefits: '💎 VIP Benefits:\n• Access to exclusive VIP rooms\n• Unlimited avatar characters\n• Priority when joining full rooms\n• More advanced chat features\n• Priority customer support\n• Private usage statistics\n• Rooms with larger capacity\n• Send videos without size limits\n• Create custom private rooms\n\n',
            plans: '💰 VIP Packages (Rupiah):\n\n📅 Daily: Rp 5.000\n• VIP access for 24 hours\n• All VIP features\n\n📅 Weekly: Rp 25.000\n• VIP access for 7 days\n• All VIP features\n• 28% discount\n\n📅 Monthly: Rp 75.000\n• VIP access for 30 days\n• All VIP features\n• 50% discount\n• Highest priority\n\n',
            how_to: '💎 How to get VIP:\nUse /donate to choose a package and make payment.\n\n',
            current_status: '❌ Status: Not VIP\n💡 Upgrade to VIP for exclusive features!'
        },

    };

    const message = messages[userLang] || messages['English'];
    const fullMessage = message.title + message.features + message.benefits + message.plans + message.how_to + message.current_status;
    
    await ctx.reply(fullMessage);
};

// Handle VIP room creation
module.exports.createVIPRoom = async (ctx, roomName) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.reply('User not found. Please try /start again.');
        }
        
        if (!isVIP) {
            return ctx.reply('Only VIP users can create custom rooms. Use /vip to learn more.');
        }
        
        if (!roomName || roomName.trim() === '') {
            return ctx.reply('Please provide a room name. Usage: /create-room <room_name>');
        }
        
        const roomData = {
            lang: user.lang,
            category: 'vip',
            description: `👑 ${roomName} (VIP)`,
            createdBy: ctx.chat.id,
            maxMember: 30,
            private: false,
            vip: true
        };
        
        const newRoom = await db.createCustomRoom(roomData);
        
        if (newRoom) {
            const successMessage = lang(user.lang, roomName).custom_room_created;
            await ctx.reply(successMessage);
            
            // Auto-join the created room
            const joinCommand = require('./join');
            await joinCommand.handleRoomCallback(ctx, newRoom.room);
        } else {
            await ctx.reply('Failed to create room. Please try again.');
        }
        
    } catch (error) {
        console.error("Error creating VIP room:", error);
        await ctx.reply("An error occurred while creating the room.");
    }
};

// Handle VIP statistics
module.exports.showVIPStats = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.reply('User not found. Please try /start again.');
        }
        
        if (!isVIP) {
            return ctx.reply('Only VIP users can view VIP statistics. Use /vip to learn more.');
        }
        
        // Get real user statistics from Firebase
        const stats = await db.getUserStatistics(ctx.chat.id);
        
        // Format VIP since date
        const vipSinceText = stats.vipSince 
            ? new Date(stats.vipSince).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown';
        
        // Format join date
        const joinDateText = stats.joinDate 
            ? new Date(stats.joinDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown';
        
        const statsMessage = `📊 VIP Statistics for ${user.ava || 'User'}:\n\n` +
            `🏠 Total Rooms Joined: ${stats.totalRoomsJoined}\n` +
            `👑 VIP Rooms Accessed: ${stats.vipRoomsAccessed}\n` +
            `💬 Total Messages: ${stats.totalMessages}\n` +
            `⏰ VIP Since: ${vipSinceText}\n` +
            `📅 Member Since: ${joinDateText}\n\n` +
            `💎 Status: VIP Active`;
        
        await ctx.reply(statsMessage);
        
    } catch (error) {
        console.error("Error showing VIP stats:", error);
        await ctx.reply("An error occurred while fetching VIP statistics.");
    }
}; 