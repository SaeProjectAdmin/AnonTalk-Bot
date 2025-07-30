const db = require('../db');

// Admin user IDs (replace with actual admin IDs)
const ADMIN_IDS = ['6265283380']; // Add your Telegram user IDs here

module.exports = {
    // Check if user is admin
    isAdmin: (userId) => {
        return ADMIN_IDS.includes(userId.toString());
    },

    // Toggle content filtering
    toggleContentFilter: async (ctx) => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const filterRef = db.collection('settings').child('contentFilter');
            const snapshot = await filterRef.once('value');
            const currentSetting = snapshot.val();
            
            const newSetting = !currentSetting;
            await filterRef.set(newSetting);
            
            const message = newSetting ? 
                '✅ Content filtering telah diaktifkan.' :
                '❌ Content filtering telah dinonaktifkan.';
            
            await ctx.reply(message);
        } catch (error) {
            console.error('Error toggling content filter:', error);
            await ctx.reply('❌ Terjadi kesalahan saat mengubah pengaturan.');
        }
    },

    // View user warnings
    viewUserWarnings: async (ctx, targetUserId) => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const userRef = db.collection('users').child(targetUserId);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();
            
            if (!userData) {
                return ctx.reply('❌ User tidak ditemukan.');
            }

            const warnings = userData.warnings || 0;
            const isBanned = userData.banned || false;
            const banReason = userData.banReason || 'N/A';
            
            const message = `👤 **User Info**
ID: ${targetUserId}
Username: ${userData.username || 'N/A'}
Warnings: ${warnings}/3
Status: ${isBanned ? '🚫 Banned' : '✅ Active'}
${isBanned ? `Ban Reason: ${banReason}` : ''}`;

            await ctx.reply(message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error viewing user warnings:', error);
            await ctx.reply('❌ Terjadi kesalahan saat melihat data user.');
        }
    },

    // Ban user
    banUser: async (ctx, targetUserId, reason = 'Admin ban') => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const userRef = db.collection('users').child(targetUserId);
            await userRef.update({
                banned: true,
                bannedAt: new Date().toISOString(),
                banReason: reason
            });
            
            await ctx.reply(`✅ User ${targetUserId} telah dibanned.\nReason: ${reason}`);
        } catch (error) {
            console.error('Error banning user:', error);
            await ctx.reply('❌ Terjadi kesalahan saat membanned user.');
        }
    },

    // Unban user
    unbanUser: async (ctx, targetUserId) => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const userRef = db.collection('users').child(targetUserId);
            await userRef.update({
                banned: false,
                bannedAt: null,
                banReason: null,
                warnings: 0
            });
            
            await ctx.reply(`✅ User ${targetUserId} telah diunban.`);
        } catch (error) {
            console.error('Error unbanning user:', error);
            await ctx.reply('❌ Terjadi kesalahan saat unban user.');
        }
    },

    // Reset user warnings
    resetUserWarnings: async (ctx, targetUserId) => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const userRef = db.collection('users').child(targetUserId);
            await userRef.update({
                warnings: 0
            });
            
            await ctx.reply(`✅ Warning user ${targetUserId} telah direset.`);
        } catch (error) {
            console.error('Error resetting user warnings:', error);
            await ctx.reply('❌ Terjadi kesalahan saat reset warning user.');
        }
    },

    // View content filter stats
    viewFilterStats: async (ctx) => {
        if (!this.isAdmin(ctx.from.id)) {
            return ctx.reply('❌ Anda tidak memiliki akses admin.');
        }

        try {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.once('value');
            const users = snapshot.val() || {};
            
            let totalWarnings = 0;
            let bannedUsers = 0;
            let totalUsers = Object.keys(users).length;
            
            Object.values(users).forEach(user => {
                totalWarnings += user.warnings || 0;
                if (user.banned) bannedUsers++;
            });
            
            const message = `📊 **Content Filter Statistics**
Total Users: ${totalUsers}
Total Warnings: ${totalWarnings}
Banned Users: ${bannedUsers}
Average Warnings: ${totalUsers > 0 ? (totalWarnings / totalUsers).toFixed(2) : 0}`;

            await ctx.reply(message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error viewing filter stats:', error);
            await ctx.reply('❌ Terjadi kesalahan saat melihat statistik.');
        }
    }
}; 