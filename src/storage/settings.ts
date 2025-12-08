import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReminderSettings } from '../notifications';

const SETTINGS_KEY = 'gratitude.reminderSettings';

export async function loadSettings(): Promise<ReminderSettings | null> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReminderSettings;
  } catch (error) {
    console.warn('Failed to parse reminder settings', error);
    return null;
  }
}

export async function saveSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
