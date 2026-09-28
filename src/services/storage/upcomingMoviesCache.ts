import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Movie} from '../../types/movie';

const CACHE_KEY = '@tentwenty/upcoming_movies_cache';
const CACHE_VERSION = 1;
export const CACHE_TTL_MS = 30 * 60 * 1000;

export interface CachedUpcomingMovies {
  version: number;
  cachedAt: string;
  movies: Movie[];
}

export async function saveUpcomingMoviesCache(movies: Movie[]): Promise<void> {
  const payload: CachedUpcomingMovies = {
    version: CACHE_VERSION,
    cachedAt: new Date().toISOString(),
    movies,
  };
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export async function loadUpcomingMoviesCache(): Promise<CachedUpcomingMovies | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      parsed.version !== CACHE_VERSION ||
      typeof parsed.cachedAt !== 'string' ||
      !Array.isArray(parsed.movies)
    ) {
      return null;
    }

    return parsed as CachedUpcomingMovies;
  } catch {
    return null;
  }
}

export function isCacheStale(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() > CACHE_TTL_MS;
}
