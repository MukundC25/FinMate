// Navigation Types
import { Transaction } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  TransactionDetail: { transaction: Transaction };
  AddTransaction: undefined;
  Settings: undefined;
  Insights: undefined;
  Alerts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Feed: undefined;
  Budgets: undefined;
  Profile: undefined;
};
