import { useEffect, useState } from 'react';
import { ReminderSettings, scheduleReminderNotifications } from '../notifications';
import { loadSettings, saveSettings } from '../storage/settings';

const defaultSettings: ReminderSettings = {
  enabled: true,
  cadence: 'daily',
  reminderHour: 9,
  reminderMinute: 0,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  reminderIndex: 0
};

export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [scheduledId, setScheduledId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await loadSettings();
      if (stored) {
        setSettings(stored);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    (async () => {
      await saveSettings(settings);
      const scheduled = await scheduleReminderNotifications(settings);
      setScheduledId(scheduled?.id ?? null);
    })();
  }, [settings, loading]);

  return {
    settings,
    loading,
    scheduledId,
    setSettings
  };
}
