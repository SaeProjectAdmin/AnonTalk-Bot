const db = require('../db'); // Firebase DB instance
const menu = require('./menu');

module.exports = async (ctx) => {
    try {
        console.log('📨 Received /start command from:', ctx.from.id);
        
        // Show main menu using the new menu system
        await menu.showMainMenu(ctx);

        // Optional: Check user registration (simplified)
        try {
            const dbuser = db.collection('users');
            const userSnapshot = await dbuser.doc(ctx.chat.id.toString()).get();
            const user = userSnapshot.data();

            if (user && user.lang && user.lang !== '') {
                console.log(`User ${ctx.chat.id} is registered with language: ${user.lang}`);
            } else {
                console.log(`User ${ctx.chat.id} is not registered yet`);
            }
        } catch (dbError) {
            console.log('Database check skipped:', dbError.message);
        }
        
    } catch (err) {
        console.error('Error in start command:', err);
        ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
    }
};
