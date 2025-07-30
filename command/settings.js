const { Markup } = require('telegraf');
const db = require('../db'); // Firebase DB instance
const saveLang = require('../session/lang');
const saveAva = require('../session/ava');
const lang = require('../lang');

// Set language session and present the user with available languages
const setLang = async (ctx) => {
    try {
        const dbuser = db.collection('users');
        const dblang = db.collection('langs');

        // Update user session to 'lang'
        await dbuser.child(ctx.chat.id).update({ session: 'lang' });

        // Fetch user data
        const userSnapshot = await dbuser.child(ctx.chat.id).once('value');
        const user = userSnapshot.val();

        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        // Fetch available languages
        const langSnapshot = await dblang.once('value');
        const langs = langSnapshot.val();

        let keyboard = [];
        let rkeyboard = [];

        // Create the keyboard with languages
        Object.values(langs).forEach((v, i) => {
            rkeyboard.push(v.lang);
            if (i % 2 === 0) {
                keyboard.push(rkeyboard);
                rkeyboard = []; // Reset after every 2 items
            }
        });

        // Send language selection message with keyboard
        await ctx.telegram.sendMessage(
            ctx.chat.id,
            lang(user.lang, user.lang).current_lang,
            Markup.keyboard(keyboard).resize(true).oneTime(true)
        ).catch((err) => false);

    } catch (err) {
        console.error('Error setting language:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while setting the language.");
    }
};

// Set avatar session and send the current avatar message
const setAva = async (ctx) => {
    try {
        const dbuser = db.collection('users');

        // Update user session to 'ava'
        await dbuser.child(ctx.chat.id).update({ session: 'ava' });

        // Fetch user data
        const userSnapshot = await dbuser.child(ctx.chat.id).once('value');
        const user = userSnapshot.val();

        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        // Check if user is VIP
        const isVIP = user.vip || false;
        
        let avatarMessage = lang(user.lang, user.ava).current_ava;
        
        if (isVIP) {
            avatarMessage += '\n\n💎 VIP Avatar: Anda dapat menggunakan avatar tanpa batas karakter!';
        }

        // Send the current avatar message
        await ctx.telegram.sendMessage(
            ctx.chat.id,
            avatarMessage
        ).catch((err) => false);

    } catch (err) {
        console.error('Error setting avatar:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while setting the avatar.");
    }
};

module.exports = {
    setLang,
    setAva,
    saveAva,
    saveLang
};
