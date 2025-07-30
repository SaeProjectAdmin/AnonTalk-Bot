const db = require('../db');
const lang = require('../lang');

// Admin user IDs (replace with actual admin IDs)
const ADMIN_IDS = ['6265283380']; // Add your Telegram user IDs here

// Check if user is admin
const isAdmin = (userId) => {
    return ADMIN_IDS.includes(userId.toString());
};

// Command: /setvip <user_id> <true/false>
const setVIP = async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 3) {
        return ctx.reply('❌ Format: /setvip <user_id> <true/false>\nContoh: /setvip 123456789 true');
    }

    const targetUserId = args[1];
    const isVIP = args[2].toLowerCase() === 'true';

    try {
        const success = await db.setUserVIP(targetUserId, isVIP);
        
        if (success) {
            const status = isVIP ? 'VIP' : 'Regular';
            await ctx.reply(`✅ User ${targetUserId} berhasil di-set sebagai ${status}`);
        } else {
            await ctx.reply('❌ Gagal mengubah status VIP user.');
        }
    } catch (error) {
        console.error("Error setting VIP status:", error);
        await ctx.reply("❌ Terjadi kesalahan saat mengatur status VIP.");
    }
};

// Command: /checkvip <user_id>
const checkVIP = async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('❌ Format: /checkvip <user_id>\nContoh: /checkvip 123456789');
    }

    const targetUserId = args[1];

    try {
        const isVIP = await db.isUserVIP(targetUserId);
        const status = isVIP ? '✅ VIP' : '❌ Regular';
        
        await ctx.reply(`👤 User ${targetUserId}\nStatus: ${status}`);
    } catch (error) {
        console.error("Error checking VIP status:", error);
        await ctx.reply("❌ Terjadi kesalahan saat mengecek status VIP.");
    }
};

// Command: /listvip
const listVIP = async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin.');
    }

    try {
        const snapshot = await db.ref('vip_users').once('value');
        const vipUsers = snapshot.val();
        
        if (!vipUsers) {
            return ctx.reply('📋 Tidak ada user VIP saat ini.');
        }

        let message = '👑 **Daftar User VIP:**\n\n';
        let count = 0;
        
        for (const [userId, userData] of Object.entries(vipUsers)) {
            if (userData.isVIP) {
                count++;
                const date = userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('id-ID') : 'Unknown';
                message += `${count}. ID: ${userId}\n   📅 Set: ${date}\n\n`;
            }
        }

        if (count === 0) {
            message = '📋 Tidak ada user VIP saat ini.';
        } else {
            message += `\n📊 Total VIP Users: ${count}`;
        }

        await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error("Error listing VIP users:", error);
        await ctx.reply("❌ Terjadi kesalahan saat mengambil daftar VIP.");
    }
};

// Command: /removevip <user_id>
const removeVIP = async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin.');
    }

    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('❌ Format: /removevip <user_id>\nContoh: /removevip 123456789');
    }

    const targetUserId = args[1];

    try {
        const success = await db.setUserVIP(targetUserId, false);
        
        if (success) {
            await ctx.reply(`✅ VIP status user ${targetUserId} berhasil dihapus.`);
        } else {
            await ctx.reply('❌ Gagal menghapus status VIP user.');
        }
    } catch (error) {
        console.error("Error removing VIP status:", error);
        await ctx.reply("❌ Terjadi kesalahan saat menghapus status VIP.");
    }
};

// Command: /adminhelp
const adminHelp = async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('❌ Anda tidak memiliki akses admin.');
    }

    const helpMessage = `🛠️ **Admin Commands**\n\n` +
        `**VIP Management:**\n` +
        `• /setvip <user_id> <true/false> - Set status VIP user\n` +
        `• /checkvip <user_id> - Cek status VIP user\n` +
        `• /listvip - Lihat daftar semua user VIP\n` +
        `• /removevip <user_id> - Hapus status VIP user\n\n` +
        `**Contoh Penggunaan:**\n` +
        `• /setvip 123456789 true - Set user sebagai VIP\n` +
        `• /setvip 123456789 false - Hapus status VIP user\n` +
        `• /checkvip 123456789 - Cek apakah user VIP\n` +
        `• /removevip 123456789 - Hapus status VIP user\n\n` +
        `💡 **Tips:**\n` +
        `• User ID bisa didapat dari forward message atau reply\n` +
        `• Gunakan /listvip untuk melihat semua user VIP\n` +
        `• Status VIP akan tersimpan permanen sampai dihapus`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
};

// Export all functions
module.exports = {
    setVIP,
    checkVIP,
    listVIP,
    removeVIP,
    adminHelp,
    isAdmin
}; 