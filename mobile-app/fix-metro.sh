#!/bin/bash

# Fix Metro and React Native configuration issues

set -e

echo "🔧 Fixing Metro and React Native configuration..."

# Kill any running Metro processes
echo "🛑 Stopping any running Metro processes..."
pkill -f "react-native start" || true
pkill -f "metro" || true

# Clear Metro cache
echo "🧹 Clearing Metro cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*
rm -rf node_modules/.cache

# Clear React Native cache
echo "🧹 Clearing React Native cache..."
npx react-native start --reset-cache &
sleep 3
pkill -f "react-native start" || true

# Clean Android build
if [ -d "android" ]; then
    echo "🧹 Cleaning Android build..."
    cd android
    ./gradlew clean || echo "Gradle clean failed, continuing..."
    cd ..
fi

echo "✅ Configuration fixed!"
echo ""
echo "Now try running:"
echo "  npm start"
echo "  # In another terminal:"
echo "  npm run android"
