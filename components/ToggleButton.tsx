import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';

type ToggleButtonProps = {
  onclick: (state: boolean) => void;
  color?: string;
  isActive?: boolean;
};

const ToggleButton = ({ onclick, color = '#269fe5', isActive = false }: ToggleButtonProps) => {
  const [isOn, setIsOn] = useState(isActive);
  const translateX = useState(new Animated.Value(isActive ? 40 : 0))[0];

  useEffect(() => {
    setIsOn(isActive);
    Animated.timing(translateX, {
      toValue: isActive ? 40 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    Animated.timing(translateX, {
      toValue: newState ? 40 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    onclick(newState);
  };

  return (
    <TouchableOpacity onPress={toggleSwitch}>
      <View style={styles.toggleContainer}>
        <View style={[styles.track, { backgroundColor: isOn ? color : '#616774' }]} />
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]}>
          <View style={styles.eye} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default ToggleButton;

const styles = StyleSheet.create({
  toggleContainer: {
    width: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    padding: 5,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
});
