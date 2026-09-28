import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isCacheStale,
  loadUpcomingMoviesCache,
  saveUpcomingMoviesCache,
} from '../upcomingMoviesCache';
import type {Movie} from '../../../types/movie';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      __reset: () => {
        store = {};
      },
    },
  };
});

const mockAsyncStorage = AsyncStorage as unknown as {
  getItem: jest.MockedFunction<(key: string) => Promise<string | null>>;
  setItem: jest.MockedFunction<(key: string, value: string) => Promise<void>>;
  __reset: () => void;
};

const movies: Movie[] = [
  {
    id: 1,
    title: 'Free Guy',
    releaseDate: '2021-08-13',
    overview: '',
    voteAverage: 7.5,
    posterUrl: null,
    backdropUrl: 'https://image.tmdb.org/t/p/w780/freeguy.jpg',
  },
];

describe('upcomingMoviesCache', () => {
  afterEach(() => {
    mockAsyncStorage.__reset();
    jest.clearAllMocks();
  });

  it('returns null when nothing has been cached', async () => {
    await expect(loadUpcomingMoviesCache()).resolves.toBeNull();
  });

  it('persists and reloads movies with a cachedAt timestamp', async () => {
    await saveUpcomingMoviesCache(movies);
    const cached = await loadUpcomingMoviesCache();

    expect(cached).not.toBeNull();
    expect(cached?.movies).toEqual(movies);
    expect(typeof cached?.cachedAt).toBe('string');
    expect(Number.isNaN(new Date(cached!.cachedAt).getTime())).toBe(false);
  });

  it('ignores corrupted (non-JSON) cache data without throwing', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce('not valid json{{{');
    await expect(loadUpcomingMoviesCache()).resolves.toBeNull();
  });

  it('ignores cache data with an unexpected shape', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({version: 1, movies: 'not-an-array'}),
    );
    await expect(loadUpcomingMoviesCache()).resolves.toBeNull();
  });

  it('ignores cache data from a different cache version', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({version: 999, cachedAt: new Date().toISOString(), movies}),
    );
    await expect(loadUpcomingMoviesCache()).resolves.toBeNull();
  });

  it('treats a recent cache as not stale', () => {
    expect(isCacheStale(new Date().toISOString())).toBe(false);
  });

  it('treats a cache older than the TTL as stale', () => {
    const oldTimestamp = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(isCacheStale(oldTimestamp)).toBe(true);
  });
});
