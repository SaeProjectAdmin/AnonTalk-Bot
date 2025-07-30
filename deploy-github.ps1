# PowerShell deployment script for GitHub-based Firebase App Hosting

Write-Host "🚀 Starting GitHub-based deployment..." -ForegroundColor Green

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "🚀 Auto-deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host "✅ Changes pushed to GitHub" -ForegroundColor Green
    Write-Host "🔄 Firebase App Hosting will automatically deploy from GitHub" -ForegroundColor Cyan
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "🔗 Your app will be available at: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app" -ForegroundColor Cyan
Write-Host "📊 Performance monitoring: https://anontalk--anontalk-bot-5f3f1.us-central1.hosted.app/performance" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Check deployment status in Firebase Console" -ForegroundColor White
Write-Host "   - Monitor logs in Firebase Console > App Hosting > Logs" -ForegroundColor White
Write-Host "   - Test your bot after deployment completes" -ForegroundColor White 