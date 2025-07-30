# 🤖 AnonTalk Bot - Anonymous Chat Bot

A feature-rich anonymous chat bot for Telegram with VIP features, multi-language support, and enhanced media sharing capabilities.

## 🌟 Features

### 💬 Anonymous Chat
- **Anonymous Messaging** - Chat without revealing your identity
- **Room-based Chat** - Join different chat rooms by topic and language
- **Real-time Messaging** - Instant message delivery to room members
- **Media Sharing** - Share photos, videos, stickers, and more

### 👑 VIP Features
- **Unlimited Avatar Characters** - VIP users can use up to 100 characters for avatars
- **Custom Room Creation** - Create private VIP-only rooms
- **Enhanced Video Support** - Send videos up to 200MB (vs 50MB for regular users)
- **Exclusive VIP Rooms** - Access to premium chat rooms
- **Priority Support** - Faster customer service

### 🌐 Multi-Language Support
- **Indonesia** - Full Indonesian language support
- **English** - Complete English language support  
- **Jawa** - Javanese language support

### 🎬 Media Support
- **Photos** - Up to 10MB
- **Videos** - Up to 50MB (regular), 200MB (VIP)
- **Stickers** - All Telegram stickers
- **Documents** - Up to 2GB
- **Audio** - Up to 50MB
- **Voice Messages** - Up to 50MB
- **Video Notes** - Up to 50MB
- **Animations/GIFs** - Up to 50MB
- **Contacts** - Full contact sharing
- **Location** - GPS coordinates
- **Venues** - Location with address

## 💰 VIP Packages (Rupiah)

### 📅 Daily Package - Rp 5.000
- VIP access for 24 hours
- All VIP features
- Perfect for trying VIP features

### 📅 Weekly Package - Rp 25.000
- VIP access for 7 days
- All VIP features
- **28% discount** compared to daily rate

### 📅 Monthly Package - Rp 75.000
- VIP access for 30 days
- All VIP features
- **50% discount** compared to daily rate
- **Highest priority** support

## 🏠 Room Categories

### General Rooms
- **General Indonesia** - General chat in Indonesian
- **General English** - General chat in English
- **General Jawa** - General chat in Javanese

### Specialized Rooms
- **Chill Rooms** - Relaxed conversations
- **Random Rooms** - Random topics
- **Gaming Rooms** - Gaming discussions
- **Music Rooms** - Music conversations
- **Tech Rooms** - Technology discussions
- **Sports Rooms** - Sports talk
- **Food Rooms** - Food discussions

### VIP Rooms (VIP Only)
- **VIP Indonesia** - Exclusive Indonesian VIP room
- **VIP English** - Exclusive English VIP room
- **VIP Jawa** - Exclusive Javanese VIP room

## 📋 Commands

### Basic Commands
- `/start` - Start the bot and see welcome message
- `/help` - Show help information
- `/lang` - Set your language preference
- `/avatar` - Set your avatar (emoji or text)
- `/join` - Join a room or see available rooms
- `/exit` - Leave current room
- `/rooms` - List all available rooms
- `/list` - Show members in current room
- `/cancel` - Cancel current action

### VIP Commands
- `/vip` - Show VIP information and status
- `/create-room <name>` - Create custom VIP room
- `/donate` - Support bot development and get VIP

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- Firebase Realtime Database
- Telegram Bot Token

### Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/AnonTalk-Bot.git
cd AnonTalk-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
```

4. Edit `.env` file with your configuration:
```env
BOT_TOKEN=your_telegram_bot_token
BOT_NAME=AnonTalkV2Bot
DB_URL=your_firebase_database_url
WEBHOOK_URL=your_webhook_url
```

5. Set up Firebase:
   - Create a Firebase project
   - Enable Realtime Database
   - Download service account key
   - Place `serviceAccount.json` in project root

6. Start the bot:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Configuration

### Environment Variables
- `BOT_TOKEN` - Your Telegram bot token
- `BOT_NAME` - Bot name for display
- `DB_URL` - Firebase Realtime Database URL
- `WEBHOOK_URL` - Webhook URL for production
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

### Firebase Setup
1. Create Firebase project
2. Enable Realtime Database
3. Set up security rules
4. Download service account key
5. Configure database structure

## 📁 Project Structure

```
AnonTalk-Bot/
├── command/           # Bot commands
│   ├── start.js      # Start command
│   ├── help.js       # Help command
│   ├── join.js       # Join room command
│   ├── exit.js       # Exit room command
│   ├── settings.js   # Settings commands
│   ├── misc.js       # Miscellaneous commands
│   ├── vip.js        # VIP command
│   └── create-room.js # Create room command
├── session/          # Session handlers
│   ├── sessions.js   # Main session handler
│   ├── lang.js       # Language session
│   ├── ava.js        # Avatar session
│   └── room.js       # Room message handler
├── middleware/       # Middleware
│   └── userCheck.js  # User validation
├── utils/           # Utilities
│   └── mediaHandler.js # Media handling
├── db.js            # Database operations
├── lang.js          # Language strings
├── config.js        # Configuration
├── index.js         # Main entry point
└── package.json     # Dependencies
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🔒 Security

### User Privacy
- Anonymous messaging
- No personal data collection
- Secure message forwarding
- Privacy-focused design

### Data Protection
- Firebase security rules
- Environment variable protection
- Secure webhook handling
- Input validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [VIP Features](VIP_FEATURES.md) - Detailed VIP feature documentation
- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions

### Contact
- **Telegram**: @your_bot_username
- **Email**: support@anontalkbot.com
- **Issues**: GitHub Issues

## 🙏 Acknowledgments

- Telegram Bot API
- Firebase Realtime Database
- Telegraf.js framework
- Community contributors

## 📊 Statistics

- **Languages Supported**: 3 (Indonesia, English, Jawa)
- **Room Categories**: 8+ categories
- **Media Types**: 10+ supported types
- **VIP Features**: 6+ premium features
- **Payment Methods**: 5+ options

---

**Made with ❤️ for the Telegram community** 