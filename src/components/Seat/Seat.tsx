import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../../theme';
import type {Seat as SeatType} from '../../types/seat';

interface SeatProps {
  seat: SeatType;
  onPress: (seatId: string) => void;
}

function SeatComponent({seat, onPress}: SeatProps) {
  const isOccupied = seat.status === 'occupied';

  const handlePress = useCallback(() => {
    if (!isOccupied) {
      onPress(seat.id);
    }
  }, [isOccupied, onPress, seat.id]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOccupied}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`Seat ${seat.id}, ${seat.status}`}
      accessibilityState={{disabled: isOccupied, selected: seat.status === 'selected'}}
      style={[styles.seat, styles[seat.status]]}>
      <Text style={[styles.label, seat.status !== 'available' && styles.labelOnColor]}>
        {seat.number}
      </Text>
    </Pressable>
  );
}

export const Seat = React.memo(SeatComponent);

const styles = StyleSheet.create({
  seat: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  available: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  occupied: {
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  labelOnColor: {
    color: colors.white,
  },
});
