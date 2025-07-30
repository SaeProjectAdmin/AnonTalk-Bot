const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = {
    rooms: async (ctx) => {
        try {
            const user = await db.getUserByChatId(ctx.chat.id);
            
            if (!user) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            const isVIP = await db.isUserVIP(ctx.chat.id);
            const rooms = await db.getRoomsByLanguage(user.lang);
            
            if (!rooms || rooms.length === 0) {
                return ctx.telegram.sendMessage(ctx.chat.id, "No rooms available for your language.");
            }

            // Group rooms by category
            const roomsByCategory = {};
            rooms.forEach(room => {
                if (!room.private) {
                    if (!roomsByCategory[room.category]) {
                        roomsByCategory[room.category] = [];
                    }
                    roomsByCategory[room.category].push(room);
                }
            });

            let room_list = '';
            
            // Display rooms grouped by category
            Object.keys(roomsByCategory).forEach(category => {
                const categoryInfo = db.ROOM_CATEGORIES[category];
                const categoryName = categoryInfo.name[user.lang] || categoryInfo.name['English'];
                
                room_list += `\n${categoryInfo.icon} ${categoryName}:\n`;
                
                roomsByCategory[category].forEach(room => {
                    const currentRoomIndicator = room.room === user.room ? '🏠 ' : '';
                    const vipIndicator = room.vip ? '👑 ' : '';
                    const memberInfo = `${room.member}/${room.maxMember}`;
                    const roomName = room.description || `${categoryInfo.icon} ${categoryName}`;
                    
                    room_list += `${currentRoomIndicator}${vipIndicator}${roomName} (${memberInfo})\n`;
                });
            });

            // Add VIP status information
            if (isVIP) {
                room_list += `\n👑 Status: VIP Aktif - Akses ke semua room tersedia`;
            } else {
                room_list += `\n💡 Upgrade ke VIP untuk akses room eksklusif`;
            }

            await ctx.telegram.sendMessage(
                ctx.chat.id,
                `${lang(user.lang, room_list).rooms}`
            ).catch(() => false);

        } catch (err) {
            console.error("Error fetching rooms:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while fetching rooms.");
        }
    },

    list: async (ctx) => {
        try {
            const user = await db.getUserByChatId(ctx.chat.id);
            
            if (!user) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            if (user.room) {
                const roomUserSnapshot = await db.collection('users').orderByChild('room').equalTo(user.room).once('value');
                const roomUserData = roomUserSnapshot.val();

                let people_list = '';
                if (roomUserData) {
                    Object.values(roomUserData).forEach((person) => {
                        people_list += `${person.ava || '👤'}, `;
                    });
                    people_list = people_list.slice(0, -2); // Remove the trailing comma and space
                }

                await ctx.telegram.sendMessage(
                    ctx.chat.id,
                    `${lang(user.lang, people_list).list}`
                ).catch(() => false);
            } else {
                await ctx.telegram.sendMessage(
                    ctx.chat.id,
                    `${lang(user.lang).not_in_room}`
                ).catch(() => false);
            }

        } catch (err) {
            console.error("Error fetching room members:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while fetching room members.");
        }
    },

    donate: async (ctx) => {
        try {
            const user = await db.getUserByChatId(ctx.chat.id);
            
            if (!user) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            const donateUrl = `https://anontalkid.my.to/donasi/new.php?id=${ctx.chat.id}`;
            
            const messages = {
                'Indonesia': {
                    title: '💝 Dukung AnonTalk Bot\n\n',
                    description: 'Dukung pengembangan bot ini dengan memberikan donasi. Setiap donasi akan membantu kami untuk:\n\n',
                    benefits: '✨ Manfaat Donasi:\n• 🚀 Pengembangan fitur baru\n• 🔧 Perbaikan bug dan error\n• 📱 Peningkatan performa bot\n• 🎨 UI/UX yang lebih baik\n• 🌐 Dukungan bahasa tambahan\n\n',
                    packages: '💰 Paket Donasi:\n\n📅 Harian: Rp 5.000\n• Akses VIP 24 jam\n• Semua fitur VIP\n\n📅 Mingguan: Rp 25.000\n• Akses VIP 7 hari\n• Semua fitur VIP\n• Diskon 28%\n\n📅 Bulanan: Rp 75.000\n• Akses VIP 30 hari\n• Semua fitur VIP\n• Diskon 50%\n• Prioritas tertinggi\n\n',
                    how_to: '💳 Cara Donasi:\n1. Klik tombol di bawah\n2. Pilih paket yang diinginkan\n3. Lakukan pembayaran\n4. Nikmati fitur VIP!\n\n',
                    thanks: '🙏 Terima kasih atas dukungannya!'
                },
                'English': {
                    title: '💝 Support AnonTalk Bot\n\n',
                    description: 'Support the development of this bot by making a donation. Every donation will help us to:\n\n',
                    benefits: '✨ Donation Benefits:\n• 🚀 Develop new features\n• 🔧 Fix bugs and errors\n• 📱 Improve bot performance\n• 🎨 Better UI/UX\n• 🌐 Add language support\n\n',
                    packages: '💰 Donation Packages:\n\n📅 Daily: Rp 5.000\n• VIP access for 24 hours\n• All VIP features\n\n📅 Weekly: Rp 25.000\n• VIP access for 7 days\n• All VIP features\n• 28% discount\n\n📅 Monthly: Rp 75.000\n• VIP access for 30 days\n• All VIP features\n• 50% discount\n• Highest priority\n\n',
                    how_to: '💳 How to Donate:\n1. Click the button below\n2. Choose your package\n3. Make payment\n4. Enjoy VIP features!\n\n',
                    thanks: '🙏 Thank you for your support!'
                },

            };

            const message = messages[user.lang] || messages['English'];
            const fullMessage = message.title + message.description + message.benefits + message.packages + message.how_to + message.thanks;

            await ctx.telegram.sendMessage(ctx.chat.id, fullMessage, {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '💳 Donasi Sekarang / Donate Now',
                            url: donateUrl
                        }
                    ]]
                }
            }).catch(() => false);

        } catch (err) {
            console.error("Error in donate command:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while processing donation.");
        }
    }
};
