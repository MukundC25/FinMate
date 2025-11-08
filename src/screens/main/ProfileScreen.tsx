import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { TransactionDB, BudgetDB } from '../../services/database';
import { AuthService } from '../../services/auth';

export function ProfileScreen({ navigation }: any) {
  const { setTransactions, setBudgets } = useStore();
  const user = {
    name: 'User',
    email: 'user@example.com',
    monthlyBudget: 16000,
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, budgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionDB.deleteAll();
              await BudgetDB.deleteAll();
              setTransactions([]);
              setBudgets([]);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', onPress: () => Alert.alert('Coming Soon', 'Edit profile feature will be available soon!') },
        { icon: '🎯', label: 'Monthly Budget', value: formatCurrency(user.monthlyBudget), onPress: () => Alert.alert('Coming Soon', 'Budget settings will be available soon!') },
        { icon: '🏦', label: 'Bank Accounts', onPress: () => Alert.alert('Coming Soon', 'Bank account management will be available soon!') },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Settings') },
        { icon: '🏷️', label: 'Categories', onPress: () => Alert.alert('Coming Soon', 'Category management will be available soon!') },
        { icon: '🌙', label: 'Dark Mode', onPress: () => navigation.navigate('Settings') },
        { icon: '💱', label: 'Currency', value: 'INR (₹)', onPress: () => navigation.navigate('Settings') },
      ],
    },
    {
      section: 'Data',
      items: [
        { icon: '📊', label: 'Export Data', onPress: () => navigation.navigate('ExportData') },
        { icon: '📥', label: 'Import Transactions', onPress: () => navigation.navigate('ImportData') },
        { icon: '🗑️', label: 'Clear All Data', onPress: handleClearData, danger: true },
      ],
    },
    {
      section: 'About',
      items: [
        { icon: 'ℹ️', label: 'About FinMate', value: 'v1.0.0', onPress: () => Alert.alert('FinMate', 'Version 1.0.0\n\nYour personal finance manager') },
        { icon: '📄', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy Policy', 'Your data is stored locally on your device and is never shared.') },
        { icon: '📧', label: 'Contact Support', onPress: () => Alert.alert('Contact Support', 'Email: support@finmate.app') },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('Landing');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
