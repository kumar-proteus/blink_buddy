#!/bin/bash

# BlinkBuddy macOS Build Script
# Run this script on a macOS machine to build the app for distribution

set -e

echo "==================================="
echo "BlinkBuddy macOS Build"
echo "==================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Error: This script must be run on macOS"
    exit 1
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Parse arguments
BUILD_TYPE="${1:-release}"
OUTPUT_DIR="${2:-$PROJECT_ROOT/build/macos}"

echo "Build type: $BUILD_TYPE"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Build configuration
if [ "$BUILD_TYPE" = "debug" ]; then
    CONFIGURATION="Debug"
else
    CONFIGURATION="Release"
fi

echo "Building React Native bundle..."
npx react-native bundle \
    --platform macos \
    --dev false \
    --entry-file index.js \
    --bundle-output macos/BlinkBuddy-macOS/main.jsbundle \
    --assets-dest macos/BlinkBuddy-macOS

echo ""
echo "Building macOS app..."
cd macos

# Clean previous build
xcodebuild clean \
    -workspace BlinkBuddy-macOS.xcworkspace \
    -scheme BlinkBuddy-macOS \
    -configuration "$CONFIGURATION" \
    -quiet

# Build the app
xcodebuild build \
    -workspace BlinkBuddy-macOS.xcworkspace \
    -scheme BlinkBuddy-macOS \
    -configuration "$CONFIGURATION" \
    -derivedDataPath "$OUTPUT_DIR/DerivedData" \
    -quiet

# Find and copy the built app
APP_PATH=$(find "$OUTPUT_DIR/DerivedData" -name "BlinkBuddy.app" -type d | head -1)

if [ -n "$APP_PATH" ]; then
    echo ""
    echo "Copying app to output directory..."
    cp -R "$APP_PATH" "$OUTPUT_DIR/"

    echo ""
    echo "==================================="
    echo "Build Complete!"
    echo "==================================="
    echo ""
    echo "App location: $OUTPUT_DIR/BlinkBuddy.app"
    echo ""
    echo "To create a DMG for distribution, run:"
    echo "  hdiutil create -volname BlinkBuddy -srcfolder $OUTPUT_DIR/BlinkBuddy.app -ov -format UDZO $OUTPUT_DIR/BlinkBuddy.dmg"
    echo ""
else
    echo "Error: Could not find built app"
    exit 1
fi
