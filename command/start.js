const db = require('../db'); // Firebase DB instance
const lang = require('../lang');

module.exports = async (ctx) => {
    try {
        console.log('📨 Received /start command from:', ctx.from.id);
        
        // Create main menu keyboard
        const menuKeyboard = {
            inline_keyboard: [
                [
                    { text: '🏠 Join Room', callback_data: 'menu_join' },
                    { text: '🌍 Language', callback_data: 'menu_lang' }
                ],
                [
                    { text: '💎 VIP Info', callback_data: 'menu_vip' },
                    { text: '📋 Help', callback_data: 'menu_help' }
                ],
                [
                    { text: '🏆 Rooms List', callback_data: 'menu_rooms' },
                    { text: '⚙️ Settings', callback_data: 'menu_settings' }
                ]
            ]
        };
        
        // Send welcome message with menu
        await ctx.reply('🎉 Selamat datang di AnonTalk Bot!\n\n' +
                       '🤖 Bot untuk chat anonymous dengan user lain\n\n' +
                       '📱 Pilih menu di bawah ini:',
                       { reply_markup: menuKeyboard });

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
        ctx.reply('An error occurred. Please try again.');
    }
};
