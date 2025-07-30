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

            // Get real-time user count for each room
            const roomsWithRealCount = await Promise.all(rooms.map(async (room) => {
                try {
                    // Count users currently in this room
                    const roomUsersSnapshot = await db.adminDb.ref('users').orderByChild('room').equalTo(room.room).once('value');
                    const roomUsers = roomUsersSnapshot.val();
                    const realMemberCount = roomUsers ? Object.keys(roomUsers).length : 0;
                    
                    return {
                        ...room,
                        realMember: realMemberCount
                    };
                } catch (error) {
                    console.error(`Error counting users in room ${room.room}:`, error);
                    return {
                        ...room,
                        realMember: room.member || 0
                    };
                }
            }));

            // Filter out private rooms and sort by real member count (most active first)
            const publicRooms = roomsWithRealCount
                .filter(room => !room.private)
                .sort((a, b) => b.realMember - a.realMember);

            let room_list = '';
            let totalRooms = 0;
            let totalUsers = 0;
            
            // Display all rooms in a single list without categories
            publicRooms.forEach((room, index) => {
                const currentRoomIndicator = room.room === user.room ? '🏠 ' : '';
                const vipIndicator = room.vip ? '👑 ' : '';
                const roomName = room.description || `${db.ROOM_CATEGORIES[room.category]?.icon || '📁'} ${db.ROOM_CATEGORIES[room.category]?.name[user.lang] || db.ROOM_CATEGORIES[room.category]?.name['English'] || room.category}`;
                
                // Use real member count instead of stored count
                const memberInfo = `${room.realMember}/${room.maxMember}`;
                totalRooms++;
                totalUsers += room.realMember;
                
                // Add room number for better organization
                const roomNumber = (index + 1).toString().padStart(2, '0');
                room_list += `${roomNumber}. ${currentRoomIndicator}${vipIndicator}${roomName} (${memberInfo})\n`;
            });

            // Add summary information
            const summaryText = user.lang === 'Indonesia' ? 
                `\n📊 **Ringkasan:**\n🏠 Total Room: ${totalRooms}\n👥 Total User: ${totalUsers}\n` :
                `\n📊 **Summary:**\n🏠 Total Rooms: ${totalRooms}\n👥 Total Users: ${totalUsers}\n`;

            // Add VIP status information
            if (isVIP) {
                room_list += `\n👑 Status: VIP Aktif - Akses ke semua room tersedia`;
            } else {
                room_list += `\n💡 Upgrade ke VIP untuk akses room eksklusif`;
            }

            const fullMessage = `${lang(user.lang, room_list).rooms}${summaryText}`;

            await ctx.telegram.sendMessage(
                ctx.chat.id,
                fullMessage,
                { parse_mode: 'Markdown' }
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
                const roomUserSnapshot = await db.adminDb.ref('users').orderByChild('room').equalTo(user.room).once('value');
                const roomUserData = roomUserSnapshot.val();

                let people_list = '';
                let userCount = 0;
                let vipCount = 0;
                
                if (roomUserData) {
                    // Get VIP status for all users in the room
                    const usersWithVIP = await Promise.all(
                        Object.values(roomUserData).map(async (person) => {
                            const isVIP = await db.isUserVIP(person.userid);
                            return { ...person, isVIP };
                        })
                    );

                    // Sort users: VIP first, then by join time
                    usersWithVIP.sort((a, b) => {
                        if (a.isVIP && !b.isVIP) return -1;
                        if (!a.isVIP && b.isVIP) return 1;
                        return (a.joinDate || 0) - (b.joinDate || 0);
                    });

                    usersWithVIP.forEach((person) => {
                        const vipBadge = person.isVIP ? '👑' : '';
                        const avatar = person.ava || '👤';
                        people_list += `${vipBadge}${avatar} `;
                        userCount++;
                        if (person.isVIP) vipCount++;
                    });
                    
                    people_list = people_list.trim(); // Remove trailing space
                }

                // Get room information
                const roomSnapshot = await db.adminDb.ref('rooms').child(user.room).once('value');
                const roomData = roomSnapshot.val();
                const roomName = roomData ? (roomData.description || 'Unknown Room') : 'Unknown Room';
                const maxMembers = roomData ? roomData.maxMember : 20;

                // Create detailed message
                const message = user.lang === 'Indonesia' ?
                    `🏠 **Room:** ${roomName}\n👥 **User dalam room:** ${userCount}/${maxMembers}\n\n${people_list}\n\n👑 VIP: ${vipCount} user` :
                    `🏠 **Room:** ${roomName}\n👥 **Users in room:** ${userCount}/${maxMembers}\n\n${people_list}\n\n👑 VIP: ${vipCount} users`;

                await ctx.telegram.sendMessage(
                    ctx.chat.id,
                    message,
                    { parse_mode: 'Markdown' }
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
