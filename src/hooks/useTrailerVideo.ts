import {useCallback, useEffect, useState} from 'react';
import {fetchMovieTrailerVideo} from '../services/tmdb/endpoints/movieTrailer';
import type {TMDbVideo} from '../services/tmdb/types/movieVideos';

type Status = 'loading' | 'success' | 'unavailable' | 'error';

interface TrailerVideoState {
  status: Status;
  video: TMDbVideo | null;
  error: string | null;
}

function overrideAsVideo(videoKey: string): TMDbVideo {
  return {
    id: videoKey,
    key: videoKey,
    name: '',
    site: 'YouTube',
    type: 'Trailer',
    official: false,
  };
}

export function useTrailerVideo(movieId: number, overrideVideoKey?: string) {
  const [state, setState] = useState<TrailerVideoState>(() =>
    overrideVideoKey
      ? {status: 'success', video: overrideAsVideo(overrideVideoKey), error: null}
      : {status: 'loading', video: null, error: null},
  );

  const load = useCallback(async () => {
    if (overrideVideoKey) {
      setState({status: 'success', video: overrideAsVideo(overrideVideoKey), error: null});
      return;
    }
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
  }, [movieId, overrideVideoKey]);

  useEffect(() => {
    load();
  }, [load]);

  return {...state, retry: load};
}
