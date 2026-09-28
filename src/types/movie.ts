export interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
  posterUrl: string | null;
  backdropUrl: string | null;
}
