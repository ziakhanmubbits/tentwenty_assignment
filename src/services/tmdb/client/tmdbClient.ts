import {TMDB_API_KEY} from '@env';

const BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbRequestError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'TmdbRequestError';
  }
}

export async function tmdbGet<T>(
  path: string,
  params: Record<string, string | number> = {},
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  });

  console.log('[tmdb] request', path, params);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}?${query.toString()}`, {signal});
  } catch (networkError) {
  
    console.log('[tmdb] network error (fetch threw before reaching TMDb)', path, networkError);
    throw networkError;
  }

  console.log('[tmdb] response', path, response.status);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.log('[tmdb] error body', path, response.status, body);
    throw new TmdbRequestError(
      `TMDb request to ${path} failed`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
