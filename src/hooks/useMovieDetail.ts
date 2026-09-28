import {useCallback, useEffect, useState} from 'react';
import {fetchMovieDetail} from '../services/tmdb/endpoints/movieDetail';
import type {MovieDetail} from '../types/movie';

type Status = 'loading' | 'success' | 'error';

interface MovieDetailState {
  status: Status;
  movie: MovieDetail | null;
  error: string | null;
}

export function useMovieDetail(movieId: number) {
  const [state, setState] = useState<MovieDetailState>({
    status: 'loading',
    movie: null,
    error: null,
  });

  const load = useCallback(async () => {
    setState({status: 'loading', movie: null, error: null});
    try {
      const movie = await fetchMovieDetail(movieId);
      setState({status: 'success', movie, error: null});
    } catch {
      setState({
        status: 'error',
        movie: null,
        error: "Couldn't load movie details.",
      });
    }
  }, [movieId]);

  useEffect(() => {
    load();
  }, [load]);

  return {...state, retry: load};
}
