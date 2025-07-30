const menu = require('./menu');

module.exports = async (ctx) => {
    try {
        console.log('📱 Received /menu command from:', ctx.from.id);
        
        // Show main menu
        await menu.showMainMenu(ctx);
        
        // Optional: Log menu usage
        try {
            const dbuser = require('../db').collection('users');
            await dbuser.doc(ctx.chat.id.toString()).set({
                lastMenuUse: new Date().toISOString(),
                username: ctx.from.username || 'anonymous'
            }, { merge: true });
        } catch (dbError) {
            console.log('Menu usage logging skipped:', dbError.message);
        }
        
    } catch (err) {
        console.error('Error in menu command:', err);
        ctx.reply('❌ Terjadi kesalahan saat menampilkan menu. Silakan coba lagi.');
    }
}; 