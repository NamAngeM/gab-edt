import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';

interface SkeletonProps {
  style?: ViewStyle | ViewStyle[];
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export const Skeleton = ({ style, width, height, borderRadius = 8 }: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height: height as any, borderRadius, opacity: animatedValue },
        style
      ]}
    />
  );
};

export const CourseSkeleton = () => (
  <View style={styles.courseCard}>
    <Skeleton width="100%" height={24} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton width="40%" height={16} />
      <Skeleton width="20%" height={16} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Skeleton width={32} height={32} borderRadius={16} style={{ marginRight: 12 }} />
      <Skeleton width="30%" height={16} />
    </View>
  </View>
);

export const ActuSkeleton = () => (
  <View style={styles.actuCard}>
    <Skeleton width="100%" height={120} borderRadius={12} style={{ marginBottom: 12 }} />
    <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
    <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
    <Skeleton width="60%" height={14} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.outlineVariant,
  },
  courseCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginHorizontal: 16,
  },
  actuCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginHorizontal: 12,
  }
});
