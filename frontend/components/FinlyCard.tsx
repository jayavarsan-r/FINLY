import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface FinlyCardProps {
  children: React.ReactNode;
  gradient?: string[];
  glowColor?: string;
  style?: ViewStyle;
}

export default function FinlyCard({
  children,
  gradient,
  glowColor,
  style,
}: FinlyCardProps) {
  if (gradient) {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.card,
        glowColor && { shadowColor: glowColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  gradient: {
    padding: Spacing.md,
  },
});