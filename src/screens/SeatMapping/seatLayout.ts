import type {Seat} from '../../types/seat';

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEATS_PER_ROW = 10;

export const OCCUPIED_SEAT_IDS: ReadonlySet<string> = new Set([
  'A3',
  'A4',
  'C5',
  'C6',
  'C7',
  'E1',
  'E2',
  'F8',
  'G9',
  'G10',
  'H4',
  'H5',
  'H6',
]);

export function createInitialSeatLayout(): Seat[][] {
  return ROWS.map(row =>
    Array.from({length: SEATS_PER_ROW}, (_, index) => {
      const number = index + 1;
      const id = `${row}${number}`;
      return {
        id,
        row,
        number,
        status: OCCUPIED_SEAT_IDS.has(id) ? 'occupied' : 'available',
      };
    }),
  );
}
