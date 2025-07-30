#!/bin/bash

# AnonTalk Bot - Firebase App Hosting Deployment Script
# Version 2.0.0

echo "🚀 Starting AnonTalk Bot deployment to Firebase App Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    firebase login
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Please create one with your configuration."
    echo "Required environment variables:"
    echo "- BOT_TOKEN"
    echo "- DB_URL"
    echo "- FIREBASE_CREDENTIALS"
    echo "- BOT_NAME"
fi

# Check if serviceAccount.json exists
if [ ! -f serviceAccount.json ]; then
    echo "⚠️  Warning: serviceAccount.json not found. Please ensure it exists for Firebase authentication."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application (if needed)
echo "🔨 Building application..."
npm run build

# Deploy to Firebase App Hosting
echo "🚀 Deploying to Firebase App Hosting..."
firebase deploy --only apphosting

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your AnonTalk Bot is now live on Firebase App Hosting"
    echo "📱 Bot should be accessible via the Firebase hosting URL"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set up your bot webhook URL in Telegram"
    echo "2. Configure your environment variables in Firebase"
    echo "3. Test your bot functionality"
    echo ""
    echo "📚 For more information, check the README_NEW.md file"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 