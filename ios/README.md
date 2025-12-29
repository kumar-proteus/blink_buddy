# BlinkBuddy iOS Setup

This folder contains Podfile and instructions for setting up the iOS platform for BlinkBuddy.

Quick steps:

1. From the repo root, install JS dependencies:

```bash
# Using yarn if available
yarn install
# or with npm
npm install
```

2. Run the setup script to install CocoaPods dependencies:

```bash
./scripts/setup-ios.sh
```

3. Open the Xcode workspace and run on a simulator or device:

```bash
open ios/BlinkBuddy.xcworkspace
```

Or run from CLI:

```bash
npm run ios
```

If you don't have an `ios/` Xcode project yet (this repo currently contains the JS and macOS targets), you can generate a default iOS project with React Native tooling and then re-run `pod install`:

```bash
npx react-native init TempProject --version 0.79.2
# Copy the generated ios/ Xcode project into this repo and rename the target to BlinkBuddy
```
