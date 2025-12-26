import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  NativeModules,
  Platform,
  TextInput,
  useColorScheme,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Path } from 'react-native-svg';

const { Usage } = NativeModules;

interface AppUsageStat {
  appName?: string;
  packageName: string;
  totalTimeInForeground: number;
  lastTimeUsed: number;
}

const getAppIcon = (packageName: string) => {
  // Placeholder: replace with actual logic or fallback
  return `https://play-lh.googleusercontent.com/a-/AOh14Gg${packageName.slice(-8)}?w=64&h=64`;
};

export default function UsageScreen() {
  const [appStats, setAppStats] = useState<AppUsageStat[]>([]);
  const [filteredStats, setFilteredStats] = useState<AppUsageStat[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [search, setSearch] = useState('');
  const isDark = useColorScheme() === 'light';

  const colors = {
    background: isDark ? '#121212' : '#f9f9f9',
    text: isDark ? '#fff' : '#000',
    card: isDark ? '#1e1e1e' : '#fff',
    accent: '#28a745',
    placeholder: '#888',
  };

  useEffect(() => {
    if (Platform.OS === 'android') checkPermission();
  }, []);

  useEffect(() => {
    const filtered = appStats.filter((app) =>
      app.packageName.toLowerCase().includes(search.toLowerCase()) ||
      getSimpleNameFromPackage(app.packageName).toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStats(filtered);
  }, [search, appStats]);

  const checkPermission = async () => {
    try {
      const granted = await Usage.hasUsagePermission();
      setPermissionGranted(granted);
      if (granted) loadUsageStats();
    } catch {
      setPermissionGranted(false);
    }
  };

  function openSettings() {
    Usage.requestUsagePermission();
  }

  const loadUsageStats = async () => {
  try {
    const stats: AppUsageStat[] = await Usage.getUsageStats();

    // Filter valid entries and sort by usage time
    const filtered = stats
      .filter((a) => typeof a.totalTimeInForeground === 'number')
      .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);

    // Remove duplicates by packageName
    const uniqueStats = [];
    const seen = new Set();

    for (const app of filtered) {
      if (!seen.has(app.packageName)) {
        seen.add(app.packageName);
        uniqueStats.push(app);
      }
    }

    setAppStats(uniqueStats);
  } catch (error) {
    console.warn("Failed to load usage stats:", error);
    setAppStats([]); // Safe fallback
  }
};


  const getSimpleNameFromPackage = (pkg: string) => {
    const parts = pkg.split('.');
    return parts[parts.length - 1] || pkg;
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  const renderGraph = () => {
    const top = filteredStats.slice(0, 5).filter((a) => a.totalTimeInForeground > 0);
    if (top.length === 0) return null;
    const data = {
      labels: top.map((a) => getSimpleNameFromPackage(a.packageName)),
      datasets: [{ data: top.map((a) => parseFloat((a.totalTimeInForeground / 60).toFixed(2))) }],
    };
    return (
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisSuffix="m"
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          color: () => colors.accent,
          labelColor: () => colors.text,
        }}
        bezier
        style={{ margin: 12, borderRadius: 16 }}
      />
    );
  };

  if (permissionGranted === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.warning, { color: colors.accent }]}>🚫 Usage Access Not Granted</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Please enable usage access to continue.
        </Text>
        <TouchableOpacity onPress={openSettings}>
          <Text style={[styles.openSettings, { color: colors.accent }]}>Open Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (permissionGranted === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.text }]}>🔄 Checking permission...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,gap: 10, paddingTop: 12 }}>
  <Text style={[styles.title, { color: colors.text, fontSize: 24, fontWeight: 'bold' }]}>
    Track Usage
  </Text>

  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none">
    <Path d="M2 21.5L22 21.5" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18 15.5H18.009M18 18.5H18.009" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 18.5H6.00898M6 15.5H6.00898M6 12.5H6.00898M6 9.5H6.00898" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7.79063 5.39186L16.2183 9.5904M8 4.5C8 5.60457 7.10457 6.5 6 6.5C4.89543 6.5 4 5.60457 4 4.5C4 3.39543 4.89543 2.5 6 2.5C7.10457 2.5 8 3.39543 8 4.5ZM20 10.5C20 11.6046 19.1046 12.5 18 12.5C16.8954 12.5 16 11.6046 16 10.5C16 9.39543 16.8954 8.5 18 8.5C19.1046 8.5 20 9.39543 20 10.5Z" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
</View>


      <TextInput
        placeholder="Search apps..."
        placeholderTextColor={colors.placeholder}
        value={search}
        onChangeText={setSearch}
        style={[
          styles.searchBar,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.placeholder },
        ]}
      />

      {renderGraph()}

      <FlatList
        data={filteredStats}
        keyExtractor={(item, idx) => item.packageName + idx}
        renderItem={({ item }) => (
          <TouchableOpacity>

          <View style={[styles.item, { backgroundColor: colors.card }]}>
            <FastImage
              source={{ uri: getAppIcon(item.packageName) }}
              style={styles.icon}
              onError={() => { }}
              resizeMode={FastImage.resizeMode.contain}
            />
            <View style={styles.appInfo}>
              <Text style={[styles.packageName, { color: colors.text }]}>
                {getSimpleNameFromPackage(item.packageName)}
              </Text>
              <Text style={[styles.subLabel, { color: colors.placeholder }]}>
                Last: {new Date(item.lastTimeUsed).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={[styles.usageTime, { color: colors.accent }]}>
              {formatTime(item.totalTimeInForeground)}
            </Text>
          </View>
                </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>No data available.</Text>
        }
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
    marginTop: 34,
  },
  title: { fontSize: 24, fontWeight: '700', alignSelf: 'center', marginBottom: 10 },
  searchBar: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    borderRadius: 44,
    // elevation: 1,
  },
  appInfo: { flex: 1 },
  icon: { width: 44, height: 44, borderRadius: 10, marginRight: 10 },
  packageName: { fontSize: 16, fontWeight: '600' },
  subLabel: { fontSize: 12, marginTop: 2 },
  usageTime: { fontWeight: 'bold' },
  warning: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  infoText: { textAlign: 'center', fontSize: 14, marginBottom: 20 },
  openSettings: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
  loading: { textAlign: 'center', fontSize: 18 },
  emptyText: { textAlign: 'center', fontSize: 16, marginTop: 24 },
});
