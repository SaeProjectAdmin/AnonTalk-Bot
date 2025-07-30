const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = {
    rooms: async (ctx) => {
        try {
            const dbuser = db.collection('users');
            const userSnapshot = await dbuser.orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();

            if (!userData) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            const userIdKey = Object.keys(userData)[0];
            const user = userData[userIdKey];

            const dbroom = db.collection('rooms');
            const roomSnapshot = await dbroom.orderByChild('lang').equalTo(user.lang).once('value');
            const roomData = roomSnapshot.val();

            let room_list = '';
            if (roomData) {
                Object.values(roomData).forEach((room) => {
                    if (!room.private) {
                        room_list += `${room.room} ${room.room === user.room ? '(🏠)' : ''}\n`;
                    }
                });
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
            const dbuser = db.collection('users');
            const userSnapshot = await dbuser.orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();

            if (!userData) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            const userIdKey = Object.keys(userData)[0];
            const user = userData[userIdKey];

            if (user.room) {
                const roomUserSnapshot = await dbuser.orderByChild('room').equalTo(user.room).once('value');
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
            const dbuser = db.collection('users');
            const userSnapshot = await dbuser.orderByChild('userid').equalTo(ctx.chat.id).once('value');
            const userData = userSnapshot.val();

            if (!userData) {
                return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
            }

            const userIdKey = Object.keys(userData)[0];
            const user = userData[userIdKey];

            const donateUrl = `https://anontalkid.my.to/donasi/new.php?id=${ctx.chat.id}`;
            
            const messages = {
                'Indonesia': {
                    title: '💝 Dukung AnonTalk Bot\n\n',
                    description: 'Terima kasih telah mempertimbangkan donasi! Dukungan Anda membantu menjaga bot ini tetap berjalan dan gratis untuk semua orang.\n\n',
                    packages: '💰 Paket VIP (Rupiah):\n\n📅 Harian: Rp 5.000\n• Akses VIP 24 jam\n• Semua fitur VIP\n\n📅 Mingguan: Rp 25.000\n• Akses VIP 7 hari\n• Semua fitur VIP\n• Diskon 28%\n\n📅 Bulanan: Rp 75.000\n• Akses VIP 30 hari\n• Semua fitur VIP\n• Diskon 50%\n• Prioritas tertinggi\n\n',
                    features: '✨ Fitur VIP:\n• Avatar tanpa batas karakter\n• Buat room custom\n• Kirim video tanpa batas\n• Room VIP eksklusif\n• Prioritas join room\n• Dukungan prioritas\n\n',
                    payment: '💳 Metode Pembayaran:\n• DANA\n• OVO\n• GoPay\n• Bank Transfer\n• QRIS\n\n',
                    link: `🔗 Link Donasi:\n${donateUrl}\n\n`,
                    thanks: '🙏 Setiap donasi membantu:\n• Biaya server\n• Waktu pengembangan\n• Fitur baru\n• Pemeliharaan bot\n\nTerima kasih atas dukungannya! ❤️'
                },
                'English': {
                    title: '💝 Support AnonTalk Bot\n\n',
                    description: 'Thank you for considering a donation! Your support helps keep this bot running and free for everyone.\n\n',
                    packages: '💰 VIP Packages (Rupiah):\n\n📅 Daily: Rp 5.000\n• VIP access for 24 hours\n• All VIP features\n\n📅 Weekly: Rp 25.000\n• VIP access for 7 days\n• All VIP features\n• 28% discount\n\n📅 Monthly: Rp 75.000\n• VIP access for 30 days\n• All VIP features\n• 50% discount\n• Highest priority\n\n',
                    features: '✨ VIP Features:\n• Unlimited avatar characters\n• Create custom rooms\n• Send videos without limits\n• Exclusive VIP rooms\n• Priority room joining\n• Priority support\n\n',
                    payment: '💳 Payment Methods:\n• DANA\n• OVO\n• GoPay\n• Bank Transfer\n• QRIS\n\n',
                    link: `🔗 Donation Link:\n${donateUrl}\n\n`,
                    thanks: '🙏 Every donation helps:\n• Server costs\n• Development time\n• New features\n• Bot maintenance\n\nThank you for your support! ❤️'
                },
                'Jawa': {
                    title: '💝 Dhukung AnonTalk Bot\n\n',
                    description: 'Matur nuwun wis nimbang-nimbang donasi! Dhukungan sampeyan mbantu njaga bot iki tetep mlaku lan gratis kanggo kabeh wong.\n\n',
                    packages: '💰 Paket VIP (Rupiah):\n\n📅 Harian: Rp 5.000\n• Akses VIP 24 jam\n• Kabeh fitur VIP\n\n📅 Mingguan: Rp 25.000\n• Akses VIP 7 dina\n• Kabeh fitur VIP\n• Diskon 28%\n\n📅 Bulanan: Rp 75.000\n• Akses VIP 30 dina\n• Kabeh fitur VIP\n• Diskon 50%\n• Prioritas paling dhuwur\n\n',
                    features: '✨ Fitur VIP:\n• Avatar tanpa wates karakter\n• Gawe kamar custom\n• Kirim video tanpa wates\n• Kamar VIP eksklusif\n• Prioritas gabung kamar\n• Dhukungan prioritas\n\n',
                    payment: '💳 Cara Pembayaran:\n• DANA\n• OVO\n• GoPay\n• Bank Transfer\n• QRIS\n\n',
                    link: `🔗 Link Donasi:\n${donateUrl}\n\n`,
                    thanks: '🙏 Saben donasi mbantu:\n• Biaya server\n• Wektu pangembangan\n• Fitur anyar\n• Pangopènan bot\n\nMatur nuwun kanggo dhukungane! ❤️'
                }
            };

            const message = messages[user.lang] || messages['English'];
            const fullMessage = message.title + message.description + message.packages + message.features + message.payment + message.link + message.thanks;
            
            await ctx.telegram.sendMessage(ctx.chat.id, fullMessage).catch(() => false);

        } catch (err) {
            console.error("Error sending donation link:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while sending the donation link.");
        }
    }
};
