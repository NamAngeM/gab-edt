import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  activeOpacity?: number;
}

export const AnimatedCard = ({ children, index = 0, style, onPress, activeOpacity = 0.97 }: AnimatedCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: activeOpacity,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY }, { scale: scaleAnim }],
  };

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={style as any}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
