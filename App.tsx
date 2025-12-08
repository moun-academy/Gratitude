import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import ReminderSettingsScreen from './src/screens/ReminderSettingsScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  useEffect(() => {
    (async () => {
      await Notifications.setNotificationChannelAsync('gratitude-reminders', {
        name: 'Gratitude Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default'
      });
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ReminderSettingsScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  }
});
