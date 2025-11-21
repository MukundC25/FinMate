// Design System - Colors, Typography, Spacing

export const Colors = {
  // Primary Brand Colors
  primary: '#0B6E6F',
  primaryLight: '#00A79D',
  primaryDark: '#064E4F',
  
  // Status Colors
  success: '#16A34A',
  successLight: '#4ADE80',
  error: '#DC2626',
  errorLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  info: '#3B82F6',
  
  // Category Colors
  food: '#FF9F1C',
  groceries: '#16A34A',
  recharge: '#0B6E6F',
  p2p: '#00A79D',
  bills: '#DC2626',
  entertainment: '#8B5CF6',
  travel: '#3B82F6',
  shopping: '#EC4899',
  health: '#10B981',
  education: '#6366F1',
  
  // Neutral Colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#E5E7EB',
  
  // Text Colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights (using numeric values for React Native compatibility)
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const CategoryConfig = {
  // Expense categories
  Food: { color: Colors.food, icon: '🍔' },
  Groceries: { color: Colors.groceries, icon: '🛒' },
  Recharge: { color: Colors.recharge, icon: '📱' },
  'Recharge/Bills': { color: Colors.recharge, icon: '📱' },
  P2P: { color: Colors.p2p, icon: '👥' },
  Bills: { color: Colors.bills, icon: '💳' },
  Entertainment: { color: Colors.entertainment, icon: '🎬' },
  Travel: { color: Colors.travel, icon: '🚗' },
  Shopping: { color: Colors.shopping, icon: '🛍️' },
  Health: { color: Colors.health, icon: '❤️' },
  Education: { color: Colors.education, icon: '📚' },
  Income: { color: Colors.success, icon: '💰' },
  Others: { color: Colors.textSecondary, icon: '📌' },
  'Wallet/Recharge': { color: Colors.recharge, icon: '👛' },
  'P2P / Merchant': { color: Colors.p2p, icon: '👥' },
  Merchant: { color: Colors.textSecondary, icon: '🏪' },
  'Bank Transfer': { color: Colors.primary, icon: '🏦' },
  Mandate: { color: Colors.info, icon: '🔄' },
  Uncategorized: { color: Colors.textTertiary, icon: '❓' },
  
  // Income categories
  Salary: { color: '#10B981', icon: '💼' },
  Freelance: { color: '#8B5CF6', icon: '💻' },
  Investment: { color: '#F59E0B', icon: '📈' },
  Gift: { color: '#EC4899', icon: '🎁' },
  Refund: { color: '#06B6D4', icon: '↩️' },
  Other: { color: Colors.textSecondary, icon: '💵' },
};
