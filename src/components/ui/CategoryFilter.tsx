import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📊' },
  { id: 'Food', label: 'Food', icon: '🍔' },
  { id: 'Groceries', label: 'Groceries', icon: '🛒' },
  { id: 'Recharge/Bills', label: 'Bills', icon: '📱' },
  { id: 'P2P', label: 'P2P', icon: '👥' },
  { id: 'Travel', label: 'Travel', icon: '✈️' },
  { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'Others', label: 'Others', icon: '📦' },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  counts?: Map<string, number>;
}

export function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const count = counts?.get(category.id) || 0;
        const isSelected = selected === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
            ]}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {category.label}
            </Text>
            {count > 0 && (
              <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.surface,
    fontWeight: Typography.fontWeight.semibold,
  },
  badge: {
    backgroundColor: Colors.primaryLight || '#E3F2FD',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  badgeTextSelected: {
    color: Colors.surface,
  },
});
