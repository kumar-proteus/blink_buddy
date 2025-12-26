import React, { useState, useEffect } from 'react';
import { NativeModules, View, Text, StyleSheet, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import ToggleButton from './ToggleButton';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider'; // Import the Slider component
// import UsageScreen from './UsageScreen';

const { Overlay, OverlayCyan, OverlayBlue, OverlayLavender } = NativeModules;

const durationOptions = [
  { label: '4 Seconds', value: 4 * 1000 },
  { label: '5 minutes', value: 5 * 60 * 1000 },
  { label: '10 minutes', value: 10 * 60 * 1000 },
  { label: '15 minutes', value: 15 * 60 * 1000 },
  { label: '20 minutes', value: 20 * 60 * 1000 },
];

const colorOptions = [
  { label: 'Blue', value: 'blue' },
  { label: 'Brown', value: 'brown' },
  { label: 'Pink', value: 'pink' },
  { label: 'Purple', value: 'purple' },
  { label: 'Green', value: 'green' },
  { label: 'Grey', value: 'grey' },
];

const STORAGE_KEYS = {
  overlayOn: '@overlayOn',
  activeOverlay: '@activeOverlay',
  onDuration: '@onDuration',
  offDuration: '@offDuration',
  alwaysOn: '@alwaysOn',
  overlayColor: '@overlayColor',  // Added this line to store color
  overlaySize: '@overlaySize',
};

export default function EyeShow() {
  const [onDuration, setOnDuration] = useState(durationOptions[0].value);
  const [offDuration, setOffDuration] = useState(durationOptions[0].value);
  const [overlayOn, setOverlayOn] = useState(false);
  const [alwaysOn, setAlwaysOn] = useState(false);
  const [overlaySize, setOverlaySize] = useState(50); // Default size in percentage (50%)
  const [overlayColor, setOverlayColor] = useState('blue'); // Default color

  const overlayModules: Record<string, any> = {
    Overlay,
    OverlayCyan,
    OverlayBlue,
    OverlayLavender,
  };

  // Helper to stop any running overlay
  const hideOverlay = () => {
    Object.values(overlayModules).forEach(mod => {
      try {
        mod?.hideOverlay();
      } catch { }
    });
  };

  // Show overlay with given durations and overlay module name
  const showOverlay = (name: string, onDur: number, offDur: number, size: number) => {
    if (!overlayModules[name]) return;
    overlayModules[name].showOverlay(onDur, offDur, size, overlayColor);
  };

  // Save entire state to AsyncStorage (including the color)
  const saveState = async (overlayOnVal: boolean, alwaysOnVal: boolean, onDurVal: number, offDurVal: number, sizeVal: number, colorVal: string) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.overlayOn, JSON.stringify(overlayOnVal)],
        [STORAGE_KEYS.alwaysOn, JSON.stringify(alwaysOnVal)],
        [STORAGE_KEYS.onDuration, onDurVal.toString()],
        [STORAGE_KEYS.offDuration, offDurVal.toString()],
        [STORAGE_KEYS.overlaySize, sizeVal.toString()],
        [STORAGE_KEYS.overlayColor, colorVal], // Save the selected color to AsyncStorage
        [STORAGE_KEYS.activeOverlay, 'Overlay'],
      ]);
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  };

  // Load state from AsyncStorage on mount (including color)
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
          AsyncStorage.getItem(STORAGE_KEYS.overlayColor), // Load saved color
        ]);

        setOverlayOn(savedOverlayOn ? JSON.parse(savedOverlayOn) : false);
        setAlwaysOn(savedAlwaysOn ? JSON.parse(savedAlwaysOn) : false);
        setOnDuration(savedOnDuration ? parseInt(savedOnDuration, 10) : durationOptions[0].value);
        setOffDuration(savedOffDuration ? parseInt(savedOffDuration, 10) : durationOptions[0].value);
        setOverlaySize(savedSize ? parseFloat(savedSize) : 50); // Default size if not saved
        setOverlayColor(savedColor || 'blue'); // Set the saved color or default to 'blue'

        if (savedOverlayOn === 'true') {
          hideOverlay();
          if (savedAlwaysOn === 'true') {
            showOverlay('Overlay', 60 * 60 * 1000, 1000, savedSize ? parseFloat(savedSize) : 50,);
          } else {
            showOverlay('Overlay', savedOnDuration, savedOffDuration, savedSize ? parseFloat(savedSize) : 50);
          }
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      }
    })();
  }, []);

  // Request notification permission (Android 13+)
  useEffect(() => {
    async function requestNotificationPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs notification permission to show alerts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied');
        }
      }
    }
    requestNotificationPermission();
  }, []);

  // Called when Always On toggled
  const handleAlwaysOnToggle = async (isOn: boolean) => {
    setAlwaysOn(isOn);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }
    await saveState(false, isOn, onDuration, offDuration, overlaySize, overlayColor);
  };

  // Handle color change and save it
  const handleColorChange = (color) => {
    setOverlayColor(color); // Update the selected color
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
    }
    saveState(overlayOn, alwaysOn, onDuration, offDuration, overlaySize, color); // Save the color state to AsyncStorage
  };

  // Called when Default Overlay toggle pressed
  const handleDefaultOverlayToggle = async (isOn: boolean) => {
    if (alwaysOn) {
      if (isOn) {
        showOverlay('Overlay', 60 * 60 * 1000, 1000, overlaySize); // 1 hour ON, 1 sec OFF
      } else {
        hideOverlay();
      }
    } else {
      if (isOn) {
        showOverlay('Overlay', onDuration, offDuration, overlaySize);
      } else {
        hideOverlay();
      }
    }

    setOverlayOn(isOn);
    await saveState(isOn, alwaysOn, onDuration, offDuration, overlaySize, overlayColor);
  };

  const handleOnDurationChange = async (value: number) => {
    setOnDuration(value);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
      await saveState(false, alwaysOn, value, offDuration, overlaySize, overlayColor);
    } else {
      await saveState(false, alwaysOn, value, offDuration, overlaySize, overlayColor);
    }
  };

  const handleOffDurationChange = async (value: number) => {
    setOffDuration(value);
    if (overlayOn) {
      hideOverlay();
      setOverlayOn(false);
      await saveState(false, alwaysOn, onDuration, value, overlaySize, overlayColor);
    } else {
      await saveState(false, alwaysOn, onDuration, value, overlaySize, overlayColor);
    }
  };

  const handleSizeChange = async (value: number) => {
    setOverlaySize(value);
    if (overlayOn) {
      hideOverlay();
      showOverlay('Overlay', onDuration, offDuration, value);
    }
    await saveState(overlayOn, alwaysOn, onDuration, offDuration, value, overlayColor);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlinkBuddy Control Panel</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* <UsageScreen/> */}

        {/* Always On toggle */}
        <Text style={styles.toggleLabel}>Always On</Text>
        <View style={styles.floatingButton}>
          <ToggleButton
            onclick={handleAlwaysOnToggle}
            color={alwaysOn ? 'green' : 'blue'}
            isActive={alwaysOn}
          />
        </View>

        {/* Default Overlay toggle - ALWAYS visible */}
        <Text style={styles.toggleLabel}>Turn on BlinkBuddy</Text>
        <View style={styles.floatingButton}>
          <ToggleButton
            onclick={handleDefaultOverlayToggle}
            color={overlayOn ? 'green' : 'blue'}
            isActive={overlayOn}
          />
        </View>

        {/* Duration pickers visible ONLY if Always On is OFF */}
        {!alwaysOn && (
          <>
            <Text style={styles.toggleLabel}>Select ON Duration</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={onDuration}
                onValueChange={handleOnDurationChange}
                mode="dropdown"
                style={styles.picker}
              >
                {durationOptions.map(opt => (
                  <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.toggleLabel}>Select OFF Duration</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={offDuration}
                onValueChange={handleOffDurationChange}
                mode="dropdown"
                style={styles.picker}
              >
                {durationOptions.map(opt => (
                  <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {/* Color Picker */}
        <Text style={styles.toggleLabel}>Select Overlay Color</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={overlayColor}
            onValueChange={handleColorChange}
            mode="dropdown"
            style={styles.picker}
          >
            {colorOptions.map((opt) => (
              <Picker.Item key={opt.label} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        <Text style={styles.colorLabel}>Selected Color: {overlayColor}</Text>

        {/* Slider to adjust overlay size */}
        <Text style={styles.toggleLabel}>Adjust Overlay Size</Text>
        <Slider
          style={styles.slider}
          minimumValue={30}
          maximumValue={100}
          step={1}
          value={overlaySize}
          onValueChange={handleSizeChange}
          minimumTrackTintColor="#1A73E8" // Blue color for the minimum track
          maximumTrackTintColor="#d3d3d3" // Light grey for the maximum track
          thumbTintColor="#ff6347" // Tomato red for the thumb (slider button)
        />
        <Text style={styles.sizeLabel}>{Math.round(overlaySize)}%</Text>
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  premiumResetButton: {
    backgroundColor: '#E11D48', // deep rose
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8, // Android shadow
    transform: [{ scale: 1 }],
  },

  slider: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  sizeLabel: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },

  // Custom styles for the slider thumb (the button)
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2, // Making it round
    backgroundColor: '#ff6347', // Tomato red color for the thumb
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5, // Android shadow effect
  },
  premiumResetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  container: {
  flex: 1,
  backgroundColor: '#FFFAFA',
    // paddingTop: 60,
    marginTop: 56,
    borderRadius: 20,

  padding: 33,
  // width: '120%',  // or just remove this line entirely
},

  simpleButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },

  simpleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1C1C1E', // dark gray instead of black for a softer look
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 24,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,  // slightly bigger radius for smoothness
    backgroundColor: '#fff',
    width: 220,        // slightly wider to balance padding
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,       // Android shadow
  },
  Cyan: {
    color: '#03E3FC',
  },
  Teal: {
    color: '#3CF2C3',
  },
  Lavender: {
    color: '#D8A7FF',
  },


  picker: {
    height: 68,
    width: '100%',
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 2,
  },


  scrollContent: {
    paddingBottom: 60,
    gap: 26,
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  floatingButton: {
    borderRadius: 50,
    backgroundColor: '#ffffff',
    padding: 14,

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,

    // Android elevation
    elevation: 20,

    borderWidth: 1,
    borderColor: '#e0e0e0',

    // Optional scale style (static, or animate dynamically)
    transform: [{ scale: 1 }],
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
});


