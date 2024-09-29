
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

function init(callback) {
 
    adminDb.ref('rooms').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            let private = false;
            let member = 0;
            const rooms = [
                { room: uniqueID(), lang: 'Indonesia', member, private },
                { room: uniqueID(), lang: 'Indonesia', member, private },
                { room: uniqueID(), lang: 'Indonesia', member, private },
                { room: uniqueID(), lang: 'English', member, private },
                { room: uniqueID(), lang: 'English', member, private },
                { room: uniqueID(), lang: 'English', member, private }
            ];

            rooms.forEach(room => {
                adminDb.ref('rooms').push(room);
            });
        }
    });

    adminDb.ref('langs').once('value', (snapshot) => {
        if (!snapshot.exists()) {
            const langs = [
                { lang: 'Indonesia' },
                { lang: 'English' }
            ];

            langs.forEach(lang => {
                adminDb.ref('langs').push(lang);
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

const uniqueID = () => Date.now() + Math.floor(Math.random() * 100);

// Exporting the relevant functions and instances
module.exports = {
    collection,
    init,
    close,
    isConnected,
    clientDb // You can also export clientDb if needed for client operations
};
