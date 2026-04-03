import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing, BorderRadius } from '../constants/Spacing';

interface FinlyTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function FinlyTextField({
  label,
  error,
  containerStyle,
  style,
  ...props
}: FinlyTextFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textTertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    ...Typography.bodyLarge,
  },
  inputError: {
    borderColor: Colors.expense,
    borderWidth: 2,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.expense,
    marginTop: Spacing.xs,
  },
});