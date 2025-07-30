const uniqueID = () => Date.now() + Math.floor(Math.random() * 100);
const db = require('../db');
const lang = require('../lang');
const roomExit = require('./exit');

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found. Please try /start again.");
        }

        if (!user.lang || user.lang === '') {
            return ctx.telegram.sendMessage(ctx.chat.id, "Please set your language first with /lang command.");
        }

        // Check if user is in a room and exit first
        if (user.room !== '') {
            await roomExit(ctx, () => showRoomCategories(ctx, user));
        } else {
            await showRoomCategories(ctx, user);
        }
    } catch (err) {
        console.error("Error in join command:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

const showRoomCategories = async (ctx, user) => {
    try {
        const isVIP = await db.isUserVIP(ctx.chat.id);
        const categories = Object.keys(db.ROOM_CATEGORIES);
        
        // Create inline keyboard for room categories
        const keyboard = [];
        let row = [];
        
        categories.forEach((category, index) => {
            const categoryInfo = db.ROOM_CATEGORIES[category];
            const categoryName = categoryInfo.name[user.lang] || categoryInfo.name['English'];
            const buttonText = `${categoryInfo.icon} ${categoryName}`;
            
            row.push({
                text: buttonText,
                callback_data: `join_category_${category}`
            });
            
            if (row.length === 2) {
                keyboard.push(row);
                row = [];
            }
        });
        
        if (row.length > 0) {
            keyboard.push(row);
        }
        
        const message = lang(user.lang, '', '', '', '').room_categories.replace('${par1}', 
            categories.map(cat => {
                const catInfo = db.ROOM_CATEGORIES[cat];
                const catName = catInfo.name[user.lang] || catInfo.name['English'];
                return `${catInfo.icon} ${catName}`;
            }).join('\n')
        );
        
        await ctx.telegram.sendMessage(ctx.chat.id, message, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        
        // Store user context for callback handling
        ctx.session = { user, isVIP };
        
    } catch (error) {
        console.error("Error showing room categories:", error);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};

// Handle category selection callback
module.exports.handleCategoryCallback = async (ctx, category) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        // Get rooms for selected category and user's language
        const rooms = await db.getRoomsByLanguage(user.lang);
        const categoryRooms = rooms.filter(room => room.category === category);
        
        if (categoryRooms.length === 0) {
            return ctx.answerCbQuery("No rooms available for this category.");
        }
        
        // Filter VIP rooms if user is not VIP
        const availableRooms = categoryRooms.filter(room => {
            if (room.vip && !isVIP) return false;
            return room.member < room.maxMember;
        });
        
        if (availableRooms.length === 0) {
            const message = isVIP ? 
                "All rooms in this category are full." : 
                "This category contains VIP rooms only. Upgrade to VIP to access.";
            return ctx.answerCbQuery(message);
        }
        
        // Show available rooms in category
        await showRoomsInCategory(ctx, user, availableRooms, category);
        
    } catch (error) {
        console.error("Error handling category callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

const showRoomsInCategory = async (ctx, user, rooms, category) => {
    try {
        const categoryInfo = db.ROOM_CATEGORIES[category];
        const categoryName = categoryInfo.name[user.lang] || categoryInfo.name['English'];
        
        const keyboard = [];
        rooms.forEach(room => {
            const roomName = room.description || `${categoryInfo.icon} ${categoryName}`;
            const memberInfo = `${room.member}/${room.maxMember}`;
            const vipIndicator = room.vip ? '👑 ' : '';
            
            keyboard.push([{
                text: `${vipIndicator}${roomName} (${memberInfo})`,
                callback_data: `join_room_${room.room}`
            }]);
        });
        
        // Add back button
        keyboard.push([{
            text: '⬅️ Back to Categories',
            callback_data: 'join_categories'
        }]);
        
        const message = `📂 ${categoryInfo.icon} ${categoryName} Rooms:\n\nSelect a room to join:`;
        
        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        
    } catch (error) {
        console.error("Error showing rooms in category:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

// Handle room selection callback
module.exports.handleRoomCallback = async (ctx, roomId) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        // Get room information
        const roomSnapshot = await db.collection('rooms').orderByChild('room').equalTo(roomId).once('value');
        const roomData = roomSnapshot.val();
        
        if (!roomData) {
            return ctx.answerCbQuery("Room not found.");
        }
        
        const room = Object.values(roomData)[0];
        
        // Check VIP access
        if (room.vip && !isVIP) {
            return ctx.answerCbQuery("This is a VIP room. Upgrade to VIP to access.");
        }
        
        // Check if room is full
        if (room.member >= room.maxMember) {
            if (isVIP) {
                // VIP users can join full rooms with priority
                await joinRoomWithPriority(ctx, user, room);
                return ctx.answerCbQuery("VIP Priority: You joined a full room!");
            } else {
                return ctx.answerCbQuery("Room is full. Upgrade to VIP for priority access.");
            }
        }
        
        // Join room normally
        await joinRoom(ctx, user, room);
        ctx.answerCbQuery("Successfully joined room!");
        
    } catch (error) {
        console.error("Error handling room callback:", error);
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
        const categoryInfo = db.ROOM_CATEGORIES[room.category];
        const categoryName = categoryInfo.name[user.lang] || categoryInfo.name['English'];
        
        const roomInfo = lang(user.lang, room.description, room.member, room.maxMember, categoryName).room_info;
        const joinConfirm = lang(user.lang, room.description).join_room;
        
        await ctx.telegram.sendMessage(ctx.chat.id, `${joinConfirm}\n\n${roomInfo}`);
        
    } catch (error) {
        console.error("Error joining room:", error);
        throw error;
    }
};

const joinRoomWithPriority = async (ctx, user, room) => {
    try {
        // For VIP priority, we might need to remove a non-VIP user if room is full
        if (room.member >= room.maxMember) {
            // Find a non-VIP user to remove (simplified implementation)
            const usersInRoomSnapshot = await db.collection('users').orderByChild('room').equalTo(room.room).once('value');
            const usersInRoomData = usersInRoomSnapshot.val();
            
            if (usersInRoomData) {
                const usersInRoom = Object.values(usersInRoomData);
                const nonVIPUser = usersInRoom.find(u => u.userid !== user.userid);
                
                if (nonVIPUser) {
                    // Remove non-VIP user and notify them
                    await db.collection('users').child(nonVIPUser.userid).update({ room: '' });
                    await ctx.telegram.sendMessage(nonVIPUser.userid, 
                        "You were removed from the room due to VIP priority access.");
                }
            }
        }
        
        // Join the room
        await joinRoom(ctx, user, room);
        
        // Send VIP priority message
        await ctx.telegram.sendMessage(ctx.chat.id, lang(user.lang).vip_priority_join);
        
    } catch (error) {
        console.error("Error joining room with priority:", error);
        throw error;
    }
};

// Handle back to categories callback
module.exports.handleBackToCategories = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }
        
        await showRoomCategories(ctx, user);
        ctx.answerCbQuery();
        
    } catch (error) {
        console.error("Error handling back to categories:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};
