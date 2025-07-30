#!/bin/bash

echo "🚀 Starting deployment to Firebase App Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Please install it first:"
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Login to Firebase
echo "🔐 Logging in to Firebase..."
firebase login

# Deploy to App Hosting
echo "📦 Deploying to Firebase App Hosting..."
firebase deploy --only apphosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live on Firebase App Hosting"
    echo "📱 Update your webhook URL in Telegram Bot API"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 