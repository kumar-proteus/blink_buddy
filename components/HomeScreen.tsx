import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {LineChart} from 'react-native-chart-kit';
import {Usage} from '../src/platform';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// App usage stats interface
interface AppUsageStat {
  appName: string;
  packageName: string;
  totalTimeInForeground: number;
  lastTimeUsed: number;
}

// Home Icon - Clean house outline
const HomeIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    {/* Roof */}
    <Path
      d="M3 10.5L12 3L21 10.5"
      stroke="#1A1A1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* House body */}
    <Path
      d="M5 9V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V9"
      stroke="#1A1A1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Settings Icon - Gear/cog wheel
const SettingsIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    {/* Outer gear teeth */}
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="#1A1A1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74493 20.1656 6.23584 20.3766 5.705 20.3766C5.17416 20.3766 4.66507 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95229 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87229 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74493 3.62343 6.23584 3.62343 5.705C3.62343 5.17416 3.83445 4.66507 4.21 4.29C4.58507 3.91445 5.09416 3.70343 5.625 3.70343C6.15584 3.70343 6.66493 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95229 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87229 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58507 20.2966 5.09416 20.2966 5.625C20.2966 6.15584 20.0856 6.66493 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"
      stroke="#1A1A1A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Default App Icon - shown when app icon is not available
const DefaultAppIcon = () => (
  <View style={defaultAppIconStyles.container}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={4} stroke="#9CA3AF" strokeWidth={1.5} />
      <Circle cx={12} cy={10} r={3} stroke="#9CA3AF" strokeWidth={1.5} />
      <Path
        d="M6 20C6 17 9 15 12 15C15 15 18 17 18 20"
        stroke="#9CA3AF"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const defaultAppIconStyles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});

// App Icon component with error handling
interface AppIconProps {
  iconUri: string | undefined;
  packageName: string;
}

const AppIcon: React.FC<AppIconProps> = ({iconUri, packageName}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset error state when iconUri changes
    setHasError(false);
    setIsLoading(true);
  }, [iconUri]);

  if (!iconUri || hasError) {
    return <DefaultAppIcon />;
  }

  return (
    <Image
      source={{uri: iconUri}}
      style={appIconStyles.icon}
      resizeMode="contain"
      onLoad={() => {
        console.log('Icon loaded successfully for:', packageName);
        setIsLoading(false);
      }}
      onError={(e) => {
        console.warn('Icon load error for', packageName, ':', e.nativeEvent.error);
        setHasError(true);
      }}
    />
  );
};

const appIconStyles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
});

// Eye Icon for buttons
const EyeIcon = ({size = 24, color = '#1A1A1A'}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={12.5} r={3} stroke={color} strokeWidth={1.5} />
  </Svg>
);

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: object;
}

const Card: React.FC<CardProps> = ({children, style}) => (
  <View style={[styles.card, style]}>{children}</View>
);

interface HomeScreenProps {
  onSettingsPress?: () => void;
}

// Duration options for usage report
type DurationOption = 'today' | 'week' | 'month';

interface DurationConfig {
  label: string;
  days: number;
}

const DURATION_OPTIONS: Record<DurationOption, DurationConfig> = {
  today: {label: 'Today', days: 1},
  week: {label: 'Last 7 Days', days: 7},
  month: {label: 'Last Month', days: 30},
};

const HomeScreen: React.FC<HomeScreenProps> = ({onSettingsPress}) => {
  const [appStats, setAppStats] = useState<AppUsageStat[]>([]);
  const [appIcons, setAppIcons] = useState<{[key: string]: string}>({});
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>('week');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if package is an Android system app or service
  const isSystemApp = (packageName: string): boolean => {
    // System app prefixes to filter out
    const systemPrefixes = [
      // Android core
      'android',
      'com.android.',
      // Google system services
      'com.google.android.gms',
      'com.google.android.gsf',
      'com.google.android.inputmethod',
      'com.google.android.providers',
      'com.google.android.ext.',
      'com.google.android.onetimeinitializer',
      'com.google.android.packageinstaller',
      'com.google.android.partnersetup',
      'com.google.android.setupwizard',
      'com.google.android.permissioncontroller',
      'com.google.android.cellbroadcastreceiver',
      'com.google.android.webview',
      'com.google.android.trichromelibrary',
      'com.google.android.overlay',
      'com.google.android.configupdater',
      'com.google.android.printservice',
      'com.google.android.syncadapters',
      'com.google.android.backuptransport',
      'com.google.android.feedback',
      'com.google.android.marvin',
      'com.google.android.tag',
      'com.google.android.as',
      // Samsung
      'com.samsung.android.',
      'com.samsung.',
      'com.sec.android.',
      'com.sec.',
      // Huawei
      'com.huawei.android.',
      'com.huawei.',
      // Xiaomi / MIUI
      'com.miui.',
      'com.xiaomi.',
      // Oppo / ColorOS
      'com.oppo.',
      'com.coloros.',
      'com.oplus.',
      // Vivo
      'com.vivo.',
      'com.bbk.',
      // OnePlus
      'com.oneplus.',
      // Realme
      'com.realme.',
      // Other OEMs
      'com.asus.',
      'com.motorola.',
      'com.lenovo.',
      'com.lge.',
      'com.sony.',
      'com.htc.',
      'com.zte.',
      'com.meizu.',
      // Qualcomm
      'com.qualcomm.',
      'com.qti.',
      // MediaTek
      'com.mediatek.',
      // Common system services
      'com.caf.',
      'org.codeaurora.',
    ];

    // Check if package matches any system prefix
    return systemPrefixes.some(prefix =>
      packageName === prefix || packageName.startsWith(prefix + (prefix.endsWith('.') ? '' : '.'))
    );
  };

  // Load usage stats for selected duration
  const loadUsageStats = async (duration: DurationOption) => {
    setIsLoading(true);
    try {
      // Check if usage stats are supported on this platform
      if (!Usage.isSupported()) {
        console.log('Usage stats not supported on this platform');
        setAppStats([]);
        setIsLoading(false);
        return;
      }

      const hasPermission = await Usage.hasUsagePermission();
      if (hasPermission) {
        const days = DURATION_OPTIONS[duration].days;
        const stats: AppUsageStat[] = await Usage.getUsageStats(days);
        const filtered = stats
          .filter((a) => typeof a.totalTimeInForeground === 'number')
          .filter((a) => !isSystemApp(a.packageName))
          .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);

        // Remove duplicates by packageName
        const uniqueStats: AppUsageStat[] = [];
        const seen = new Set();
        for (const app of filtered) {
          if (!seen.has(app.packageName)) {
            seen.add(app.packageName);
            uniqueStats.push(app);
          }
        }
        setAppStats(uniqueStats);

        // Load app icons for top 10 apps in parallel
        const topApps = uniqueStats.slice(0, 10);
        console.log('Loading icons for', topApps.length, 'apps');
        const iconPromises = topApps.map(async app => {
          try {
            const iconUri = await Usage.getAppIcon(app.packageName);
            console.log('Icon result for', app.packageName, ':', iconUri ? 'loaded' : 'null');
            return {packageName: app.packageName, iconUri};
          } catch (e) {
            console.warn('Failed to load icon for', app.packageName, e);
            return {packageName: app.packageName, iconUri: null};
          }
        });

        const iconResults = await Promise.all(iconPromises);
        const icons: {[key: string]: string} = {};
        iconResults.forEach(result => {
          if (result.iconUri) {
            icons[result.packageName] = result.iconUri;
            // Log first 100 chars of first icon to verify format
            if (Object.keys(icons).length === 1) {
              console.log('First icon URI sample:', result.iconUri.substring(0, 100));
            }
          }
        });
        console.log('Total icons loaded:', Object.keys(icons).length);
        console.log('Icon keys:', Object.keys(icons));
        setAppIcons(icons);
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load usage stats when duration changes
  useEffect(() => {
    loadUsageStats(selectedDuration);
  }, [selectedDuration]);

  // Handle duration selection
  const handleDurationChange = (duration: DurationOption) => {
    if (duration !== selectedDuration) {
      setAppStats([]);
      setAppIcons({});
      setSelectedDuration(duration);
    }
  };

  // Get display name for app - prefer appName, fallback to formatted package name
  const getAppDisplayName = (appName: string | undefined, packageName: string): string => {
    // Use appName if it's valid and not just the package name
    if (appName && appName.trim() && appName !== packageName) {
      return appName;
    }

    // Fallback: extract and format name from package
    const parts = packageName.split('.');
    const lastPart = parts[parts.length - 1] || packageName;

    // Capitalize first letter and add spaces before capital letters
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Format time in hours, minutes, seconds
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  // Render usage chart
  const renderUsageChart = () => {
    const top = appStats.slice(0, 5).filter((a) => a.totalTimeInForeground > 0);
    if (top.length === 0) {
      return (
        <View style={styles.statsPlaceholder}>
          <Text style={styles.statsText}>No usage data available</Text>
        </View>
      );
    }

    const chartWidth = SCREEN_WIDTH - 72;
    const data = {
      labels: top.map((a) => {
        const name = getAppDisplayName(a.appName, a.packageName);
        return name.length > 6 ? name.substring(0, 6) : name;
      }),
      datasets: [{data: top.map((a) => parseFloat((a.totalTimeInForeground / 3600).toFixed(2)))}],
    };

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={chartWidth}
          height={180}
          yAxisSuffix="h"
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
            labelColor: () => '#6B7280',
            style: {borderRadius: 12},
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#7C3AED',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Section with Purple Background */}
        <View style={styles.headerContainer}>
          {/* Top Icons */}
          <View style={styles.topBar}>
            <Pressable
              style={({pressed}) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}>
              <HomeIcon />
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={onSettingsPress}>
              <SettingsIcon />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.headerTitle}>Blink Buddy</Text>
          <Text style={styles.headerSubtitle}>Reduce Eye Strain</Text>

          {/* Eye Button - Inside header, under title */}
          <View style={styles.eyeButtonContainer}>
            <View style={styles.eyeButton}>
              <EyeIcon size={24} color="#7C3AED" />
            </View>
          </View>

          {/* Curved bottom */}
          <View style={styles.curvedBottom} />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Session Stats Card */}
          <Card>
            <Text style={styles.sectionTitle}>Session Stats - Usage</Text>

            {/* Duration Selector */}
            <View style={styles.durationSelector}>
              {(Object.keys(DURATION_OPTIONS) as DurationOption[]).map(key => (
                <Pressable
                  key={key}
                  style={[
                    styles.durationButton,
                    selectedDuration === key && styles.durationButtonActive,
                  ]}
                  onPress={() => handleDurationChange(key)}>
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === key && styles.durationButtonTextActive,
                    ]}>
                    {DURATION_OPTIONS[key].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Loading Indicator or Usage Report */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading usage data...</Text>
              </View>
            ) : (
              <>
                {renderUsageChart()}

                {/* App Usage List */}
                {appStats.length > 0 && (
                  <View style={styles.appListContainer}>
                    <Text style={styles.appListTitle}>Top Apps</Text>
                    {appStats.slice(0, 10).map((item, index) => (
                      <View key={item.packageName + index} style={styles.appItem}>
                        <AppIcon
                          iconUri={appIcons[item.packageName]}
                          packageName={item.packageName}
                        />
                        <View style={styles.appInfo}>
                          <Text style={styles.appName} numberOfLines={1}>
                            {getAppDisplayName(item.appName, item.packageName)}
                          </Text>
                          <Text style={styles.appLastUsed}>
                            Last: {new Date(item.lastTimeUsed).toLocaleTimeString()}
                          </Text>
                        </View>
                        <Text style={styles.appUsageTime}>
                          {formatTime(item.totalTimeInForeground)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#d7a4f1',
    paddingTop: 35,
    paddingBottom: 60,
    minHeight: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
  },
  curvedBottom: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  eyeButtonContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 20,
    zIndex: 10,
  },
  eyeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#7C3AED',
  },
  durationButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  statsPlaceholder: {
    height: 150,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartContainer: {
    alignItems: 'center',
    marginHorizontal: -10,
  },
  chart: {
    borderRadius: 12,
  },
  appListContainer: {
    marginTop: 20,
  },
  appListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  appLastUsed: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  appUsageTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
});

export default HomeScreen;
