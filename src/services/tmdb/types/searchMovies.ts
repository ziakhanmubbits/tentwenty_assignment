export interface TMDbSearchMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
}

export interface TMDbSearchMoviesResponse {
  page: number;
  results: TMDbSearchMovie[];
  total_pages: number;
  total_results: number;
}
