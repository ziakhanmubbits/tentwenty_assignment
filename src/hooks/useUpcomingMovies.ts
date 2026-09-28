import {useCallback, useEffect, useState} from 'react';
import {fetchUpcomingMovies} from '../services/tmdb/endpoints/upcomingMovies';
import type {Movie} from '../types/movie';

type Status = 'loading' | 'success' | 'empty' | 'error';

interface UpcomingMoviesState {
  status: Status;
  movies: Movie[];
  error: string | null;
}

export function useUpcomingMovies() {
  const [state, setState] = useState<UpcomingMoviesState>({
    status: 'loading',
    movies: [],
    error: null,
  });

  const load = useCallback(async () => {
    setState(prev => ({...prev, status: 'loading', error: null}));
    try {
      const movies = await fetchUpcomingMovies();
      setState({
        status: movies.length === 0 ? 'empty' : 'success',
        movies,
        error: null,
      });
    } catch {
      setState({
        status: 'error',
        movies: [],
        error: "Couldn't load movies.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {...state, retry: load};
}
