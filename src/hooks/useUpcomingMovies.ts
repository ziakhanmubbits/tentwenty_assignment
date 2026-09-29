import NetInfo from '@react-native-community/netinfo';
import {useCallback, useEffect, useState} from 'react';
import {fetchUpcomingMovies} from '../services/tmdb/endpoints/upcomingMovies';
import {
  loadUpcomingMoviesCache,
  saveUpcomingMoviesCache,
} from '../services/storage';
import type {Movie} from '../types/movie';

type Status = 'loading' | 'success' | 'empty' | 'error';

interface UpcomingMoviesState {
  status: Status;
  movies: Movie[];
  error: string | null;
  isOffline: boolean;
  cachedAt: string | null;
}

export function useUpcomingMovies() {
  const [state, setState] = useState<UpcomingMoviesState>({
    status: 'loading',
    movies: [],
    error: null,
    isOffline: false,
    cachedAt: null,
  });

  const load = useCallback(async () => {
    const cached = await loadUpcomingMoviesCache();

    if (cached) {
      setState({
        status: 'success',
        movies: cached.movies,
        error: null,
        isOffline: true,
        cachedAt: cached.cachedAt,
      });
    } else {
      setState(prev => ({...prev, status: 'loading', error: null}));
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      if (!cached) {
        setState({
          status: 'error',
          movies: [],
          error: "You're offline and no saved movies are available.",
          isOffline: true,
          cachedAt: null,
        });
      }
      return;
    }

    try {
      const movies = await fetchUpcomingMovies();
      await saveUpcomingMoviesCache(movies);
      setState({
        status: movies.length === 0 ? 'empty' : 'success',
        movies,
        error: null,
        isOffline: false,
        cachedAt: null,
      });
    } catch {
      if (cached) {
        setState({
          status: 'success',
          movies: cached.movies,
          error: null,
          isOffline: true,
          cachedAt: cached.cachedAt,
        });
      } else {
        setState({
          status: 'error',
          movies: [],
          error: "Couldn't load movies.",
          isOffline: false,
          cachedAt: null,
        });
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        return;
      }
      const movies = await fetchUpcomingMovies();
      await saveUpcomingMoviesCache(movies);
      setState({
        status: movies.length === 0 ? 'empty' : 'success',
        movies,
        error: null,
        isOffline: false,
        cachedAt: null,
      });
    } catch {
      // Keep whatever is already on screen; a pull-to-refresh failure
      // shouldn't disrupt a list the user can already see.
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {...state, retry: load, refresh, isRefreshing};
}
