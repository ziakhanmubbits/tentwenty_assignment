import {useCallback, useEffect, useState} from 'react';
import {fetchMovieTrailerVideo} from '../services/tmdb/endpoints/movieTrailer';
import type {TMDbVideo} from '../services/tmdb/types/movieVideos';

type Status = 'loading' | 'success' | 'unavailable' | 'error';

interface TrailerVideoState {
  status: Status;
  video: TMDbVideo | null;
  error: string | null;
}

export function useTrailerVideo(movieId: number) {
  const [state, setState] = useState<TrailerVideoState>({
    status: 'loading',
    video: null,
    error: null,
  });

  const load = useCallback(async () => {
    setState({status: 'loading', video: null, error: null});
    try {
      const video = await fetchMovieTrailerVideo(movieId);
      setState({
        status: video ? 'success' : 'unavailable',
        video,
        error: null,
      });
    } catch {
      setState({
        status: 'error',
        video: null,
        error: "Couldn't load trailer.",
      });
    }
  }, [movieId]);

  useEffect(() => {
    load();
  }, [load]);

  return {...state, retry: load};
}
