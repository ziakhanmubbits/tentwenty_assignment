export interface TMDbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
}

export interface TMDbUpcomingMoviesResponse {
  page: number;
  results: TMDbMovie[];
  total_pages: number;
  total_results: number;
}
