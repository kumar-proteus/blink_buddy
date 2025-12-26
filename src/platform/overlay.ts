import {Platform, NativeModules, Alert} from 'react-native';

const {Overlay: NativeOverlay} = NativeModules;

interface OverlayInterface {
  showOverlay: (
    onDuration: number,
    offDuration: number,
    size: number,
    color: string,
  ) => void;
  hideOverlay: () => void;
  isSupported: () => boolean;
}

// Android implementation using native module
const AndroidOverlay: OverlayInterface = {
  showOverlay: (onDuration, offDuration, size, color) => {
    try {
      NativeOverlay?.showOverlay(onDuration, offDuration, size, color);
    } catch (e) {
      console.log('Error showing overlay:', e);
    }
  },
  hideOverlay: () => {
    try {
      NativeOverlay?.hideOverlay();
    } catch (e) {
      console.log('Error hiding overlay:', e);
    }
  },
  isSupported: () => true,
};

// macOS/iOS stub implementation
// System-wide overlays are not possible on macOS/iOS
// This provides a no-op implementation with user notification
const DesktopOverlay: OverlayInterface = {
  showOverlay: (onDuration, offDuration, size, color) => {
    console.log(
      `[macOS] Overlay requested: on=${onDuration}ms, off=${offDuration}ms, size=${size}, color=${color}`,
    );
    // On macOS, we could potentially use notifications or a floating window
    // For now, we just log the request
    Alert.alert(
      'Blink Reminder Active',
      `Blink Buddy is now active. Remember to blink regularly!\n\nNote: System-wide overlays are not available on this platform.`,
      [{text: 'OK'}],
    );
  },
  hideOverlay: () => {
    console.log('[macOS] Overlay hide requested');
  },
  isSupported: () => false,
};

// Export the appropriate implementation based on platform
export const Overlay: OverlayInterface =
  Platform.OS === 'android' ? AndroidOverlay : DesktopOverlay;

export default Overlay;
