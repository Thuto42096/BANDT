#!/bin/bash

# Township POS Mobile - Setup Script
# This script helps set up the React Native project with correct dependencies

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Setting up Township POS Mobile${NC}"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the mobile-app directory.${NC}"
    exit 1
fi

# Clear npm cache
echo -e "${YELLOW}🧹 Clearing npm cache...${NC}"
npm cache clean --force

# Remove node_modules and package-lock.json if they exist
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}🗑️  Removing existing node_modules...${NC}"
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo -e "${YELLOW}🗑️  Removing existing package-lock.json...${NC}"
    rm -f package-lock.json
fi

# Use minimal package.json first
echo -e "${YELLOW}📦 Using minimal package.json for initial setup...${NC}"
cp package-minimal.json package.json

# Install core dependencies
echo -e "${YELLOW}📦 Installing core dependencies...${NC}"
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Core dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install core dependencies!${NC}"
    exit 1
fi

# Now add additional dependencies one by one
echo -e "${YELLOW}📦 Adding additional dependencies...${NC}"

# SQLite for offline database
echo -e "${YELLOW}  Installing react-native-sqlite-storage...${NC}"
npm install react-native-sqlite-storage@^6.0.1

# Charts for dashboard
echo -e "${YELLOW}  Installing react-native-chart-kit and react-native-svg...${NC}"
npm install react-native-chart-kit@^6.12.0 react-native-svg@^13.14.0

# Permissions
echo -e "${YELLOW}  Installing react-native-permissions...${NC}"
npm install react-native-permissions@^3.10.1

# Push notifications
echo -e "${YELLOW}  Installing react-native-push-notification...${NC}"
npm install react-native-push-notification@^8.1.1

# Gesture handler and reanimated
echo -e "${YELLOW}  Installing react-native-gesture-handler and react-native-reanimated...${NC}"
npm install react-native-gesture-handler@^2.13.4 react-native-reanimated@^3.5.4

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📱 Next steps:${NC}"
echo "1. Make sure you have Android Studio installed"
echo "2. Set up your Android emulator or connect a device"
echo "3. Run: npm run android"
echo ""
echo -e "${YELLOW}💡 If you encounter any issues:${NC}"
echo "1. Make sure ANDROID_HOME is set correctly"
echo "2. Check that your Android SDK is up to date"
echo "3. Try running: npx react-native doctor"
echo ""

exit 0
