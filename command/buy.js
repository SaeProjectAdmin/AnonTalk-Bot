const { Telegraf } = require('telegraf');
const { createPaymentRecord } = require('../db');
const { VIP_PLANS, MIDTRANS_CONFIG } = require('../config');
const midtransClient = require('midtrans-client');

const buy = async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const args = ctx.message.text.split(' ');
    
    if (args.length < 2) {
        await ctx.reply('❌ Please specify a plan: /buy <daily|weekly|monthly>');
        return;
    }
    
    const plan = args[1].toLowerCase();
    
    if (!VIP_PLANS[plan]) {
        await ctx.reply('❌ Invalid plan. Available plans: daily, weekly, monthly');
        return;
    }
    
    const planDetails = VIP_PLANS[plan];
    const orderId = `VIP_${userId}_${Date.now()}`;
    
    try {
        // Create payment record
        await createPaymentRecord({
            orderId: orderId,
            userId: userId,
            username: username,
            plan: plan,
            amount: planDetails.price,
            status: 'pending'
        });
        
        // Initialize Midtrans
        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: MIDTRANS_CONFIG.serverKey,
            clientKey: MIDTRANS_CONFIG.clientKey
        });
        
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: planDetails.price
            },
            customer_details: {
                first_name: username,
                user_id: userId.toString()
            },
            item_details: [{
                id: `VIP_${plan}`,
                price: planDetails.price,
                quantity: 1,
                name: `VIP ${plan.toUpperCase()} Plan`
            }]
        };
        
        const transaction = await snap.createTransaction(parameter);
        
        let message = `🛒 **VIP Purchase - ${plan.toUpperCase()}** 🛒\n\n`;
        message += `💰 Price: Rp ${planDetails.price.toLocaleString('id-ID')}\n`;
        message += `⏱️ Duration: ${planDetails.duration}\n`;
        message += `✨ Features:\n`;
        planDetails.features.forEach(feature => {
            message += `   • ${feature}\n`;
        });
        message += `\n💳 **Payment Link:**\n`;
        message += `${transaction.redirect_url}\n\n`;
        message += `📋 Order ID: \`${orderId}\``;
        
        await ctx.reply(message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('Error creating payment:', error);
        await ctx.reply('❌ Error creating payment. Please try again later.');
    }
};

module.exports = { buy }; 