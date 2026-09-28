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
): Promise<T> {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  });

  const response = await fetch(`${BASE_URL}${path}?${query.toString()}`);

  if (!response.ok) {
    throw new TmdbRequestError(
      `TMDb request to ${path} failed`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}
