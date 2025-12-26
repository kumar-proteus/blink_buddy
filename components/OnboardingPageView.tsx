import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  PermissionsAndroid,
  NativeModules,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const {OverlayPermission, Usage} = NativeModules;

interface OnboardingPageViewProps {
  onSkip: () => void;
  onGoHome: () => void;
}

// Open Eye Icon
const OpenEyeIcon = () => (
  <Svg width={120} height={80} viewBox="0 0 120 80" fill="none">
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

// Closed Eye Icon with eyelashes
const ClosedEyeIcon = () => (
  <Svg width={120} height={80} viewBox="0 0 120 80" fill="none">
    <Path
      d="M15 45C15 45 35 65 60 65C85 65 105 45 105 45"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M30 55L20 70"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
    />
    <Path
      d="M50 62L45 78"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
    />
    <Path
      d="M70 62L75 78"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
    />
    <Path
      d="M90 55L100 70"
      stroke="#1A1A1A"
      strokeWidth={4}
      strokeLinecap="round"
    />
  </Svg>
);

// Arrow Icon for skip button
const ArrowIcon = ({pressed = false}: {pressed?: boolean}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7L17 7M17 7L17 17M17 7L7 17"
      stroke={pressed ? '#4ADE80' : '#1A1A1A'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Page data
const pages = [
  {
    icon: OpenEyeIcon,
    title: 'Blink Buddy',
    subtitle: 'Reduce eye strain with blink buddy',
  },
  {
    icon: ClosedEyeIcon,
    title: 'Blink Buddy',
    subtitle: 'Reduce eye strain with blink buddy',
  },
];

const OnboardingPageView: React.FC<OnboardingPageViewProps> = ({onSkip, onGoHome}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isLastPage = activeIndex === pages.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(currentIndex);
  };

  // Check if all permissions are granted
  const checkAllPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      // Check notification permission
      let notificationGranted = true;
      if (Platform.Version >= 33) {
        notificationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      // Check overlay permission
      let overlayGranted = false;
      try {
        if (OverlayPermission && OverlayPermission.canDrawOverlays) {
          overlayGranted = await OverlayPermission.canDrawOverlays();
        }
      } catch (error) {
        console.log('Error checking overlay permission:', error);
      }

      // Check usage access permission
      let usageGranted = false;
      try {
        if (Usage && Usage.hasUsagePermission) {
          usageGranted = await Usage.hasUsagePermission();
        }
      } catch (error) {
        console.log('Error checking usage permission:', error);
      }

      return notificationGranted && overlayGranted && usageGranted;
    }
    return true;
  }, []);

  // Handle button press - check permissions on last page
  const handleButtonPress = async () => {
    if (isLastPage) {
      const allGranted = await checkAllPermissions();
      if (allGranted) {
        onGoHome();
      } else {
        onSkip();
      }
    } else {
      onSkip();
    }
  };

  return (
    <View style={styles.container}>
      {/* Swipeable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}>
        {pages.map((page, index) => {
          const IconComponent = page.icon;
          return (
            <View key={index} style={styles.page}>
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <IconComponent />
                </View>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.subtitle}>{page.subtitle}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Section - Fixed */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        {/* Skip / Go Ahead Button */}
        <Pressable
          style={({pressed}) => [
            styles.skipButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleButtonPress}>
          {({pressed}) => (
            <>
              <Text style={[styles.skipText, pressed && styles.textPressed]}>
                {isLastPage ? 'Go Ahead' : 'skip'}
              </Text>
              <ArrowIcon pressed={pressed} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 60,
    paddingTop: 20,
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
  buttonPressed: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: -12,
    marginVertical: -8,
  },
  textPressed: {
    color: '#4ADE80',
  },
});

export default OnboardingPageView;
