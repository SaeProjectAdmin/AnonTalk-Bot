const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = async (ctx, _join = null) => {
    try {
        // Fetch user by their chat ID
        const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = userSnapshot.val();
        if (!userData) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        const userIdKey = Object.keys(userData)[0]; // Firebase returns an object, get the first key
        const user = userData[userIdKey]; // User data

        // Fetch other users in the same room (but not the current user)
        const usersInRoomSnapshot = await db.adminDb.ref('users')
            .orderByChild('room')
            .equalTo(user.room)
            .once('value');
        const usersInRoomData = usersInRoomSnapshot.val();

        const usersInRoom = usersInRoomData 
            ? Object.keys(usersInRoomData)
                .map((key) => usersInRoomData[key])
                .filter((roomUser) => roomUser.userid !== user.userid)
            : [];

        // Update room member count in the 'rooms' collection
        await db.adminDb.ref('rooms').child(user.room).update({ member: usersInRoom.length });

        // Clear user's room
        await db.adminDb.ref('users').child(userIdKey).update({ room: '' });

        // Notify other users in the room that the user has left
        for (const roomUser of usersInRoom) {
            await ctx.telegram.sendMessage(
                roomUser.userid,
                `${lang(roomUser.lang, user.ava || 'Botak').other_left} ${lang(roomUser.lang, usersInRoom.length).people}`
            ).catch(() => false); // Handle potential errors
        }

        // Notify the current user that they have left the room
        await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).left);

        // If there's a join function, call it with the context and user
        if (_join !== null) {
            _join(ctx, user);
        }
    } catch (err) {
        console.error("Error handling room exit:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};
