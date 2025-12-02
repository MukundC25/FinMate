import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export type Timeframe = 'week' | 'month' | 'year';

interface TimeframeSelectorProps {
  selected: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
}

export function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  const options: { value: Timeframe; label: string }[] = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selected === option.value && styles.buttonSelected,
          ]}
          onPress={() => onSelect(option.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              selected === option.value && styles.buttonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  buttonTextSelected: {
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
});
