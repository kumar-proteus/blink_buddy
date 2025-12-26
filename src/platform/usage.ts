import {Platform, NativeModules} from 'react-native';

const {Usage: NativeUsage} = NativeModules;

export interface AppUsageStat {
  appName: string;
  packageName: string;
  totalTimeInForeground: number;
  lastTimeUsed: number;
}

interface UsageInterface {
  hasUsagePermission: () => Promise<boolean>;
  requestUsagePermission: () => Promise<void>;
  getUsageStats: (days: number) => Promise<AppUsageStat[]>;
  getAppIcon: (packageName: string) => Promise<string | null>;
  isSupported: () => boolean;
}

// Android implementation using native module
const AndroidUsage: UsageInterface = {
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

  getUsageStats: async (days: number) => {
    try {
      if (NativeUsage?.getUsageStats) {
        return await NativeUsage.getUsageStats(days);
      }
      return [];
    } catch (error) {
      console.log('Error getting usage stats:', error);
      return [];
    }
  },

  getAppIcon: async (packageName: string) => {
    try {
      if (NativeUsage?.getAppIcon) {
        return await NativeUsage.getAppIcon(packageName);
      }
      return null;
    } catch (error) {
      console.log('Error getting app icon:', error);
      return null;
    }
  },

  isSupported: () => true,
};

// macOS/iOS stub implementation
// Usage stats are not available on macOS/iOS in the same way
const DesktopUsage: UsageInterface = {
  hasUsagePermission: async () => {
    // Not applicable on desktop, return true to skip permission check
    return true;
  },

  requestUsagePermission: async () => {
    // No-op on desktop
    console.log('[macOS] Usage permission not applicable');
  },

  getUsageStats: async (_days: number) => {
    // Return empty array - usage stats not available on macOS
    console.log('[macOS] Usage stats not available');
    return [];
  },

  getAppIcon: async (_packageName: string) => {
    // Not applicable on desktop
    return null;
  },

  isSupported: () => false,
};

export const Usage: UsageInterface =
  Platform.OS === 'android' ? AndroidUsage : DesktopUsage;

export default Usage;
