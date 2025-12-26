import { View, Text, Button, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import VIForegroundService from '@voximplant/react-native-foreground-service';

import { PermissionsAndroid, Platform } from 'react-native';

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification Permission',
        message: 'App needs access to show notifications',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    console.log('Notification permission:', granted);
  }
};


const ForegroundService = () => {

  useEffect(() => {
    requestNotificationPermission(); // 👈 Don't forget this!
  CreateChannel();
}, []);



  const CreateChannel = async () => {
    const channelConfig = {
      id: 'channelId',
      name: 'Channel name',
      description: 'Channel description',
      enableVibration: false,
    };
    await VIForegroundService.getInstance().createNotificationChannel(channelConfig);
  };



  const startForegroundService = async () => {
    const notificationConfig = {
      channelId: 'channelId',
      id: 3456,
      title: 'Title',
      text: 'Fuck off',
      icon: 'ic_icon',
      button: 'Some text',
    };
    try {
      await VIForegroundService.getInstance().startService(notificationConfig);
    } catch (e) {
      console.error(e);
    }
  };

  const stopForegroundService = async () => {
  await VIForegroundService.getInstance().stopService();
  };



  return (
    <View style={{
      paddingTop: 40,
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
    }}>

      {/* Start Foreground Service */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4a90e2',
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginVertical: 10,
          marginHorizontal: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => startForegroundService()}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          Start Foreground Service
        </Text>
      </TouchableOpacity>

      {/* Stop Foreground Service */}
      <TouchableOpacity
        style={{
          backgroundColor: '#d9534f',
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginVertical: 10,
          marginHorizontal: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => stopForegroundService()}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          Stop Foreground Service
        </Text>
      </TouchableOpacity>

      {/* Start Background Service */}
      <TouchableOpacity
        style={{
          backgroundColor: '#5cb85c',
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginVertical: 10,
          marginHorizontal: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => console.log('Start Background')}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          Start Background Service
        </Text>
      </TouchableOpacity>

      {/* Stop Background Service */}
      <TouchableOpacity
        style={{
          backgroundColor: '#f0ad4e',
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginVertical: 10,
          marginHorizontal: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
        onPress={() => console.log('Stop Background')}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          Stop Background Service
        </Text>
      </TouchableOpacity>

    </View>

  )
}

export default ForegroundService