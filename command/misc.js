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

            await ctx.telegram.sendMessage(
                ctx.chat.id,
                `${lang(user.lang, `https://anontalkid.my.to/donasi/new.php?id=${ctx.chat.id}`).donate}`
            ).catch(() => false);

        } catch (err) {
            console.error("Error sending donation link:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while sending the donation link.");
        }
    }
};
