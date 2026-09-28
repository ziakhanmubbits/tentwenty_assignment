import type {Seat} from '../../types/seat';

export const ROW_COUNT = 10;
export const LEFT_BLOCK_SIZE = 3;
export const CENTER_BLOCK_SIZE = 12;
export const RIGHT_BLOCK_SIZE = 3;
export const SEATS_PER_ROW = LEFT_BLOCK_SIZE + CENTER_BLOCK_SIZE + RIGHT_BLOCK_SIZE;
export const VIP_ROW = String(ROW_COUNT);

export const SEAT_PRICES = {
  regular: 50,
  vip: 150,
} as const;

export const OCCUPIED_SEAT_IDS: ReadonlySet<string> = new Set([
  '1-3',
  '1-4',
  '1-13',
  '2-6',
  '2-7',
  '3-1',
  '3-2',
  '3-9',
  '4-11',
  '4-12',
  '5-4',
  '5-5',
  '5-16',
  '6-1',
  '6-10',
  '6-11',
  '7-7',
  '7-8',
  '8-3',
  '8-14',
  '9-2',
  '9-9',
  '9-10',
]);

export function createInitialSeatLayout(): Seat[][] {
  return Array.from({length: ROW_COUNT}, (__, rowIndex) => {
    const row = String(rowIndex + 1);
    const isVipRow = row === VIP_ROW;

    return Array.from({length: SEATS_PER_ROW}, (_, seatIndex) => {
      const number = seatIndex + 1;
      const id = `${row}-${number}`;
      return {
        id,
        row,
        number,
        tier: isVipRow ? 'vip' : 'regular',
        status: !isVipRow && OCCUPIED_SEAT_IDS.has(id) ? 'occupied' : 'available',
      };
    });
  });
}
