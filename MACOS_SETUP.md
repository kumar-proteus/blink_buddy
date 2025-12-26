# macOS Setup Guide for Blink Buddy

This guide explains how to set up and run Blink Buddy on macOS.

## Prerequisites

1. **macOS computer** (Intel or Apple Silicon)
2. **Xcode** installed from the Mac App Store
3. **Xcode Command Line Tools**: `xcode-select --install`
4. **CocoaPods**: `sudo gem install cocoapods`
5. **Node.js** (v18 or later)

## Setup Steps

### 1. Clone/Copy the project to your Mac

```bash
cd ~/Development
git clone <your-repo-url> blink_buddy
cd blink_buddy
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Initialize macOS project

Run the following command to create the macOS folder structure:

```bash
npx react-native-macos-init
```

This will create a `macos` folder with the native macOS project files.

### 4. Install CocoaPods dependencies

```bash
cd macos
pod install
cd ..
```

### 5. Run the app

```bash
npm run macos
```

Or open the workspace in Xcode:

```bash
open macos/BlinkBuddy.xcworkspace
```

Then press Cmd+R to build and run.

## Platform Limitations

The following features are **Android-only** and will not work on macOS:

### 1. System-Wide Overlays
- On Android, Blink Buddy can display a reminder overlay on top of all apps
- On macOS, this is not possible due to system restrictions
- Instead, macOS will show an alert notification when you activate the blink reminder

### 2. App Usage Statistics
- On Android, the app can track how long you use other apps
- On macOS, this information is not accessible to third-party apps
- The usage stats section will show empty data on macOS

### 3. Special Permissions
- The permissions screen will auto-skip on macOS since those permissions are Android-specific

## Alternative macOS Features

Consider implementing these macOS-native alternatives:

1. **Menu Bar App**: Add a menu bar icon for quick access
2. **Native Notifications**: Use macOS notifications for blink reminders
3. **NSWindow Floating Panel**: Create a small floating reminder window within the app

## Troubleshooting

### CocoaPods errors
```bash
cd macos
pod deintegrate
pod install
```

### Build errors
1. Clean the build: Xcode > Product > Clean Build Folder
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Restart Xcode

### Metro bundler issues
```bash
npm start -- --reset-cache
```

## File Structure

The macOS-compatible code is organized as follows:

```
src/
  platform/
    index.ts         # Exports all platform modules
    overlay.ts       # Overlay abstraction (stub on macOS)
    permissions.ts   # Permissions abstraction (auto-grants on macOS)
    usage.ts         # Usage stats abstraction (stub on macOS)
```

These platform abstraction modules automatically detect the platform and provide appropriate implementations:
- On Android: Uses native modules
- On macOS: Provides stub implementations that gracefully degrade
