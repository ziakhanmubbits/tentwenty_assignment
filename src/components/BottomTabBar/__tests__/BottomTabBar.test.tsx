import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomTabBar} from '../BottomTabBar';

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function renderBar(activeTab: 'watch' | 'dashboard', onTabPress: () => void) {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <BottomTabBar activeTab={activeTab} onTabPress={onTabPress} />
      </SafeAreaProvider>,
    );
  });
  return renderer!;
}

describe('BottomTabBar', () => {
  it('marks only the active tab as selected', () => {
    const renderer = renderBar('dashboard', jest.fn());

    const dashboardTab = renderer.root.findByProps({accessibilityLabel: 'Dashboard'});
    const watchTab = renderer.root.findByProps({accessibilityLabel: 'Watch'});

    expect(dashboardTab.props.accessibilityState.selected).toBe(true);
    expect(watchTab.props.accessibilityState.selected).toBe(false);
  });

  it('calls onTabPress with the pressed tab key', () => {
    const onTabPress = jest.fn();
    const renderer = renderBar('watch', onTabPress);

    const libraryTab = renderer.root.findByProps({accessibilityLabel: 'Media Library'});
    act(() => {
      libraryTab.props.onPress();
    });

    expect(onTabPress).toHaveBeenCalledWith('library');
  });
});
