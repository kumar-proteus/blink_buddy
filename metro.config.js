const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Support macOS platform extension
    platforms: ['ios', 'android', 'macos'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
