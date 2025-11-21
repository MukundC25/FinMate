import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function SettingsScreen({ navigation }: any) {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(false);

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    Alert.alert('Currency Updated', `Currency changed to ${code}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Currency Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>💱 Currency</Text>
          {CURRENCIES.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={styles.currencyOption}
              onPress={() => handleCurrencyChange(currency.code)}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <View>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                </View>
              </View>
              {selectedCurrency === currency.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Notification Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive app notifications
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={notifications ? Colors.primary : Colors.textSecondary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Budget Alerts</Text>
              <Text style={styles.settingDescription}>
                Alert when reaching budget limits
              </Text>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={budgetAlerts ? Colors.primary : Colors.textSecondary}
              disabled={!notifications}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Transaction Alerts</Text>
              <Text style={styles.settingDescription}>
                Notify for each transaction
              </Text>
            </View>
            <Switch
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={transactionAlerts ? Colors.primary : Colors.textSecondary}
              disabled={!notifications}
            />
          </View>
        </Card>

        {/* Appearance Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🌙 Appearance</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Use dark theme (Coming soon)
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                Alert.alert('Coming Soon', 'Dark mode will be available in the next update!');
              }}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={darkMode ? Colors.primary : Colors.textSecondary}
            />
          </View>
        </Card>

        {/* Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Settings are saved automatically
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  currencySymbol: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  currencyCode: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  checkmark: {
    fontSize: 24,
    color: Colors.success,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  infoCard: {
    padding: Spacing.md,
    backgroundColor: Colors.info + '10',
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.info,
    textAlign: 'center',
  },
});
