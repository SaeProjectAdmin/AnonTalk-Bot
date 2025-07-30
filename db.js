
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const cfg = require('./config');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(cfg.FIREBASE_CREDENTIALS),
    databaseURL: cfg.DB_URL
});

// Initialize Firebase Client SDK
const app = initializeApp({
    databaseURL: cfg.DB_URL // You can include more config parameters here if needed
});
const clientDb = getDatabase(app); // Get the client database instance

let adminDb = admin.database(); // Get the admin database instance

// Room categories with icons
const ROOM_CATEGORIES = {
    'general': { icon: '💬', name: { 'Indonesia': 'Umum', 'English': 'General', 'Jawa': 'Umum' } },
    'chill': { icon: '😌', name: { 'Indonesia': 'Santai', 'English': 'Chill', 'Jawa': 'Santai' } },
    'random': { icon: '🎲', name: { 'Indonesia': 'Acak', 'English': 'Random', 'Jawa': 'Acak' } },
    'gaming': { icon: '🎮', name: { 'Indonesia': 'Game', 'English': 'Gaming', 'Jawa': 'Game' } },
    'music': { icon: '🎵', name: { 'Indonesia': 'Musik', 'English': 'Music', 'Jawa': 'Musik' } },
    'tech': { icon: '💻', name: { 'Indonesia': 'Teknologi', 'English': 'Tech', 'Jawa': 'Teknologi' } },
    'sports': { icon: '⚽', name: { 'Indonesia': 'Olahraga', 'English': 'Sports', 'Jawa': 'Olahraga' } },
    'food': { icon: '🍕', name: { 'Indonesia': 'Makanan', 'English': 'Food', 'Jawa': 'Panganan' } },
    'vip': { icon: '👑', name: { 'Indonesia': 'VIP', 'English': 'VIP', 'Jawa': 'VIP' } }
};

// Supported languages
const SUPPORTED_LANGUAGES = ['Indonesia', 'English', 'Jawa'];

function init(callback) {
    // Initialize rooms with new structure
    adminDb.ref('rooms').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const rooms = [];
            
            // Create 24 default rooms (8 per language)
            SUPPORTED_LANGUAGES.forEach(lang => {
                Object.keys(ROOM_CATEGORIES).forEach(category => {
                    const isVIP = category === 'vip';
                    const maxMembers = isVIP ? 30 : 20;
                    
                    rooms.push({
                        room: uniqueID(),
                        lang: lang,
                        category: category,
                        member: 0,
                        maxMember: maxMembers,
                        private: false,
                        vip: isVIP,
                        createdAt: Date.now(),
                        description: `${ROOM_CATEGORIES[category].icon} ${ROOM_CATEGORIES[category].name[lang]} - ${lang}`
                    });
                });
            });

            rooms.forEach(room => {
                adminDb.ref('rooms').push(room);
            });
        }
    });

    // Initialize languages
    adminDb.ref('langs').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const langs = SUPPORTED_LANGUAGES.map(lang => ({ lang: lang }));

            langs.forEach(lang => {
                adminDb.ref('langs').push(lang);
            });
        }
    });

    // Initialize VIP users collection
    adminDb.ref('vip_users').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.log('VIP users collection initialized');
        }
    });

    // Initialize room categories
    adminDb.ref('categories').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            Object.keys(ROOM_CATEGORIES).forEach(category => {
                adminDb.ref('categories').child(category).set(ROOM_CATEGORIES[category]);
            });
        }
    });

    console.log('Connected to Firebase Realtime Database.');
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
        if (vipData && vipData.isVIP) {
            // Check if VIP is still valid
            if (vipData.expiresAt && vipData.expiresAt < Date.now()) {
                // VIP expired, remove it
                await adminDb.ref('vip_users').child(chatId).remove();
                return false;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking VIP status:', error);
        return false;
    }
}

async function setUserVIP(chatId, expiresAt = null) {
    try {
        await adminDb.ref('vip_users').child(chatId).set({
            isVIP: true,
            activatedAt: Date.now(),
            expiresAt: expiresAt // null for permanent VIP
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

async function getRoomsByCategory(category) {
    try {
        const snapshot = await adminDb.ref('rooms').orderByChild('category').equalTo(category).once('value');
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    } catch (error) {
        console.error('Error getting rooms by category:', error);
        return [];
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

async function createCustomRoom(roomData) {
    try {
        const newRoom = {
            room: uniqueID(),
            lang: roomData.lang,
            category: roomData.category || 'general',
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

const uniqueID = () => Date.now() + Math.floor(Math.random() * 100);

// Exporting the relevant functions and instances
module.exports = {
    collection,
    init,
    close,
    isConnected,
    clientDb,
    getUserByChatId,
    isUserVIP,
    setUserVIP,
    getRoomsByLanguage,
    getRoomsByCategory,
    updateRoomMemberCount,
    createCustomRoom,
    ROOM_CATEGORIES,
    SUPPORTED_LANGUAGES
};
