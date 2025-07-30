
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const cfg = require('./config');

// Initialize Firebase Admin SDK
let adminApp;
try {
    if (cfg.FIREBASE_CREDENTIALS) {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(cfg.FIREBASE_CREDENTIALS),
            databaseURL: cfg.DB_URL
        });
    } else {
        // Use default credentials (for Firebase App Hosting)
        adminApp = admin.initializeApp({
            databaseURL: cfg.DB_URL
        });
    }
} catch (error) {
    console.log('⚠️ Firebase Admin SDK initialization failed:', error.message);
    throw error; // Re-throw as this is critical for the bot to function
}

// Initialize Firebase Client SDK
let app, clientDb;
try {
    app = initializeApp({
        databaseURL: cfg.DB_URL,
        projectId: cfg.FIREBASE_PROJECT_ID
    });
    clientDb = getDatabase(app); // Get the client database instance
} catch (error) {
    console.log('⚠️ Firebase Client SDK initialization failed:', error.message);
    // Continue with admin SDK only
}

let adminDb;
try {
    adminDb = admin.database(adminApp); // Get the admin database instance
} catch (error) {
    console.log('⚠️ Firebase Admin Database initialization failed:', error.message);
    throw error; // Re-throw as this is critical for the bot to function
}

// Simple room names for 10 rooms
const SIMPLE_ROOM_NAMES = [
    'Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5',
    'Room 6', 'Room 7', 'Room 8', 'Room 9', 'Room 10'
];

// Supported languages
const SUPPORTED_LANGUAGES = ['Indonesia', 'English'];

function init(callback) {
    console.log('🔗 Connecting to Firebase Realtime Database...');
    console.log(`📡 Database URL: ${cfg.DB_URL}`);
    
    // Test database connection first
    adminDb.ref('.info/connected').once('value', (snapshot) => {
        const connected = snapshot.val();
        if (connected) {
            console.log('✅ Firebase Realtime Database connection successful');
        } else {
            console.log('⚠️ Firebase Realtime Database connection status unknown');
        }
    });

    // Initialize rooms with new structure
    adminDb.ref('rooms').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.log('🏠 Initializing default rooms...');
            const rooms = [];
            
            // Create 10 simple rooms per language (Room 1, Room 2, etc.)
            SUPPORTED_LANGUAGES.forEach(lang => {
                for (let i = 1; i <= 10; i++) {
                    const maxMembers = 20;
                    
                    rooms.push({
                        room: uniqueID(),
                        lang: lang,
                        member: 0,
                        maxMember: maxMembers,
                        private: false,
                        vip: false,
                        createdAt: Date.now(),
                        description: `Room ${i} - ${lang}`
                    });
                }
            });

            rooms.forEach(room => {
                adminDb.ref('rooms').push(room);
            });
            console.log(`✅ Created ${rooms.length} default rooms (10 per language)`);
        } else {
            console.log('✅ Rooms already initialized');
        }
    });

    // Initialize languages
    adminDb.ref('langs').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.log('🌐 Initializing supported languages...');
            const langs = SUPPORTED_LANGUAGES.map(lang => ({ lang: lang }));

            langs.forEach(lang => {
                adminDb.ref('langs').push(lang);
            });
            console.log(`✅ Initialized ${SUPPORTED_LANGUAGES.length} languages`);
        } else {
            console.log('✅ Languages already initialized');
        }
    });



    console.log('🎉 Firebase Realtime Database initialization complete');
    callback();
}

function close() {
    console.log('Connection closed.');
}

function isConnected() {
    return adminDb !== null;
}

function collection(_collection) {
    return adminDb.ref(_collection); 
}

// Helper functions for database operations
async function getUserByChatId(chatId) {
    try {
        const snapshot = await adminDb.ref('users').orderByChild('userid').equalTo(chatId).once('value');
        const data = snapshot.val();
        if (data) {
            const userIdKey = Object.keys(data)[0];
            return data[userIdKey];
        }
        return null;
    } catch (error) {
        console.error('Error getting user by chat ID:', error);
        return null;
    }
}

async function isUserVIP(chatId) {
    try {
        const snapshot = await adminDb.ref('vip_users').child(chatId).once('value');
        const vipData = snapshot.val();
        return vipData && vipData.isVIP === true;
    } catch (error) {
        console.error('Error checking VIP status:', error);
        return false;
    }
}

async function setUserVIP(chatId, isVIP = true) {
    try {
        await adminDb.ref('vip_users').child(chatId).set({
            isVIP: isVIP,
            updatedAt: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error setting user VIP:', error);
        return false;
    }
}

async function getRoomsByLanguage(lang) {
    try {
        const snapshot = await adminDb.ref('rooms').orderByChild('lang').equalTo(lang).once('value');
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    } catch (error) {
        console.error('Error getting rooms by language:', error);
        return [];
    }
}

async function getSimpleRoomNames() {
    try {
        return SIMPLE_ROOM_NAMES;
    } catch (error) {
        console.error('Error getting simple room names:', error);
        return SIMPLE_ROOM_NAMES;
    }
}

async function updateRoomMemberCount(roomId, increment = 1) {
    try {
        const roomRef = adminDb.ref('rooms').child(roomId);
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (roomData) {
            const newMemberCount = Math.max(0, roomData.member + increment);
            await roomRef.update({ member: newMemberCount });
            return newMemberCount;
        }
        return 0;
    } catch (error) {
        console.error('Error updating room member count:', error);
        return 0;
    }
}

// Update room member count based on actual users in room
async function updateRoomMemberCountReal(roomId) {
    try {
        // Count actual users in the room
        const roomUsersSnapshot = await adminDb.ref('users').orderByChild('room').equalTo(roomId).once('value');
        const roomUsers = roomUsersSnapshot.val();
        const actualMemberCount = roomUsers ? Object.keys(roomUsers).length : 0;
        
        // Update room member count
        const roomRef = adminDb.ref('rooms').child(roomId);
        await roomRef.update({ member: actualMemberCount });
        
        return actualMemberCount;
    } catch (error) {
        console.error('Error updating room member count real:', error);
        return 0;
    }
}

// Get room statistics
async function getRoomStatistics(roomId) {
    try {
        const roomSnapshot = await adminDb.ref('rooms').child(roomId).once('value');
        const roomData = roomSnapshot.val();
        
        if (!roomData) {
            return null;
        }
        
        // Count actual users in the room
        const roomUsersSnapshot = await adminDb.ref('users').orderByChild('room').equalTo(roomId).once('value');
        const roomUsers = roomUsersSnapshot.val();
        const actualMemberCount = roomUsers ? Object.keys(roomUsers).length : 0;
        
        // Count VIP users in the room
        let vipCount = 0;
        if (roomUsers) {
            for (const userId of Object.keys(roomUsers)) {
                const isVIP = await isUserVIP(roomUsers[userId].userid);
                if (isVIP) vipCount++;
            }
        }
        
        return {
            roomId,
            roomName: roomData.description || 'Unknown Room',
            maxMembers: roomData.maxMember || 20,
            actualMembers: actualMemberCount,
            storedMembers: roomData.member || 0,
            vipMembers: vipCount,
            isVIP: roomData.vip || false,
            language: roomData.lang || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting room statistics:', error);
        return null;
    }
}

// Update user's last activity and current room
async function updateUserActivity(chatId, roomId = null) {
    try {
        const userSnapshot = await adminDb.ref('users').orderByChild('userid').equalTo(chatId).once('value');
        const userData = userSnapshot.val();
        if (userData) {
            const userKey = Object.keys(userData)[0];
            const updates = {
                lastActivity: Date.now()
            };
            
            if (roomId) {
                updates.currentRoom = roomId;
            }
            
            await adminDb.ref('users').child(userKey).update(updates);
        }
    } catch (error) {
        console.error('Error updating user activity:', error);
    }
}

// Auto kick inactive users (7 hours = 25200000 ms)
async function autoKickInactiveUsers() {
    try {
        const inactiveThreshold = Date.now() - (7 * 60 * 60 * 1000); // 7 hours
        
        const usersSnapshot = await adminDb.ref('users').once('value');
        const users = usersSnapshot.val();
        
        if (!users) return;
        
        for (const [userId, userData] of Object.entries(users)) {
            if (userData.currentRoom && userData.lastActivity && userData.lastActivity < inactiveThreshold) {
                // Kick user from room
                await adminDb.ref('users').child(userId).update({
                    currentRoom: null,
                    room: null
                });
                
                // Decrease room member count
                await updateRoomMemberCount(userData.currentRoom, -1);
                
                console.log(`🔄 Auto-kicked inactive user ${userData.userid} from room ${userData.currentRoom}`);
            }
        }
    } catch (error) {
        console.error('Error in auto kick inactive users:', error);
    }
}

async function createCustomRoom(roomData) {
    try {
        const newRoom = {
            room: uniqueID(),
            lang: roomData.lang,
            member: 1,
            maxMember: roomData.maxMember || 20,
            private: roomData.private || false,
            vip: roomData.vip || false,
            createdAt: Date.now(),
            createdBy: roomData.createdBy,
            description: roomData.description || 'Custom Room'
        };
        
        const roomRef = await adminDb.ref('rooms').push(newRoom);
        return { ...newRoom, key: roomRef.key };
    } catch (error) {
        console.error('Error creating custom room:', error);
        return null;
    }
}

// Statistics functions
async function getBotStatistics() {
    try {
        const stats = {
            totalUsers: 0,
            activeUsers: 0,
            totalRooms: 0,
            activeRooms: 0,
            vipUsers: 0,
            totalMessages: 0,
            topCategories: [],
            uptime: process.uptime()
        };

        // Get total users
        const usersSnapshot = await adminDb.ref('users').once('value');
        if (usersSnapshot.exists()) {
            stats.totalUsers = Object.keys(usersSnapshot.val()).length;
        }

        // Get active users (users who joined in last 24 hours)
        const activeUsersSnapshot = await adminDb.ref('users')
            .orderByChild('lastActivity')
            .startAt(Date.now() - 24 * 60 * 60 * 1000)
            .once('value');
        if (activeUsersSnapshot.exists()) {
            stats.activeUsers = Object.keys(activeUsersSnapshot.val()).length;
        }

        // Get total rooms
        const roomsSnapshot = await adminDb.ref('rooms').once('value');
        if (roomsSnapshot.exists()) {
            const rooms = roomsSnapshot.val();
            stats.totalRooms = Object.keys(rooms).length;
            
            // Count active rooms (rooms with members > 0)
            stats.activeRooms = Object.values(rooms).filter(room => room.member > 0).length;
            
            // Calculate top rooms by member count
            const roomCounts = {};
            Object.values(rooms).forEach(room => {
                if (room.description) {
                    roomCounts[room.description] = (roomCounts[room.description] || 0) + room.member;
                }
            });
            
            // Sort rooms by member count
            stats.topCategories = Object.entries(roomCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([roomName, count]) => ({
                    category: roomName,
                    count,
                    icon: '🏠'
                }));
        }

        // Get VIP users count
        const vipSnapshot = await adminDb.ref('vip_users').once('value');
        if (vipSnapshot.exists()) {
            const vipUsers = vipSnapshot.val();
            stats.vipUsers = Object.values(vipUsers).filter(user => {
                if (user.isVIP) {
                    // Check if VIP is still valid
                    if (user.expiresAt && user.expiresAt < Date.now()) {
                        return false;
                    }
                    return true;
                }
                return false;
            }).length;
        }

        // Get total messages (if message tracking is implemented)
        const messagesSnapshot = await adminDb.ref('messages').once('value');
        if (messagesSnapshot.exists()) {
            stats.totalMessages = Object.keys(messagesSnapshot.val()).length;
        }

        return stats;
    } catch (error) {
        console.error('Error getting bot statistics:', error);
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalRooms: 0,
            activeRooms: 0,
            vipUsers: 0,
            totalMessages: 0,
            topCategories: [],
            uptime: process.uptime()
        };
    }
}

async function getUserStatistics(chatId) {
    try {
        const stats = {
            totalRoomsJoined: 0,
            vipRoomsAccessed: 0,
            totalMessages: 0,
            vipSince: null,
            currentRoom: null,
            joinDate: null
        };

        // Get user data
        const user = await getUserByChatId(chatId);
        if (user) {
            stats.joinDate = user.createdAt || user.joinDate;
        }

        // Get VIP status and date
        const vipSnapshot = await adminDb.ref('vip_users').child(chatId).once('value');
        const vipData = vipSnapshot.val();
        if (vipData && vipData.isVIP) {
            if (!vipData.expiresAt || vipData.expiresAt > Date.now()) {
                stats.vipSince = vipData.activatedAt;
            }
        }

        // Get user's room history (if implemented)
        const userRoomsSnapshot = await adminDb.ref('user_rooms').child(chatId).once('value');
        if (userRoomsSnapshot.exists()) {
            const userRooms = userRoomsSnapshot.val();
            stats.totalRoomsJoined = Object.keys(userRooms).length;
            
            // Count VIP rooms accessed
            stats.vipRoomsAccessed = Object.values(userRooms).filter(room => room.vip).length;
        }

        // Get user's message count (if implemented)
        const userMessagesSnapshot = await adminDb.ref('user_messages').child(chatId).once('value');
        if (userMessagesSnapshot.exists()) {
            const userMessages = userMessagesSnapshot.val();
            stats.totalMessages = Object.keys(userMessages).length;
        }

        return stats;
    } catch (error) {
        console.error('Error getting user statistics:', error);
        return {
            totalRoomsJoined: 0,
            vipRoomsAccessed: 0,
            totalMessages: 0,
            vipSince: null,
            currentRoom: null,
            joinDate: null
        };
    }
}

const uniqueID = () => Date.now() + Math.floor(Math.random() * 100);

// Exporting the relevant functions and instances
module.exports = {
    collection,
    init,
    close,
    isConnected,
    clientDb,
    adminDb,
    getUserByChatId,
    isUserVIP,
    setUserVIP,
    getRoomsByLanguage,
    getSimpleRoomNames,
    updateRoomMemberCount,
    updateRoomMemberCountReal,
    getRoomStatistics,
    updateUserActivity,
    autoKickInactiveUsers,
    createCustomRoom,
    getBotStatistics,
    getUserStatistics,
    SIMPLE_ROOM_NAMES,
    SUPPORTED_LANGUAGES
};
