import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInLeft,
  SlideInUp,
  SlideInDown,
  BounceIn,
  BounceOut,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  ZoomOut,
  Layout,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

type AnimationType =
  | 'fade'
  | 'slideRight'
  | 'slideLeft'
  | 'slideUp'
  | 'slideDown'
  | 'bounce'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'zoom';

interface AnimatedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  delay?: number;
  type?: AnimationType;
  onPress?: () => void;
  activeOpacity?: number;
  disabled?: boolean;
  entering?: any;
  exiting?: any;
  layout?: any;
  onLayout?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'menu' | 'menuitem' | 'text' | 'none';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{ name: string; label?: string }>;
  onAccessibilityAction?: (event: any) => void;
  hitSlop?: { top: number; left: number; bottom: number; right: number };
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  removeClippedSubviews?: boolean;
  collapsable?: boolean;
  needsOffscreenAlphaCompositing?: boolean;
  renderToHardwareTextureAndroid?: boolean;
  shouldRasterizeIOS?: boolean;
  isTVSelectable?: boolean;
  hasTVPreferredFocus?: boolean;
  tvParallaxProperties?: any;
  tvParallaxShiftDistanceX?: number;
  tvParallaxShiftDistanceY?: number;
  tvParallaxTiltAngle?: number;
  tvParallaxMagnification?: number;
}

const getEnteringAnimation = (type: AnimationType, duration: number, delay: number) => {
  const config = { duration, delay };
  
  switch (type) {
    case 'fade':
      return FadeIn.duration(duration).delay(delay);
    case 'slideRight':
      return SlideInRight.duration(duration).delay(delay);
    case 'slideLeft':
      return SlideInLeft.duration(duration).delay(delay);
    case 'slideUp':
      return SlideInUp.duration(duration).delay(delay);
    case 'slideDown':
      return SlideInDown.duration(duration).delay(delay);
    case 'bounce':
      return BounceIn.duration(duration).delay(delay);
    case 'fadeInUp':
      return FadeInUp.duration(duration).delay(delay);
    case 'fadeInDown':
      return FadeInDown.duration(duration).delay(delay);
    case 'zoom':
      return ZoomIn.duration(duration).delay(delay);
    default:
      return FadeIn.duration(duration).delay(delay);
  }
};

const getExitingAnimation = (type: AnimationType, duration: number, delay: number) => {
  const config = { duration, delay };
  
  switch (type) {
    case 'fade':
      return FadeOut.duration(duration).delay(delay);
    case 'bounce':
      return BounceOut.duration(duration).delay(delay);
    case 'zoom':
      return ZoomOut.duration(duration).delay(delay);
    default:
      return FadeOut.duration(duration).delay(delay);
  }
};

const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  style,
  duration = 300,
  delay = 0,
  type = 'fade',
  entering,
  exiting,
  layout,
  ...rest
}) => {
  const enteringAnimation = entering || getEnteringAnimation(type, duration, delay);
  const exitingAnimation = exiting || getExitingAnimation(type, duration, delay);
  const layoutAnimation = layout || Layout.duration(duration).delay(delay);

  return (
    <Animated.View
      entering={enteringAnimation}
      exiting={exitingAnimation}
      layout={layoutAnimation}
      style={[style]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
