import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface FinlyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function FinlyButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: FinlyButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary' || variant === 'danger') {
    const colors = variant === 'primary' ? ['#6C63FF', '#9C63FF'] : ['#FF6B6B', '#FF8E53'];
    
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, isDisabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.container, styles.secondary, isDisabled && styles.disabled, style]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <Text style={[styles.text, styles.secondaryText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.textButton, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.textButtonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
  },
  secondary: {
    height: 52,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  secondaryText: {
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  textButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  textButtonText: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
});