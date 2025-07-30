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
        
        if (!isVIP) {
            const messages = {
                'Indonesia': '❌ Hanya pengguna VIP yang dapat membuat room custom.\n\nGunakan /vip untuk informasi lebih lanjut.',
                'English': '❌ Only VIP users can create custom rooms.\n\nUse /vip for more information.',
                'Jawa': '❌ Mung pangguna VIP sing bisa gawe kamar custom.\n\nGunakake /vip kanggo informasi luwih lanjut.'
            };
            
            await ctx.reply(messages[user.lang] || messages['English']);
            return;
        }

        const commandText = ctx.message.text;
        const roomName = commandText.includes(' ') ? commandText.split(' ').slice(1).join(' ').trim() : '';
        
        if (!roomName) {
            const messages = {
                'Indonesia': '❌ Nama room tidak boleh kosong!\n\nContoh: /create-room Nama Room Saya',
                'English': '❌ Room name cannot be empty!\n\nExample: /create-room My Room Name',
                'Jawa': '❌ Jeneng kamar ora boleh kosong!\n\nConto: /create-room Jeneng Kamar Kula'
            };
            
            await ctx.reply(messages[user.lang] || messages['English']);
            return;
        }

        if (roomName.length > 50) {
            const messages = {
                'Indonesia': '❌ Nama room terlalu panjang! Maksimal 50 karakter.',
                'English': '❌ Room name too long! Maximum 50 characters.',
                'Jawa': '❌ Jeneng kamar kakehan dawa! Maksimal 50 karakter.'
            };
            
            await ctx.reply(messages[user.lang] || messages['English']);
            return;
        }

        await createCustomRoom(ctx, user, roomName);
        
    } catch (error) {
        console.error("Error in create-room command:", error);
        await ctx.reply("An error occurred. Please try again.");
    }
};

const createCustomRoom = async (ctx, user, roomName) => {
    try {
        const roomId = `custom-${Date.now()}`;
        const newRoom = {
            room: roomId,
            name: roomName,
            lang: user.lang,
            member: 1,
            private: true,
            category: 'custom',
            vip_only: true,
            created_by: user.userid,
            created_at: new Date().toISOString()
        };

        // Create custom room
        await db.createRoom(newRoom);
        
        // Join the custom room
        await db.updateUser(ctx.chat.id, { room: roomId });

        const messages = {
            'Indonesia': {
                title: '🏗️ Room Custom Dibuat!\n\n',
                info: `🏠 Room: ${roomName}\n👑 Tipe: VIP Custom\n👥 Anggota: 1 (Anda)\n🌐 Bahasa: ${user.lang}\n🆔 ID: ${roomId}\n\n`,
                features: '💎 Fitur VIP aktif!\n• Room pribadi eksklusif\n• Kapasitas 30 anggota\n• Fitur chat lanjutan\n• Kontrol penuh atas room\n\n',
                help: '💡 Mulai chatting!\nBagikan ID room dengan pengguna VIP lain untuk bergabung!\n\n📋 Perintah Room:\n• /list - Lihat anggota\n• /exit - Keluar dari room'
            },
            'English': {
                title: '🏗️ Custom Room Created!\n\n',
                info: `🏠 Room: ${roomName}\n👑 Type: VIP Custom\n👥 Members: 1 (You)\n🌐 Language: ${user.lang}\n🆔 ID: ${roomId}\n\n`,
                features: '💎 VIP features active!\n• Exclusive private room\n• 30 member capacity\n• Advanced chat features\n• Full room control\n\n',
                help: '💡 Start chatting!\nShare room ID with other VIP users to join!\n\n📋 Room Commands:\n• /list - View members\n• /exit - Leave room'
            },
            'Jawa': {
                title: '🏗️ Kamar Custom Digawe!\n\n',
                info: `🏠 Kamar: ${roomName}\n👑 Jenis: VIP Custom\n👥 Anggota: 1 (Sampeyan)\n🌐 Basa: ${user.lang}\n🆔 ID: ${roomId}\n\n`,
                features: '💎 Fitur VIP aktif!\n• Kamar pribadi eksklusif\n• Kapasitas 30 anggota\n• Fitur chat lanjutan\n• Kontrol penuh kamar\n\n',
                help: '💡 Miwiti chatting!\nBagikake ID kamar karo pangguna VIP liyane kanggo gabung!\n\n📋 Perintah Kamar:\n• /list - Deleng anggota\n• /exit - Metu saka kamar'
            }
        };

        const message = messages[user.lang] || messages['English'];
        const fullMessage = message.title + message.info + message.features + message.help;
        
        await ctx.reply(fullMessage);
        
    } catch (error) {
        console.error("Error creating custom room:", error);
        throw error;
    }
}; 