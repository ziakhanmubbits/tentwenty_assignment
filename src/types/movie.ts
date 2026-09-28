export interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
  posterUrl: string | null;
  backdropUrl: string | null;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: string[];
  logoUrl: string | null;
  trailerVideoKey: string | null;
}

export interface MovieSearchResult extends Movie {
  genreLabel: string | null;
}
