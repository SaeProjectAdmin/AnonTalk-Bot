#!/bin/bash

echo "🚀 Starting Firebase App Hosting deployment..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Environment variables are configured in firebase.json
echo "🔧 Environment variables configured in firebase.json"

# Deploy to Firebase App Hosting
echo "🌐 Deploying to Firebase App Hosting..."
firebase deploy --only apphosting

echo "✅ Deployment completed!"
echo "🔗 Your app is available at: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app"
echo "📊 Performance monitoring: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app/performance" 