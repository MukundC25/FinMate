import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { formatCurrency } from '../../utils/helpers';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const isDebit = transaction.type === 'sent';
  const categoryInfo = CategoryConfig[transaction.category as keyof typeof CategoryConfig] || CategoryConfig.Others;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Category Icon */}
      <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
        <Text style={[styles.iconText, { color: categoryInfo.color }]}>
          {transaction.category.charAt(0)}
        </Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={styles.info} numberOfLines={1}>
          {transaction.upiId} • {transaction.time}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: isDebit ? Colors.error : Colors.success }]}>
          {isDebit ? '-' : '+'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.status}>{transaction.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  details: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  merchant: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  info: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  status: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
});
