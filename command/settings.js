const { Markup } = require('telegraf');
const db = require('../db'); // Firebase DB instance
const saveLang = require('../session/lang');
const saveAva = require('../session/ava');
const lang = require('../lang');

// Set language session and present the user with available languages
const setLang = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        // Update user session to 'lang'
        await db.collection('users').child(user.userid).update({ session: 'lang' });

        // Create inline keyboard for language selection with current selection indicator
        const keyboard = [
            [
                {
                    text: user.lang === 'Indonesia' ? '🇮🇩 Indonesia ✅' : '🇮🇩 Indonesia',
                    callback_data: 'lang_indonesia'
                },
                {
                    text: user.lang === 'English' ? '🇺🇸 English ✅' : '🇺🇸 English',
                    callback_data: 'lang_english'
                }
            ],
        ];

        // Create message showing current language
        const currentLangMessage = {
            'Indonesia': `🌐 **Pilih Bahasa**\n\nBahasa saat ini: **${user.lang}**\n\nPilih bahasa yang ingin Anda gunakan:`,
            'English': `🌐 **Select Language**\n\nCurrent language: **${user.lang}**\n\nChoose the language you want to use:`
        };
        
        // Send language selection message with inline keyboard
        await ctx.telegram.sendMessage(
            ctx.chat.id,
            currentLangMessage[user.lang] || currentLangMessage['English'],
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        ).catch((err) => false);

    } catch (err) {
        console.error('Error setting language:', err);
        ctx.telegram.sendMessage(ctx.chat.id, "An error occurred while setting the language.");
    }
};

// Handle language selection callback
const handleLanguageCallback = async (ctx, selectedLang) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.answerCbQuery("User not found. Please try /start again.");
        }

        // Map callback data to language names
        const langMap = {
            'lang_indonesia': 'Indonesia',
            'lang_english': 'English'
        };

        const newLang = langMap[selectedLang];
        
        if (!newLang) {
            return ctx.answerCbQuery("Invalid language selection.");
        }

        // Update user's language
        await db.collection('users').child(user.userid).update({ 
            lang: newLang,
            session: '' // Clear session
        });

        // Send confirmation message with updated language info
        const confirmMessage = {
            'Indonesia': `✅ **Bahasa berhasil diubah!**\n\nBahasa baru: **${newLang}**\n\nBot sekarang akan menggunakan bahasa ${newLang}.`,
            'English': `✅ **Language changed successfully!**\n\nNew language: **${newLang}**\n\nThe bot will now use ${newLang} language.`
        };
        
        await ctx.editMessageText(confirmMessage[newLang] || confirmMessage['English'], {
            parse_mode: 'Markdown'
        });
        
        ctx.answerCbQuery("Language updated successfully!");

    } catch (error) {
        console.error("Error handling language callback:", error);
        ctx.answerCbQuery("An error occurred. Please try again.");
    }
};

// Set avatar session and send the current avatar message
const setAva = async (ctx) => {
    try {
        const user = await db.getUserByChatId(ctx.chat.id);
        
        if (!user) {
            return ctx.telegram.sendMessage(ctx.chat.id, "User not found.");
        }

        // Update user session to 'ava'
        await db.collection('users').child(user.userid).update({ session: 'ava' });

        let avatarMessage = lang(user.lang, user.ava).current_ava;

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
    saveLang,
    handleLanguageCallback
};
