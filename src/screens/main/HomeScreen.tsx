import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TransactionRow } from '../../components/common/TransactionRow';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useStore } from '../../store/useStore';
import { getCurrentMonthRange, getCurrentMonthName, getGreeting, getCategorySpending, getWeeklySpending } from '../../utils/helpers';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { TransactionDB, BudgetDB } from '../../services/database';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { SpendingChart } from '../../components/charts/SpendingChart';
import { TimeframeSelector } from '../../components/ui/TimeframeSelector';
import { SmartSuggestions } from '../../components/common/SmartSuggestions';
import { useSMSListener } from '../../hooks/useSMSListener';
import { SMSService } from '../../services/smsService';

export function HomeScreen({ navigation }: any) {
  const { transactions, setTransactions, budgets, setBudgets, currentUserId, selectedTimeframe, setSelectedTimeframe } = useStore();
  const { formatCurrency } = useCurrencyFormat();
  const { processSMSManually, isPermissionGranted } = useSMSListener();
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [smsProcessing, setSMSProcessing] = useState(false);
  
  // Calculate total monthly budget from all budgets
  const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        loadData();
      }
    }, [currentUserId])
  );

  const loadData = async () => {
    if (!currentUserId) {
      console.log('⚠️ No user logged in');
      return;
    }

    try {
      console.log('📊 Loading home screen data for user:', currentUserId);
      const allTransactions = await TransactionDB.getAll(currentUserId);
      console.log(`✅ Loaded ${allTransactions.length} transactions`);
      setTransactions(allTransactions);

      // Load budgets to calculate total budget
      const allBudgets = await BudgetDB.getAll(currentUserId);
      setBudgets(allBudgets);

      const { start, end } = getCurrentMonthRange();
      const spent = await TransactionDB.getTotalSpent(start, end, currentUserId);
      setTotalSpent(spent);

      // Calculate total received
      const received = allTransactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0);
      setTotalReceived(received);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const budgetLeft = monthlyBudget - totalSpent;
  const budgetProgress = (totalSpent / monthlyBudget) * 100;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <ScrollView
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
        <Text style={styles.subtitle}>Here's your spending summary</Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard} variant="elevated">
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>This month spent</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getCurrentMonthName()}</Text>
          </View>
        </View>

        <View style={styles.budgetInfo}>
          <View>
            <Text style={styles.budgetLabel}>Budget left</Text>
            <Text style={[styles.budgetAmount, budgetLeft < 0 && styles.overBudget]}>
              {formatCurrency(budgetLeft)}
            </Text>
          </View>
          <View style={styles.progressInfo}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(budgetProgress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {budgetProgress.toFixed(0)}% of {formatCurrency(monthlyBudget)}
            </Text>
          </View>
        </View>

        {budgetLeft < 0 && (
          <View style={styles.alert}>
            <Text style={styles.alertText}>
              ⚠️ You're over budget by {formatCurrency(Math.abs(budgetLeft))}
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('🔘 Add Expense clicked');
            navigation.navigate('AddTransaction');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>➕ Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('🔘 View All clicked');
            navigation.navigate('Feed');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>📋 View All</Text>
        </TouchableOpacity>
      </View>

      {/* SMS Processing Button */}
      {isPermissionGranted && (
        <View style={styles.smsSection}>
          <TouchableOpacity
            style={[styles.smsButton, smsProcessing && styles.smsButtonDisabled]}
            onPress={async () => {
              if (smsProcessing) return;
              setSMSProcessing(true);
              try {
                console.log('🔄 Manual SMS processing started...');
                const result = await processSMSManually();
                if (result.success && 'created' in result && result.created > 0) {
                  // Reload data to show new transactions
                  loadData();
                  console.log(`✅ Found ${result.created} new transactions from SMS`);
                } else if (result.success && 'created' in result && result.created === 0) {
                  console.log('📱 No new transactions found in SMS');
                } else if (!result.success) {
                  console.log('❌ SMS processing failed:', result.error);
                }
              } catch (error) {
                console.error('❌ SMS processing error:', error);
              } finally {
                setSMSProcessing(false);
              }
            }}
            activeOpacity={0.7}
            disabled={smsProcessing}
          >
            <Text style={[styles.smsButtonText, smsProcessing && styles.smsButtonTextDisabled]}>
              {smsProcessing ? '🔄 Checking SMS...' : '📱 Check SMS for Transactions'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, smsProcessing && styles.smsButtonDisabled]}
            onPress={async () => {
              setSMSProcessing(true);
              try {
                console.log('🗑️ Clearing processed SMS records...');
                if (currentUserId) {
                  await SMSService.clearProcessedRecords(currentUserId);
                }
                console.log('✅ Cleared! Now re-scanning ALL SMS from last 30 days...');
                const result = await processSMSManually();
                if (result.success && 'created' in result && result.created > 0) {
                  loadData();
                  console.log(`✅ Found ${result.created} transactions from ALL SMS`);
                } else {
                  console.log('📱 No transactions found in SMS');
                }
              } catch (error) {
                console.error('❌ Error:', error);
              } finally {
                setSMSProcessing(false);
              }
            }}
            activeOpacity={0.7}
            disabled={smsProcessing}
          >
            <Text style={[styles.clearButtonText, smsProcessing && styles.smsButtonTextDisabled]}>
              {smsProcessing ? '🔄 Re-scanning...' : '🔄 Clear & Re-scan ALL SMS'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Card variant="outlined">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onPress={() => navigation.navigate('TransactionDetail', { transaction })}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Add your first transaction to get started</Text>
            </View>
          )}
        </Card>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={[styles.statValue, { color: Colors.error }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total Received</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {formatCurrency(totalReceived)}
          </Text>
        </Card>
      </View>

      {/* Smart Suggestions */}
      <View style={styles.section}>
        <SmartSuggestions
          totalSpent={totalSpent}
          monthlyBudget={monthlyBudget}
          categorySpending={getCategorySpending(transactions)}
        />
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <Card>
          <CategoryPieChart data={getCategorySpending(transactions)} />
        </Card>
      </View>

      {/* Weekly Spending */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending Overview</Text>
          <TimeframeSelector
            selected={selectedTimeframe}
            onSelect={setSelectedTimeframe}
          />
        </View>
        <Card>
          <SpendingChart timeframe={selectedTimeframe} />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  summaryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  budgetAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  overBudget: {
    color: Colors.errorLight,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.textInverse,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverse,
    opacity: 0.8,
  },
  alert: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  alertText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  actionButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  smsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  smsButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsButtonDisabled: {
    opacity: 0.6,
    borderColor: Colors.textSecondary,
  },
  smsButtonText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  smsButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  clearButton: {
    backgroundColor: Colors.warning || '#FFA500',
    borderWidth: 2,
    borderColor: Colors.warning || '#FFA500',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
