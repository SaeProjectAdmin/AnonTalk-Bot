const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        // Create help message
        let helpMessage = `🤖 AnonTalk Bot - Commands\n\n` +
            `🌐 Language: ${user.lang}\n` +
            `💡 Status: Regular User\n\n` +
            `📋 Basic Commands:\n` +
            `/start - Start the bot\n` +
            `/help - Show this help message\n` +
            `/lang - Change language (🇮🇩🇺🇸🇮🇩)\n` +
            `/avatar - Change your avatar\n` +
            `/cancel - Cancel current action\n\n` +
            `🏠 Room Commands:\n` +
            `/join - Join fun rooms\n` +
            `/rooms - View all available rooms\n` +
            `/exit - Leave current room\n` +
            `/list - Show room members\n\n` +
            `🎭 Fun Room Types:\n` +
            `🤪 Ghibah | 😴 Tidur | 🍕 Makan\n` +
            `🎮 Game | 🎵 Musik | 💻 Coding\n` +
            `🏃 Olahraga | 📚 Belajar | 🎬 Film\n\n` +
            `🌐 Supported Languages:\n` +
            `🇮🇩 Indonesia | 🇺🇸 English`;

        // Send the enhanced help message
        await ctx.telegram.sendMessage(ctx.chat.id, helpMessage).catch(() => false);
        
    } catch (err) {
        console.error("Error fetching user or sending message:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};
