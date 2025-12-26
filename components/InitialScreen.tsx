import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

interface InitialScreenProps {
  onSkip: () => void;
}

const EyeIcon = () => (
  <Svg width={120} height={80} viewBox="0 0 120 80" fill="none">
    {/* Outer eye shape */}
    <Path
      d="M60 10C30 10 10 40 10 40C10 40 30 70 60 70C90 70 110 40 110 40C110 40 90 10 60 10Z"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Inner circle (iris) */}
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

const ArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7L17 7M17 7L17 17M17 7L7 17"
      stroke="#1A1A1A"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InitialScreen: React.FC<InitialScreenProps> = ({onSkip}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Eye Icon */}
        <View style={styles.iconContainer}>
          <EyeIcon />
        </View>

        {/* Title */}
        <Text style={styles.title}>Blink Buddy</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Reduce eye strain with blink buddy</Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>skip</Text>
          <ArrowIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#999999',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#1A1A1A',
    textDecorationLine: 'underline',
  },
});

export default InitialScreen;
