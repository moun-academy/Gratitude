import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingRowProps {
  label: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function SettingRow({ label, description, onPress, children }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {children}
    </TouchableOpacity>
  );
}

interface ToggleRowProps extends Omit<SettingRowProps, 'children'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  return (
    <SettingRow label={label} description={description}>
      <Switch value={value} onValueChange={onValueChange} />
    </SettingRow>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  textContainer: {
    flex: 1
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  }
});

export default SettingRow;
