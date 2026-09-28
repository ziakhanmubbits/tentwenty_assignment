export type RootStackParamList = {
  MovieList: undefined;
  MovieDetail: {movieId: number};
  Trailer: {movieId: number; videoKey?: string};
  MovieSearch: undefined;
  ShowtimeSelection: {movieId: number; movieTitle: string; releaseDateLabel: string | null};
  SeatMapping: {movieId: number; movieTitle: string};
};

export type RootTabParamList = {
  Watch: undefined;
  Dashboard: undefined;
  MediaLibrary: undefined;
  More: undefined;
};
