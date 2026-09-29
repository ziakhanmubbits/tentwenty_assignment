import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeatMappingScreen} from '../SeatMappingScreen';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatMapping'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

// Center-block seats (never hidden by the theater-shaped layout), one regular
// available, one regular occupied, and one VIP available, per the deterministic
// formula in seatLayout.ts.
const REGULAR_AVAILABLE_LABEL = 'Seat 1-6, Regular, available';
const REGULAR_OCCUPIED_LABEL = 'Seat 1-10, Regular, occupied';
const VIP_AVAILABLE_LABEL = 'Seat 10-6, VIP, available';

function renderScreen() {
  const goBack = jest.fn();
  const navigation = {goBack} as unknown as Props['navigation'];
  const route = {
    params: {
      movieId: 42,
      movieTitle: "The King's Man",
      scheduleLabel: 'March 5, 2026 | 12:30 Hall 1',
    },
  } as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <SeatMappingScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, goBack};
}

describe('SeatMappingScreen', () => {
  it('renders the movie title, schedule date/time and an initial "no seats selected" summary', () => {
    const {renderer} = renderScreen();
    expect(
      renderer.root.findAllByProps({children: "The King's Man"}).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({children: 'March 5, 2026'}).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({children: '12:30 Hall 1'}).length,
    ).toBeGreaterThan(0);
    expect(renderer.root.findAllByProps({children: '$ 0'}).length).toBeGreaterThan(0);
  });

  it('renders a regular available seat with the correct accessibility label', () => {
    const {renderer} = renderScreen();
    expect(
      renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL}),
    ).toBeTruthy();
  });

  it('renders an occupied seat as disabled', () => {
    const {renderer} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_OCCUPIED_LABEL});
    expect(seat.props.accessibilityState.disabled).toBe(true);
  });

  it('renders the last row as VIP seats', () => {
    const {renderer} = renderScreen();
    expect(renderer.root.findByProps({accessibilityLabel: VIP_AVAILABLE_LABEL})).toBeTruthy();
  });

  it('does not render an interactive element for a hidden (theater-shaped) seat', () => {
    const {renderer} = renderScreen();
    expect(
      renderer.root.findAllByProps({accessibilityLabel: 'Seat 1-1, Regular, available'}).length,
    ).toBe(0);
  });

  it('selects an available seat when pressed', () => {
    const {renderer} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});

    act(() => {
      seat.props.onPress();
    });

    expect(
      renderer.root.findByProps({accessibilityLabel: 'Seat 1-6, Regular, selected'}),
    ).toBeTruthy();
  });

  it('deselects a selected seat when pressed again', () => {
    const {renderer} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});

    act(() => {
      seat.props.onPress();
    });
    const selected = renderer.root.findByProps({
      accessibilityLabel: 'Seat 1-6, Regular, selected',
    });
    act(() => {
      selected.props.onPress();
    });

    expect(renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL})).toBeTruthy();
  });

  it('does not select an occupied seat when pressed', () => {
    const {renderer} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_OCCUPIED_LABEL});

    act(() => {
      seat.props.onPress();
    });

    expect(
      renderer.root.findAllByProps({accessibilityLabel: 'Seat 1-10, Regular, selected'}).length,
    ).toBe(0);
    expect(renderer.root.findAllByProps({children: '$ 0'}).length).toBeGreaterThan(0);
  });

  it('sums the total price across regular and VIP seats', () => {
    const {renderer} = renderScreen();
    const regularSeat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});
    const vipSeat = renderer.root.findByProps({accessibilityLabel: VIP_AVAILABLE_LABEL});

    act(() => {
      regularSeat.props.onPress();
      vipSeat.props.onPress();
    });

    expect(renderer.root.findAllByProps({children: '$ 200'}).length).toBeGreaterThan(0);
  });

  it('deselects a seat when its chip is removed', () => {
    const {renderer} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});
    act(() => {
      seat.props.onPress();
    });

    const removeChip = renderer.root.findByProps({accessibilityLabel: 'Remove seat 1-6'});
    act(() => {
      removeChip.props.onPress();
    });

    expect(renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL})).toBeTruthy();
  });

  it('disables Proceed to pay when no seats are selected and enables it once a seat is picked', () => {
    const {renderer} = renderScreen();
    const before = renderer.root.findByProps({accessibilityLabel: 'Proceed to pay'});
    expect(before.props.accessibilityState.disabled).toBe(true);

    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});
    act(() => {
      seat.props.onPress();
    });

    const after = renderer.root.findByProps({accessibilityLabel: 'Proceed to pay'});
    expect(after.props.accessibilityState.disabled).toBe(false);
  });

  it('returns to the previous screen when Proceed to pay is pressed with seats selected', () => {
    const {renderer, goBack} = renderScreen();
    const seat = renderer.root.findByProps({accessibilityLabel: REGULAR_AVAILABLE_LABEL});
    act(() => {
      seat.props.onPress();
    });

    const proceedButton = renderer.root.findByProps({accessibilityLabel: 'Proceed to pay'});
    act(() => {
      proceedButton.props.onPress();
    });

    expect(goBack).toHaveBeenCalled();
  });

  it('navigates back when the back button is pressed', () => {
    const {renderer, goBack} = renderScreen();
    const backButton = renderer.root.findByProps({accessibilityLabel: 'Go back'});
    act(() => {
      backButton.props.onPress();
    });
    expect(goBack).toHaveBeenCalled();
  });

  it('adjusts zoom when the zoom controls are pressed', () => {
    const {renderer} = renderScreen();
    const zoomInButton = renderer.root.findByProps({accessibilityLabel: 'Zoom in'});
    expect(() => {
      act(() => {
        zoomInButton.props.onPress();
      });
    }).not.toThrow();

    const zoomOutButton = renderer.root.findByProps({accessibilityLabel: 'Zoom out'});
    expect(() => {
      act(() => {
        zoomOutButton.props.onPress();
        zoomOutButton.props.onPress();
      });
    }).not.toThrow();
  });
});
