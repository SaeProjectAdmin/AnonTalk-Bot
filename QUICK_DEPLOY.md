# ⚡ Quick Deploy - AnonTalk Bot to Firebase App Hosting

## 🚀 Immediate Deployment Steps

### 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Configure Environment Variables
Create a `.env` file in your project root:

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

### 4. Update Firebase Project ID
Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 5. Deploy (Choose One Method)

#### Option A: Windows (Recommended)
```bash
deploy.bat
```

#### Option B: Manual Deployment
```bash
npm install
npm run deploy:hosting
```

#### Option C: Direct Firebase Command
```bash
firebase deploy --only apphosting
```

## 🔧 Required Files

Make sure you have:
- ✅ `.env` file with your configuration
- ✅ `serviceAccount.json` from Firebase Console
- ✅ Updated `.firebaserc` with your project ID

## 🌐 Post-Deployment

### 1. Set Webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project-id.web.app/<YOUR_BOT_TOKEN>"
  }'
```

### 2. Test Your Bot
- Send `/start` to your bot
- Test `/lang` for language selection
- Test `/join` for room joining
- Test `/vip` for VIP features

## 📊 Verify Deployment

Check these URLs:
- **Health Check:** `https://your-project-id.web.app/`
- **Bot Status:** `https://your-project-id.web.app/status`

## 🆘 Quick Troubleshooting

### Bot Not Responding?
1. Check webhook: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
2. Verify `.env` file exists
3. Check Firebase Console logs

### Deployment Failed?
1. Ensure Firebase CLI is installed
2. Check if logged in: `firebase projects:list`
3. Verify project ID in `.firebaserc`

### Database Issues?
1. Verify `DB_URL` in `.env`
2. Check `serviceAccount.json` exists
3. Ensure Firebase project is active

---

**🎉 Your AnonTalk Bot with 24 rooms, 9 categories, 3 languages, and VIP features is ready!** 