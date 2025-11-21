import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '../../types';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const { formatCurrency } = useCurrencyFormat();
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
        <View style={styles.merchantRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          {transaction.isAutoDetected ? (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>AUTO</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.info} numberOfLines={1}>
            {transaction.upiId || 'N/A'} • {transaction.time}
          </Text>
          {transaction.confidence && transaction.isAutoDetected ? (
            <Text style={styles.confidence} numberOfLines={1}>
              {' '}• {Math.round(transaction.confidence * 100)}% confidence
            </Text>
          ) : null}
        </View>
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
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  merchant: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  autoBadge: {
    backgroundColor: Colors.primaryLight || '#E3F2FD',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.xs,
  },
  autoBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  info: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  confidence: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontStyle: 'italic',
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
