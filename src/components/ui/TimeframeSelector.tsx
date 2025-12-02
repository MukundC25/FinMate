import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

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
    borderRadius: BorderRadius.lg,
    padding: 3,
    gap: 3,
    alignSelf: 'flex-start',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  buttonSelected: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  buttonTextSelected: {
    color: Colors.surface,
    fontWeight: '600',
  },
});
