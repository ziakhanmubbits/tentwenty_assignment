import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Seat} from '../../components/Seat';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import {
  CENTER_BLOCK_SIZE,
  LEFT_BLOCK_SIZE,
  SEAT_PRICES,
  createInitialSeatLayout,
} from './seatLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatMapping'>;

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.1;

function LegendItem({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, {backgroundColor: color}]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export function SeatMappingScreen({navigation, route}: Props) {
  const {movieTitle, scheduleLabel} = route.params;
  const [seatLayout, setSeatLayout] = useState(createInitialSeatLayout);
  const [zoom, setZoom] = useState(1);
  const [scrollMetrics, setScrollMetrics] = useState({viewportRatio: 1, offsetRatio: 0});

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

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + SEAT_PRICES[seat.tier], 0),
    [selectedSeats],
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    if (contentSize.width <= layoutMeasurement.width) {
      setScrollMetrics({viewportRatio: 1, offsetRatio: 0});
      return;
    }
    const viewportRatio = layoutMeasurement.width / contentSize.width;
    const maxOffset = contentSize.width - layoutMeasurement.width;
    setScrollMetrics({
      viewportRatio,
      offsetRatio: maxOffset > 0 ? contentOffset.x / maxOffset : 0,
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(2)));
  }, []);

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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movieTitle}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {scheduleLabel}
          </Text>
        </View>
        <View style={styles.backButtonSpacer} />
      </View>

      <View style={styles.mapArea}>
        <View style={styles.screenIndicatorContainer}>
          <View style={styles.screenArc} />
          <Text style={styles.screenIndicatorText}>SCREEN</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.gridScrollContent}>
          <View style={{transform: [{scale: zoom}]}}>
            {seatLayout.map(row => (
              <View key={row[0]?.row} style={styles.row}>
                <Text style={styles.rowLabel}>{row[0]?.row}</Text>
                {row.map((seat, index) => (
                  <View
                    key={seat.id}
                    style={[
                      index === LEFT_BLOCK_SIZE - 1 && styles.blockGap,
                      index === LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE - 1 && styles.blockGap,
                    ]}>
                    <Seat seat={seat} onPress={toggleSeat} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.zoomControls}>
          <Pressable
            onPress={zoomIn}
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            style={styles.zoomButton}>
            <Ionicons name="add" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={zoomOut}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            style={styles.zoomButton}>
            <Ionicons name="remove" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.scrollTrack}>
          <View
            style={[
              styles.scrollThumb,
              {
                width: `${scrollMetrics.viewportRatio * 100}%`,
                left: `${
                  scrollMetrics.offsetRatio * (1 - scrollMetrics.viewportRatio) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <LegendItem color={colors.accentGold} label="Selected" />
            <LegendItem color={colors.border} label="Not available" />
          </View>
          <View style={styles.legendRow}>
            <LegendItem color={colors.accentPurple} label={`VIP ($${SEAT_PRICES.vip})`} />
            <LegendItem color={colors.primary} label={`Regular ($${SEAT_PRICES.regular})`} />
          </View>
        </View>

        {selectedSeats.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
            contentContainerStyle={styles.chipsRowContent}>
            {selectedSeats.map(seat => (
              <View key={seat.id} style={styles.chip}>
                <Text style={styles.chipText}>{`${seat.number} / ${seat.row} row`}</Text>
                <Pressable
                  onPress={() => toggleSeat(seat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove seat ${seat.row}-${seat.number}`}
                  hitSlop={8}>
                  <Ionicons name="close" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalPriceLabel}>Total Price</Text>
            <Text style={styles.totalPriceValue}>{`$ ${totalPrice}`}</Text>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={selectedSeats.length === 0}
            accessibilityRole="button"
            accessibilityLabel="Proceed to pay"
            accessibilityState={{disabled: selectedSeats.length === 0}}
            style={[
              styles.proceedButton,
              selectedSeats.length === 0 && styles.proceedButtonDisabled,
            ]}>
            <Text style={styles.proceedButtonText}>Proceed to pay</Text>
          </Pressable>
        </View>
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
  },
  backButton: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSpacer: {
    width: 44,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  mapArea: {
    flex: 1,
  },
  screenIndicatorContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  screenArc: {
    width: '70%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  screenIndicatorText: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  gridScrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    width: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  blockGap: {
    marginRight: spacing.sm,
  },
  zoomControls: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    gap: spacing.xs,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  scrollThumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.md,
    gap: spacing.sm,
  },
  legend: {
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chipsRowContent: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  totalPriceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  totalPriceValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: colors.border,
  },
  proceedButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
