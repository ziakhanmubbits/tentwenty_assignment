import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme';
import type {Showtime} from '../../types/showtime';

interface ShowtimeCardProps {
  showtime: Showtime;
  isSelected: boolean;
  onPress: (showtimeId: string) => void;
}


const SEAT_ROWS = 11;
const MID_COLS = 14;
const SIDE_COLS = 4;
const SEAT_SIZE = 4;
const SEAT_GAP = 2;
const BLOCK_GAP = 10;


const SIDE_COUNTS = [2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 2];

const SPECIAL_SEATS: Record<string, string> = {
  'm-2-0': colors.accentTeal,
  'm-2-13': colors.accentTeal,
  'm-3-0': colors.accentPink,
  'm-3-13': colors.accentPink,
  'm-5-6': colors.accentPurple,
  'm-5-7': colors.accentPurple,
  'm-6-0': colors.accentTeal,
  'm-6-13': colors.accentTeal,
  'l-10-3': colors.accentTeal,
  'r-10-0': colors.accentTeal,
};

function seatColor(block: 'l' | 'm' | 'r', row: number, col: number) {
  const special = SPECIAL_SEATS[`${block}-${row}-${col}`];
  if (special) {
    return special;
  }
  // deterministic "taken" seats
  const taken = ((row + 1) * (col + 3) * 7 + (block === 'm' ? 1 : 3)) % 5 < 2;
  return taken ? colors.border : colors.primary;
}

function Seat({color}: {color: string}) {
  return <View style={[styles.seat, {backgroundColor: color}]} />;
}

function SeatMapPreview() {
  return (
    <View style={styles.seatMap}>
      {/* curved screen */}
      <View style={styles.arcClip}>
        <View style={styles.arc} />
      </View>

      {Array.from({length: SEAT_ROWS}).map((_, row) => {
        const sideCount = SIDE_COUNTS[row];
        return (
          <View key={row} style={styles.seatRow}>
            <View style={[styles.sideBlock, styles.sideBlockLeft]}>
              {Array.from({length: sideCount}).map((__, i) => {
                const col = SIDE_COLS - sideCount + i;
                return <Seat key={col} color={seatColor('l', row, col)} />;
              })}
            </View>
            <View style={styles.midBlock}>
              {Array.from({length: MID_COLS}).map((__, col) => (
                <Seat key={col} color={seatColor('m', row, col)} />
              ))}
            </View>
            <View style={[styles.sideBlock, styles.sideBlockRight]}>
              {Array.from({length: sideCount}).map((__, col) => (
                <Seat key={col} color={seatColor('r', row, col)} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}


function PriceLabel({label}: {label: string}) {
  const match = /^From\s+(.+?)\s+or\s+(.+)$/i.exec(label);
  if (!match) {
    return <Text style={styles.price}>{label}</Text>;
  }
  // "$50" -> "50$" like Figma
  const price = match[1].replace(/^\$(\d+(?:\.\d+)?)$/, '$1$');
  return (
    <Text style={styles.price}>
      {'From '}
      <Text style={styles.priceBold}>{price}</Text>
      {' or '}
      <Text style={styles.priceBold}>{match[2]}</Text>
    </Text>
  );
}


function ShowtimeCardComponent({showtime, isSelected, onPress}: ShowtimeCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{showtime.time}</Text>
        <Text style={styles.venue}>{showtime.venue}</Text>
      </View>
      <Pressable
        onPress={() => onPress(showtime.id)}
        accessibilityRole="button"
        accessibilityLabel={`Showtime ${showtime.time} at ${showtime.venue}`}
        accessibilityState={{selected: isSelected}}
        style={[styles.card, isSelected && styles.cardSelected]}>
        <SeatMapPreview />
      </Pressable>
      <PriceLabel label={showtime.priceLabel} />
    </View>
  );
}

export const ShowtimeCard = React.memo(ShowtimeCardComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: 249,
    gap: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  time: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  venue: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  card: {
    height: 145,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  seatMap: {
    alignItems: 'center',
    gap: SEAT_GAP,
  },
  arcClip: {
    width: 150,
    height: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  arc: {
    position: 'absolute',
    top: 0,
    left: -225,
    width: 600,
    height: 600,
    borderRadius: 300,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.6,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BLOCK_GAP,
  },
  sideBlock: {
    width: SIDE_COLS * SEAT_SIZE + (SIDE_COLS - 1) * SEAT_GAP,
    flexDirection: 'row',
    gap: SEAT_GAP,
  },
  sideBlockLeft: {
    justifyContent: 'flex-end',
  },
  sideBlockRight: {
    justifyContent: 'flex-start',
  },
  midBlock: {
    flexDirection: 'row',
    gap: SEAT_GAP,
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 1.5,
  },
  price: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  priceBold: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});