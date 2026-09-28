import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  actionLabel?: string;
}

export function ErrorState({message, onRetry, actionLabel = 'Try again'}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={styles.button}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
