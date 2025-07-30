# 🚀 AnonTalk Bot - Firebase App Hosting Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Node.js** (v18 or higher)
- ✅ **Firebase CLI** installed globally
- ✅ **Firebase project** created
- ✅ **Telegram Bot Token** from @BotFather
- ✅ **Firebase service account** credentials

## 🔧 Setup Instructions

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
# Navigate to your project directory
cd AnonTalk-Bot

# Initialize Firebase (if not already done)
firebase init apphosting
```

### 4. Configure Environment Variables

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your values:**
   ```env
   # Bot Configuration
   BOT_TOKEN=your_telegram_bot_token_here
   BOT_NAME=AnonTalk Bot

   # Firebase Configuration
   DB_URL=https://your-project-id.firebaseio.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CREDENTIALS_PATH=./serviceAccount.json

   # Environment
   NODE_ENV=production
   PORT=8080

   # Webhook Configuration
   WEBHOOK_URL=https://your-project-id.web.app/your_bot_token

   # VIP Configuration
   VIP_ENABLED=true
   VIP_DAILY_PRICE=5000
   VIP_WEEKLY_PRICE=25000
   VIP_MONTHLY_PRICE=75000
   ```

### 5. Set Up Firebase Service Account

1. **Go to Firebase Console** → Project Settings → Service Accounts
2. **Generate new private key**
3. **Download the JSON file**
4. **Save as `serviceAccount.json` in your project root**

### 6. Configure Firebase Project

1. **Update `.firebaserc`:**
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

2. **Update `firebase.json` (already configured):**
   ```json
   {
     "apphosting": {
       "source": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**",
         "**/public/**",
         "**/*.log",
         "**/CHANGELOG.md",
         "**/README_NEW.md",
         "**/deploy.sh",
         "**/vercel.json",
         "**/app.yaml"
       ]
     }
   }
   ```

## 🚀 Deployment Steps

### Option 1: Using Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy to Firebase App Hosting
firebase deploy --only apphosting
```

### Option 3: Using npm scripts

```bash
# Install dependencies
npm install

# Deploy using npm script
npm run deploy:hosting
```

## 🔗 Post-Deployment Configuration

### 1. Set Up Telegram Webhook

After successful deployment, set up your bot webhook:

```bash
# Replace with your actual values
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project-id.web.app/<YOUR_BOT_TOKEN>",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### 2. Verify Deployment

Check your bot status:

```bash
# Health check
curl https://your-project-id.web.app/

# Bot status
curl https://your-project-id.web.app/status
```

### 3. Test Your Bot

1. **Send `/start` to your bot**
2. **Test language selection with `/lang`**
3. **Test room joining with `/join`**
4. **Test VIP features with `/vip`**

## 🔧 Environment Configuration

### Firebase Console Configuration

1. **Go to Firebase Console** → Project Settings
2. **Add your environment variables:**
   - `BOT_TOKEN`
   - `DB_URL`
   - `FIREBASE_PROJECT_ID`
   - `WEBHOOK_URL`

### Database Rules

Ensure your Firebase Realtime Database has proper rules:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "rooms": {
      ".read": true,
      ".write": "auth != null"
    },
    "vip_users": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "categories": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 📊 Monitoring & Logs

### View Deployment Logs

```bash
# View Firebase hosting logs
firebase hosting:channel:list

# View real-time logs
firebase hosting:channel:open
```

### Monitor Bot Performance

1. **Check bot status:** `https://your-project-id.web.app/status`
2. **Monitor Firebase Console** → Functions → Logs
3. **Check Telegram Bot API** for webhook status

## 🔄 Update Deployment

To update your bot:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Deploy updates
npm run deploy:hosting
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Webhook Not Working
```bash
# Check webhook status
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

#### 2. Database Connection Issues
- Verify `DB_URL` is correct
- Check `serviceAccount.json` permissions
- Ensure Firebase project is active

#### 3. Bot Not Responding
- Check bot token validity
- Verify webhook URL is accessible
- Check Firebase hosting logs

#### 4. Environment Variables Not Loading
- Ensure `.env` file exists
- Check variable names match exactly
- Restart deployment after changes

### Debug Commands

```bash
# Test local development
npm run dev

# Check Firebase project
firebase projects:list

# View deployment status
firebase hosting:channel:list

# Check bot webhook
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## 📱 Bot Features After Deployment

Your deployed bot will have:

- ✅ **24 Rooms** across 9 categories
- ✅ **3 Languages** (Indonesia, English, Jawa)
- ✅ **VIP System** with priority features
- ✅ **Enhanced Media Support**
- ✅ **Inline Keyboard Navigation**
- ✅ **Real-time Chat**
- ✅ **Custom Room Creation** (VIP)

## 🔒 Security Considerations

1. **Never commit sensitive files:**
   - `.env`
   - `serviceAccount.json`
   - Bot tokens

2. **Use environment variables** for all sensitive data
3. **Regularly rotate** bot tokens and service account keys
4. **Monitor** bot usage and logs

## 📞 Support

If you encounter issues:

1. **Check the logs** in Firebase Console
2. **Verify configuration** in `.env` file
3. **Test locally** with `npm run dev`
4. **Check Telegram Bot API** status
5. **Review Firebase documentation**

---

**🎉 Congratulations!** Your AnonTalk Bot is now deployed on Firebase App Hosting with all enhanced features! 