export type SeatStatus = 'available' | 'selected' | 'occupied';
export type SeatTier = 'regular' | 'vip';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  tier: SeatTier;
  hidden: boolean;
}
