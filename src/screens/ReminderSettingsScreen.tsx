import React, { useMemo } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getRotatingReminder } from '../constants/reminderCopy';
import { ReminderSettings, snoozeRemindersForToday } from '../notifications';
import { useReminderSettings } from '../hooks/useReminderSettings';
import SettingRow, { ToggleRow } from '../components/SettingRow';

function formatTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ReminderSettingsScreen() {
  const { settings, setSettings, loading } = useReminderSettings();

  const previewCopy = useMemo(() => getRotatingReminder(settings.reminderIndex), [settings.reminderIndex]);

  const updateSetting = (patch: Partial<ReminderSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleSnooze = async () => {
    await snoozeRemindersForToday(settings);
    updateSetting({ reminderIndex: settings.reminderIndex + 1 });
  };

  const advanceCopy = () => updateSetting({ reminderIndex: settings.reminderIndex + 1 });

  if (loading) {
    return (
      <View style={styles.centered}>\n        <Text>Loading reminder preferences…</Text>\n      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Reminder cadence</Text>
      <View style={styles.rowGroup}>
        <ToggleRow
          label="Enable reminders"
          description="Turn daily or weekly nudges on or off."
          value={settings.enabled}
          onValueChange={(value) => updateSetting({ enabled: value })}
        />
        <SettingRow label="Cadence" description="Choose how often to be reminded.">
          <View style={styles.inlineButtons}>
            <TouchableOpacity
              style={[styles.choiceButton, settings.cadence === 'daily' && styles.choiceButtonActive]}
              onPress={() => updateSetting({ cadence: 'daily' })}
            >
              <Text style={styles.choiceText}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.choiceButton, settings.cadence === 'weekly' && styles.choiceButtonActive]}
              onPress={() => updateSetting({ cadence: 'weekly', weekday: settings.weekday ?? new Date().getDay() })}
            >
              <Text style={styles.choiceText}>Weekly</Text>
            </TouchableOpacity>
          </View>
        </SettingRow>
        {settings.cadence === 'weekly' ? (
          <SettingRow label="Weekday" description="Pick the day for weekly reminders.">
            <View style={styles.inlineButtons}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.choiceButtonSmall, settings.weekday === index && styles.choiceButtonActive]}
                  onPress={() => updateSetting({ weekday: index })}
                >
                  <Text style={styles.choiceText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>
        ) : null}
      </View>

      <Text style={styles.header}>Reminder time</Text>
      <View style={styles.rowGroup}>
        <SettingRow label="Time" description="Local time to deliver the reminder.">
          <View style={styles.timeInputs}>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={String(settings.reminderHour)}
              onChangeText={(text) => updateSetting({ reminderHour: Math.min(23, Math.max(0, Number(text) || 0)) })}
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={String(settings.reminderMinute)}
              onChangeText={(text) => updateSetting({ reminderMinute: Math.min(59, Math.max(0, Number(text) || 0)) })}
            />
          </View>
        </SettingRow>
        <SettingRow label="Quiet hours" description="Reminders pause during these hours.">
          <View style={styles.timeInputs}>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={String(settings.quietHoursStart)}
              onChangeText={(text) => updateSetting({ quietHoursStart: Math.min(23, Math.max(0, Number(text) || 0)) })}
            />
            <Text style={styles.rangeText}>to</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="numeric"
              value={String(settings.quietHoursEnd)}
              onChangeText={(text) => updateSetting({ quietHoursEnd: Math.min(23, Math.max(0, Number(text) || 0)) })}
            />
          </View>
        </SettingRow>
        <Text style={styles.helper}>Next reminder around {formatTime(settings.reminderHour, settings.reminderMinute)} outside quiet hours.</Text>
      </View>

      <Text style={styles.header}>Preview & rotation</Text>
      <View style={styles.rowGroup}>
        <Text style={styles.previewLabel}>Preview</Text>
        <Text style={styles.previewBody}>{previewCopy}</Text>
        <View style={styles.inlineButtons}>
          <Button title="Rotate reminder" onPress={advanceCopy} />
          <Button title="Snooze for today" onPress={handleSnooze} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    paddingBottom: 32
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    textTransform: 'uppercase'
  },
  rowGroup: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: StyleSheet.hairlineWidth
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 8
  },
  choiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#d1d5db',
    borderWidth: 1,
    marginLeft: 8
  },
  choiceButtonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderColor: '#d1d5db',
    borderWidth: 1,
    marginHorizontal: 2
  },
  choiceButtonActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9'
  },
  choiceText: {
    fontWeight: '600'
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeInput: {
    width: 48,
    padding: 8,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center'
  },
  colon: {
    paddingHorizontal: 8,
    fontWeight: '700'
  },
  rangeText: {
    paddingHorizontal: 8,
    fontWeight: '700'
  },
  helper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    color: '#6b7280'
  },
  previewLabel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: '700'
  },
  previewBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#111827',
    fontSize: 16
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
