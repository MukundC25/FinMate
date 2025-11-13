import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Typography } from '../../constants/theme';
import AnimatedView from '../../components/common/AnimatedView';
import { useThemeColors } from '../../hooks/useThemeColors';

export const AnimationExampleScreen = () => {
  const colors = useThemeColors();
  const [showAnimations, setShowAnimations] = useState(true);
  const [animationType, setAnimationType] = useState('fade');

  const animationTypes = [
    'fade',
    'slideRight',
    'slideLeft',
    'slideUp',
    'slideDown',
    'bounce',
    'fadeInUp',
    'fadeInDown',
    'zoom'
  ];

  const renderAnimationBox = (type: string) => (
    <AnimatedView
      key={type}
      type={type as any}
      duration={600}
      delay={100}
      style={[styles.animationBox, { backgroundColor: colors.primary }]}
    >
      <Text style={[styles.animationText, { color: colors.background }]}>
        {type}
      </Text>
    </AnimatedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Animation Examples
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => setShowAnimations(!showAnimations)}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              {showAnimations ? 'Hide Animations' : 'Show Animations'}
            </Text>
          </TouchableOpacity>
        </View>

        {showAnimations && (
          <View style={styles.animationsContainer}>
            {animationTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: animationType === type ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setAnimationType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: animationType === type ? colors.background : colors.text },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.animationArea}>
          {showAnimations && renderAnimationBox(animationType)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  animationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeButton: {
    padding: 8,
    margin: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.xs,
  },
  animationArea: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  animationBox: {
    width: 150,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  animationText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});

// No default export needed, using named export
