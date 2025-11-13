import { withTiming, withSpring, Easing, withSequence, withDelay, interpolate, useAnimatedStyle, useSharedValue, withRepeat } from 'react-native-reanimated';

type AnimationConfig = {
  duration?: number;
  delay?: number;
  scale?: number;
};

// Fade in animation
export const fadeIn = (config: AnimationConfig = {}) => {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
    },
    animations: {
      opacity: withDelay(
        config.delay || 0,
        withTiming(1, {
          duration: config.duration || 300,
          easing: Easing.out(Easing.ease),
        })
      ),
    },
  };
};

// Slide in from bottom
export const slideInBottom = (config: AnimationConfig = {}) => {
  'worklet';
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 50 }],
    },
    animations: {
      opacity: withDelay(
        config.delay || 0,
        withTiming(1, {
          duration: config.duration || 400,
          easing: Easing.out(Easing.cubic),
        })
      ),
      transform: [
        {
          translateY: withDelay(
            config.delay || 0,
            withTiming(0, {
              duration: config.duration || 400,
              easing: Easing.out(Easing.cubic),
            })
          ),
        },
      ],
    },
  };
};

// Subtle scale animation for buttons and cards
export const subtleScale = (config: AnimationConfig = {}) => {
  'worklet';
  return {
    initialValues: {
      transform: [{ scale: 1 }],
    },
    animations: {
      transform: [
        {
          scale: withDelay(
            config.delay || 0,
            withTiming(config.scale || 1.02, {
              duration: config.duration || 150,
              easing: Easing.out(Easing.ease),
            })
          ),
        },
      ],
    },
  };
};

// Loading pulse animation
export const pulse = (config: AnimationConfig = {}) => {
  'worklet';
  return {
    initialValues: {
      opacity: 0.6,
      transform: [{ scale: 0.98 }],
    },
    animations: {
      opacity: withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      ),
      transform: [
        {
          scale: withRepeat(
            withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
          ),
        },
      ],
    },
  };
};

// Custom hook for press animations
export const usePressAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  return { animatedStyle, onPressIn, onPressOut };
};

export const withFadeIn = (index: number, config: { delay?: number } = {}) => {
  'worklet';
  const delay = config.delay || 0;
  const itemDelay = index * 100 + delay;
  
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 20 }],
    },
    animations: {
      opacity: withDelay(
        itemDelay,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        })
      ),
      transform: [
        {
          translateY: withDelay(
            itemDelay,
            withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.ease),
            })
          ),
        },
      ],
    },
  };
};
