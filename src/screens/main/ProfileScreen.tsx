import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';

export function ProfileScreen({ navigation }: any) {
  const user = {
    name: 'User',
    email: 'user@example.com',
    monthlyBudget: 16000,
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', onPress: () => {} },
        { icon: '🎯', label: 'Monthly Budget', value: formatCurrency(user.monthlyBudget), onPress: () => {} },
        { icon: '🏦', label: 'Bank Accounts', onPress: () => {} },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', onPress: () => {} },
        { icon: '🏷️', label: 'Categories', onPress: () => {} },
        { icon: '🌙', label: 'Dark Mode', toggle: false, onPress: () => {} },
        { icon: '💱', label: 'Currency', value: 'INR (₹)', onPress: () => {} },
      ],
    },
    {
      section: 'Data',
      items: [
        { icon: '📊', label: 'Export Data', onPress: () => {} },
        { icon: '📥', label: 'Import Transactions', onPress: () => {} },
        { icon: '🗑️', label: 'Clear All Data', onPress: () => {}, danger: true },
      ],
    },
    {
      section: 'About',
      items: [
        { icon: 'ℹ️', label: 'About FinMate', value: 'v1.0.0', onPress: () => {} },
        { icon: '📄', label: 'Privacy Policy', onPress: () => {} },
        { icon: '📧', label: 'Contact Support', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Budgets</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </Card>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <Card variant="outlined">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                      {item.label}
                    </Text>
                  </View>
                  {item.value && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for smart budgeting</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.medium,
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  menuValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  menuArrow: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textTertiary,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
  },
});
