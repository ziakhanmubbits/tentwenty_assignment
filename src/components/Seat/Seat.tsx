import React, {useCallback} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors} from '../../theme';
import type {Seat as SeatType} from '../../types/seat';
import {SeatShape} from './SeatShape';

interface SeatProps {
  seat: SeatType;
  onPress: (seatId: string) => void;
  zoom?: number;
}

const BASE_UNIT = 13; 
const BASE_SEAT_WIDTH = 7;
const BASE_ROW_HEIGHT = 15.5;

const TIER_LABEL: Record<SeatType['tier'], string> = {
  regular: 'Regular',
  vip: 'VIP',
};

function getSeatColor(seat: SeatType) {
  if (seat.status === 'occupied') {
    return colors.border;
  }
  if (seat.status === 'selected') {
    return colors.accentGold;
  }
  return seat.tier === 'vip' ? colors.accentPurple : colors.primary;
}

function SeatComponent({seat, onPress, zoom = 1}: SeatProps) {
  const isOccupied = seat.status === 'occupied';

  const handlePress = useCallback(() => {
    if (!isOccupied) {
      onPress(seat.id);
    }
  }, [isOccupied, onPress, seat.id]);

  const cellStyle = {width: BASE_UNIT * zoom, height: BASE_ROW_HEIGHT * zoom};

  if (seat.hidden) {
    return <View style={cellStyle} />;
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOccupied}
      hitSlop={3}
      accessibilityRole="button"
      accessibilityLabel={`Seat ${seat.row}-${seat.number}, ${TIER_LABEL[seat.tier]}, ${seat.status}`}
      accessibilityState={{disabled: isOccupied, selected: seat.status === 'selected'}}
      style={[cellStyle, styles.cell]}>
      <SeatShape color={getSeatColor(seat)} width={BASE_SEAT_WIDTH * zoom} />
    </Pressable>
  );
}

export const Seat = React.memo(SeatComponent);

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});