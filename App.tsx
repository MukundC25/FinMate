import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { LandingScreen } from './src/screens/auth/LandingScreen';
import { PermissionsScreen } from './src/screens/auth/PermissionsScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { HomeScreen } from './src/screens/main/HomeScreen';
import { TransactionFeedScreen } from './src/screens/main/TransactionFeedScreen';
import { BudgetScreen } from './src/screens/main/BudgetScreen';
import { ProfileScreen } from './src/screens/main/ProfileScreen';
import { AddTransactionScreen } from './src/screens/transaction/AddTransactionScreen';
import { TransactionDetailScreen } from './src/screens/transaction/TransactionDetailScreen';
import { AddBudgetScreen } from './src/screens/budget/AddBudgetScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { ExportDataScreen } from './src/screens/settings/ExportDataScreen';
import { ImportDataScreen } from './src/screens/settings/ImportDataScreen';
import { seedMockData } from './src/utils/mockData';
import { RootStackParamList, MainTabParamList } from './src/navigation/types';
import { Colors } from './src/constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Feed" 
        component={TransactionFeedScreen}
        options={{
          tabBarLabel: 'Transactions',
        }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budgets',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting FinMate...');
      await seedMockData();
      console.log('✅ App ready!');
      setIsReady(true);
    } catch (error) {
      console.error('❌ Initialization error:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <SplashScreen onComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="AddTransaction" 
            component={AddTransactionScreen}
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="TransactionDetail" 
            component={TransactionDetailScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="AddBudget" 
            component={AddBudgetScreen}
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ExportData" 
            component={ExportDataScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ImportData" 
            component={ImportDataScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
