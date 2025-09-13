# Township POS Mobile

A React Native mobile application for small business owners in South African townships, providing offline-first point-of-sale functionality with integrated credit scoring.

## Features

### 🏪 Point of Sale System
- **Offline-first architecture** - Works without internet connection
- **Inventory management** - Track stock levels and low-stock alerts
- **Multiple payment methods** - Cash, mobile money, QR codes, cards
- **Real-time sales tracking** - Monitor daily performance
- **Receipt generation** - Digital receipts for customers

### 📊 Credit Scoring System
- **Automatic credit building** - Build credit through daily transactions
- **Real-time score updates** - See credit improvements instantly
- **Loan eligibility** - Access to microfinance based on performance
- **Business analytics** - Track sales trends and payment preferences

### 🎮 Gamification
- **Level progression** - Advance through business levels
- **Achievement badges** - Earn rewards for milestones
- **Daily missions** - Complete challenges for XP
- **Credit garden** - Visual representation of credit growth
- **Township leaderboard** - Compete with other local businesses

### 📱 Mobile-Optimized Features
- **Touch-friendly interface** - Designed for smartphones and tablets
- **Offline data sync** - Automatic synchronization when online
- **Local notifications** - Stock alerts and daily reminders
- **Data backup** - Secure local data storage
- **Network status indicators** - Clear offline/online status

## Installation

### Prerequisites
- Node.js 16 or higher
- React Native CLI
- Android Studio (for Android development)
- Android SDK with API level 21 or higher

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/township-pos-mobile.git
   cd township-pos-mobile/mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Android Setup**
   ```bash
   # Install Android dependencies
   cd android
   ./gradlew clean
   cd ..
   
   # Start Metro bundler
   npm start
   
   # Run on Android device/emulator
   npm run android
   ```

4. **iOS Setup** (if needed)
   ```bash
   cd ios
   pod install
   cd ..
   npm run ios
   ```

## Building for Production

### Android APK

1. **Generate release APK**
   ```bash
   chmod +x scripts/build-release.sh
   ./scripts/build-release.sh
   ```

2. **The APK will be available in the `dist/` folder**

### Signing Configuration

For production builds, create a `gradle.properties` file in the `android/` directory:

```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

## Architecture

### Offline-First Design
- **Local SQLite database** - All data stored locally first
- **Sync queue** - Operations queued when offline
- **Conflict resolution** - Smart merging of local and server data
- **Optimistic updates** - Immediate UI updates with rollback capability

### Data Flow
```
User Action → Local Database → UI Update → Sync Queue → Server (when online)
```

### Key Services
- **DatabaseService** - Local SQLite operations
- **SyncService** - Online/offline synchronization
- **DeviceService** - Native device features
- **OfflineManager** - Offline state management

## Configuration

### Server Connection
Update the API base URL in `src/services/SyncService.js`:
```javascript
this.baseURL = 'https://your-server.com/api';
```

### App Settings
Modify app configuration in `src/config/AppConfig.js`:
```javascript
export const AppConfig = {
  appName: 'Township POS',
  version: '1.0.0',
  syncInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  // ... other settings
};
```

## Deployment

### For Small Business Owners

1. **Direct APK Distribution**
   - Build release APK using the build script
   - Distribute via file sharing or download links
   - Provide installation instructions

2. **Installation Instructions for Users**
   - Enable "Unknown Sources" in Android Settings
   - Download the APK file
   - Install and grant necessary permissions
   - Complete initial setup

### Google Play Store (Optional)
1. Create a Google Play Console account
2. Upload the signed APK
3. Complete store listing
4. Submit for review

## Usage Guide

### First Time Setup
1. **Launch the app** and complete initial setup
2. **Add inventory items** using the Inventory tab
3. **Process your first sale** using the POS tab
4. **Check your credit score** in the Dashboard tab

### Daily Operations
1. **Morning**: Check inventory levels and low-stock alerts
2. **Throughout the day**: Process sales using the POS system
3. **Evening**: Review daily performance and sync data
4. **Complete daily missions** for XP and rewards

### Offline Usage
- The app works fully offline
- All transactions are saved locally
- Data syncs automatically when connection is restored
- Manual sync available in settings

## Troubleshooting

### Common Issues

**App won't start**
- Check Android version (minimum API 21)
- Ensure sufficient storage space
- Clear app cache if needed

**Sync problems**
- Check internet connection
- Verify server URL configuration
- Check sync queue in settings

**Performance issues**
- Clear app cache
- Restart the app
- Check available device storage

### Support
For technical support or business inquiries:
- Email: support@townshippospro.com
- WhatsApp: +27 XX XXX XXXX
- Website: https://townshippospro.com

## Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for South African township entrepreneurs
- Inspired by the need for financial inclusion
- Designed with offline-first principles
- Optimized for low-end Android devices

---

**Township POS Mobile** - Empowering small businesses, one transaction at a time. 🏪📱
