export type RootStackParamList = {
  MovieList: undefined;
  MovieDetail: {movieId: number};
  Trailer: {movieId: number; videoKey?: string};
  MovieSearch: undefined;
  SeatMapping: {movieId: number; movieTitle: string};
};
