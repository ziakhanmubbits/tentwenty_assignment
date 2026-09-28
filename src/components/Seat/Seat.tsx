import React, {useCallback} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../../theme';
import type {Seat as SeatType} from '../../types/seat';

interface SeatProps {
  seat: SeatType;
  onPress: (seatId: string) => void;
}

const TIER_LABEL: Record<SeatType['tier'], string> = {
  regular: 'Regular',
  vip: 'VIP',
};

function SeatComponent({seat, onPress}: SeatProps) {
  const isOccupied = seat.status === 'occupied';

  const handlePress = useCallback(() => {
    if (!isOccupied) {
      onPress(seat.id);
    }
  }, [isOccupied, onPress, seat.id]);

  const fillStyle =
    seat.status === 'occupied'
      ? styles.occupied
      : seat.status === 'selected'
        ? styles.selected
        : seat.tier === 'vip'
          ? styles.vip
          : styles.regular;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOccupied}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`Seat ${seat.row}-${seat.number}, ${TIER_LABEL[seat.tier]}, ${seat.status}`}
      accessibilityState={{disabled: isOccupied, selected: seat.status === 'selected'}}
      style={[styles.seat, fillStyle]}>
      <Text style={[styles.label, seat.status !== 'occupied' && styles.labelOnColor]}>
        {seat.number}
      </Text>
    </Pressable>
  );
}

export const Seat = React.memo(SeatComponent);

const styles = StyleSheet.create({
  seat: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  regular: {
    backgroundColor: colors.primary,
  },
  vip: {
    backgroundColor: colors.accentPurple,
  },
  selected: {
    backgroundColor: colors.accentGold,
  },
  occupied: {
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  labelOnColor: {
    color: colors.white,
  },
});
