import {useCallback, useEffect, useRef, useState} from 'react';
import {searchMovies} from '../services/tmdb/endpoints/searchMovies';
import type {MovieSearchResult} from '../types/movie';

const DEBOUNCE_MS = 400;

type Status = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface SearchState {
  status: Status;
  results: MovieSearchResult[];
  error: string | null;
}

export function useMovieSearch() {
  const [query, setQuery] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [state, setState] = useState<SearchState>({
    status: 'idle',
    results: [],
    error: null,
  });
  const latestRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();

    abortControllerRef.current?.abort();

    if (normalizedQuery.length === 0) {
      latestRequestIdRef.current += 1;
      setState({status: 'idle', results: [], error: null});
      return;
    }

    const requestId = ++latestRequestIdRef.current;

    const timeoutId = setTimeout(() => {
      setState(prev => ({...prev, status: 'loading', error: null}));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      searchMovies(normalizedQuery, controller.signal)
        .then(results => {
          if (latestRequestIdRef.current !== requestId) {
            return;
          }
          setState({
            status: results.length === 0 ? 'empty' : 'success',
            results,
            error: null,
          });
        })
        .catch(err => {
          if (latestRequestIdRef.current !== requestId) {
            return;
          }
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          setState({
            status: 'error',
            results: [],
            error: "Couldn't search movies.",
          });
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, retryToken]);

  const retry = useCallback(() => {
    setRetryToken(token => token + 1);
  }, []);

  return {query, setQuery, ...state, retry};
}
