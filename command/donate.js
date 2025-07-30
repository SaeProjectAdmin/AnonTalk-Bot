const { Telegraf } = require('telegraf');
const { setUserVIP, createPaymentRecord } = require('../db');
const { VIP_PLANS } = require('../config');

const donate = async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    
    let message = `🌟 **VIP Features Available** 🌟\n\n`;
    message += `Unlock premium features with VIP subscription:\n\n`;
    
    Object.entries(VIP_PLANS).forEach(([plan, details]) => {
        message += `📦 **${plan.toUpperCase()}**\n`;
        message += `💰 Price: Rp ${details.price.toLocaleString('id-ID')}\n`;
        message += `⏱️ Duration: ${details.duration}\n`;
        message += `✨ Features:\n`;
        details.features.forEach(feature => {
            message += `   • ${feature}\n`;
        });
        message += `\n`;
    });
    
    message += `💳 **Payment Methods:**\n`;
    message += `• Bank Transfer\n`;
    message += `• E-Wallet (GoPay, OVO, DANA)\n`;
    message += `• Credit/Debit Card\n\n`;
    message += `To purchase VIP, use: /buy <plan>\n`;
    message += `Example: /buy daily`;
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
};

const processPaymentSuccess = async (orderId, paymentStatus) => {
    try {
        // Update payment status in database
        const payment = await getPaymentById(orderId);
        if (payment) {
            await updatePaymentStatus(orderId, paymentStatus);
            
            if (paymentStatus === 'success') {
                // Activate VIP for user
                const plan = payment.plan;
                const planDetails = VIP_PLANS[plan];
                
                if (planDetails) {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + planDetails.days);
                    
                    await setUserVIP(payment.userId, {
                        plan: plan,
                        startDate: new Date().toISOString(),
                        expiryDate: expiryDate.toISOString(),
                        isActive: true
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error processing payment success:', error);
    }
};

module.exports = { donate, processPaymentSuccess }; 