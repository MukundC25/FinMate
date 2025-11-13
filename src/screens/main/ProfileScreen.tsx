import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useStore } from '../../store/useStore';
import { TransactionDB, BudgetDB, UserDB } from '../../services/database';
import { AuthService } from '../../services/auth';

export function ProfileScreen({ navigation }: any) {
  const { transactions, budgets, setTransactions, setBudgets, setCurrentUserId, currentUserId } = useStore();
  const { formatCurrency, selectedCurrency } = useCurrencyFormat();
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
  });
  
  // Load user data on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [currentUserId])
  );
  
  const loadUserData = async () => {
    if (!currentUserId) return;
    
    try {
      const userData = await UserDB.getById(currentUserId);
      if (userData) {
        setUser({
          name: userData.name || 'User',
          email: userData.email || 'user@example.com',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  // Calculate dynamic stats
  const totalTransactions = transactions.length;
  const totalBudgets = budgets.length;
  const totalCategories = new Set(transactions.map(t => t.category)).size;

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
        { icon: '👤', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
        { icon: '🎯', label: 'Monthly Budget', value: formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0)), onPress: () => navigation.navigate('MainTabs', { screen: 'Budgets' }) },
        { icon: '🏦', label: 'Bank Accounts', onPress: () => navigation.navigate('BankAccounts') },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
        { icon: '🏷️', label: 'Categories', onPress: () => Alert.alert('Coming Soon', 'Category management will be available soon!') },
        { icon: '💱', label: 'Currency', value: `${selectedCurrency.code} (${selectedCurrency.symbol})`, onPress: () => navigation.navigate('Currency') },
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
              // Clear user data from store
              setCurrentUserId(null);
              setTransactions([]);
              setBudgets([]);
              console.log('👋 Logged out successfully');
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
      {/* Profile Header */}
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
            <Text style={styles.statValue}>{totalTransactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalBudgets}</Text>
            <Text style={styles.statLabel}>Budgets</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{totalCategories}</Text>
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

        {/* Footer */}
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
