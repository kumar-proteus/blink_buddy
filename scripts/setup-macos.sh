#!/bin/bash

# BlinkBuddy macOS Setup Script
# Run this script on a macOS machine to set up the development environment

set -e

echo "==================================="
echo "BlinkBuddy macOS Setup"
echo "==================================="
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Error: This script must be run on macOS"
    exit 1
fi

# Check for required tools
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
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18 or later is required. Current version: $(node -v)"
    exit 1
fi
echo "✓ Node.js $(node -v) installed"

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo "Installing CocoaPods..."
    sudo gem install cocoapods
fi
echo "✓ CocoaPods installed"

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo ""
echo "Installing npm dependencies..."
npm install --legacy-peer-deps

echo ""
echo "Installing CocoaPods dependencies for macOS..."
cd macos
pod install --repo-update
cd ..

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "To run the app in development mode:"
echo "  npm run macos"
echo ""
echo "Or open in Xcode:"
echo "  open macos/BlinkBuddy-macOS.xcworkspace"
echo ""
echo "Then press Cmd+R to build and run."
echo ""
