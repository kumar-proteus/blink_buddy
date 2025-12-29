#!/bin/bash

# BlinkBuddy iOS Setup Script
# Run this script on a macOS machine to set up iOS development

set -euo pipefail
trap 'echo "Error on line $LINENO. Exiting." >&2' ERR

echo "==================================="
echo "BlinkBuddy iOS Setup"
echo "==================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Error: This script must be run on macOS"
    exit 1
fi

echo "Checking prerequisites..."

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "Error: Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi
echo "✓ Xcode installed"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi
NODE_VERSION_MAJOR=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if ! [[ $NODE_VERSION_MAJOR =~ ^[0-9]+$ ]] || [ "$NODE_VERSION_MAJOR" -lt 18 ]; then
    echo "Error: Node.js 18 or later is required. Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js $(node -v) installed"

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo "CocoaPods not found. Attempting to install CocoaPods..."
    if command -v brew &> /dev/null; then
        echo "Installing CocoaPods via Homebrew..."
        brew install cocoapods
    elif command -v gem &> /dev/null; then
        echo "Installing CocoaPods via gem (requires sudo)..."
        sudo gem install cocoapods
    else
        echo "Error: Neither Homebrew nor gem found. Please install CocoaPods manually: https://guides.cocoapods.org/using/getting-started.html"
        exit 1
    fi
fi
echo "✓ CocoaPods available"

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo ""
echo "Installing JS dependencies..."
if [ -f yarn.lock ] && command -v yarn &> /dev/null; then
    echo "Using yarn to install dependencies"
    yarn install --frozen-lockfile || yarn install
else
    echo "Using npm to install dependencies"
    npm install --legacy-peer-deps
fi

echo ""
echo "Installing CocoaPods dependencies for iOS..."
cd ios
pod install --repo-update
cd ..

echo ""
echo "==================================="
echo "iOS Setup Complete!"
echo "==================================="
echo ""
echo "To run the app in development mode (iOS simulator):"
echo "  npm run ios"
echo ""
echo "Or open in Xcode:"
echo "  open ios/BlinkBuddy.xcworkspace"
echo ""
