import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { BorderRadius } from '../constants/Spacing';
import { useEffect } from 'react';

interface LoadingShimmerProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export default function LoadingShimmer({
  width = '100%',
  height,
  borderRadius = BorderRadius.md,
  style,
}: LoadingShimmerProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: Colors.backgroundTertiary,
  },
});