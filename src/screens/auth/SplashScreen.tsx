import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  console.log('🎨 SplashScreen rendering...');
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>FinMate</Text>
        <Text style={styles.subtitle}>Smart UPI Expense Tracker</Text>
        <Text style={styles.debugText}>Loading...</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  debugText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  loader: {
    marginTop: Spacing.xl,
  },
});
