import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

// App Icon - Open Eye
const AppIcon = () => (
  <Svg width={150} height={100} viewBox="0 0 120 80" fill="none">
    <Path
      d="M60 10C30 10 10 40 10 40C10 40 30 70 60 70C90 70 110 40 110 40C110 40 90 10 60 10Z"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle
      cx={60}
      cy={40}
      r={18}
      stroke="#1A1A1A"
      strokeWidth={4}
      fill="none"
    />
  </Svg>
);

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <AppIcon />
        </View>

        {/* App Name */}
        <Text style={styles.title}>Blink Buddy</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ADE80" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 40,
  },
  loadingContainer: {
    marginTop: 20,
  },
});

export default SplashScreen;
