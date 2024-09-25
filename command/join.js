const uniqueID = () => Date.now() + Math.floor(Math.random() * 100);
const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module
const roomExit = require('./exit'); // Room exit handler

let max_member = 50 + Math.floor(Math.random() * 5);
let max_join = 20;
let dbuser, user, dbroom;

module.exports = async (ctx) => {
    dbuser = db.collection('users');

    try {
        const userSnapshot = await dbuser.orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = userSnapshot.val();

        if (!userData) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        const userIdKey = Object.keys(userData)[0];
        user = userData[userIdKey];

        if (user.room !== '') {
            roomExit(ctx, let_join); // Exit current room before joining a new one
        } else {
            let_join(ctx, user); // Directly join if not in a room
        }
    } catch (err) {
        console.error("Error finding user:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

const let_join = async (ctx, user) => {
    let gotRoom = String(uniqueID());
    let gotRoomInfo = {};
    let foundRoom = false;
    let sroom;
    let dest_room = ctx.message.text.substr(6);
    dbroom = db.collection('rooms');

    if (dest_room === '') {
        try {
            const roomSnapshot = await dbroom.orderByChild('lang').equalTo(user.lang).once('value');
            const roomData = roomSnapshot.val();

            if (roomData) {
                sroom = Object.values(roomData);
                shuffle(sroom);
                let roomCandidate = sroom[0];

                if (roomCandidate.member <= max_member) {
                    gotRoom = roomCandidate.room;
                    gotRoomInfo = roomCandidate;
                    foundRoom = true;
                }

                if (foundRoom) {
                    await dbuser.child(user.userid).update({ room: gotRoom });
                    await dbroom.child(gotRoom).update({ member: gotRoomInfo.member + 1 });

                    const usersInRoomSnapshot = await dbuser.orderByChild('room').equalTo(gotRoom).once('value');
                    const usersInRoomData = usersInRoomSnapshot.val();
                    const usersInRoom = usersInRoomData ? Object.values(usersInRoomData).filter(v => v.userid !== user.userid) : [];

                    usersInRoom.forEach(async v => {
                        await ctx.telegram.sendMessage(
                            v.userid,
                            `${lang(v.lang, user.ava || 'Botak', ctx.message.text).other_join} ${lang(v.lang, gotRoomInfo.member + 1).people}`
                        );
                    });

                    await ctx.telegram.sendMessage(
                        ctx.chat.id,
                        `${lang(user.lang).join} ${lang(user.lang, gotRoomInfo.member).other_people}`
                    );
                } else {
                    await dbuser.child(user.userid).update({ room: gotRoom });
                    await dbroom.child(gotRoom).set({ room: gotRoom, member: 1, lang: user.lang, private: false });

                    await ctx.telegram.sendMessage(
                        ctx.chat.id,
                        `${lang(user.lang).join} ${lang(user.lang, 0).other_people}`
                    );
                }
            }
        } catch (err) {
            console.error("Error finding or creating room:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while joining the room. Please try again.");
        }
    } else {
        try {
            const roomSnapshot = await dbroom.orderByChild('room').equalTo(dest_room).once('value');
            const roomData = roomSnapshot.val();

            if (!roomData || roomData.member >= max_join) {
                await ctx.telegram.sendMessage(
                    ctx.chat.id,
                    `${lang(user.lang, dest_room).room_full}`
                );
            } else {
                await dbuser.child(user.userid).update({ room: dest_room });
                await dbroom.child(dest_room).update({ member: roomData.member + 1 });

                const usersInRoomSnapshot = await dbuser.orderByChild('room').equalTo(dest_room).once('value');
                const usersInRoomData = usersInRoomSnapshot.val();
                const usersInRoom = usersInRoomData ? Object.values(usersInRoomData).filter(v => v.userid !== user.userid) : [];

                usersInRoom.forEach(async v => {
                    await ctx.telegram.sendMessage(
                        v.userid,
                        `${lang(v.lang, user.ava || 'Botak').other_join} ${lang(v.lang, roomData.member + 1).people}`
                    );
                });

                await ctx.telegram.sendMessage(
                    ctx.chat.id,
                    `${lang(user.lang).join} ${lang(user.lang, roomData.member).other_people}`
                );
            }
        } catch (err) {
            console.error("Error finding or joining specific room:", err);
            ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while joining the room. Please try again.");
        }
    }
};

// Function to shuffle an array
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
