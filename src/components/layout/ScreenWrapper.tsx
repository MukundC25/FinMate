import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  scrollViewProps?: ScrollViewProps;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  horizontalPadding?: boolean;
}

export function ScreenWrapper({
  children,
  scroll = false,
  scrollViewProps,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom'],
  horizontalPadding = true,
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: Colors.background,
    paddingLeft: horizontalPadding ? Spacing.lg : 0,
    paddingRight: horizontalPadding ? Spacing.lg : 0,
  };

  const scrollContentStyle: ViewStyle = {
    flexGrow: 1,
    paddingBottom: edges.includes('bottom') ? insets.bottom + Spacing.lg : Spacing.lg,
    ...contentContainerStyle,
  };

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
        <ScrollView
          style={containerStyle}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      <View style={[containerStyle, contentContainerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
