import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {RefreshControl, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import {MovieListScreen} from '../MovieListScreen';
import {fetchUpcomingMovies} from '../../../services/tmdb/endpoints/upcomingMovies';
import {
  loadUpcomingMoviesCache,
  saveUpcomingMoviesCache,
} from '../../../services/storage';
import type {Movie} from '../../../types/movie';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

jest.mock('../../../services/tmdb/endpoints/upcomingMovies');
jest.mock('../../../services/storage');

const mockFetchUpcomingMovies = fetchUpcomingMovies as jest.MockedFunction<
  typeof fetchUpcomingMovies
>;
const mockLoadCache = loadUpcomingMoviesCache as jest.MockedFunction<
  typeof loadUpcomingMoviesCache
>;
const mockSaveCache = saveUpcomingMoviesCache as jest.MockedFunction<
  typeof saveUpcomingMoviesCache
>;
const mockNetInfoFetch = NetInfo.fetch as jest.MockedFunction<
  typeof NetInfo.fetch
>;

type Props = NativeStackScreenProps<RootStackParamList, 'MovieList'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Free Guy',
    releaseDate: '2021-08-13',
    overview: '',
    voteAverage: 7.5,
    posterUrl: null,
    backdropUrl: 'https://image.tmdb.org/t/p/w780/freeguy.jpg',
  },
  {
    id: 2,
    title: "The King's Man",
    releaseDate: '2021-12-22',
    overview: '',
    voteAverage: 7.0,
    posterUrl: null,
    backdropUrl: 'https://image.tmdb.org/t/p/w780/kingsman.jpg',
  },
];

const cachedMovie: Movie = {
  id: 3,
  title: 'Jojo Rabbit',
  releaseDate: '2019-10-18',
  overview: '',
  voteAverage: 8.0,
  posterUrl: null,
  backdropUrl: 'https://image.tmdb.org/t/p/w780/jojorabbit.jpg',
};

function renderScreen() {
  const navigate = jest.fn();
  const navigation = {navigate} as unknown as Props['navigation'];
  const route = {} as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <MovieListScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, navigate};
}

function flushMicrotasks() {
  return act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('MovieListScreen', () => {
  beforeEach(() => {
    mockLoadCache.mockResolvedValue(null);
    mockSaveCache.mockResolvedValue(undefined);
    mockNetInfoFetch.mockResolvedValue({isConnected: true} as never);
  });

  afterEach(() => {
    mockFetchUpcomingMovies.mockReset();
    mockLoadCache.mockReset();
    mockSaveCache.mockReset();
    mockNetInfoFetch.mockReset();
  });

  it('shows a loading state before the request resolves', async () => {
    mockFetchUpcomingMovies.mockReturnValue(new Promise(() => {}));
    const {renderer} = renderScreen();
    await flushMicrotasks();
    expect(renderer.root.findByProps({accessibilityRole: 'progressbar'})).toBeTruthy();
  });

  it('renders movie titles once the request resolves', async () => {
    mockFetchUpcomingMovies.mockResolvedValue(mockMovies);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Free Guy');
    expect(texts).toContain("The King's Man");
  });

  it('caches successfully fetched movies', async () => {
    mockFetchUpcomingMovies.mockResolvedValue(mockMovies);
    renderScreen();
    await flushMicrotasks();

    expect(mockSaveCache).toHaveBeenCalledWith(mockMovies);
  });

  it('shows an empty state when there are no upcoming movies', async () => {
    mockFetchUpcomingMovies.mockResolvedValue([]);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('No upcoming movies right now.');
  });

  it('shows an error state with a retry action when the request fails and there is no cache', async () => {
    mockFetchUpcomingMovies.mockRejectedValue(new Error('network down'));
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("Couldn't load movies.");
    expect(
      renderer.root.findByProps({accessibilityLabel: 'Try again'}),
    ).toBeTruthy();
  });

  it('shows an error state when offline and there is no cache', async () => {
    mockNetInfoFetch.mockResolvedValue({isConnected: false} as never);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    expect(mockFetchUpcomingMovies).not.toHaveBeenCalled();
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("You're offline and no saved movies are available.");
  });

  it('shows cached movies with an offline banner when the request fails but cache exists', async () => {
    mockLoadCache.mockResolvedValue({
      version: 1,
      cachedAt: new Date().toISOString(),
      movies: [cachedMovie],
    });
    mockFetchUpcomingMovies.mockRejectedValue(new Error('network down'));
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Jojo Rabbit');
    expect(texts).toContain("You're offline. Showing saved movies.");
  });

  it('shows cached movies without attempting a request when NetInfo reports no connection', async () => {
    mockLoadCache.mockResolvedValue({
      version: 1,
      cachedAt: new Date().toISOString(),
      movies: [cachedMovie],
    });
    mockNetInfoFetch.mockResolvedValue({isConnected: false} as never);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    expect(mockFetchUpcomingMovies).not.toHaveBeenCalled();
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Jojo Rabbit');
  });

  it('replaces cached movies with fresh network data when the request succeeds', async () => {
    mockLoadCache.mockResolvedValue({
      version: 1,
      cachedAt: new Date().toISOString(),
      movies: [cachedMovie],
    });
    mockFetchUpcomingMovies.mockResolvedValue(mockMovies);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Free Guy');
    expect(texts).not.toContain('Jojo Rabbit');
  });

  it('retries the request when the retry action is pressed', async () => {
    mockFetchUpcomingMovies.mockRejectedValueOnce(new Error('network down'));
    mockFetchUpcomingMovies.mockResolvedValueOnce(mockMovies);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const retryButton = renderer.root.findByProps({accessibilityLabel: 'Try again'});
    await act(async () => {
      retryButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchUpcomingMovies).toHaveBeenCalledTimes(2);
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Free Guy');
  });

  it('navigates to Movie Detail with the selected movie id when a card is pressed', async () => {
    mockFetchUpcomingMovies.mockResolvedValue(mockMovies);
    const {renderer, navigate} = renderScreen();
    await flushMicrotasks();

    const [freeGuyCard] = renderer.root.findAllByProps({
      accessibilityLabel: 'View details for Free Guy',
    });
    expect(freeGuyCard).toBeTruthy();

    act(() => {
      freeGuyCard.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('MovieDetail', {movieId: 1});
  });

  it('refreshes the list via pull-to-refresh and shows the new data', async () => {
    mockFetchUpcomingMovies.mockResolvedValueOnce(mockMovies);
    mockFetchUpcomingMovies.mockResolvedValueOnce([cachedMovie]);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const refreshControl = renderer.root.findByType(RefreshControl);
    expect(refreshControl.props.refreshing).toBe(false);

    await act(async () => {
      refreshControl.props.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchUpcomingMovies).toHaveBeenCalledTimes(2);
    expect(mockSaveCache).toHaveBeenCalledWith([cachedMovie]);
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Jojo Rabbit');
  });

  it('keeps the current list visible when a pull-to-refresh request fails', async () => {
    mockFetchUpcomingMovies.mockResolvedValueOnce(mockMovies);
    mockFetchUpcomingMovies.mockRejectedValueOnce(new Error('network down'));
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const refreshControl = renderer.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Free Guy');
    expect(texts).toContain("The King's Man");
    expect(texts).not.toContain("Couldn't load movies.");
  });

  it('does not attempt a network request when pulling to refresh while offline', async () => {
    mockFetchUpcomingMovies.mockResolvedValueOnce(mockMovies);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    mockNetInfoFetch.mockResolvedValueOnce({isConnected: false} as never);
    const refreshControl = renderer.root.findByType(RefreshControl);
    await act(async () => {
      refreshControl.props.onRefresh();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchUpcomingMovies).toHaveBeenCalledTimes(1);
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Free Guy');
  });

  it('navigates to Movie Search when the header search icon is pressed', async () => {
    mockFetchUpcomingMovies.mockResolvedValue(mockMovies);
    const {renderer, navigate} = renderScreen();
    await flushMicrotasks();

    const searchButton = renderer.root.findByProps({accessibilityLabel: 'Search'});
    act(() => {
      searchButton.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('MovieSearch');
  });
});
