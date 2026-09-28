import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MovieSearchScreen} from '../MovieSearchScreen';
import {searchMovies} from '../../../services/tmdb/endpoints/searchMovies';
import type {MovieSearchResult} from '../../../types/movie';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

jest.mock('../../../services/tmdb/endpoints/searchMovies');

const mockSearchMovies = searchMovies as jest.MockedFunction<typeof searchMovies>;

type Props = NativeStackScreenProps<RootStackParamList, 'MovieSearch'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function batmanResult(title: string, id: number): MovieSearchResult {
  return {
    id,
    title,
    releaseDate: '2005-06-15',
    overview: '',
    voteAverage: 8.0,
    posterUrl: null,
    backdropUrl: null,
    genreLabel: 'Action',
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

function renderScreen() {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const navigation = {navigate, goBack} as unknown as Props['navigation'];
  const route = {} as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <MovieSearchScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, navigate, goBack};
}

function typeQuery(renderer: ReactTestRenderer.ReactTestRenderer, text: string) {
  const input = renderer.root.findByProps({accessibilityLabel: 'Search'});
  act(() => {
    input.props.onChangeText(text);
  });
}

async function advanceDebounce() {
  await act(async () => {
    jest.advanceTimersByTime(400);
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('MovieSearchScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    mockSearchMovies.mockReset();
    jest.useRealTimers();
  });

  it('shows an idle prompt before any query is entered', () => {
    const {renderer} = renderScreen();
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Search for movies by title.');
  });

  it('does not call the API for an empty query', async () => {
    const {renderer} = renderScreen();
    typeQuery(renderer, '   ');
    await advanceDebounce();
    expect(mockSearchMovies).not.toHaveBeenCalled();
  });

  it('debounces rapid typing into a single request', async () => {
    mockSearchMovies.mockResolvedValue([]);
    const {renderer} = renderScreen();

    typeQuery(renderer, 'b');
    typeQuery(renderer, 'ba');
    typeQuery(renderer, 'bat');
    await advanceDebounce();

    expect(mockSearchMovies).toHaveBeenCalledTimes(1);
    expect(mockSearchMovies).toHaveBeenCalledWith('bat', expect.anything());
  });

  it('shows a loading state while the search request is in flight', async () => {
    mockSearchMovies.mockReturnValue(new Promise(() => {}));
    const {renderer} = renderScreen();

    typeQuery(renderer, 'batman');
    await advanceDebounce();

    expect(renderer.root.findByProps({accessibilityRole: 'progressbar'})).toBeTruthy();
  });

  it('renders search results with a count heading', async () => {
    mockSearchMovies.mockResolvedValue([
      batmanResult('Batman Begins', 1),
      batmanResult('The Dark Knight', 2),
    ]);
    const {renderer} = renderScreen();

    typeQuery(renderer, 'batman');
    await advanceDebounce();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Batman Begins');
    expect(texts).toContain('The Dark Knight');
    expect(texts).toContain('2 Results Found');
  });

  it('shows an empty state when there are no matching movies', async () => {
    mockSearchMovies.mockResolvedValue([]);
    const {renderer} = renderScreen();

    typeQuery(renderer, 'zzzznomatch');
    await advanceDebounce();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('No movies found for "zzzznomatch".');
  });

  it('shows an error state with retry when the search request fails', async () => {
    mockSearchMovies.mockRejectedValue(new Error('network down'));
    const {renderer} = renderScreen();

    typeQuery(renderer, 'batman');
    await advanceDebounce();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("Couldn't search movies.");
    expect(renderer.root.findByProps({accessibilityLabel: 'Try again'})).toBeTruthy();
  });

  it('retries the search when the retry action is pressed', async () => {
    mockSearchMovies.mockRejectedValueOnce(new Error('network down'));
    mockSearchMovies.mockResolvedValueOnce([batmanResult('Batman Begins', 1)]);
    const {renderer} = renderScreen();

    typeQuery(renderer, 'batman');
    await advanceDebounce();
    await flushMicrotasks();

    const retryButton = renderer.root.findByProps({accessibilityLabel: 'Try again'});
    act(() => {
      retryButton.props.onPress();
    });
    await advanceDebounce();
    await flushMicrotasks();

    expect(mockSearchMovies).toHaveBeenCalledTimes(2);
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Batman Begins');
  });

  it('navigates to Movie Detail when a result is pressed', async () => {
    mockSearchMovies.mockResolvedValue([batmanResult('Batman Begins', 1)]);
    const {renderer, navigate} = renderScreen();

    typeQuery(renderer, 'batman');
    await advanceDebounce();

    const [resultItem] = renderer.root.findAllByProps({
      accessibilityLabel: 'View details for Batman Begins',
    });
    act(() => {
      resultItem.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('MovieDetail', {movieId: 1});
  });

  it('navigates back when the back button is pressed', () => {
    const {renderer, goBack} = renderScreen();
    const backButton = renderer.root.findByProps({accessibilityLabel: 'Go back'});
    act(() => {
      backButton.props.onPress();
    });
    expect(goBack).toHaveBeenCalled();
  });

  it('only keeps the latest query results when an older request resolves after a newer one', async () => {
    const deferredBat = createDeferred<MovieSearchResult[]>();
    const deferredBatman = createDeferred<MovieSearchResult[]>();
    mockSearchMovies
      .mockImplementationOnce(() => deferredBat.promise)
      .mockImplementationOnce(() => deferredBatman.promise);

    const {renderer} = renderScreen();

    typeQuery(renderer, 'bat');
    await advanceDebounce();

    typeQuery(renderer, 'batman');
    await advanceDebounce();

    expect(mockSearchMovies).toHaveBeenCalledTimes(2);

    await act(async () => {
      deferredBatman.resolve([batmanResult('Batman Begins', 1)]);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      deferredBat.resolve([batmanResult('The Bat Family Christmas Special', 99)]);
      await Promise.resolve();
      await Promise.resolve();
    });

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Batman Begins');
    expect(texts).not.toContain('The Bat Family Christmas Special');
  });

  it('does not let an older request error overwrite a newer successful result', async () => {
    const deferredBat = createDeferred<MovieSearchResult[]>();
    const deferredBatman = createDeferred<MovieSearchResult[]>();
    mockSearchMovies
      .mockImplementationOnce(() => deferredBat.promise)
      .mockImplementationOnce(() => deferredBatman.promise);

    const {renderer} = renderScreen();

    typeQuery(renderer, 'bat');
    await advanceDebounce();

    typeQuery(renderer, 'batman');
    await advanceDebounce();

    await act(async () => {
      deferredBatman.resolve([batmanResult('Batman Begins', 1)]);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      deferredBat.reject(new Error('stale request failed'));
      await Promise.resolve();
      await Promise.resolve();
    });

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Batman Begins');
    expect(texts).not.toContain("Couldn't search movies.");
  });
});
