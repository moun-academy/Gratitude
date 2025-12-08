import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getRotatingReminder } from './constants/reminderCopy';

export type ReminderCadence = 'daily' | 'weekly';

export interface ReminderSettings {
  enabled: boolean;
  cadence: ReminderCadence;
  reminderHour: number; // 0-23
  reminderMinute: number; // 0-59
  weekday?: number; // 0 (Sun) - 6 (Sat) for weekly cadence
  quietHoursStart: number; // 0-23
  quietHoursEnd: number; // 0-23
  reminderIndex: number;
  snoozedDate?: string; // ISO date of last snooze
}

export interface ScheduledReminder {
  id: string;
  copyIndex: number;
}

function isWithinQuietHours(date: Date, settings: ReminderSettings): boolean {
  const hour = date.getHours();
  const { quietHoursStart, quietHoursEnd } = settings;
  if (quietHoursStart === quietHoursEnd) return false; // disabled
  if (quietHoursStart < quietHoursEnd) {
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }
  // Quiet hours wrap around midnight
  return hour >= quietHoursStart || hour < quietHoursEnd;
}

function normalizeToNextAllowedTime(target: Date, settings: ReminderSettings): Date {
  if (!isWithinQuietHours(target, settings)) {
    return target;
  }

  const adjusted = new Date(target);
  const { quietHoursStart, quietHoursEnd } = settings;
  if (quietHoursStart < quietHoursEnd) {
    adjusted.setHours(quietHoursEnd, 0, 0, 0);
  } else {
    // wrap to next day
    adjusted.setDate(adjusted.getDate() + 1);
    adjusted.setHours(quietHoursEnd, 0, 0, 0);
  }
  return adjusted;
}

async function ensurePermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const request = await Notifications.requestPermissionsAsync();
  return request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

function buildTriggerDate(settings: ReminderSettings, skipToday: boolean): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(settings.reminderHour, settings.reminderMinute, 0, 0);

  if (settings.cadence === 'weekly' && settings.weekday !== undefined) {
    const currentDow = target.getDay();
    const delta = (settings.weekday - currentDow + 7) % 7;
    if (delta === 0) {
      target.setDate(target.getDate() + (skipToday ? 7 : 0));
    } else {
      target.setDate(target.getDate() + delta);
    }
  } else {
    if (skipToday || target <= now) {
      target.setDate(target.getDate() + 1);
    }
  }

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return normalizeToNextAllowedTime(target, settings);
}

export async function cancelScheduledReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function scheduleReminderNotifications(settings: ReminderSettings): Promise<ScheduledReminder | null> {
  if (!settings.enabled) {
    await cancelScheduledReminders();
    return null;
  }
  const hasPerm = await ensurePermissions();
  if (!hasPerm) return null;

  await cancelScheduledReminders();

  const fireDate = buildTriggerDate(settings, false);
  const reminderCopy = getRotatingReminder(settings.reminderIndex);

  const trigger: Notifications.NotificationTriggerInput = Platform.select({
    ios: {
      date: fireDate,
      repeats: settings.cadence === 'daily' || settings.cadence === 'weekly'
    },
    android: {
      channelId: 'gratitude-reminders',
      repeats: settings.cadence === 'daily' || settings.cadence === 'weekly',
      minute: fireDate.getMinutes(),
      hour: fireDate.getHours(),
      weekday: settings.cadence === 'weekly' ? fireDate.getDay() : undefined
    },
    default: { date: fireDate }
  }) as Notifications.NotificationTriggerInput;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Gentle gratitude reminder',
      body: reminderCopy,
      sound: true
    },
    trigger
  });

  return { id, copyIndex: settings.reminderIndex };
}

export async function snoozeRemindersForToday(settings: ReminderSettings): Promise<void> {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  await cancelScheduledReminders();
  const nextSettings: ReminderSettings = { ...settings, snoozedDate: todayIso };
  const nextTrigger = buildTriggerDate(nextSettings, true);
  const reminderCopy = getRotatingReminder(settings.reminderIndex + 1);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reminder moved to tomorrow',
      body: reminderCopy,
      sound: true
    },
    trigger: nextTrigger
  });
}
