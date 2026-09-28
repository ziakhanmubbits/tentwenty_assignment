import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, spacing} from '../../theme';

interface TrailerButtonProps {
  available: boolean;
  onPress?: () => void;
}

export function TrailerButton({available, onPress}: TrailerButtonProps) {
  return (
    <Pressable
      onPress={available ? onPress : undefined}
      disabled={!available}
      accessibilityRole="button"
      accessibilityLabel={available ? 'Watch Trailer' : 'Trailer unavailable'}
      accessibilityState={{disabled: !available}}
      style={[styles.button, !available && styles.buttonDisabled]}>
      <Ionicons
        name="play-outline"
        size={18}
        color={available ? colors.primary : colors.textSecondary}
      />
      <Text style={[styles.text, !available && styles.textDisabled]}>
        {available ? 'Watch Trailer' : 'Trailer unavailable'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  buttonDisabled: {
    borderColor: colors.border,
  },
  text: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  textDisabled: {
    color: colors.textSecondary,
  },
});
