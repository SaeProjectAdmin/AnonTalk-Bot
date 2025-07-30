@echo off
REM AnonTalk Bot - Firebase App Hosting Deployment Script for Windows
REM Version 2.0.0

echo 🚀 Starting AnonTalk Bot deployment to Firebase App Hosting...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Firebase first:
    firebase login
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found. Please create one with your configuration.
    echo Required environment variables:
    echo - BOT_TOKEN
    echo - DB_URL
    echo - FIREBASE_CREDENTIALS
    echo - BOT_NAME
)

REM Check if serviceAccount.json exists
if not exist serviceAccount.json (
    echo ⚠️  Warning: serviceAccount.json not found. Please ensure it exists for Firebase authentication.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the application (if needed)
echo 🔨 Building application...
npm run build

REM Deploy to Firebase App Hosting
echo 🚀 Deploying to Firebase App Hosting...
firebase deploy --only apphosting

REM Check deployment status
if errorlevel 0 (
    echo ✅ Deployment successful!
    echo 🌐 Your AnonTalk Bot is now live on Firebase App Hosting
    echo 📱 Bot should be accessible via the Firebase hosting URL
    echo.
    echo 🔧 Next steps:
    echo 1. Set up your bot webhook URL in Telegram
    echo 2. Configure your environment variables in Firebase
    echo 3. Test your bot functionality
    echo.
    echo 📚 For more information, check the README_NEW.md file
) else (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
)

pause 