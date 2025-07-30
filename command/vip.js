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
            rooms: '🏠 Room VIP yang Tersedia:\n• /join vip-indo - VIP Indonesia\n• /join vip-eng - VIP English\n• /join vip-jawa - VIP Jawa\n\n',
            commands: '🛠️ Perintah VIP:\n• /create-room <nama> - Buat room custom\n• /avatar <teks> - Set avatar tanpa batas\n• /vip-stats - Lihat statistik VIP\n\n',
            status: '💎 Status: VIP Aktif\n⏰ Berlaku: Selamanya\n\n',
            thanks: '🙏 Terima kasih telah mendukung AnonTalk Bot!'
        },
        'English': {
            title: '👑 Your VIP Features\n\n',
            features: '✨ Active VIP Features:\n• 🏠 Exclusive private rooms\n• 👤 Unlimited avatar characters\n• ⚡ Priority room joining\n• 🎨 Advanced chat features\n• 🎯 Priority support\n• 📊 Private chat statistics\n• 🔒 VIP-only rooms\n• 🎬 Send videos without limits\n• 🏗️ Create custom rooms\n\n',
            rooms: '🏠 Available VIP Rooms:\n• /join vip-indo - VIP Indonesia\n• /join vip-eng - VIP English\n• /join vip-jawa - VIP Jawa\n\n',
            commands: '🛠️ VIP Commands:\n• /create-room <name> - Create custom room\n• /avatar <text> - Set unlimited avatar\n• /vip-stats - View VIP statistics\n\n',
            status: '💎 Status: VIP Active\n⏰ Valid: Forever\n\n',
            thanks: '🙏 Thank you for supporting AnonTalk Bot!'
        },
        'Jawa': {
            title: '👑 Fitur VIP Sampeyan\n\n',
            features: '✨ Fitur VIP Aktif:\n• 🏠 Kamar pribadi eksklusif\n• 👤 Avatar tanpa wates karakter\n• ⚡ Prioritas gabung kamar\n• 🎨 Fitur chat lanjutan\n• 🎯 Dhukungan prioritas\n• 📊 Statistik chat pribadi\n• 🔒 Kamar VIP khusus\n• 🎬 Kirim video tanpa wates\n• 🏗️ Gawe kamar custom\n\n',
            rooms: '🏠 Kamar VIP sing Kasedhiya:\n• /join vip-indo - VIP Indonesia\n• /join vip-eng - VIP English\n• /join vip-jawa - VIP Jawa\n\n',
            commands: '🛠️ Perintah VIP:\n• /create-room <nama> - Gawe kamar custom\n• /avatar <teks> - Set avatar tanpa wates\n• /vip-stats - Deleng statistik VIP\n\n',
            status: '💎 Status: VIP Aktif\n⏰ Berlaku: Selamane\n\n',
            thanks: '🙏 Matur nuwun wis dhukung AnonTalk Bot!'
        }
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
        'Jawa': {
            title: '👑 Fitur VIP AnonTalk Bot\n\n',
            features: '✨ Fitur VIP:\n• 🏠 Kamar pribadi eksklusif\n• 👤 Avatar tanpa wates karakter\n• ⚡ Prioritas gabung kamar\n• 🎨 Fitur chat lanjutan\n• 🎯 Dhukungan prioritas\n• 📊 Statistik chat pribadi\n• 🔒 Kamar VIP khusus\n• 🎬 Kirim video tanpa wates\n• 🏗️ Gawe kamar custom\n\n',
            benefits: '💎 Keuntungan VIP:\n• Akses menyang kamar VIP eksklusif\n• Avatar tanpa wates karakter\n• Prioritas nalika gabung kamar kebak\n• Fitur chat sing luwih canggih\n• Dhukungan pelanggan prioritas\n• Statistik panggunaan pribadi\n• Kamar nganggo kapasitas luwih gedhe\n• Kirim video tanpa wates ukuran\n• Gawe kamar custom pribadi\n\n',
            plans: '💰 Paket VIP (Rupiah):\n\n📅 Harian: Rp 5.000\n• Akses VIP 24 jam\n• Kabeh fitur VIP\n\n📅 Mingguan: Rp 25.000\n• Akses VIP 7 dina\n• Kabeh fitur VIP\n• Diskon 28%\n\n📅 Bulanan: Rp 75.000\n• Akses VIP 30 dina\n• Kabeh fitur VIP\n• Diskon 50%\n• Prioritas paling dhuwur\n\n',
            how_to: '💎 Cara entuk VIP:\nGunakake /donate kanggo milih paket lan nindakake pembayaran.\n\n',
            current_status: '❌ Status: Dudu VIP\n💡 Upgrade menyang VIP kanggo fitur eksklusif!'
        }
    };

    const message = messages[userLang] || messages['English'];
    const fullMessage = message.title + message.features + message.benefits + message.plans + message.how_to + message.current_status;
    
    await ctx.reply(fullMessage);
};

// Function to create VIP room
const createVIPRoom = async (ctx, user, roomName) => {
    try {
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!isVIP) {
            const messages = {
                'Indonesia': '❌ Hanya pengguna VIP yang dapat membuat room VIP.',
                'English': '❌ Only VIP users can create VIP rooms.',
                'Jawa': '❌ Mung pangguna VIP sing bisa gawe kamar VIP.'
            };
            
            await ctx.reply(messages[user.lang] || messages['English']);
            return;
        }

        const roomId = `vip-${Date.now()}`;
        const newRoom = {
            room: roomId,
            name: roomName,
            lang: user.lang,
            member: 1,
            private: true,
            category: 'vip',
            vip_only: true,
            created_by: user.userid
        };

        // Create VIP room
        await db.createRoom(newRoom);
        
        // Join the VIP room
        await db.updateUser(ctx.chat.id, { room: roomId });

        const messages = {
            'Indonesia': {
                title: '👑 Room VIP Dibuat!\n\n',
                info: `🏠 Room: ${roomName}\n👑 Tipe: VIP Private\n👥 Anggota: 1 (Anda)\n🌐 Bahasa: ${user.lang}\n\n`,
                features: '💎 Fitur VIP aktif!\n• Room pribadi eksklusif\n• Kapasitas lebih besar\n• Fitur chat lanjutan\n\n',
                help: '💡 Mulai chatting!\nAjak pengguna VIP lain untuk bergabung!'
            },
            'English': {
                title: '👑 VIP Room Created!\n\n',
                info: `🏠 Room: ${roomName}\n👑 Type: VIP Private\n👥 Members: 1 (You)\n🌐 Language: ${user.lang}\n\n`,
                features: '💎 VIP features active!\n• Exclusive private room\n• Larger capacity\n• Advanced chat features\n\n',
                help: '💡 Start chatting!\nInvite other VIP users to join!'
            },
            'Jawa': {
                title: '👑 Kamar VIP Digawe!\n\n',
                info: `🏠 Kamar: ${roomName}\n👑 Jenis: VIP Private\n👥 Anggota: 1 (Sampeyan)\n🌐 Basa: ${user.lang}\n\n`,
                features: '💎 Fitur VIP aktif!\n• Kamar pribadi eksklusif\n• Kapasitas luwih gedhe\n• Fitur chat lanjutan\n\n',
                help: '💡 Miwiti chatting!\nAjak pangguna VIP liyane kanggo gabung!'
            }
        };

        const message = messages[user.lang] || messages['English'];
        const fullMessage = message.title + message.info + message.features + message.help;
        
        await ctx.reply(fullMessage);
        
    } catch (error) {
        console.error("Error creating VIP room:", error);
        throw error;
    }
};

module.exports.createVIPRoom = createVIPRoom; 