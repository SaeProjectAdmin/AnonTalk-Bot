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

        // Show fun room selection
        await showFunRooms(ctx, user);
        
    } catch (error) {
        console.error("Error in join command:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

const showFunRooms = async (ctx, user) => {
    try {
        const isVIP = await db.isUserVIP(ctx.chat.id);
        const funRoomNames = await db.getFunRoomNames();
        
        // Create inline keyboard for fun rooms
        const keyboard = [];
        let row = [];
        
        // Add "Join Random Room" button at the top
        const randomButtonText = user.lang === 'Indonesia' ? '🎲 Join Room Acak' : '🎲 Join Random Room';
        
        keyboard.push([{
            text: randomButtonText,
            callback_data: 'join_random_room'
        }]);
        
        // Add separator
        keyboard.push([{
            text: '🏠 Pilih Room / Choose Room',
            callback_data: 'separator'
        }]);
        
        // Get available rooms for user's language
        const availableRooms = await db.getRoomsByLanguage(user.lang);
        
        // Create buttons for each fun room name
        funRoomNames.forEach((roomName, index) => {
            const roomNameText = roomName.name[user.lang] || roomName.name['English'];
            const buttonText = `${roomName.icon} ${roomNameText}`;
            
            row.push({
                text: buttonText,
                callback_data: `join_fun_room_${index}`
            });
            
            if (row.length === 2) {
                keyboard.push(row);
                row = [];
            }
        });
        
        if (row.length > 0) {
            keyboard.push(row);
        }
        
        const message = `🏠 **Pilih Room yang Lucu!**

Pilih room yang ingin Anda masuki:

${funRoomNames.map((roomName, index) => {
    const roomNameText = roomName.name[user.lang] || roomName.name['English'];
    return `${roomName.icon} **${roomNameText}**`;
}).join('\n')}

💡 **Tips:** Setiap room memiliki tema yang berbeda dan menyenangkan!`;
        
        await ctx.telegram.sendMessage(ctx.chat.id, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        
    } catch (error) {
        console.error("Error showing fun rooms:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

// Handle fun room selection callback
module.exports.handleFunRoomCallback = async (ctx, roomIndex) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        // Get fun room names
        const funRoomNames = await db.getFunRoomNames();
        const selectedRoomName = funRoomNames[roomIndex];
        
        if (!selectedRoomName) {
            return ctx.answerCbQuery("Room not found.");
        }
        
        // Get rooms for user's language
        const rooms = await db.getRoomsByLanguage(user.lang);
        
        // Find rooms that match the selected room name
        const matchingRooms = rooms.filter(room => {
            const roomNameText = selectedRoomName.name[user.lang] || selectedRoomName.name['English'];
            return room.description && room.description.includes(roomNameText);
        });
        
        if (matchingRooms.length === 0) {
            return ctx.answerCbQuery("No rooms available for this selection.");
        }
        
        // Filter VIP rooms if user is not VIP
        const availableRooms = matchingRooms.filter(room => {
            if (room.vip && !isVIP) return false;
            return room.member < room.maxMember;
        });
        
        if (availableRooms.length === 0) {
            const message = isVIP ? 
                "All rooms of this type are full." : 
                "This room type is VIP only. Upgrade to VIP to access.";
            return ctx.answerCbQuery(message);
        }
        
        // Join the first available room
        const roomToJoin = availableRooms[0];
        await joinRoom(ctx, user, roomToJoin);
        
    } catch (error) {
        console.error("Error handling fun room callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

// Handle random room callback
module.exports.handleRandomRoomCallback = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        // Get available rooms for user's language
        const rooms = await db.getRoomsByLanguage(user.lang);
        
        // Filter available rooms
        const availableRooms = rooms.filter(room => {
            if (room.vip && !isVIP) return false;
            return room.member < room.maxMember;
        });
        
        if (availableRooms.length === 0) {
            return ctx.answerCbQuery("No rooms available at the moment.");
        }
        
        // Select random room
        const randomIndex = Math.floor(Math.random() * availableRooms.length);
        const randomRoom = availableRooms[randomIndex];
        
        await joinRoom(ctx, user, randomRoom);
        
    } catch (error) {
        console.error("Error handling random room callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

const joinRoom = async (ctx, user, room) => {
    try {
        // Update user's room
        await db.collection('users').child(user.userid).update({ room: room.room });
        
        // Update room member count
        await db.updateRoomMemberCount(room.room, 1);
        
        // Notify other users in the room
        const usersInRoomSnapshot = await db.collection('users').orderByChild('room').equalTo(room.room).once('value');
        const usersInRoomData = usersInRoomSnapshot.val();
        const usersInRoom = usersInRoomData ? Object.values(usersInRoomData).filter(v => v.userid !== user.userid) : [];
        
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
        const roomSnapshot = await db.collection('rooms').orderByChild('room').equalTo(roomId).once('value');
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
