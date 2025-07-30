#!/bin/bash

echo "🚀 Starting GitHub-based deployment..."

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "🚀 Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo "✅ Changes pushed to GitHub"
    echo "🔄 Firebase App Hosting will automatically deploy from GitHub"
else
    echo "✅ No changes to commit"
fi

echo "⏳ Waiting for deployment to complete..."
echo "🔗 Your app will be available at: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app"
echo "📊 Performance monitoring: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app/performance"

echo ""
echo "💡 Tips:"
echo "   - Check deployment status in Firebase Console"
echo "   - Monitor logs in Firebase Console > App Hosting > Logs"
echo "   - Test your bot after deployment completes" 