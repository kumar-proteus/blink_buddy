# macOS Setup Guide for Blink Buddy

This guide explains how to set up, build, and run Blink Buddy on macOS.

## Prerequisites

1. **macOS computer** (macOS 11.0 Big Sur or later, Intel or Apple Silicon)
2. **Xcode** installed from the Mac App Store (version 12 or later)
3. **Xcode Command Line Tools**: `xcode-select --install`
4. **CocoaPods**: `sudo gem install cocoapods`
5. **Node.js** (v18 or later)

## Quick Setup (Automated)

Run the setup script to automatically configure everything:

```bash
./scripts/setup-macos.sh
```

This will:
- Verify prerequisites are installed
- Install npm dependencies
- Install CocoaPods dependencies
- Prepare the project for building

## Manual Setup Steps

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

### 3. Install CocoaPods dependencies

```bash
cd macos
pod install --repo-update
cd ..
```

### 4. Run the app in development mode

```bash
npm run macos
```

Or open the workspace in Xcode:

```bash
open macos/BlinkBuddy-macOS.xcworkspace
```

Then press Cmd+R to build and run.

## Building for Distribution

### Development Build

```bash
./scripts/build-macos.sh debug
```

### Release Build

```bash
./scripts/build-macos.sh release
```

The built app will be located in `build/macos/BlinkBuddy.app`.

### Creating a DMG for Distribution

After building, create a DMG file:

```bash
hdiutil create -volname BlinkBuddy -srcfolder build/macos/BlinkBuddy.app -ov -format UDZO build/macos/BlinkBuddy.dmg
```

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

## Project Structure

```
macos/
├── BlinkBuddy-macOS/
│   ├── AppDelegate.swift      # macOS app delegate
│   ├── Main.storyboard        # Main storyboard with menu bar
│   ├── Info.plist             # App configuration
│   ├── BlinkBuddy.entitlements # App sandbox entitlements
│   ├── Assets.xcassets/       # App icons
│   └── BlinkBuddy-macOS-Bridging-Header.h
├── BlinkBuddy-macOS.xcodeproj/  # Xcode project
├── Podfile                    # CocoaPods configuration
└── .xcode.env                 # Node binary path
```

Platform abstraction modules in `src/platform/`:
- `overlay.ts` - Overlay abstraction (alert on macOS)
- `permissions.ts` - Permissions abstraction (auto-grants on macOS)
- `usage.ts` - Usage stats abstraction (stub on macOS)

## Troubleshooting

### CocoaPods errors

```bash
cd macos
pod deintegrate
pod install --repo-update
```

### Build errors

1. Clean the build: Xcode > Product > Clean Build Folder (Cmd+Shift+K)
2. Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Restart Xcode
4. Re-run pod install:
   ```bash
   cd macos && pod install && cd ..
   ```

### Metro bundler issues

```bash
npm start -- --reset-cache
```

### "No bundle URL present" error

Make sure Metro bundler is running:

```bash
npm start
```

### Apple Silicon (M1/M2) issues

If you're on Apple Silicon and encounter issues, try:

```bash
cd macos
arch -x86_64 pod install
cd ..
```

### Code signing issues

For development, the project is configured to sign with your local identity. If you encounter code signing errors:

1. Open Xcode
2. Select the BlinkBuddy-macOS target
3. Go to "Signing & Capabilities"
4. Select your team or enable "Automatically manage signing"

## Adding App Icons

Place your app icons in `macos/BlinkBuddy-macOS/Assets.xcassets/AppIcon.appiconset/`:

Required sizes:
- 16x16 (16pt @1x)
- 32x32 (16pt @2x, 32pt @1x)
- 64x64 (32pt @2x)
- 128x128 (128pt @1x)
- 256x256 (128pt @2x, 256pt @1x)
- 512x512 (256pt @2x, 512pt @1x)
- 1024x1024 (512pt @2x)

Then update the `Contents.json` file to reference your images.

## Future Improvements

Consider implementing these macOS-native alternatives:

1. **Menu Bar App**: Add a menu bar icon for quick access to blink reminders
2. **Native Notifications**: Use macOS User Notifications for blink reminders
3. **NSWindow Floating Panel**: Create a small floating reminder window
4. **Screen Time API**: Use Apple's Screen Time API for usage statistics (requires family controls entitlement)
