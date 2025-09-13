#!/bin/bash

# Township POS Mobile - Release Build Script
# This script builds a release APK for distribution

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="TownshipPOS"
BUILD_DIR="android/app/build/outputs/apk/release"
DIST_DIR="dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
VERSION=$(node -p "require('./package.json').version")

echo -e "${BLUE}🏗️  Building Township POS Mobile v${VERSION}${NC}"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}❌ Error: ANDROID_HOME environment variable is not set.${NC}"
    echo "Please set ANDROID_HOME to your Android SDK path."
    exit 1
fi

# Check if Java is available
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Error: Java is not installed or not in PATH.${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed or not in PATH.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
cd android
./gradlew clean
cd ..

# Create dist directory if it doesn't exist
mkdir -p $DIST_DIR

echo -e "${YELLOW}🔨 Building release APK...${NC}"
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

cd ..

# Check if APK was created
if [ ! -f "$BUILD_DIR/app-release.apk" ]; then
    echo -e "${RED}❌ Error: APK file not found at $BUILD_DIR/app-release.apk${NC}"
    exit 1
fi

# Copy APK to dist directory with versioned name
APK_NAME="${APP_NAME}_v${VERSION}_${TIMESTAMP}.apk"
cp "$BUILD_DIR/app-release.apk" "$DIST_DIR/$APK_NAME"

# Get APK size
APK_SIZE=$(du -h "$DIST_DIR/$APK_NAME" | cut -f1)

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo "=================================================="
echo -e "📱 APK Location: ${BLUE}$DIST_DIR/$APK_NAME${NC}"
echo -e "📏 APK Size: ${BLUE}$APK_SIZE${NC}"
echo -e "🏷️  Version: ${BLUE}$VERSION${NC}"
echo -e "📅 Build Time: ${BLUE}$(date)${NC}"

# Generate build info file
cat > "$DIST_DIR/build-info.json" << EOF
{
  "appName": "$APP_NAME",
  "version": "$VERSION",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "apkFile": "$APK_NAME",
  "apkSize": "$APK_SIZE",
  "buildType": "release",
  "platform": "android"
}
EOF

echo -e "${GREEN}📄 Build info saved to: $DIST_DIR/build-info.json${NC}"

# Optional: Generate QR code for easy download (requires qrencode)
if command -v qrencode &> /dev/null; then
    echo -e "${YELLOW}📱 Generating QR code for download...${NC}"
    # You would replace this URL with your actual download URL
    DOWNLOAD_URL="https://your-domain.com/downloads/$APK_NAME"
    qrencode -t PNG -o "$DIST_DIR/download-qr.png" "$DOWNLOAD_URL"
    echo -e "${GREEN}📱 QR code saved to: $DIST_DIR/download-qr.png${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Test the APK on different devices"
echo "2. Upload to your distribution platform"
echo "3. Share with small business owners"
echo ""
echo -e "${YELLOW}💡 Installation instructions for users:${NC}"
echo "1. Enable 'Unknown Sources' in Android Settings > Security"
echo "2. Download and install the APK file"
echo "3. Grant necessary permissions when prompted"
echo ""

exit 0
