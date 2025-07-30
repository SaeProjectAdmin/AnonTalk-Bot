#!/bin/bash

echo "🚀 Starting optimized deployment..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies with production flag
echo "📦 Installing dependencies..."
npm install --production

# Deploy to Google Cloud Run
echo "🌐 Deploying to Google Cloud Run..."
gcloud app deploy app.yaml --quiet

echo "✅ Deployment completed!"
echo "🔗 Your app is available at: https://anontalk-app--anontalk-bot-5f3f1.asia-east1.hosted.app"
echo "📊 Performance monitoring: https://anontalk-app--anontalk-bot-5f3f1.asia-east1.hosted.app/performance" 