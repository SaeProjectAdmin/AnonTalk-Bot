const db = require('../db'); // Firebase DB instance
const lang = require('../lang'); // Language module

module.exports = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        const isVIP = await db.isUserVIP(ctx.chat.id);
        
        // Create enhanced help message based on user's VIP status
        let helpMessage = '';
        
        if (isVIP) {
            helpMessage = `👑 AnonTalk Bot - VIP Commands\n\n` +
                `🌐 Language: ${user.lang}\n` +
                `💎 Status: VIP Active\n\n` +
                `📋 Basic Commands:\n` +
                `/start - Start the bot\n` +
                `/help - Show this help message\n` +
                `/lang - Change language (🇮🇩🇺🇸🇮🇩)\n` +
                `/avatar - Change your avatar\n` +
                `/cancel - Cancel current action\n\n` +
                `🏠 Room Commands:\n` +
                `/join - Join rooms by category\n` +
                `/rooms - View all available rooms\n` +
                `/exit - Leave current room\n` +
                `/list - Show room members\n\n` +
                `👑 VIP Commands:\n` +
                `/vip - View VIP features\n` +
                `/vip-stats - View VIP statistics\n` +
                `/create-room <name> - Create custom VIP room\n` +
                `/donate - Support the bot\n\n` +
                `💡 VIP Features:\n` +
                `• 🏠 Exclusive VIP rooms\n` +
                `• ⚡ Priority room joining\n` +
                `• 👤 Unlimited avatar characters\n` +
                `• 📊 Personal statistics\n` +
                `• 🎬 Send videos without limits\n` +
                `• 🏗️ Create custom rooms\n\n` +
                `📂 Room Categories:\n` +
                `💬 General | 😌 Chill | 🎲 Random\n` +
                `🎮 Gaming | 🎵 Music | 💻 Tech\n` +
                `⚽ Sports | 🍕 Food | 👑 VIP\n\n` +
                `🌐 Supported Languages:\n` +
                `🇮🇩 Indonesia | 🇺🇸 English | 🇮🇩 Jawa`;
        } else {
            helpMessage = `🤖 AnonTalk Bot - Commands\n\n` +
                `🌐 Language: ${user.lang}\n` +
                `💡 Status: Regular User\n\n` +
                `📋 Basic Commands:\n` +
                `/start - Start the bot\n` +
                `/help - Show this help message\n` +
                `/lang - Change language (🇮🇩🇺🇸🇮🇩)\n` +
                `/avatar - Change your avatar\n` +
                `/cancel - Cancel current action\n\n` +
                `🏠 Room Commands:\n` +
                `/join - Join rooms by category\n` +
                `/rooms - View all available rooms\n` +
                `/exit - Leave current room\n` +
                `/list - Show room members\n\n` +
                `💎 VIP Commands:\n` +
                `/vip - Learn about VIP features\n` +
                `/donate - Support the bot\n\n` +
                `📂 Room Categories:\n` +
                `💬 General | 😌 Chill | 🎲 Random\n` +
                `🎮 Gaming | 🎵 Music | 💻 Tech\n` +
                `⚽ Sports | 🍕 Food | 👑 VIP\n\n` +
                `🌐 Supported Languages:\n` +
                `🇮🇩 Indonesia | 🇺🇸 English | 🇮🇩 Jawa\n\n` +
                `💡 Upgrade to VIP for:\n` +
                `• 🏠 Exclusive VIP rooms\n` +
                `• ⚡ Priority room joining\n` +
                `• 👤 Unlimited avatar characters\n` +
                `• 📊 Personal statistics\n` +
                `• 🎬 Send videos without limits\n` +
                `• 🏗️ Create custom rooms`;
        }

        // Send the enhanced help message
        await ctx.telegram.sendMessage(ctx.chat.id, helpMessage).catch(() => false);
        
    } catch (err) {
        console.error("Error fetching user or sending message:", err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred. Please try again.");
    }
};
