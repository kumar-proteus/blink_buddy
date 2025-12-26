import {Platform, NativeModules, PermissionsAndroid, Linking} from 'react-native';

const {OverlayPermission: NativeOverlayPermission, Usage: NativeUsage} =
  NativeModules;

interface PermissionsInterface {
  // Overlay permission
  canDrawOverlays: () => Promise<boolean>;
  requestOverlayPermission: () => Promise<void>;

  // Usage stats permission
  hasUsagePermission: () => Promise<boolean>;
  requestUsagePermission: () => Promise<void>;

  // Notification permission
  checkNotificationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;

  // Platform info
  isOverlaySupported: () => boolean;
  isUsageStatsSupported: () => boolean;
}

// Android implementation
const AndroidPermissions: PermissionsInterface = {
  canDrawOverlays: async () => {
    try {
      if (NativeOverlayPermission?.canDrawOverlays) {
        return await NativeOverlayPermission.canDrawOverlays();
      }
      return false;
    } catch (error) {
      console.log('Error checking overlay permission:', error);
      return false;
    }
  },

  requestOverlayPermission: async () => {
    try {
      if (NativeOverlayPermission?.requestOverlayPermission) {
        await NativeOverlayPermission.requestOverlayPermission();
      } else {
        Linking.openSettings();
      }
    } catch (error) {
      console.log('Error requesting overlay permission:', error);
      Linking.openSettings();
    }
  },

  hasUsagePermission: async () => {
    try {
      if (NativeUsage?.hasUsagePermission) {
        return await NativeUsage.hasUsagePermission();
      }
      return false;
    } catch (error) {
      console.log('Error checking usage permission:', error);
      return false;
    }
  },

  requestUsagePermission: async () => {
    try {
      if (NativeUsage?.requestUsagePermission) {
        await NativeUsage.requestUsagePermission();
      }
    } catch (error) {
      console.log('Error requesting usage permission:', error);
    }
  },

  checkNotificationPermission: async () => {
    if (Platform.Version >= 33) {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
    return true; // Pre-Android 13, notifications are enabled by default
  },

  requestNotificationPermission: async () => {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message:
            'Blink Buddy needs notification permission to remind you to blink',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  },

  isOverlaySupported: () => true,
  isUsageStatsSupported: () => true,
};

// macOS/iOS implementation - permissions are either not needed or not available
const DesktopPermissions: PermissionsInterface = {
  canDrawOverlays: async () => {
    // Overlays not supported, but we return true to skip the permission screen
    return true;
  },

  requestOverlayPermission: async () => {
    // No-op on desktop
    console.log('[macOS] Overlay permission not applicable');
  },

  hasUsagePermission: async () => {
    // Usage stats not available, return true to skip
    return true;
  },

  requestUsagePermission: async () => {
    // No-op on desktop
    console.log('[macOS] Usage permission not applicable');
  },

  checkNotificationPermission: async () => {
    // On macOS, notifications work differently
    // For now, assume granted
    return true;
  },

  requestNotificationPermission: async () => {
    // On macOS, notifications work differently
    return true;
  },

  isOverlaySupported: () => false,
  isUsageStatsSupported: () => false,
};

export const Permissions: PermissionsInterface =
  Platform.OS === 'android' ? AndroidPermissions : DesktopPermissions;

export default Permissions;
