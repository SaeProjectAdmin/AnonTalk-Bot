# AnonTalk Bot - Enhanced Room System

## 🌟 Overview

AnonTalk Bot is a comprehensive anonymous chat bot for Telegram with an expanded room system, VIP features, and multi-language support. This enhanced version includes 24 default rooms across 3 languages with categorized room types and exclusive VIP features.

## 🏗️ System Architecture

### 🎭 Fun Room Types (24 Types)
- **🤪 Room Ghibah** - Gossip and casual chat
- **😴 Room Tidur** - Relaxed and sleepy vibes
- **🍕 Room Makan** - Food and culinary discussions
- **🎮 Room Game** - Gaming conversations
- **🎵 Room Musik** - Music and entertainment
- **💻 Room Coding** - Technology and programming
- **🏃 Room Olahraga** - Sports and fitness
- **📚 Room Belajar** - Study and education
- **🎬 Room Film** - Movies and entertainment
- **🛒 Room Shopping** - Shopping and fashion
- **✈️ Room Travel** - Travel and adventure
- **🐱 Room Kucing** - Pet lovers (cats)
- **🐕 Room Anjing** - Pet lovers (dogs)
- **🌺 Room Bunga** - Nature and flowers
- **☕ Room Kopi** - Coffee and beverages
- **🍰 Room Kue** - Desserts and sweets
- **🎨 Room Seni** - Art and creativity
- **📱 Room Gadget** - Gadgets and tech
- **💄 Room Makeup** - Beauty and cosmetics
- **🏠 Room Rumah** - Home and lifestyle
- **🚗 Room Mobil** - Cars and vehicles
- **🌙 Room Malam** - Night owls
- **☀️ Room Pagi** - Early birds
- **🌈 Room Pelangi** - Colorful and fun

### 🌐 Language Support
- **🇮🇩 Indonesia** - Full Indonesian support
- **🇺🇸 English** - Full English support


### 🏠 Room Structure
- **48 Default Rooms** (24 per language)
- **Regular Rooms**: 20 member capacity
- **VIP Rooms**: 30 member capacity
- **Fun name-based organization**
- **Language-specific filtering**

## 👑 VIP System

### 💎 VIP Features
- **🏠 Exclusive VIP Rooms** - Access to VIP-only rooms
- **⚡ Priority Joining** - Join full rooms with priority
- **👤 Unlimited Avatar Characters** - No character limit on avatars
- **📊 Personal Statistics** - View your chat statistics
- **🎬 Unlimited Video Size** - Send videos without size restrictions
- **🏗️ Custom Room Creation** - Create your own VIP rooms
- **🎯 Priority Support** - Get priority customer support

### 💰 VIP Packages
- **📅 Daily**: Rp 5.000 (24 hours)
- **📅 Weekly**: Rp 25.000 (7 days, 28% discount)
- **📅 Monthly**: Rp 75.000 (30 days, 50% discount)

## 📱 Enhanced Media Support

### ✅ Supported Media Types
- **Text Messages** - Standard text communication
- **Photos & Images** - Image sharing with captions
- **Videos & Video Notes** - Video sharing (VIP: unlimited size)
- **Stickers & GIFs** - Animated content sharing
- **Voice Messages** - Audio voice recordings
- **Audio Files** - Music and audio sharing
- **Documents & Files** - File sharing
- **Contact Sharing** - Share contact information
- **Location Sharing** - Share GPS locations
- **Venue Sharing** - Share venue information

## 🛠️ Technical Improvements

### 🗄️ Database Enhancements
- **Helper Functions** - Consistent database operations
- **VIP Status Management** - Efficient VIP user tracking
- **Room Categorization** - Organized room structure
- **Language Support** - Multi-language database schema
- **Error Handling** - Robust error management

### 🎯 User Experience
- **Inline Keyboards** - Modern button-based navigation
- **Room Grouping** - Category-based room organization
- **VIP Status Indicators** - Clear VIP feature visibility
- **Better Error Messages** - User-friendly error handling
- **Consistent Language Support** - Seamless language switching

### 🛡️ Error Handling
- **Global Error Catchers** - Comprehensive error management
- **Graceful Shutdown** - Proper bot termination
- **Database Connection Management** - Reliable database operations
- **Middleware Error Handling** - Robust middleware error catching

## 📋 Commands

### 🔧 Basic Commands
- `/start` - Initialize the bot
- `/help` - Show command help
- `/lang` - Change language (with inline keyboard)
- `/avatar` - Set your avatar
- `/cancel` - Cancel current action

### 🏠 Room Commands
- `/join` - Join fun rooms (enhanced with inline keyboard)
- `/rooms` - View all available rooms
- `/exit` - Leave current room
- `/list` - Show room members

### 👑 VIP Commands
- `/vip` - View VIP features and status
- `/vip-stats` - View VIP statistics
- `/create-room <name>` - Create custom VIP room
- `/donate` - Support the bot and get VIP

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Firebase project with Realtime Database
- Telegram Bot Token

### Environment Variables
```env
BOT_TOKEN=your_telegram_bot_token
DB_URL=your_firebase_database_url
FIREBASE_CREDENTIALS=path_to_service_account.json
BOT_NAME=AnonTalk Bot
```

### Installation Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase credentials
4. Configure environment variables
5. Run the bot: `npm start`

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Realtime Database
3. Download service account JSON
4. Set up database rules

### Bot Configuration
- Configure webhook URL
- Set up bot commands
- Configure VIP payment system
- Set up language files

## 📊 Database Schema

### Users Collection
```json
{
  "userid": "telegram_user_id",
  "lang": "Indonesia|English",
  "ava": "user_avatar_emoji",
  "room": "current_room_id",
  "session": "current_session_state"
}
```

### Rooms Collection
```json
{
  "room": "unique_room_id",
  "lang": "room_language",
  "member": "current_member_count",
  "maxMember": "maximum_capacity",
  "private": "is_private_room",
  "vip": "is_vip_room",
  "createdAt": "timestamp",
  "description": "room_description"
}
```

### VIP Users Collection
```json
{
  "isVIP": "boolean",
  "activatedAt": "timestamp",
  "expiresAt": "expiration_timestamp"
}
```

## 🌟 Features in Detail

### 🎨 Enhanced Avatar System
- **Regular Users**: Single emoji avatars
- **VIP Users**: Unlimited character avatars
- **Special Effects**: VIP avatars with special indicators

### 🏠 Smart Room Management
- **Auto-balancing**: Automatic room distribution
- **Fun Room Names**: Easy room discovery with fun names
- **Language Isolation**: Language-specific rooms
- **Capacity Management**: Dynamic room capacity

### 📱 Modern UI/UX
- **Inline Keyboards**: Button-based navigation
- **Fun Room Icons**: Visual room identification with fun icons
- **Status Indicators**: Clear user and room status
- **Responsive Design**: Works on all devices

### 🔒 Security Features
- **User Validation**: Proper user authentication
- **Room Access Control**: VIP room protection
- **Media Validation**: File size and type checking
- **Error Recovery**: Graceful error handling

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Firebase Functions
```bash
# Deploy to Firebase Functions
firebase deploy --only functions
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring & Analytics

### Performance Metrics
- **Room Occupancy**: Track room usage
- **User Engagement**: Monitor user activity
- **VIP Conversion**: Track VIP upgrades
- **Error Rates**: Monitor system health

### Logging
- **Structured Logging**: JSON format logs
- **Error Tracking**: Comprehensive error logging
- **User Actions**: Track user interactions
- **System Health**: Monitor bot performance

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **JSDoc**: Documentation
- **Testing**: Unit tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Telegram Bot API** - For the bot platform
- **Firebase** - For the database backend
- **Telegraf** - For the bot framework
- **Community** - For feedback and suggestions

## 📞 Support

- **Documentation**: Check this README
- **Issues**: Report on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: Contact the development team

---

**AnonTalk Bot** - Enhanced anonymous chat experience with modern features and VIP exclusivity. 