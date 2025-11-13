// Navigation Types
import { Transaction } from '../types';

export type RootStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Permissions: undefined;
  Login: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  TransactionDetail: { transaction: Transaction };
  AddTransaction: undefined;
  AddBudget: undefined;
  Settings: undefined;
  ExportData: undefined;
  ImportData: undefined;
  EditProfile: undefined;
  BankAccounts: undefined;
  DarkMode: undefined;
  Notifications: undefined;
  Currency: undefined;
  Insights: undefined;
  Alerts: undefined;
  AnimationExample: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Feed: undefined;
  Budgets: undefined;
  Profile: undefined;
};
