# Troubleshooting Guide - Township POS Mobile

## Common Installation Issues

### 1. Package Not Found Errors (404)

**Problem:** Getting 404 errors for packages like `@react-native-netinfo/netinfo`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Use the setup script
chmod +x setup.sh
./setup.sh
```

### 2. Network/Registry Issues

**Problem:** npm can't reach the registry

**Solution:**
```bash
# Check npm registry
npm config get registry

# Reset to default registry
npm config set registry https://registry.npmjs.org/

# Or try using yarn instead
npm install -g yarn
yarn install
```

### 3. React Native CLI Issues

**Problem:** `react-native` command not found

**Solution:**
```bash
# Install React Native CLI globally
npm install -g @react-native-community/cli

# Or use npx
npx react-native --version
```

## Android Setup Issues

### 1. ANDROID_HOME Not Set

**Problem:** Android SDK not found

**Solution:**
```bash
# Add to your ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload your shell
source ~/.bashrc
```

### 2. Gradle Issues

**Problem:** Gradle build failures

**Solution:**
```bash
cd android
./gradlew clean
cd ..

# If still failing, try:
cd android
rm -rf .gradle
./gradlew clean
cd ..
```

### 3. Metro Bundler Issues

**Problem:** Metro can't start or bundle fails

**Solution:**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or manually clear
rm -rf /tmp/metro-*
rm -rf node_modules/.cache
```

## Dependency-Specific Issues

### 1. SQLite Issues

**Problem:** `react-native-sqlite-storage` not working

**Solution:**
```bash
# For Android, make sure you have the correct version
npm install react-native-sqlite-storage@^6.0.1

# For React Native 0.60+, auto-linking should work
# If not, try manual linking (check the package docs)
```

### 2. Vector Icons Issues

**Problem:** Icons not showing

**Solution:**
```bash
# For Android, you may need to link fonts manually
# Add to android/app/build.gradle:
# apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

# Or copy fonts manually to android/app/src/main/assets/fonts/
```

### 3. Navigation Issues

**Problem:** Navigation not working

**Solution:**
```bash
# Make sure you have all required navigation dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# For Android, you may need to add to MainActivity.java:
# import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
```

## Development Issues

### 1. Hot Reload Not Working

**Solution:**
```bash
# Restart Metro with cache reset
npx react-native start --reset-cache

# Or shake device/emulator and enable hot reload
```

### 2. Build Errors

**Solution:**
```bash
# Clean everything
npm run clean  # if you have this script
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install

# Rebuild
npm run android
```

### 3. Emulator Issues

**Solution:**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd YOUR_AVD_NAME

# Or use Android Studio AVD Manager
```

## Step-by-Step Fresh Setup

If you're having persistent issues, try this complete fresh setup:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# 2. Use minimal setup
cp package-minimal.json package.json
npm install

# 3. Add dependencies gradually
npm install react-native-sqlite-storage
npm install @react-native-community/netinfo
npm install react-native-vector-icons
npm install react-native-paper

# 4. Test basic setup
npm run android
```

## Getting Help

### Check React Native Doctor
```bash
npx react-native doctor
```

### Check Logs
```bash
# Android logs
npx react-native log-android

# Metro logs
npx react-native start --verbose
```

### Useful Commands
```bash
# Check React Native version
npx react-native --version

# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0
```

## Alternative Package Managers

If npm continues to give issues, try:

### Using Yarn
```bash
npm install -g yarn
yarn install
yarn android
```

### Using pnpm
```bash
npm install -g pnpm
pnpm install
pnpm run android
```

## Contact Support

If you're still having issues:
1. Check the React Native documentation
2. Search Stack Overflow for your specific error
3. Check the GitHub issues for the specific package
4. Create a minimal reproduction case

Remember: React Native development can be tricky, especially on the first setup. Don't get discouraged - these issues are common and solvable!
