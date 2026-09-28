export type SeatStatus = 'available' | 'selected' | 'occupied';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}
