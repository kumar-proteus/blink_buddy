import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeModules,
  Pressable,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

const {Overlay} = NativeModules;

const STORAGE_KEYS = {
  overlayOn: '@overlayOn',
  alwaysOn: '@alwaysOn',
  onDuration: '@onDuration',
  offDuration: '@offDuration',
  overlayColor: '@overlayColor',
  overlaySize: '@overlaySize',
};

const DEFAULT_ON_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_OFF_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SIZE = 50;
const DEFAULT_COLOR = 'blue';

// Duration options for pickers
const durationOptions = [
  {label: '4 Seconds', value: 4 * 1000},
  {label: '5 Minutes', value: 5 * 60 * 1000},
  {label: '10 Minutes', value: 10 * 60 * 1000},
  {label: '15 Minutes', value: 15 * 60 * 1000},
  {label: '20 Minutes', value: 20 * 60 * 1000},
];

// Color options for overlay
const colorOptions = [
  {label: 'Blue', value: 'blue', hex: '#3B82F6'},
  {label: 'Brown', value: 'brown', hex: '#92400E'},
  {label: 'Pink', value: 'pink', hex: '#EC4899'},
  {label: 'Purple', value: 'purple', hex: '#8B5CF6'},
  {label: 'Green', value: 'green', hex: '#22C55E'},
  {label: 'Grey', value: 'grey', hex: '#6B7280'},
];

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

// Toggle Switch Component
interface ToggleSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({isEnabled, onToggle}) => {
  return (
    <Pressable
      onPress={onToggle}
      style={({pressed}) => [
        pressed && {
          backgroundColor: 'rgba(74, 222, 128, 0.2)',
          borderRadius: 20,
          padding: 4,
          margin: -4,
        },
      ]}>
      <Svg width={60} height={32} viewBox="0 0 60 32">
        {/* Track */}
        <Path
          d="M16 2 H44 A14 14 0 0 1 44 30 H16 A14 14 0 0 1 16 2"
          fill={isEnabled ? '#4ADE80' : '#E5E7EB'}
        />
        {/* Thumb */}
        <Circle cx={isEnabled ? 44 : 16} cy={16} r={12} fill="#FFFFFF" />
      </Svg>
    </Pressable>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: object;
}

const Card: React.FC<CardProps> = ({children, style}) => (
  <View style={[styles.card, style]}>{children}</View>
);

interface SettingsScreenProps {
  onBackPress?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({onBackPress}) => {
  const [overlayOn, setOverlayOn] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [onDuration, setOnDuration] = useState(DEFAULT_ON_DURATION);
  const [offDuration, setOffDuration] = useState(DEFAULT_OFF_DURATION);
  const [overlaySize, setOverlaySize] = useState(DEFAULT_SIZE);
  const [overlayColor, setOverlayColor] = useState(DEFAULT_COLOR);

  // Hide overlay
  const hideOverlay = () => {
    try {
      Overlay?.hideOverlay();
    } catch (e) {
      console.log('Error hiding overlay:', e);
    }
  };

  // Show overlay
  const showOverlay = (onDur: number, offDur: number, size: number, color: string) => {
    try {
      Overlay?.showOverlay(onDur, offDur, size, color);
    } catch (e) {
      console.log('Error showing overlay:', e);
    }
  };

  // Save state to AsyncStorage
  const saveState = async (
    overlayOnVal: boolean,
    alwaysOnVal: boolean,
    onDurVal: number,
    offDurVal: number,
    sizeVal: number,
    colorVal: string,
  ) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.overlayOn, JSON.stringify(overlayOnVal)],
        [STORAGE_KEYS.alwaysOn, JSON.stringify(alwaysOnVal)],
        [STORAGE_KEYS.onDuration, onDurVal.toString()],
        [STORAGE_KEYS.offDuration, offDurVal.toString()],
        [STORAGE_KEYS.overlaySize, sizeVal.toString()],
        [STORAGE_KEYS.overlayColor, colorVal],
      ]);
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  };

  // Load state from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [
          savedOverlayOn,
          savedAlwaysOn,
          savedOnDuration,
          savedOffDuration,
          savedSize,
          savedColor,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.overlayOn),
          AsyncStorage.getItem(STORAGE_KEYS.alwaysOn),
          AsyncStorage.getItem(STORAGE_KEYS.onDuration),
          AsyncStorage.getItem(STORAGE_KEYS.offDuration),
          AsyncStorage.getItem(STORAGE_KEYS.overlaySize),
          AsyncStorage.getItem(STORAGE_KEYS.overlayColor),
        ]);

        const parsedOverlayOn = savedOverlayOn ? JSON.parse(savedOverlayOn) : false;
        const parsedAlwaysOn = savedAlwaysOn ? JSON.parse(savedAlwaysOn) : false;
        const parsedOnDuration = savedOnDuration
          ? parseInt(savedOnDuration, 10)
          : DEFAULT_ON_DURATION;
        const parsedOffDuration = savedOffDuration
          ? parseInt(savedOffDuration, 10)
          : DEFAULT_OFF_DURATION;
        const parsedSize = savedSize ? parseFloat(savedSize) : DEFAULT_SIZE;
        const parsedColor = savedColor || DEFAULT_COLOR;

        setOverlayOn(parsedOverlayOn);
        setAlwaysOn(parsedAlwaysOn);
        setOnDuration(parsedOnDuration);
        setOffDuration(parsedOffDuration);
        setOverlaySize(parsedSize);
        setOverlayColor(parsedColor);
      } catch (e) {
        console.warn('Failed to load state', e);
      }
    })();
  }, []);

  // Handle Always On toggle
  const handleAlwaysOnToggle = async () => {
    const newAlwaysOn = !alwaysOn;
    setAlwaysOn(newAlwaysOn);

    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }

    await saveState(false, newAlwaysOn, onDuration, offDuration, overlaySize, overlayColor);
  };

  // Handle Turn on BlinkBuddy toggle
  const handleBlinkBuddyToggle = async () => {
    const newOverlayOn = !overlayOn;

    if (newOverlayOn) {
      if (alwaysOn) {
        showOverlay(60 * 60 * 1000, 1000, overlaySize, overlayColor);
      } else {
        showOverlay(onDuration, offDuration, overlaySize, overlayColor);
      }
    } else {
      hideOverlay();
    }

    setOverlayOn(newOverlayOn);
    await saveState(newOverlayOn, alwaysOn, onDuration, offDuration, overlaySize, overlayColor);
  };

  // Handle ON duration change
  const handleOnDurationChange = async (value: number) => {
    setOnDuration(value);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }
    await saveState(false, alwaysOn, value, offDuration, overlaySize, overlayColor);
  };

  // Handle OFF duration change
  const handleOffDurationChange = async (value: number) => {
    setOffDuration(value);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }
    await saveState(false, alwaysOn, onDuration, value, overlaySize, overlayColor);
  };

  // Handle color change
  const handleColorChange = async (color: string) => {
    setOverlayColor(color);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }
    await saveState(false, alwaysOn, onDuration, offDuration, overlaySize, color);
  };

  // Handle size change
  const handleSizeChange = async (value: number) => {
    setOverlaySize(value);
    if (overlayOn) {
      hideOverlay();
      showOverlay(onDuration, offDuration, value, overlayColor);
    }
    await saveState(overlayOn, alwaysOn, onDuration, offDuration, value, overlayColor);
  };

  // Get color hex from value
  const getColorHex = (value: string) => {
    const option = colorOptions.find(opt => opt.value === value);
    return option ? option.hex : '#3B82F6';
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
              ]}
              onPress={onBackPress}>
              <HomeIcon />
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}>
              <SettingsIcon />
            </Pressable>
          </View>

          {/* Title */}
          <Text style={styles.headerTitle}>Settings</Text>

          {/* Curved bottom */}
          <View style={styles.curvedBottom} />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Actions Card */}
          <Card>
            <Text style={styles.sectionTitle}>Actions</Text>

            {/* Turn on Blink Buddy */}
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Turn on Blink Buddy</Text>
              <ToggleSwitch isEnabled={overlayOn} onToggle={handleBlinkBuddyToggle} />
            </View>

            {/* Always On */}
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Always On</Text>
              <ToggleSwitch isEnabled={alwaysOn} onToggle={handleAlwaysOnToggle} />
            </View>
          </Card>

          {/* Duration Settings Card - Only visible when Always On is OFF */}
          {!alwaysOn && (
            <Card>
              <Text style={styles.sectionTitle}>Duration Settings</Text>

              {/* ON Duration */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>ON Duration</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={onDuration}
                    onValueChange={handleOnDurationChange}
                    mode="dropdown"
                    style={styles.picker}
                    dropdownIconColor="#7C3AED">
                    {durationOptions.map(opt => (
                      <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* OFF Duration */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>OFF Duration</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={offDuration}
                    onValueChange={handleOffDurationChange}
                    mode="dropdown"
                    style={styles.picker}
                    dropdownIconColor="#7C3AED">
                    {durationOptions.map(opt => (
                      <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card>
          )}

          {/* Appearance Settings Card */}
          <Card>
            <Text style={styles.sectionTitle}>Appearance</Text>

            {/* Overlay Color */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Overlay Color</Text>
                <View style={[styles.colorPreview, {backgroundColor: getColorHex(overlayColor)}]} />
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={overlayColor}
                  onValueChange={handleColorChange}
                  mode="dropdown"
                  style={styles.picker}
                  dropdownIconColor="#7C3AED">
                  {colorOptions.map(opt => (
                    <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Overlay Size */}
            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <Text style={styles.settingLabel}>Overlay Size</Text>
                <Text style={styles.sliderValue}>{Math.round(overlaySize)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={30}
                maximumValue={100}
                step={1}
                value={overlaySize}
                onSlidingComplete={handleSizeChange}
                minimumTrackTintColor="#7C3AED"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#7C3AED"
              />
            </View>
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
    minHeight: 180,
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
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    minWidth: 140,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: 140,
    color: '#1A1A1A',
    fontSize: 14,
  },
  sliderSection: {
    paddingVertical: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 15,
    color: '#7C3AED',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default SettingsScreen;
