import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingPageView from './components/OnboardingPageView';
import PermissionsScreen from './components/PermissionsScreen';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

/**
 * The main application component.
 * It serves as the root of the application and renders the primary layout,
 * including a bottom navigation bar to switch between screens.
 */
export default function App() {
  // State to track the current screen flow: 'splash' -> 'onboarding' -> 'permissions' -> 'home' -> 'settings'
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'permissions' | 'home' | 'settings'>('splash');

  // Check if onboarding was completed on app launch (during splash screen)
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Add a minimum splash duration for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (onboardingComplete === 'true') {
          // Skip onboarding, go directly to permissions screen
          setCurrentScreen('permissions');
        } else {
          // First launch, show onboarding
          setCurrentScreen('onboarding');
        }
      } catch (error) {
        console.log('Error checking onboarding status:', error);
        // Default to onboarding on error
        setCurrentScreen('onboarding');
      }
    };

    checkOnboardingStatus();
  }, []);

  // Handle skip from onboarding - go to permissions screen and save completion
  const handleSkipOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    setCurrentScreen('permissions');
  };

  // Handle all permissions granted - go to home screen
  const handlePermissionsGranted = () => {
    setCurrentScreen('home');
  };

  // Handle going directly to home (when permissions already granted)
  const handleGoHome = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    setCurrentScreen('home');
  };

  // Handle navigation to settings screen
  const handleSettingsPress = () => {
    setCurrentScreen('settings');
  };

  // Handle navigation back to home from settings
  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  // Show splash screen while checking onboarding status
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  // Show onboarding pageview first (only on first launch)
  if (currentScreen === 'onboarding') {
    return <OnboardingPageView onSkip={handleSkipOnboarding} onGoHome={handleGoHome} />;
  }

  // Show permissions screen after onboarding
  if (currentScreen === 'permissions') {
    return <PermissionsScreen onAllPermissionsGranted={handlePermissionsGranted} />;
  }

  // Show settings screen
  if (currentScreen === 'settings') {
    return <SettingsScreen onBackPress={handleBackToHome} />;
  }

  // Show home screen
  return <HomeScreen onSettingsPress={handleSettingsPress} />;
}

// Styles (kept for potential future use)
const styles = StyleSheet.create({});