import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Seat} from '../../components/Seat';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import {createInitialSeatLayout} from './seatLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatMapping'>;

function LegendItem({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, {backgroundColor: color}]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export function SeatMappingScreen({navigation, route}: Props) {
  const {movieTitle} = route.params;
  const [seatLayout, setSeatLayout] = useState(createInitialSeatLayout);

  const toggleSeat = useCallback((seatId: string) => {
    setSeatLayout(prevLayout =>
      prevLayout.map(row =>
        row.map(seat => {
          if (seat.id !== seatId || seat.status === 'occupied') {
            return seat;
          }
          return {
            ...seat,
            status: seat.status === 'selected' ? 'available' : 'selected',
          } as const;
        }),
      ),
    );
  }, []);

  const selectedSeats = useMemo(
    () => seatLayout.flat().filter(seat => seat.status === 'selected'),
    [seatLayout],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movieTitle}
        </Text>
      </View>

      <View style={styles.screenIndicator}>
        <Text style={styles.screenIndicatorText}>SCREEN</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gridScrollContent}>
        <View>
          {seatLayout.map(row => (
            <View key={row[0]?.row} style={styles.row}>
              <Text style={styles.rowLabel}>{row[0]?.row}</Text>
              {row.map(seat => (
                <Seat key={seat.id} seat={seat} onPress={toggleSeat} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <LegendItem color={colors.background} label="Available" />
        <LegendItem color={colors.primary} label="Selected" />
        <LegendItem color={colors.border} label="Occupied" />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText} numberOfLines={1}>
          {selectedSeats.length === 0
            ? 'No seats selected'
            : `${selectedSeats.length} ${
                selectedSeats.length === 1 ? 'Seat' : 'Seats'
              }: ${selectedSeats.map(seat => seat.id).join(', ')}`}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={selectedSeats.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{disabled: selectedSeats.length === 0}}
          style={[
            styles.continueButton,
            selectedSeats.length === 0 && styles.continueButtonDisabled,
          ]}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  screenIndicator: {
    alignSelf: 'center',
    width: '70%',
    height: 6,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
  screenIndicatorText: {
    position: 'absolute',
    top: spacing.sm,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  gridScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    width: 20,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  summary: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
