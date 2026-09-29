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
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Seat} from '../../components/Seat/Seat';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors} from '../../theme';
import {
  CENTER_BLOCK_SIZE,
  LEFT_BLOCK_SIZE,
  SEAT_PRICES,
  createInitialSeatLayout,
} from './seatLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatMapping'>;

const MIN_ZOOM = 1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;
const SCREEN_ARC_HEIGHT = 40;
const LIGHT_GREY = '#F5F5F5';

function SeatShape({color, width}: {color: string; width: number}) {
  return (
    <View
      style={{
        width,
        height: width,
        borderRadius: width * 0.3,
        backgroundColor: color,
      }}
    />
  );
}

function LegendItem({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <SeatShape color={color} width={18} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

export function SeatMappingScreen({navigation, route}: Props) {
  const {movieTitle, scheduleLabel} = route.params;
  const {width: windowWidth} = useWindowDimensions();
  const [seatLayout, setSeatLayout] = useState(createInitialSeatLayout);
  const [zoom, setZoom] = useState(1);
  const [scrollMetrics, setScrollMetrics] = useState({viewportRatio: 1, offsetRatio: 0});

  const [datePart, timePart] = useMemo(() => {
    const parts = scheduleLabel.split(' | ');
    return [parts[0], parts[1]] as const;
  }, [scheduleLabel]);

  const toggleSeat = useCallback((seatId: string) => {
    setSeatLayout(prevLayout =>
      prevLayout.map(row =>
        row.map(seat => {
          if (seat.id !== seatId || seat.hidden || seat.status === 'occupied') {
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
    () => seatLayout.flat().filter(seat => !seat.hidden && seat.status === 'selected'),
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

  // curved screen: a big circle clipped to a shallow arc
  const arcWidth = windowWidth - 46;
  const arcRadius =
    ((arcWidth * arcWidth) / 4 + SCREEN_ARC_HEIGHT * SCREEN_ARC_HEIGHT) / (2 * SCREEN_ARC_HEIGHT);

  return (
    <View style={styles.container}>
      {/* White header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {movieTitle}
            </Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.headerSubtitle}>{datePart}</Text>
              {timePart ? (
                <>
                  <View style={styles.subtitleDivider} />
                  <Text style={styles.headerSubtitle}>{timePart}</Text>
                </>
              ) : null}
            </View>
          </View>
          <View style={styles.backButtonSpacer} />
        </View>
      </SafeAreaView>

      <View style={styles.mapArea}>
        {/* Curved screen */}
        <View style={styles.screenContainer}>
          <View style={[styles.arcClip, {width: arcWidth, height: SCREEN_ARC_HEIGHT}]}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: -(arcRadius - arcWidth / 2),
                width: arcRadius * 2,
                height: arcRadius * 2,
                borderRadius: arcRadius,
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: 'rgba(98,196,245,0.10)',
              }}
            />
          </View>
          <Text style={styles.screenText}>SCREEN</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.gridScroll}
          contentContainerStyle={styles.gridScrollContent}>
          <View>
            {seatLayout.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                <Text style={styles.rowLabel}>{rowIndex + 1}</Text>
                {row.map((seat, index) => (
                  <View
                    key={seat.id}
                    style={[
                      index === LEFT_BLOCK_SIZE - 1 && {marginRight: 12 * zoom},
                      index === LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE - 1 && {
                        marginRight: 12 * zoom,
                      },
                    ]}>
                    <Seat seat={seat} zoom={zoom} onPress={toggleSeat} />
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
            <Ionicons name="add" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={zoomOut}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            style={styles.zoomButton}>
            <Ionicons name="remove" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.scrollTrack}>
          <View
            style={[
              styles.scrollThumb,
              {
                width: `${scrollMetrics.viewportRatio * 100}%`,
                left: `${scrollMetrics.offsetRatio * (1 - scrollMetrics.viewportRatio) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <LegendItem color={colors.accentGold} label="Selected" />
            <LegendItem color={colors.border} label="Not available" />
          </View>
          <View style={styles.legendRow}>
            <LegendItem color={colors.accentPurple} label={`VIP (${SEAT_PRICES.vip}$)`} />
            <LegendItem color={colors.primary} label={`Regular (${SEAT_PRICES.regular} $)`} />
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
                <Text style={styles.chipNumber}>
                  {seat.number}
                  <Text style={styles.chipSlash}>{' / '}</Text>
                  <Text style={styles.chipRow}>{`${seat.row} row`}</Text>
                </Text>
                <Pressable
                  onPress={() => toggleSeat(seat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove seat ${seat.row}-${seat.number}`}
                  hitSlop={8}>
                  <Ionicons name="close" size={18} color={colors.textPrimary} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.bottomBar}>
          <View style={styles.totalBox}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.white,
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
    gap: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '400',
  },
  subtitleDivider: {
    width: 1,
    height: 11,
    backgroundColor: colors.border,
  },
  mapArea: {
    flex: 1,
    paddingTop: 60,
  },
  screenContainer: {
    alignItems: 'center',
    marginHorizontal: 23,
  },
  arcClip: {
    overflow: 'hidden',
  },
  screenText: {
    position: 'absolute',
    top: 24,
    fontSize: 10,
    color: colors.textSecondary,
  },
  gridScroll: {
    flexGrow: 0,
    marginTop: 24,
  },
  gridScrollContent: {
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    width: 14,
    marginRight: 2,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 8,
    fontWeight: '700',
  },
  zoomControls: {
    position: 'absolute',
    right: 22,
    bottom: 40,
    flexDirection: 'row',
    gap: 8,
  },
  zoomButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginHorizontal: 21,
    marginBottom: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  scrollThumb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 21,
    paddingTop: 26,
  },
  legend: {
    gap: 22,
  },
  legendRow: {
    flexDirection: 'row',
  },
  legendItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipsRow: {
    flexGrow: 0,
    marginTop: 26,
  },
  chipsRowContent: {
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 44,
    backgroundColor: LIGHT_GREY,
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  chipNumber: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  chipSlash: {
    fontSize: 18,
    fontWeight: '300',
  },
  chipRow: {
    fontSize: 13,
    fontWeight: '400',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 26,
    marginBottom: 12,
  },
  totalBox: {
    height: 50,
    minWidth: 108,
    borderRadius: 10,
    backgroundColor: LIGHT_GREY,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  totalPriceLabel: {
    color: colors.textPrimary,
    fontSize: 11,
  },
  totalPriceValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  proceedButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  proceedButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});