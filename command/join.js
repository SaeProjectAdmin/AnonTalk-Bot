const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found. Please try /start again.");
        }

        if (!user.lang || user.lang === '') {
            return ctx.telegram.sendMessage(ctx.chat.id, "Please set your language first with /lang command.");
        }

        // Direct join to random room
        await joinRandomRoom(ctx, user);
        
    } catch (error) {
        console.error("Error in join command:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

const joinRandomRoom = async (ctx, user) => {
    try {
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        // Get available rooms for user's language
        const rooms = await db.getRoomsByLanguage(user.lang);
        
        // Filter available rooms
        const availableRooms = rooms.filter(room => {
            if (room.vip && !isVIP) return false;
            return room.member < room.maxMember;
        });
        
        if (availableRooms.length === 0) {
            const message = user.lang === 'Indonesia' ? 
                "Tidak ada room yang tersedia saat ini. Silakan coba lagi nanti." :
                "No rooms available at the moment. Please try again later.";
            return ctx.telegram.sendMessage(ctx.chat.id, message);
        }
        
        // Select random room
        const randomIndex = Math.floor(Math.random() * availableRooms.length);
        const randomRoom = availableRooms[randomIndex];
        
        await joinRoom(ctx, user, randomRoom);
        
    } catch (error) {
        console.error("Error joining random room:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

const joinRoom = async (ctx, user, room) => {
    try {
        // Get user key first
        const userSnapshot = await db.adminDb.ref('users').orderByChild('userid').equalTo(ctx.chat.id).once('value');
        const userData = userSnapshot.val();
        const userKey = userData ? Object.keys(userData)[0] : null;
        
        if (!userKey) {
            throw new Error('User key not found');
        }
        
        // Update user's room and activity
        await db.adminDb.ref('users').child(userKey).update({ 
            room: room.room,
            currentRoom: room.room,
            lastActivity: Date.now()
        });
        
        // Update room member count
        await db.updateRoomMemberCount(room.room, 1);
        
        // Notify other users in the room
        const usersInRoomSnapshot = await db.adminDb.ref('users').orderByChild('room').equalTo(room.room).once('value');
        const usersInRoomData = usersInRoomSnapshot.val();
        const usersInRoom = usersInRoomData ? Object.values(usersInRoomData).filter(v => v.userid !== ctx.chat.id) : [];
        
        const joinMessage = lang(user.lang, user.ava || 'Botak').other_join;
        const peopleMessage = lang(user.lang, room.member + 1).people;
        
        usersInRoom.forEach(async v => {
            await ctx.telegram.sendMessage(v.userid, `${joinMessage} ${peopleMessage}`);
        });
        
        // Send confirmation to user
        const roomInfo = `🏠 **Room Info:**
📝 **Nama:** ${room.description}
👥 **Member:** ${room.member + 1}/${room.maxMember}
${room.vip ? '👑 **VIP Room**' : ''}`;
        
        const joinConfirm = lang(user.lang, room.description).join_room;
        
        await ctx.telegram.sendMessage(ctx.chat.id, `${joinConfirm}\n\n${roomInfo}`, {
            parse_mode: 'Markdown'
        });
        
    } catch (error) {
        console.error("Error joining room:", error);
        throw error;
    }
};

// Handle room selection callback (for backward compatibility)
module.exports.handleRoomCallback = async (ctx, roomId) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        // Get room by ID
        const roomSnapshot = await db.adminDb.ref('rooms').orderByChild('room').equalTo(roomId).once('value');
        const roomData = roomSnapshot.val();
        
        if (!roomData) {
            return ctx.answerCbQuery("Room not found.");
        }
        
        const room = Object.values(roomData)[0];
        
        // Check if user can join
        const isVIP = await db.isUserVIP(ctx.chat.id);
        if (room.vip && !isVIP) {
            return ctx.answerCbQuery("This is a VIP room. Upgrade to VIP to access.");
        }
        
        if (room.member >= room.maxMember) {
            return ctx.answerCbQuery("This room is full.");
        }
        
        await joinRoom(ctx, user, room);
        
    } catch (error) {
        console.error("Error handling room callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

// Handle random room callback from menu
module.exports.handleRandomRoomCallback = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }

        // Direct join to random room
        await joinRandomRoom(ctx, user);
        
    } catch (error) {
        console.error("Error in random room callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};
