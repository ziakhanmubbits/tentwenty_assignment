export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbMovieDetail {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: TMDbGenre[];
}
